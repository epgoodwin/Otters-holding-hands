import FolderSection from "@/components/FolderSection";

export const dynamic = "force-dynamic";

interface Folder {
  id: string;
  name: string;
  pathLower: string;
}

async function getFolders(): Promise<{ folders?: Folder[]; error?: string }> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dropbox/folders`, {
      cache: "no-store",
    });
    return res.json();
  } catch (err) {
    return { error: String(err) };
  }
}

export default async function Home() {
  const clientName = process.env.NEXT_PUBLIC_CLIENT_NAME ?? "Client";
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME ?? "Your Agency";

  const { folders, error } = await getFolders();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clientName}</h1>
            <p className="text-sm text-gray-500">Asset Library</p>
          </div>
          <p className="text-sm text-gray-400">Delivered by {companyName}</p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-6 text-center">
            <p className="text-red-600 font-medium">Could not load your asset library.</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
            <p className="text-gray-500 text-sm mt-3">
              Make sure <code className="bg-red-100 px-1 rounded">DROPBOX_ACCESS_TOKEN</code> and{" "}
              <code className="bg-red-100 px-1 rounded">DROPBOX_SHARED_LINK</code> are set in your
              environment.
            </p>
          </div>
        )}

        {!error && (!folders || folders.length === 0) && (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
            <p className="text-lg">No folders found in your Client Share.</p>
          </div>
        )}

        {folders && folders.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {folders.length} folder{folders.length !== 1 ? "s" : ""} · Click any asset to open in Dropbox
            </p>
            {folders.map((folder) => (
              <FolderSection key={folder.id} name={folder.name} pathLower={folder.pathLower} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-400">
          Powered by {companyName} · All assets stored securely in Dropbox
        </div>
      </footer>
    </div>
  );
}
