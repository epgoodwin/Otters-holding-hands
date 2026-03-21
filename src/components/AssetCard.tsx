"use client";

import { useState } from "react";

interface AssetCardProps {
  name: string;
  pathLower: string;
  fileId: string;
  mediaType: "image" | "video" | "pdf" | "document" | "other";
  size: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mediaType }: { mediaType: AssetCardProps["mediaType"] }) {
  const base = "w-12 h-12 mx-auto";
  if (mediaType === "pdf") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  }
  if (mediaType === "video") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    );
  }
  if (mediaType === "document") {
    return (
      <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
      </svg>
    );
  }
  // default / other
  return (
    <svg className={base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

export default function AssetCard({ name, pathLower, fileId, mediaType, size }: AssetCardProps) {
  const [linkLoading, setLinkLoading] = useState(false);
  const thumbnailUrl =
    mediaType === "image" || mediaType === "video"
      ? `/api/dropbox/thumbnail?path=${encodeURIComponent(pathLower)}`
      : null;

  async function handleClick() {
    setLinkLoading(true);
    try {
      const res = await fetch(`/api/dropbox/link?id=${encodeURIComponent(fileId)}`);
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setLinkLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={linkLoading}
      className="group relative flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Thumbnail area */}
      <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {thumbnailUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent) {
                parent.classList.add("show-fallback");
              }
            }}
          />
        ) : null}
        <div
          className={`absolute inset-0 flex items-center justify-center text-gray-400 ${
            thumbnailUrl ? "opacity-0 group-[.show-fallback]:opacity-100" : "opacity-100"
          }`}
        >
          <FileIcon mediaType={mediaType} />
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          {linkLoading && (
            <div className="bg-white rounded-full p-2 shadow">
              <svg className="animate-spin w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* File info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 truncate" title={name}>
          {name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatBytes(size)}</p>
      </div>
    </button>
  );
}
