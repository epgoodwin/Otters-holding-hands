import { NextRequest, NextResponse } from "next/server";
import { getDropboxToken } from "@/lib/dropbox-token";

const DROPBOX_API = "https://api.dropboxapi.com/2";

export async function GET(request: NextRequest) {
  let token: string;
  try {
    token = await getDropboxToken();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");

  if (!fileId) {
    return NextResponse.json({ error: "Missing 'id' query parameter." }, { status: 400 });
  }

  try {
    const res = await fetch(`${DROPBOX_API}/files/get_temporary_link`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: fileId }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.link });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
