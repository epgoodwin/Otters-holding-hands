/**
 * Returns a valid Dropbox access token, auto-refreshing when needed.
 *
 * Set DROPBOX_REFRESH_TOKEN + DROPBOX_APP_KEY + DROPBOX_APP_SECRET in .env.local
 * for tokens that never expire. Falls back to DROPBOX_ACCESS_TOKEN if those are absent.
 */

let cache: { token: string; expiresAt: number } | null = null;

export async function getDropboxToken(): Promise<string> {
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  // Use refresh-token flow if all three vars are set
  if (refreshToken && appKey && appSecret) {
    // Return cached token if still valid (5-min buffer)
    if (cache && cache.expiresAt > Date.now() + 5 * 60 * 1000) {
      return cache.token;
    }

    const res = await fetch("https://api.dropbox.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: appKey,
        client_secret: appSecret,
      }),
    });

    if (!res.ok) {
      throw new Error(`Dropbox token refresh failed: ${await res.text()}`);
    }

    const data = await res.json();
    cache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
    return cache.token;
  }

  // Fallback to static token
  const staticToken = process.env.DROPBOX_ACCESS_TOKEN;
  if (!staticToken) {
    throw new Error("Missing Dropbox credentials. Set DROPBOX_REFRESH_TOKEN + DROPBOX_APP_KEY + DROPBOX_APP_SECRET (or DROPBOX_ACCESS_TOKEN) in .env.local.");
  }
  return staticToken;
}
