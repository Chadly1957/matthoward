import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-tint-dark bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/big_h_web_logo.png"
            alt="Big H Recreations LLC"
            width={1898}
            height={975}
            className="h-11 w-auto"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-black sm:flex">
          <Link href="/trips" className="hover:text-pink">
            Float Trips
          </Link>
          <Link href="/camping" className="hover:text-pink">
            Camping
          </Link>
          <Link href="/#faq" className="hover:text-pink">
            FAQ
          </Link>
          <Link href="/#contact" className="hover:text-pink">
            Contact
          </Link>
        </nav>
        <Link
          href="/book"
          className="rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-dark"
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
