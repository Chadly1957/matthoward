import Image from "next/image";
import Link from "next/link";
import { logoutAdmin } from "@/lib/actions/admin-auth";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-tint">
      <header className="border-b border-tint-dark bg-black text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Image
              src="/big_h_web_logo.png"
              alt="Big H Recreations LLC"
              width={1898}
              height={975}
              className="h-8 w-auto"
            />
            Big H Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/admin" className="hover:text-pink">
              Dashboard
            </Link>
            <Link href="/admin/trips" className="hover:text-pink">
              Trips
            </Link>
            <Link href="/admin/addons" className="hover:text-pink">
              Add-ons
            </Link>
            <Link href="/admin/bookings" className="hover:text-pink">
              Bookings
            </Link>
            <Link href="/" className="hover:text-pink">
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
