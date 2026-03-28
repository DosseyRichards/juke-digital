"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
} from "date-fns";

interface Stats {
  events: number;
  customers: number;
  campaigns: number;
  teamMembers: number;
}

interface UpcomingEvent {
  id: string;
  title: string;
  start_time: string;
  event_type: string;
  color: string;
}

interface RecentCampaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
  recipient_count: number;
}

const eventTypeColors: Record<string, string> = {
  general: "#6366f1",
  shift: "#22c55e",
  private_event: "#f59e0b",
  promotion: "#ec4899",
  meeting: "#06b6d4",
  holiday: "#ef4444",
};

const campaignStatusColors: Record<string, { bg: string; text: string }> = {
  draft: { bg: "rgba(113,113,122,0.2)", text: "#71717a" },
  scheduled: { bg: "rgba(99,102,241,0.2)", text: "#6366f1" },
  sending: { bg: "rgba(245,158,11,0.2)", text: "#f59e0b" },
  sent: { bg: "rgba(34,197,94,0.2)", text: "#22c55e" },
  failed: { bg: "rgba(239,68,68,0.2)", text: "#ef4444" },
};

export default function DashboardPage() {
  const { activeVenue, venues, loading: venueLoading } = useVenue();
  const [stats, setStats] = useState<Stats>({
    events: 0,
    customers: 0,
    campaigns: 0,
    teamMembers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<UpcomingEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const supabase = createClient();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeVenue) {
        setLoading(false);
        return;
      }

      const now = new Date().toISOString();
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());

      const [eventsRes, customersRes, campaignsRes, membersRes, upcomingRes, campaignListRes, calEventsRes] =
        await Promise.all([
          supabase
            .from("events")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", activeVenue.id),
          supabase
            .from("customers")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", activeVenue.id),
          supabase
            .from("sms_campaigns")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", activeVenue.id),
          supabase
            .from("venue_members")
            .select("id", { count: "exact", head: true })
            .eq("venue_id", activeVenue.id),
          supabase
            .from("events")
            .select("id, title, start_time, event_type, color")
            .eq("venue_id", activeVenue.id)
            .gte("start_time", now)
            .order("start_time")
            .limit(5),
          supabase
            .from("sms_campaigns")
            .select("id, name, status, created_at, recipient_count")
            .eq("venue_id", activeVenue.id)
            .order("created_at", { ascending: false })
            .limit(3),
          supabase
            .from("events")
            .select("id, title, start_time, event_type, color")
            .eq("venue_id", activeVenue.id)
            .gte("start_time", monthStart.toISOString())
            .lte("start_time", monthEnd.toISOString()),
        ]);

      setStats({
        events: eventsRes.count ?? 0,
        customers: customersRes.count ?? 0,
        campaigns: campaignsRes.count ?? 0,
        teamMembers: membersRes.count ?? 0,
      });
      setUpcomingEvents(upcomingRes.data ?? []);
      setRecentCampaigns(campaignListRes.data ?? []);
      setCalendarEvents(calEventsRes.data ?? []);
      setLoading(false);
    }
    if (!venueLoading) loadDashboardData();
  }, [activeVenue, venueLoading, supabase]);

  if (venueLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
          <span className="text-[var(--muted)] text-sm">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Upcoming Events",
      value: stats.events,
      href: "/dashboard/calendar",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: "var(--primary)",
      bgColor: "rgba(99,102,241,0.1)",
    },
    {
      label: "Customers",
      value: stats.customers,
      href: "/dashboard/customers",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
      color: "var(--success)",
      bgColor: "rgba(34,197,94,0.1)",
    },
    {
      label: "SMS Campaigns",
      value: stats.campaigns,
      href: "/dashboard/sms",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      color: "var(--accent)",
      bgColor: "rgba(245,158,11,0.1)",
    },
    {
      label: "Team Members",
      value: stats.teamMembers,
      href: "/dashboard/team",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
      color: "var(--primary)",
      bgColor: "rgba(99,102,241,0.1)",
    },
  ];

  // Mini calendar data
  const today = new Date();
  const miniMonthStart = startOfMonth(today);
  const miniMonthEnd = endOfMonth(today);
  const miniCalStart = startOfWeek(miniMonthStart);
  const miniCalEnd = endOfWeek(miniMonthEnd);
  const miniDays: Date[] = [];
  let d = miniCalStart;
  while (d <= miniCalEnd) {
    miniDays.push(d);
    d = addDays(d, 1);
  }

  const hasEventsOnDay = (date: Date) =>
    calendarEvents.some((e) => isSameDay(new Date(e.start_time), date));

  const quickActions = [
    {
      label: "Add Event",
      description: "Schedule a new event",
      href: "/dashboard/calendar",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      color: "#6366f1",
    },
    {
      label: "Send Campaign",
      description: "Create an SMS blast",
      href: "/dashboard/sms",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      color: "#f59e0b",
    },
    {
      label: "Add Customer",
      description: "New contact",
      href: "/dashboard/customers",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
        </svg>
      ),
      color: "#22c55e",
    },
    {
      label: "Edit Website",
      description: "Update your site",
      href: "/dashboard/website",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      color: "#ec4899",
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">
              {activeVenue ? `Welcome back, ${activeVenue.name}` : "Welcome to Juke Digital"}
            </h1>
            <p className="text-[var(--muted)] mt-1">
              {activeVenue
                ? "Here's what's happening at your venue."
                : "Get started by creating your venue."}
            </p>
          </div>
          <div className="text-sm text-[var(--muted)]">
            <span>{format(currentTime, "EEEE, MMMM d, yyyy")}</span>
            <span className="mx-2">|</span>
            <span>{format(currentTime, "h:mm a")}</span>
          </div>
        </div>
        {venues.length > 1 && activeVenue && (
          <p className="text-xs text-[var(--muted)] mt-1">
            Managing {venues.length} venues · Viewing:{" "}
            <span className="text-[var(--primary)]">{activeVenue.name}</span>
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

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: stat.bgColor, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--success)" }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                </svg>
                <span>Active</span>
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm text-[var(--muted)] mt-1 flex items-center justify-between">
              <span>{stat.label}</span>
              <svg
                className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      {activeVenue && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - wider */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events Widget */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold">Upcoming Events</h2>
                <Link
                  href="/dashboard/calendar"
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition font-medium"
                >
                  View all →
                </Link>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                  No upcoming events. Schedule one from the calendar.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      href="/dashboard/calendar"
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-hover)] transition"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            event.color || eventTypeColors[event.event_type] || "#6366f1",
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{event.title}</div>
                        <div className="text-xs text-[var(--muted)] capitalize">
                          {event.event_type.replace("_", " ")}
                        </div>
                      </div>
                      <div className="text-xs text-[var(--muted)] text-right flex-shrink-0">
                        <div>{format(new Date(event.start_time), "MMM d")}</div>
                        <div>{format(new Date(event.start_time), "h:mm a")}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent SMS Campaigns Widget */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold">Recent SMS Campaigns</h2>
                <Link
                  href="/dashboard/sms"
                  className="text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] transition font-medium"
                >
                  View all →
                </Link>
              </div>
              {recentCampaigns.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                  No campaigns yet. Create your first SMS campaign.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {recentCampaigns.map((campaign) => {
                    const statusStyle = campaignStatusColors[campaign.status] || campaignStatusColors.draft;
                    return (
                      <Link
                        key={campaign.id}
                        href="/dashboard/sms"
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-hover)] transition"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{campaign.name}</div>
                          <div className="text-xs text-[var(--muted)]">
                            {format(new Date(campaign.created_at), "MMM d, yyyy")}
                            {campaign.recipient_count > 0 && (
                              <span> · {campaign.recipient_count} recipients</span>
                            )}
                          </div>
                        </div>
                        <span
                          className="text-xs font-medium px-2.5 py-1 rounded-full capitalize flex-shrink-0"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.text,
                          }}
                        >
                          {campaign.status}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mini Calendar */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold">{format(today, "MMMM yyyy")}</h2>
              </div>
              <div className="p-3">
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-medium text-[var(--muted)] py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                {/* Date cells */}
                <div className="grid grid-cols-7">
                  {miniDays.map((date, i) => {
                    const inMonth = isSameMonth(date, today);
                    const todayMatch = isToday(date);
                    const hasEvents = hasEventsOnDay(date);
                    return (
                      <Link
                        key={i}
                        href="/dashboard/calendar"
                        className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg text-xs transition hover:bg-[var(--surface-hover)] ${
                          !inMonth ? "opacity-30" : ""
                        }`}
                      >
                        <span
                          className={`w-7 h-7 flex items-center justify-center rounded-full ${
                            todayMatch
                              ? "bg-[var(--primary)] text-white font-bold"
                              : "font-medium"
                          }`}
                        >
                          {format(date, "d")}
                        </span>
                        {hasEvents && (
                          <span
                            className="w-1 h-1 rounded-full mt-0.5"
                            style={{ backgroundColor: "var(--primary)" }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-semibold">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-hover)] transition text-center"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: action.color + "1a",
                        color: action.color,
                      }}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{action.label}</div>
                      <div className="text-[10px] text-[var(--muted)] mt-0.5 leading-tight">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
