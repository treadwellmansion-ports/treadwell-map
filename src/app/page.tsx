import Link from "next/link";

const surfaces = [
  { href: "/kiosk", title: "Lobby Kiosk", description: "Fullscreen, bounded downtown view for hotel hardware." },
  { href: "/map", title: "Mobile Visitor Map", description: "Standalone guest map for phones/tablets." },
  { href: "/embed", title: "Website Embed", description: "Minimal-chrome view sized for an <iframe>." },
  { href: "/admin", title: "Staff Admin Dashboard", description: "Manage recommendations, categories, and map settings." },
];

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#F4E9D6] p-8">
      <div className="w-full max-w-xl">
        <h1 className="text-2xl font-semibold text-[#1B1408]">The Treadwell Mansion</h1>
        <p className="mt-1 text-[#4A3B2A]">Downtown Portsmouth Recommendation Map</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {surfaces.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5 transition-colors hover:bg-white"
            >
              <p className="font-medium text-[#1B1408]">{s.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{s.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
