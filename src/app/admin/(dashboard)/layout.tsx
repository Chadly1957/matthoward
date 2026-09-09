import Link from "next/link";
import { logoutAdmin } from "@/lib/actions/admin-auth";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sand/30">
      <header className="border-b border-sand-dark/50 bg-forest text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-semibold">
            🛶 Meramec Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="hover:text-sand">
              Dashboard
            </Link>
            <Link href="/admin/trips" className="hover:text-sand">
              Trips
            </Link>
            <Link href="/admin/addons" className="hover:text-sand">
              Add-ons
            </Link>
            <Link href="/admin/bookings" className="hover:text-sand">
              Bookings
            </Link>
            <Link href="/" className="hover:text-sand">
              View Site
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className="rounded-full bg-white/10 px-3 py-1.5 hover:bg-white/20">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
