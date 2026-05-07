import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  ListUsersCommand,
  RespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION ?? "us-east-1"
});

export async function startEmailOtpSignIn(email: string) {
  const clientId = requireCognitoClientId();

  return client.send(
    new InitiateAuthCommand({
      ClientId: clientId,
      AuthFlow: "USER_AUTH",
      AuthParameters: {
        USERNAME: email,
        PREFERRED_CHALLENGE: "EMAIL_OTP"
      }
    })
  );
}

export async function confirmEmailOtpSignIn(params: {
  email: string;
  code: string;
  session: string;
}) {
  const clientId = requireCognitoClientId();

  return client.send(
    new RespondToAuthChallengeCommand({
      ClientId: clientId,
      ChallengeName: "EMAIL_OTP",
      Session: params.session,
      ChallengeResponses: {
        USERNAME: params.email,
        EMAIL_OTP_CODE: params.code
      }
    })
  );
}

export async function findCognitoUserByEmail(email: string) {
  const userPoolId = getCognitoUserPoolId();

  if (!userPoolId) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  const response = await client.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${normalizedEmail}"`,
      Limit: 1
    })
  );

  return response.Users?.[0] ?? null;
}

export async function ensureCognitoUserForEmail(params: { email: string; previousEmail?: string }) {
  const userPoolId = getCognitoUserPoolId();

  if (!userPoolId) {
    return null;
  }

  const currentEmail = normalizeEmail(params.email);
  const previousEmail = params.previousEmail ? normalizeEmail(params.previousEmail) : undefined;

  const currentUser = await findCognitoUserByEmail(currentEmail);

  if (currentUser) {
    await client.send(
      new AdminUpdateUserAttributesCommand({
        UserPoolId: userPoolId,
        Username: currentUser.Username,
        UserAttributes: [
          { Name: "email", Value: currentEmail },
          { Name: "email_verified", Value: "true" }
        ]
      })
    );

    return currentUser;
  }

  if (previousEmail && previousEmail !== currentEmail) {
    const previousUser = await findCognitoUserByEmail(previousEmail);

    if (previousUser?.Username) {
      await client.send(
        new AdminUpdateUserAttributesCommand({
          UserPoolId: userPoolId,
          Username: previousUser.Username,
          UserAttributes: [
            { Name: "email", Value: currentEmail },
            { Name: "email_verified", Value: "true" }
          ]
        })
      );

      return previousUser;
    }
  }

  const response = await client.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: currentEmail,
      MessageAction: "SUPPRESS",
      UserAttributes: [
        { Name: "email", Value: currentEmail },
        { Name: "email_verified", Value: "true" }
      ]
    })
  );

  return response.User ?? null;
}

function requireCognitoClientId() {
  if (!process.env.COGNITO_CLIENT_ID) {
    throw new Error("COGNITO_CLIENT_ID is required");
  }

  return process.env.COGNITO_CLIENT_ID;
}

function getCognitoUserPoolId() {
  if (!process.env.COGNITO_USER_POOL_ID) {
    return null;
  }

  return process.env.COGNITO_USER_POOL_ID;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
