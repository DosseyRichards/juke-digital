"use client";

import { useEffect, useState } from "react";
import { useVenue } from "@/lib/venue-context";
import { createClient } from "@/lib/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface StatsData {
  totalCustomers: number;
  smsSent: number;
  eventsThisMonth: number;
  publishedPages: number;
}

interface MonthlyData {
  label: string;
  count: number;
}

interface EventTypeData {
  type: string;
  count: number;
}

interface ActivityItem {
  id: string;
  icon: string;
  description: string;
  timestamp: string;
}

const BAR_COLORS = [
  "var(--primary)",
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  "#ddd6fe",
];

const EVENT_TYPE_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export default function AnalyticsPage() {
  const { activeVenue } = useVenue();
  const supabase = createClient();

  const [stats, setStats] = useState<StatsData>({
    totalCustomers: 0,
    smsSent: 0,
    eventsThisMonth: 0,
    publishedPages: 0,
  });
  const [customerGrowth, setCustomerGrowth] = useState<MonthlyData[]>([]);
  const [smsActivity, setSmsActivity] = useState<MonthlyData[]>([]);
  const [eventTypes, setEventTypes] = useState<EventTypeData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeVenue) return;
    loadAnalytics();
  }, [activeVenue]);

  async function loadAnalytics() {
    if (!activeVenue) return;
    setLoading(true);

    const venueId = activeVenue.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Fetch stats in parallel
    const [customersRes, smsRes, eventsMonthRes, pagesRes] = await Promise.all([
      supabase
        .from("customers")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("sms_messages")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId),
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .gte("date", monthStart.toISOString())
        .lte("date", monthEnd.toISOString()),
      supabase
        .from("pages")
        .select("id", { count: "exact", head: true })
        .eq("venue_id", venueId)
        .eq("published", true),
    ]);

    setStats({
      totalCustomers: customersRes.count ?? 0,
      smsSent: smsRes.count ?? 0,
      eventsThisMonth: eventsMonthRes.count ?? 0,
      publishedPages: pagesRes.count ?? 0,
    });

    // Customer growth (last 6 months)
    const sixMonthsAgo = subMonths(now, 5);
    const monthlyCustomers: MonthlyData[] = [];
    const monthlySms: MonthlyData[] = [];

    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const mStart = startOfMonth(m);
      const mEnd = endOfMonth(m);
      const label = format(m, "MMM yyyy");

      const [custRes, smsMonthRes] = await Promise.all([
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId)
          .gte("created_at", mStart.toISOString())
          .lte("created_at", mEnd.toISOString()),
        supabase
          .from("sms_messages")
          .select("id", { count: "exact", head: true })
          .eq("venue_id", venueId)
          .gte("created_at", mStart.toISOString())
          .lte("created_at", mEnd.toISOString()),
      ]);

      monthlyCustomers.push({ label, count: custRes.count ?? 0 });
      monthlySms.push({ label, count: smsMonthRes.count ?? 0 });
    }

    setCustomerGrowth(monthlyCustomers);
    setSmsActivity(monthlySms);

    // Events by type
    const { data: eventsData } = await supabase
      .from("events")
      .select("event_type")
      .eq("venue_id", venueId);

    if (eventsData) {
      const typeCounts: Record<string, number> = {};
      eventsData.forEach((e) => {
        const t = e.event_type || "Other";
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
      setEventTypes(
        Object.entries(typeCounts)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
      );
    }

    // Recent activity
    const [recentCustomers, recentEvents, recentSms] = await Promise.all([
      supabase
        .from("customers")
        .select("id, name, created_at")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("events")
        .select("id, title, created_at")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("sms_messages")
        .select("id, created_at")
        .eq("venue_id", venueId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const activities: ActivityItem[] = [];

    (recentCustomers.data ?? []).forEach((c) => {
      activities.push({
        id: `cust-${c.id}`,
        icon: "👤",
        description: `New customer: ${c.name}`,
        timestamp: c.created_at,
      });
    });

    (recentEvents.data ?? []).forEach((e) => {
      activities.push({
        id: `event-${e.id}`,
        icon: "📅",
        description: `Event created: ${e.title}`,
        timestamp: e.created_at,
      });
    });

    (recentSms.data ?? []).forEach((s) => {
      activities.push({
        id: `sms-${s.id}`,
        icon: "💬",
        description: "SMS message sent",
        timestamp: s.created_at,
      });
    });

    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setRecentActivity(activities.slice(0, 10));
    setLoading(false);
  }

  if (!activeVenue) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--muted)]">
        Select a venue to view analytics
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--muted)]">
        Loading analytics...
      </div>
    );
  }

  const maxCustomerGrowth = Math.max(...customerGrowth.map((d) => d.count), 1);
  const maxSmsActivity = Math.max(...smsActivity.map((d) => d.count), 1);
  const totalEvents = eventTypes.reduce((sum, e) => sum + e.count, 0) || 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={stats.totalCustomers} icon="👤" />
        <StatCard label="SMS Messages Sent" value={stats.smsSent} icon="💬" />
        <StatCard label="Events This Month" value={stats.eventsThisMonth} icon="📅" />
        <StatCard label="Published Pages" value={stats.publishedPages} icon="🌐" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Growth</h2>
          <div className="space-y-3">
            {customerGrowth.map((d, i) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] w-20 shrink-0">
                  {d.label}
                </span>
                <div className="flex-1 bg-[var(--surface-hover)] rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((d.count / maxCustomerGrowth) * 100, d.count > 0 ? 8 : 0)}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  >
                    {d.count > 0 && (
                      <span className="text-xs font-medium text-white">
                        {d.count}
                      </span>
                    )}
                  </div>
                </div>
                {d.count === 0 && (
                  <span className="text-xs text-[var(--muted)]">0</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SMS Activity */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">SMS Activity</h2>
          <div className="space-y-3">
            {smsActivity.map((d, i) => (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted)] w-20 shrink-0">
                  {d.label}
                </span>
                <div className="flex-1 bg-[var(--surface-hover)] rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((d.count / maxSmsActivity) * 100, d.count > 0 ? 8 : 0)}%`,
                      backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                    }}
                  >
                    {d.count > 0 && (
                      <span className="text-xs font-medium text-white">
                        {d.count}
                      </span>
                    )}
                  </div>
                </div>
                {d.count === 0 && (
                  <span className="text-xs text-[var(--muted)]">0</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Events by Type */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Events by Type</h2>
          {eventTypes.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No events yet</p>
          ) : (
            <div className="space-y-3">
              {eventTypes.map((d, i) => (
                <div key={d.type} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        EVENT_TYPE_COLORS[i % EVENT_TYPE_COLORS.length],
                    }}
                  />
                  <span className="text-sm flex-1 truncate">{d.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[var(--surface-hover)] rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(d.count / totalEvents) * 100}%`,
                          backgroundColor:
                            EVENT_TYPE_COLORS[i % EVENT_TYPE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted)] w-8 text-right">
                      {d.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 py-2 border-b border-[var(--border)] last:border-0"
                >
                  <span className="text-base mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.description}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {format(new Date(item.timestamp), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--muted)]">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
