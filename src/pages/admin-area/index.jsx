import { BarChart3, CheckCircle2, FolderLock, Settings2 } from "lucide-react";

const panels = [
  {
    title: "Role management",
    description: "Promote members, review access, and keep permissions tidy.",
    icon: Settings2,
  },
  {
    title: "Content review",
    description: "Approve private gallery uploads and event albums.",
    icon: FolderLock,
  },
  {
    title: "Publishing status",
    description: "Track what is public, private, and ready to ship.",
    icon: CheckCircle2,
  },
];

export default function AdminArea() {
  return (
    <div className="mx-auto max-w-6xl px-container-px py-10 md:px-container-px-md">
      <div className="rounded-[36px] border border-gray-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white">
              <BarChart3 size={14} />
              Admin Area
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 md:text-6xl">
              Admin controls live here.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
              This area is locked to admins only. Use it for access control,
              approvals, and internal publishing workflows.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {panels.map((panel) => {
            const Icon = panel.icon;
            return (
              <div key={panel.title} className="rounded-[28px] border border-gray-200 bg-[#faf7f0] p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-medium text-gray-900">{panel.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{panel.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
