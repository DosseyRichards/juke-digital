"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { VenueProvider, useVenue } from "@/lib/venue-context";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "📅" },
  { href: "/dashboard/website", label: "Website", icon: "🌐" },
  { href: "/dashboard/sms", label: "SMS", icon: "💬" },
  { href: "/dashboard/team", label: "Team", icon: "👥" },
  { href: "/dashboard/customers", label: "Customers", icon: "🗂️" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { venues, activeVenue, setActiveVenue } = useVenue();
  const [venueDropdownOpen, setVenueDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--surface)] border-r border-[var(--border)] flex flex-col transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--border)]">
          <img src="/juke-digital-logo.png" alt="Juke Digital" className="w-8 h-8 rounded-lg object-contain" />
          <span className="text-lg font-bold">Juke Digital</span>
        </div>

        {/* Venue switcher */}
        {venues.length > 0 && (
          <div className="px-3 py-3 border-b border-[var(--border)] relative">
            <button
              onClick={() => setVenueDropdownOpen(!venueDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--surface-hover)] hover:bg-[var(--border)] transition text-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  {(activeVenue?.name || "?")[0].toUpperCase()}
                </div>
                <span className="truncate font-medium">{activeVenue?.name || "Select venue"}</span>
              </div>
              <svg className={`w-4 h-4 text-[var(--muted)] transition ${venueDropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {venueDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setVenueDropdownOpen(false)} />
                <div className="absolute left-3 right-3 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl z-20 overflow-hidden">
                  {venues.map((venue) => (
                    <button
                      key={venue.id}
                      onClick={() => {
                        setActiveVenue(venue);
                        setVenueDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition ${
                        activeVenue?.id === venue.id
                          ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-white text-xs font-bold bg-[var(--primary)]">
                        {venue.name[0].toUpperCase()}
                      </div>
                      <span className="truncate">{venue.name}</span>
                      {activeVenue?.id === venue.id && (
                        <svg className="w-4 h-4 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <Link
                    href="/dashboard/settings?new=true"
                    onClick={() => setVenueDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[var(--primary)] border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition"
                  >
                    <span className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center border border-dashed border-[var(--primary)] text-xs">+</span>
                    Add New Venue
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--surface-hover)] w-full transition"
          >
            <span className="text-base">🚪</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--background)]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[var(--muted)] hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm text-[var(--muted)]">
            {navItems.find((item) =>
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            )?.label ?? "Dashboard"}
          </div>
          <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
            U
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VenueProvider>
      <DashboardInner>{children}</DashboardInner>
    </VenueProvider>
  );
}
