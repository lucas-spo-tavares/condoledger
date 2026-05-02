import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
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

function requireCognitoClientId() {
  if (!process.env.COGNITO_CLIENT_ID) {
    throw new Error("COGNITO_CLIENT_ID is required");
  }

  return process.env.COGNITO_CLIENT_ID;
}
