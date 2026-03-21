"use client";

import { useEffect, useState } from "react";
import AssetCard from "./AssetCard";

interface File {
  id: string;
  name: string;
  pathLower: string;
  mediaType: "image" | "video" | "pdf" | "document" | "other";
  size: number;
}

interface FolderSectionProps {
  name: string;
  pathLower: string;
}

export default function FolderSection({ name, pathLower }: FolderSectionProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!pathLower) {
      setError("Folder path is missing.");
      setLoading(false);
      return;
    }
    fetch(`/api/dropbox/files?path=${encodeURIComponent(pathLower)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setFiles(data.files ?? []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [pathLower]);

  return (
    <section className="mb-10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full group mb-4 focus:outline-none"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 12h-15a4.483 4.483 0 0 0-3 1.146Z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
          {name}
        </h2>
        <svg
          className={`w-4 h-4 text-gray-400 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <>
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 animate-pulse aspect-square" />
              ))}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">
              Failed to load files: {error}
            </p>
          )}
          {!loading && !error && files.length === 0 && (
            <p className="text-sm text-gray-400 italic">No files in this folder.</p>
          )}
          {!loading && !error && files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {files.map((file) => (
                <AssetCard
                  key={file.id}
                  name={file.name}
                  pathLower={file.pathLower}
                  mediaType={file.mediaType}
                  size={file.size}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
