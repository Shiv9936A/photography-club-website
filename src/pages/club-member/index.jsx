import { CalendarDays, Camera, FileText, ShieldCheck, Sparkles } from "lucide-react";

const stats = [
  { label: "Assignments pending", value: "08" },
  { label: "Events covered", value: "24" },
  { label: "Private albums", value: "12" },
  { label: "Mentor feedback", value: "04" },
];

const shortcuts = [
  {
    title: "Private gallery",
    description: "Review NITK-only albums and shared event selects.",
    icon: Camera,
  },
  {
    title: "Coverage calendar",
    description: "Track shoots, deadlines, and event signups.",
    icon: CalendarDays,
  },
  {
    title: "Club notes",
    description: "Read member-only updates and internal announcements.",
    icon: FileText,
  },
];

export default function ClubMemberDashboard() {
  return (
    <div className="mx-auto max-w-6xl px-container-px py-10 md:px-container-px-md">
      <div className="rounded-[36px] border border-gray-200 bg-white/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-black text-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]">
              <ShieldCheck size={14} />
              Member Area
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 md:text-6xl">
              Welcome back to the club floor.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-gray-600 md:text-base">
              This dashboard is reserved for club members and admins. Use it to
              track assignments, private album access, and internal updates.
            </p>
          </div>

          <div className="grid w-full max-w-xl grid-cols-2 gap-3">
            {stats.map((item) => (
              <div key={item.label} className="rounded-[24px] border border-gray-200 bg-[#faf7f0] p-4">
                <p className="text-3xl font-semibold text-gray-900">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.15em] text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[28px] border border-gray-200 bg-white p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-medium text-gray-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-[28px] border border-gray-200 bg-gradient-to-r from-black to-[#2b2b2b] p-6 text-white md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
                <Sparkles size={12} />
                Member only
              </p>
              <h2 className="mt-4 text-2xl font-semibold md:text-3xl">
                Need a new assignment or approval?
              </h2>
              <p className="mt-2 max-w-xl text-sm text-white/75">
                Ask the team leads for access to the latest event albums and
                private notes.
              </p>
            </div>
            <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100">
              Open private gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
