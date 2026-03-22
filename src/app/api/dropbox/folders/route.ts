import { NextResponse } from "next/server";
import { getDropboxToken } from "@/lib/dropbox-token";

export const dynamic = "force-dynamic";

const DROPBOX_API = "https://api.dropboxapi.com/2";

export async function GET() {
  const sharedLink = process.env.DROPBOX_SHARED_LINK;

  if (!sharedLink) {
    return NextResponse.json(
      { error: "Missing DROPBOX_SHARED_LINK in environment variables." },
      { status: 500 }
    );
  }

  let token: string;
  try {
    token = await getDropboxToken();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  try {
    // List the root of the shared folder to find subfolders
    const res = await fetch(`${DROPBOX_API}/files/list_folder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "",
        shared_link: { url: sharedLink },
        include_media_info: false,
        recursive: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();

    // Debug: log raw Dropbox entries to terminal
    console.log("[folders] raw entries sample:", JSON.stringify(data.entries?.slice(0, 2), null, 2));

    // Filter to only folders
    const folders = (data.entries as DropboxEntry[])
      .filter((e) => e[".tag"] === "folder")
      .map((e) => ({
        id: e.id,
        name: e.name,
        pathLower: e.path_lower ?? `/${e.name}`,
      }));

    return NextResponse.json({ folders });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

interface DropboxEntry {
  ".tag": string;
  id: string;
  name: string;
  path_lower: string;
}
