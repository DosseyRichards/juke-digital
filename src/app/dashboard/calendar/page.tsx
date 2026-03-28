"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  differenceInMinutes,
  setHours,
  setMinutes,
  parseISO,
} from "date-fns";

type ViewType = "month" | "week" | "day";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  event_type: string;
  color: string;
  is_all_day: boolean;
}

const eventTypeColors: Record<string, string> = {
  general: "#6366f1",
  shift: "#22c55e",
  private_event: "#f59e0b",
  promotion: "#ec4899",
  meeting: "#06b6d4",
  holiday: "#ef4444",
};

const eventTypeLabels: Record<string, string> = {
  general: "General",
  shift: "Shift",
  private_event: "Private Event",
  promotion: "Promotion",
  meeting: "Meeting",
  holiday: "Holiday",
};

// Bar hours: 6am to 2am (next day) = hours 6..25 (25 = 1am, we go to 26 = 2am)
const DAY_START_HOUR = 6;
const DAY_END_HOUR = 26; // 2am next day
const TOTAL_HOURS = DAY_END_HOUR - DAY_START_HOUR;
const HOUR_HEIGHT = 60; // px per hour

function getTimeLabel(hour: number): string {
  const h = hour % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function getEventPosition(event: CalendarEvent) {
  const start = new Date(event.start_time);
  let startHour = getHours(start) + getMinutes(start) / 60;
  // If before DAY_START_HOUR, treat as next-day early morning (add 24)
  if (startHour < DAY_START_HOUR) startHour += 24;
  const top = Math.max(0, (startHour - DAY_START_HOUR) * HOUR_HEIGHT);

  const end = new Date(event.end_time);
  let endHour = getHours(end) + getMinutes(end) / 60;
  if (endHour < DAY_START_HOUR) endHour += 24;
  if (endHour <= startHour) endHour = startHour + 1; // minimum 1 hour display
  const height = Math.max(30, (endHour - startHour) * HOUR_HEIGHT);

  return { top, height };
}

const PRESET_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
  "#a855f7",
  "#0ea5e9",
  "#d946ef",
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const { activeVenue } = useVenue();
  const venueId = activeVenue?.id ?? null;
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    event_type: "general",
    is_all_day: false,
    color: "#6366f1",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const supabase = createClient();

  // Update current time every minute for the red line indicator
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute the date range we need to fetch based on view
  const fetchRange = useMemo(() => {
    if (view === "month") {
      const ms = startOfMonth(currentDate);
      const me = endOfMonth(currentDate);
      return { start: startOfWeek(ms), end: endOfWeek(me) };
    } else if (view === "week") {
      const ws = startOfWeek(currentDate);
      const we = endOfWeek(currentDate);
      return { start: ws, end: addDays(we, 1) }; // +1 for bar hours past midnight
    } else {
      const ds = startOfDay(currentDate);
      return { start: ds, end: addDays(endOfDay(currentDate), 1) };
    }
  }, [currentDate, view]);

  const loadEvents = useCallback(
    async (vId: string) => {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("venue_id", vId)
        .gte("start_time", fetchRange.start.toISOString())
        .lte("start_time", fetchRange.end.toISOString())
        .order("start_time");

      if (data) setEvents(data);
    },
    [fetchRange, supabase]
  );

  useEffect(() => {
    if (venueId) loadEvents(venueId);
  }, [venueId, loadEvents]);

  const handleSave = async () => {
    if (!venueId || !formData.title) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const selectedColor =
      formData.color || eventTypeColors[formData.event_type] || "#6366f1";

    const payload = {
      venue_id: venueId,
      created_by: user?.id,
      title: formData.title,
      description: formData.description,
      start_time: formData.start_time,
      end_time: formData.end_time,
      event_type: formData.event_type,
      color: selectedColor,
      is_all_day: formData.is_all_day,
    };

    if (editingId) {
      await supabase.from("events").update(payload).eq("id", editingId);
    } else {
      await supabase.from("events").insert(payload);
    }

    setShowModal(false);
    setEditingId(null);
    resetForm();
    loadEvents(venueId);
  };

  const handleDelete = async (id: string) => {
    if (!venueId) return;
    await supabase.from("events").delete().eq("id", id);
    loadEvents(venueId);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      event_type: "general",
      is_all_day: false,
      color: "#6366f1",
    });
  };

  const openNewEvent = (date: Date, hour?: number) => {
    resetForm();
    const dateStr = format(date, "yyyy-MM-dd");
    const startH = hour !== undefined ? hour : 18; // default 6pm for bars
    const endH = startH + 2;
    const startHour = String(startH % 24).padStart(2, "0");
    const endHour = String(endH % 24).padStart(2, "0");
    setFormData((prev) => ({
      ...prev,
      start_time: `${dateStr}T${startHour}:00`,
      end_time: `${dateStr}T${endHour}:00`,
      color: eventTypeColors.general,
    }));
    setEditingId(null);
    setShowModal(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    setFormData({
      title: event.title,
      description: event.description || "",
      start_time: event.start_time.slice(0, 16),
      end_time: event.end_time.slice(0, 16),
      event_type: event.event_type,
      is_all_day: event.is_all_day,
      color: event.color || eventTypeColors[event.event_type] || "#6366f1",
    });
    setEditingId(event.id);
    setShowModal(true);
  };

  // Navigation
  const goToday = () => setCurrentDate(new Date());

  const goPrev = () => {
    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goNext = () => {
    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const getTitle = () => {
    if (view === "month") return format(currentDate, "MMMM yyyy");
    if (view === "week") {
      const ws = startOfWeek(currentDate);
      const we = endOfWeek(currentDate);
      if (ws.getMonth() === we.getMonth()) {
        return `${format(ws, "MMM d")} - ${format(we, "d, yyyy")}`;
      }
      return `${format(ws, "MMM d")} - ${format(we, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  // Build month calendar grid
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const monthDays: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    monthDays.push(day);
    day = addDays(day, 1);
  }

  // Build week days
  const weekStart = startOfWeek(currentDate);
  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_time), date));

  // Time slots for week/day views
  const timeSlots: number[] = [];
  for (let h = DAY_START_HOUR; h < DAY_END_HOUR; h++) {
    timeSlots.push(h);
  }

  // Current time indicator position
  const getCurrentTimePosition = () => {
    let h = getHours(currentTime) + getMinutes(currentTime) / 60;
    if (h < DAY_START_HOUR) h += 24;
    if (h < DAY_START_HOUR || h > DAY_END_HOUR) return null;
    return (h - DAY_START_HOUR) * HOUR_HEIGHT;
  };

  const currentTimePos = getCurrentTimePosition();

  return (
    <div>
      {/* Header / Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <button onClick={() => openNewEvent(new Date())} className="btn-primary text-sm">
            + New Event
          </button>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            {(["month", "week", "day"] as ViewType[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium capitalize transition ${
                  view === v
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!venueId && (
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
          <p className="text-[var(--muted)]">
            Create a venue in Settings to start managing events.
          </p>
        </div>
      )}

      {venueId && (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={goPrev} className="btn-secondary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={goNext} className="btn-secondary text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={goToday}
                className="btn-secondary text-sm px-3"
              >
                Today
              </button>
            </div>
            <h2 className="text-lg font-semibold">{getTitle()}</h2>
            <div className="w-[120px]" /> {/* Spacer for centering */}
          </div>

          {/* Month View */}
          {view === "month" && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-7 bg-[var(--surface)]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="px-2 py-3 text-center text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border-b border-[var(--border)]"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((date, i) => {
                  const dayEvents = getEventsForDay(date);
                  const inMonth = isSameMonth(date, currentDate);
                  return (
                    <div
                      key={i}
                      onClick={() => openNewEvent(date)}
                      className={`min-h-[120px] p-2 border-b border-r border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition ${
                        !inMonth ? "opacity-30 bg-[var(--background)]" : ""
                      } ${isToday(date) ? "bg-[var(--surface)]" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday(date)
                              ? "bg-[var(--primary)] text-white"
                              : ""
                          }`}
                        >
                          {format(date, "d")}
                        </div>
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => {
                          const color =
                            event.color || eventTypeColors[event.event_type] || "#6366f1";
                          return (
                            <div
                              key={event.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditEvent(event);
                              }}
                              className="text-xs px-2 py-1 rounded-md truncate cursor-pointer hover:opacity-80 transition font-medium"
                              style={{
                                backgroundColor: color + "25",
                                color: color,
                                borderLeft: `3px solid ${color}`,
                              }}
                            >
                              {!event.is_all_day && (
                                <span className="opacity-70 mr-1">
                                  {format(new Date(event.start_time), "h:mm")}
                                </span>
                              )}
                              {event.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-[var(--muted)] pl-2 font-medium">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {view === "week" && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {/* Week header with day names */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-[var(--surface)] border-b border-[var(--border)]">
                <div className="p-2" /> {/* time gutter header */}
                {weekDays.map((wd, i) => (
                  <div
                    key={i}
                    className={`p-2 text-center border-l border-[var(--border)] ${
                      isToday(wd) ? "bg-[var(--primary)]/10" : ""
                    }`}
                  >
                    <div className="text-xs font-semibold text-[var(--muted)] uppercase">
                      {format(wd, "EEE")}
                    </div>
                    <div
                      className={`text-lg font-bold mt-0.5 ${
                        isToday(wd) ? "text-[var(--primary)]" : ""
                      }`}
                    >
                      {format(wd, "d")}
                    </div>
                  </div>
                ))}
              </div>
              {/* Time grid */}
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                <div
                  className="grid grid-cols-[60px_repeat(7,1fr)] relative"
                  style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                >
                  {/* Time labels */}
                  <div className="relative">
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 text-xs text-[var(--muted)] pr-2 text-right"
                        style={{
                          top: (hour - DAY_START_HOUR) * HOUR_HEIGHT - 8,
                        }}
                      >
                        {getTimeLabel(hour)}
                      </div>
                    ))}
                  </div>

                  {/* Day columns */}
                  {weekDays.map((wd, dayIdx) => {
                    const dayEvents = getEventsForDay(wd);
                    return (
                      <div
                        key={dayIdx}
                        className="relative border-l border-[var(--border)]"
                      >
                        {/* Hour grid lines */}
                        {timeSlots.map((hour) => (
                          <div
                            key={hour}
                            onClick={() => openNewEvent(wd, hour % 24)}
                            className="absolute left-0 right-0 border-t border-[var(--border)] hover:bg-[var(--surface-hover)]/50 cursor-pointer transition"
                            style={{
                              top: (hour - DAY_START_HOUR) * HOUR_HEIGHT,
                              height: HOUR_HEIGHT,
                            }}
                          />
                        ))}

                        {/* Events */}
                        {dayEvents
                          .filter((e) => !e.is_all_day)
                          .map((event) => {
                            const pos = getEventPosition(event);
                            const color =
                              event.color || eventTypeColors[event.event_type] || "#6366f1";
                            return (
                              <div
                                key={event.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditEvent(event);
                                }}
                                className="absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer hover:opacity-90 transition overflow-hidden z-10"
                                style={{
                                  top: pos.top,
                                  height: pos.height,
                                  backgroundColor: color + "30",
                                  borderLeft: `3px solid ${color}`,
                                  color: color,
                                }}
                              >
                                <div className="text-xs font-semibold truncate">
                                  {event.title}
                                </div>
                                <div className="text-[10px] opacity-80 truncate">
                                  {format(new Date(event.start_time), "h:mm a")} -{" "}
                                  {format(new Date(event.end_time), "h:mm a")}
                                </div>
                              </div>
                            );
                          })}

                        {/* Current time indicator */}
                        {isToday(wd) && currentTimePos !== null && (
                          <div
                            className="absolute left-0 right-0 z-20 pointer-events-none"
                            style={{ top: currentTimePos }}
                          >
                            <div className="flex items-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
                              <div className="flex-1 h-[2px] bg-red-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Day View */}
          {view === "day" && (
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {/* Day header */}
              <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      isToday(currentDate)
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--surface-hover)]"
                    }`}
                  >
                    {format(currentDate, "d")}
                  </div>
                  <div>
                    <div className="font-semibold">{format(currentDate, "EEEE")}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {format(currentDate, "MMMM d, yyyy")}
                    </div>
                  </div>
                  {isToday(currentDate) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-medium ml-auto">
                      Today
                    </span>
                  )}
                </div>
              </div>
              {/* Time grid */}
              <div className="overflow-y-auto max-h-[calc(100vh-320px)]">
                <div
                  className="grid grid-cols-[60px_1fr] relative"
                  style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
                >
                  {/* Time labels */}
                  <div className="relative border-r border-[var(--border)]">
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="absolute left-0 right-0 text-xs text-[var(--muted)] pr-2 text-right"
                        style={{
                          top: (hour - DAY_START_HOUR) * HOUR_HEIGHT - 8,
                        }}
                      >
                        {getTimeLabel(hour)}
                      </div>
                    ))}
                  </div>

                  {/* Event column */}
                  <div className="relative">
                    {/* Hour grid lines */}
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        onClick={() => openNewEvent(currentDate, hour % 24)}
                        className="absolute left-0 right-0 border-t border-[var(--border)] hover:bg-[var(--surface-hover)]/50 cursor-pointer transition"
                        style={{
                          top: (hour - DAY_START_HOUR) * HOUR_HEIGHT,
                          height: HOUR_HEIGHT,
                        }}
                      />
                    ))}

                    {/* Events */}
                    {getEventsForDay(currentDate)
                      .filter((e) => !e.is_all_day)
                      .map((event) => {
                        const pos = getEventPosition(event);
                        const color =
                          event.color || eventTypeColors[event.event_type] || "#6366f1";
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEvent(event);
                            }}
                            className="absolute left-2 right-4 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition overflow-hidden z-10"
                            style={{
                              top: pos.top,
                              height: Math.max(pos.height, 50),
                              backgroundColor: color + "25",
                              borderLeft: `4px solid ${color}`,
                              color: color,
                            }}
                          >
                            <div className="text-sm font-semibold truncate">
                              {event.title}
                            </div>
                            <div className="text-xs opacity-80 mt-0.5">
                              {format(new Date(event.start_time), "h:mm a")} -{" "}
                              {format(new Date(event.end_time), "h:mm a")}
                            </div>
                            {event.description && pos.height > 70 && (
                              <div className="text-xs opacity-60 mt-1 line-clamp-2">
                                {event.description}
                              </div>
                            )}
                            <div className="text-[10px] opacity-60 mt-1 capitalize">
                              {eventTypeLabels[event.event_type] || event.event_type}
                            </div>
                          </div>
                        );
                      })}

                    {/* All day events banner */}
                    {getEventsForDay(currentDate)
                      .filter((e) => e.is_all_day)
                      .map((event) => {
                        const color =
                          event.color || eventTypeColors[event.event_type] || "#6366f1";
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEvent(event);
                            }}
                            className="absolute left-2 right-4 top-0 rounded-lg px-3 py-2 cursor-pointer hover:opacity-90 transition z-10"
                            style={{
                              backgroundColor: color + "25",
                              borderLeft: `4px solid ${color}`,
                              color: color,
                            }}
                          >
                            <div className="text-sm font-semibold">
                              All Day: {event.title}
                            </div>
                          </div>
                        );
                      })}

                    {/* Current time indicator */}
                    {isToday(currentDate) && currentTimePos !== null && (
                      <div
                        className="absolute left-0 right-0 z-20 pointer-events-none"
                        style={{ top: currentTimePos }}
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
                          <div className="flex-1 h-[2px] bg-red-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-bold">
                {editingId ? "Edit Event" : "New Event"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-[var(--surface-hover)] transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1.5">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Event name"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        event_type: newType,
                        color: eventTypeColors[newType] || formData.color,
                      });
                    }}
                    className="w-full"
                  >
                    <option value="general">General</option>
                    <option value="shift">Shift</option>
                    <option value="private_event">Private Event</option>
                    <option value="promotion">Promotion</option>
                    <option value="meeting">Meeting</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          outline:
                            formData.color === c
                              ? `2px solid ${c}`
                              : "2px solid transparent",
                          outlineOffset: "2px",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Start</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_all_day}
                  onChange={(e) =>
                    setFormData({ ...formData, is_all_day: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                All day event
              </label>

              {/* Color preview */}
              <div
                className="rounded-lg p-3 text-sm font-medium"
                style={{
                  backgroundColor: (formData.color || "#6366f1") + "25",
                  color: formData.color || "#6366f1",
                  borderLeft: `4px solid ${formData.color || "#6366f1"}`,
                }}
              >
                Preview: {formData.title || "Event Title"}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--border)] flex gap-3">
              <button onClick={handleSave} className="btn-primary flex-1">
                {editingId ? "Update" : "Create"} Event
              </button>
              {editingId && (
                <button
                  onClick={() => {
                    handleDelete(editingId);
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="btn-danger"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
