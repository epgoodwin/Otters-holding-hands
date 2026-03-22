import { NextRequest, NextResponse } from "next/server";
import { getDropboxToken } from "@/lib/dropbox-token";

export const dynamic = "force-dynamic";

const DROPBOX_API = "https://api.dropboxapi.com/2";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const folderPath = searchParams.get("path");

  if (!folderPath) {
    return NextResponse.json({ error: "Missing 'path' query parameter." }, { status: 400 });
  }

  try {
    const res = await fetch(`${DROPBOX_API}/files/list_folder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: folderPath,
        shared_link: { url: sharedLink },
        include_media_info: true,
        recursive: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();

    // Return files (not subfolders), with metadata
    const files = (data.entries as DropboxEntry[])
      .filter((e) => e[".tag"] === "file")
      .map((e) => ({
        id: e.id,
        name: e.name,
        pathLower: e.path_lower,
        size: e.size,
        mediaType: getMediaType(e.name),
        mediaInfo: e.media_info ?? null,
      }));

    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function getMediaType(filename: string): "image" | "video" | "pdf" | "document" | "other" {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff", "bmp"].includes(ext)) return "image";
  if (["mp4", "mov", "avi", "mkv", "webm", "wmv"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv"].includes(ext)) return "document";
  return "other";
}

interface DropboxEntry {
  ".tag": string;
  id: string;
  name: string;
  path_lower: string;
  size: number;
  media_info?: object;
}
