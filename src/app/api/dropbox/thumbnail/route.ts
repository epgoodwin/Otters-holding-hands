import { NextRequest, NextResponse } from "next/server";

const DROPBOX_CONTENT_API = "https://content.dropboxapi.com/2";

export async function GET(request: NextRequest) {
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  const sharedLink = process.env.DROPBOX_SHARED_LINK;

  if (!token || !sharedLink) {
    return NextResponse.json({ error: "Missing DROPBOX_ACCESS_TOKEN or DROPBOX_SHARED_LINK." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing 'path' query parameter." }, { status: 400 });
  }

  try {
    const res = await fetch(`${DROPBOX_CONTENT_API}/files/get_thumbnail_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Dropbox-API-Arg": JSON.stringify({
          resource: { ".tag": "shared_link", url: sharedLink, path: filePath },
          format: { ".tag": "jpeg" },
          size: { ".tag": "w640h480" },
          mode: { ".tag": "fitone_bestfit" },
        }),
        "Content-Type": "text/plain",
      },
      body: "",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const imageBuffer = await res.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
