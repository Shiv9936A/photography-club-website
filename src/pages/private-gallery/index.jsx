import { CameraOff, ImagePlus, LockKeyhole, Sparkles } from "lucide-react";

const albums = [
  { title: "Incident '25 backstage", count: "48 photos" },
  { title: "Portrait retakes", count: "26 photos" },
  { title: "Workshop selects", count: "18 photos" },
];

export default function PrivateGallery() {
  return (
    <div className="mx-auto max-w-6xl px-container-px py-10 md:px-container-px-md">
      <div className="rounded-[36px] border border-gray-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
              <LockKeyhole size={14} />
              Private Gallery
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-6xl">
              NITK-only albums and selects.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
              This section is reserved for NITK email accounts. It is intended
              for private event albums, review images, and internal selections.
            </p>
          </div>

          <div className="grid w-full max-w-xl gap-3">
            {albums.map((album, index) => (
              <div key={album.title} className="rounded-[24px] border border-gray-200 bg-[#faf7f0] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{album.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-gray-500">{album.count}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                    {index % 2 === 0 ? <ImagePlus size={16} /> : <CameraOff size={16} />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-[28px] border border-gray-200 bg-gradient-to-r from-[#fff7ea] to-[#f6ede0] p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-black px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                <Sparkles size={12} />
                NITK access only
              </p>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                Invite-only review boards and album drafts.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-gray-600">
                Ask an admin if you need access to a specific private gallery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
