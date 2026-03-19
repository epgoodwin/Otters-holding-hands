# Client Share Portal

A Next.js web app that displays a client's Dropbox "Client Share" folder as a beautiful asset library. Subfolders are shown as sections, files are shown as thumbnails, and clicking any asset opens it directly in Dropbox.

---

## Setup

### 1. Create a Dropbox App

1. Go to [https://www.dropbox.com/developers/apps](https://www.dropbox.com/developers/apps)
2. Click **Create app**
3. Choose:
   - **API**: Scoped access
   - **Access type**: Full Dropbox
   - **Name**: Something like `ClientSharePortal`
4. Under **Permissions**, enable:
   - `files.metadata.read`
   - `files.content.read`
   - `sharing.read`
   - `sharing.write` *(needed to create shared links for files)*
5. Under **Settings → OAuth 2 → Generated access token**, click **Generate** to get a long-lived token.

> **Note:** The generated token doesn't expire, but you should regenerate it if it's ever compromised.

---

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

```env
DROPBOX_ACCESS_TOKEN=your_token_here
DROPBOX_SHARED_LINK=https://www.dropbox.com/scl/fo/your-client-share-link
NEXT_PUBLIC_CLIENT_NAME=Acme Corp
NEXT_PUBLIC_COMPANY_NAME=Your Agency Name
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- **`DROPBOX_ACCESS_TOKEN`** — The token generated in step 1.
- **`DROPBOX_SHARED_LINK`** — The shared Dropbox link to the client's "Client Share" folder (the one you share with the client).
- **`NEXT_PUBLIC_CLIENT_NAME`** — Displayed in the header as the client name.
- **`NEXT_PUBLIC_COMPANY_NAME`** — Your agency/company name shown in the footer.
- **`NEXT_PUBLIC_BASE_URL`** — The URL where the app is deployed (used for server-side API calls). Use `http://localhost:3000` locally.

---

### 3. Install & Run

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the environment variables in Vercel's project settings (same as `.env.local`)
4. Set `NEXT_PUBLIC_BASE_URL` to your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
5. Deploy

Each client gets their own Vercel deployment with their own set of env vars.

---

## How It Works

| Route | Description |
|---|---|
| `GET /api/dropbox/folders` | Lists subfolders in the Client Share folder |
| `GET /api/dropbox/files?path=...` | Lists files within a specific subfolder |
| `GET /api/dropbox/thumbnail?path=...` | Returns a JPEG thumbnail for an image/video |
| `GET /api/dropbox/link?path=...` | Gets or creates a public shared link for a file |

The Dropbox access token is only used server-side in API routes, so it's never exposed to the browser.

---

## Project Structure

```
src/
  app/
    page.tsx                  # Main page (server component, fetches folders)
    layout.tsx
    globals.css
    api/dropbox/
      folders/route.ts        # Lists subfolders
      files/route.ts          # Lists files in a folder
      thumbnail/route.ts      # Proxies thumbnails from Dropbox
      link/route.ts           # Gets shareable links for files
  components/
    FolderSection.tsx         # Collapsible folder with file grid
    AssetCard.tsx             # Individual file card with thumbnail
```
