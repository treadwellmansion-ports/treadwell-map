import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./SignOutButton";

const NAV = [
  { href: "/admin", label: "Recommendations" },
  { href: "/admin/selects", label: "Treadwell Selects" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Map Settings" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/reports", label: "Reported Issues" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#F4E9D6]">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-[#1B1408]">Treadwell Admin</span>
          <nav className="flex gap-4 text-sm text-neutral-600">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#1B1408]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-neutral-600">
          {user?.email}
          <SignOutButton />
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
