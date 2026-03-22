/**
 * One-time script to get a Dropbox refresh token.
 *
 * Usage:
 *   node scripts/get-refresh-token.mjs
 *
 * You'll need DROPBOX_APP_KEY and DROPBOX_APP_SECRET from your Dropbox App Console.
 */

import { createInterface } from "readline";
import { createServer } from "http";

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const appKey = await ask("Enter your DROPBOX_APP_KEY: ");
const appSecret = await ask("Enter your DROPBOX_APP_SECRET: ");

const redirectUri = "http://localhost:9876/callback";
const authUrl =
  `https://www.dropbox.com/oauth2/authorize` +
  `?client_id=${appKey}` +
  `&response_type=code` +
  `&token_access_type=offline` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}`;

console.log("\n1. Open this URL in your browser:\n");
console.log("   " + authUrl);
console.log("\n2. Authorize the app. You will be redirected to localhost.");
console.log("   (The page will show an error — that's OK, the code is captured automatically.)\n");

// Start a local server to capture the redirect
const code = await new Promise((resolve) => {
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost:9876");
    const code = url.searchParams.get("code");
    res.end("<h2>Got it! You can close this tab and return to the terminal.</h2>");
    server.close();
    resolve(code);
  });
  server.listen(9876);
});

if (!code) {
  console.error("No code received.");
  process.exit(1);
}

// Exchange code for refresh token
const tokenRes = await fetch("https://api.dropbox.com/oauth2/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: appKey,
    client_secret: appSecret,
    redirect_uri: redirectUri,
  }),
});

const tokenData = await tokenRes.json();

if (!tokenData.refresh_token) {
  console.error("Failed to get refresh token:", JSON.stringify(tokenData, null, 2));
  process.exit(1);
}

console.log("\n✅ Success! Add these to your .env.local:\n");
console.log(`DROPBOX_APP_KEY=${appKey}`);
console.log(`DROPBOX_APP_SECRET=${appSecret}`);
console.log(`DROPBOX_REFRESH_TOKEN=${tokenData.refresh_token}`);
console.log("\nThen remove or comment out DROPBOX_ACCESS_TOKEN.\n");

rl.close();
