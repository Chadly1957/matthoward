export default function SiteFooter() {
  return (
    <footer id="contact" className="mt-auto border-t border-black bg-black text-white/70">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Big H Recreations LLC</h3>
          <p className="mt-2 text-sm text-white/70">
            Hassle-free floating and camping on the Meramec River in the Ozarks of Missouri.
          </p>
        </div>
        <div className="text-sm text-white/70">
          <h4 className="font-semibold text-white">Contact</h4>
          <p className="mt-2">Meramec River, Ozarks, Missouri</p>
          <p>(573) 555-0142</p>
          <p>booking@bighrecreations.com</p>
        </div>
        <div className="text-sm text-white/70">
          <h4 className="font-semibold text-white">Hours</h4>
          <p className="mt-2">Seasonal: May &ndash; October</p>
          <p>Launch times 8:00 AM &ndash; 1:00 PM daily</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        &copy; {new Date().getFullYear()} Big H Recreations LLC. All rights reserved.
      </div>
    </footer>
  );
}
