import { OAuth } from "@raycast/api";
import fetch from "node-fetch";
import { Email } from "./types";

const clientId = "26438838656-r8modorr9qv3dhvlla36uj8u0vbfflov.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose";

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.AppURI,
  providerName: "Google",
  providerIcon: "google-logo.png",
  providerId: "google",
  description: "Connect your Google account\n(Raycast Extension Demo)",
});

export async function authorize(): Promise<void> {
  const tokenSet = await client.getTokens();
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      await client.setTokens(await refreshTokens(tokenSet.refreshToken));
    }
    return;
  }

  const authRequest = await client.authorizationRequest({
    endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: clientId,
    scope: SCOPES,
  });
  const { authorizationCode } = await client.authorize(authRequest);
  await client.setTokens(await fetchTokens(authRequest, authorizationCode));
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: params });
  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse;
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken;
  return tokenResponse;
}

async function fetchTokens(authRequest: OAuth.AuthorizationRequest, authCode: string): Promise<OAuth.TokenResponse> {
  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("code", authCode);
  params.append("verifier", authRequest.codeVerifier);
  params.append("grant_type", "authorization_code");
  params.append("redirect_uri", authRequest.redirectURI);

  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: params });
  if (!response.ok) {
    console.error("fetch tokens error:", await response.text());
    throw new Error(response.statusText);
  }
  return (await response.json()) as OAuth.TokenResponse;
}

// API call to fetch unread emails from inbox

export async function fetchInboxEmails(): Promise<{ id: string; threadId: string; payload: any }[]> {
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=" + 5, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const json = (await response.json()) as Email;
  //@ts-ignore
  const messageId = json.id;
  //@ts-ignore
  const threadId = json.threadId;

  const link = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
  const mailLink = `${link}/${messageId}`;

  console.log("Mail Link:", mailLink);

  const messages = await Promise.all(
    //@ts-ignore
    json.messages.map(async (message: { id: string; threadId: string }) => {
      const payload = await test(message);
      return { id: message.id, threadId: message.threadId, payload: { from: payload.from, subject: payload.subject } };
    })
  );
  // test(messages[0]);
  // console.log("messages");
  // console.log(messages);
  //@ts-ignore
  return messages;
}

// Testing area
async function test(message: { id: string; threadId: string }) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
    headers: {
      Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
    },
  });

  if (!response.ok) {
    console.error("refresh tokens error:", await response.text());
    throw new Error(response.statusText);
  }

  const json = await response.json();

  //@ts-ignore
  const subjectHeader = json.payload.headers.find((header) => header.name === "Subject");
  //@ts-ignore
  const fromHeader = json.payload.headers.find((header) => header.name === "From");

  const subject = subjectHeader ? subjectHeader.value : "";
  const from = fromHeader ? fromHeader.value : "";

  // console.log("Subject:", subject);
  // console.log("From:", from);
  //
  return { subject, from };
}