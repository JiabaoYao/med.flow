"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "./LogoutButton";

const navLinks = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/appointments", label: "Appointments" },
  { href: "/portal/medications", label: "Medications" },
];

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center" aria-hidden>
      {open ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </span>
  );
}

export function PortalHeader({ userName }: { userName: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 min-h-[3.5rem] max-w-4xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-4">
        <Link
          href="/portal"
          className="text-lg font-semibold text-slate-900 tracking-tight sm:text-xl shrink-0"
        >
          MediTrack <span className="text-primary-600">Portal</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop user + logout */}
        <div className="hidden items-center gap-3 md:flex shrink-0">
          <img
            src="https://cdn-icons-png.flaticon.com/128/16424/16424883.png"
            alt=""
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="text-sm font-medium text-slate-700">{userName ?? "Patient"}</span>
          <LogoutButton />
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="portal-mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        id="portal-mobile-menu"
        className={`overflow-hidden transition-[height,opacity] duration-200 ease-out md:hidden ${
          menuOpen ? "h-auto opacity-100" : "h-0 opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
          <ul className="flex flex-col gap-0.5">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-3 border-t border-slate-200 pt-3">
            <img
              src="https://cdn-icons-png.flaticon.com/128/16424/16424883.png"
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 shrink-0"
            />
            <span className="text-sm font-medium text-slate-700">{userName ?? "Patient"}</span>
            <LogoutButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
