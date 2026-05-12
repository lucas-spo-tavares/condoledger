import "server-only";

import { CognitoJwtVerifier } from "aws-jwt-verify";

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

const accessTokenVerifier =
  userPoolId && clientId
    ? CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "access",
        clientId
      })
    : null;

const idTokenVerifier =
  userPoolId && clientId
    ? CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: "id",
        clientId
      })
    : null;

export async function verifyCognitoAccessToken(token: string) {
  if (!accessTokenVerifier) {
    throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required to verify access tokens.");
  }

  return accessTokenVerifier.verify(token);
}

export async function verifyCognitoIdToken(token: string) {
  if (!idTokenVerifier) {
    throw new Error("COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required to verify ID tokens.");
  }

  return idTokenVerifier.verify(token);
}
