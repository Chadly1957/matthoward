import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-dark/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/big_h_web_logo.png"
            alt="Big H Recreations LLC"
            width={192}
            height={48}
            className="h-11 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-forest-dark sm:flex">
          <Link href="/trips" className="hover:text-river">
            Float Trips
          </Link>
          <Link href="/camping" className="hover:text-river">
            Camping
          </Link>
          <Link href="/#faq" className="hover:text-river">
            FAQ
          </Link>
          <Link href="/#contact" className="hover:text-river">
            Contact
          </Link>
        </nav>
        <Link
          href="/book"
          className="rounded-full bg-river px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-river-dark"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
