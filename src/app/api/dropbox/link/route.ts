import { NextRequest, NextResponse } from "next/server";

const DROPBOX_API = "https://api.dropboxapi.com/2";

export async function GET(request: NextRequest) {
  const token = process.env.DROPBOX_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({ error: "Missing DROPBOX_ACCESS_TOKEN." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing 'path' query parameter." }, { status: 400 });
  }

  try {
    // Try to get an existing shared link first
    const listRes = await fetch(`${DROPBOX_API}/sharing/list_shared_links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: filePath, direct_only: true }),
    });

    if (listRes.ok) {
      const listData = await listRes.json();
      if (listData.links?.length > 0) {
        return NextResponse.json({ url: listData.links[0].url });
      }
    }

    // Create a new shared link if none exists
    const createRes = await fetch(`${DROPBOX_API}/sharing/create_shared_link_with_settings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: filePath,
        settings: { requested_visibility: { ".tag": "public" } },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      return NextResponse.json({ error: err }, { status: createRes.status });
    }

    const createData = await createRes.json();
    return NextResponse.json({ url: createData.url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
