"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import Link from "next/link";

interface Stats {
  events: number;
  customers: number;
  campaigns: number;
  teamMembers: number;
}

export default function DashboardPage() {
  const { activeVenue, venues, loading: venueLoading } = useVenue();
  const [stats, setStats] = useState<Stats>({
    events: 0,
    customers: 0,
    campaigns: 0,
    teamMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      if (!activeVenue) {
        setLoading(false);
        return;
      }

      const [eventsRes, customersRes, campaignsRes, membersRes] = await Promise.all([
        supabase.from("events").select("id", { count: "exact", head: true }).eq("venue_id", activeVenue.id),
        supabase.from("customers").select("id", { count: "exact", head: true }).eq("venue_id", activeVenue.id),
        supabase.from("sms_campaigns").select("id", { count: "exact", head: true }).eq("venue_id", activeVenue.id),
        supabase.from("venue_members").select("id", { count: "exact", head: true }).eq("venue_id", activeVenue.id),
      ]);

      setStats({
        events: eventsRes.count ?? 0,
        customers: customersRes.count ?? 0,
        campaigns: campaignsRes.count ?? 0,
        teamMembers: membersRes.count ?? 0,
      });
      setLoading(false);
    }
    if (!venueLoading) loadStats();
  }, [activeVenue, venueLoading, supabase]);

  if (venueLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Upcoming Events", value: stats.events, href: "/dashboard/calendar", icon: "📅", color: "var(--primary)" },
    { label: "Customers", value: stats.customers, href: "/dashboard/customers", icon: "🗂️", color: "var(--success)" },
    { label: "SMS Campaigns", value: stats.campaigns, href: "/dashboard/sms", icon: "💬", color: "var(--accent)" },
    { label: "Team Members", value: stats.teamMembers, href: "/dashboard/team", icon: "👥", color: "var(--primary)" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          {activeVenue ? `Welcome back, ${activeVenue.name}` : "Welcome to Juke Digital"}
        </h1>
        <p className="text-[var(--muted)] mt-1">
          {activeVenue
            ? "Here's what's happening at your venue."
            : "Get started by creating your venue."}
        </p>
        {venues.length > 1 && activeVenue && (
          <p className="text-xs text-[var(--muted)] mt-1">
            Managing {venues.length} venues · Viewing: <span className="text-[var(--primary)]">{activeVenue.name}</span>
          </p>
        )}
      </div>

      {!activeVenue && (
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] mb-8">
          <h2 className="text-lg font-semibold mb-2">Set up your venue</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Create your bar or venue to start managing events, team, and customers.
          </p>
          <Link href="/dashboard/settings" className="btn-primary inline-block">
            Create Venue
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm text-[var(--muted)] mt-1">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/calendar"
          className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition"
        >
          <h3 className="font-semibold mb-1">Add Event</h3>
          <p className="text-sm text-[var(--muted)]">Schedule a new event or shift</p>
        </Link>
        <Link
          href="/dashboard/sms"
          className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition"
        >
          <h3 className="font-semibold mb-1">Send Campaign</h3>
          <p className="text-sm text-[var(--muted)]">Create and send an SMS blast</p>
        </Link>
        <Link
          href="/dashboard/website"
          className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition"
        >
          <h3 className="font-semibold mb-1">Edit Website</h3>
          <p className="text-sm text-[var(--muted)]">Update your venue&apos;s website</p>
        </Link>
      </div>
    </div>
  );
}
