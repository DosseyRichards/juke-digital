"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";

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

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const supabase = createClient();

  const loadEvents = useCallback(async (vId: string) => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));

    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("venue_id", vId)
      .gte("start_time", start.toISOString())
      .lte("start_time", end.toISOString())
      .order("start_time");

    if (data) setEvents(data);
  }, [currentMonth, supabase]);

  useEffect(() => {
    if (venueId) loadEvents(venueId);
  }, [venueId, currentMonth, loadEvents]);

  const handleSave = async () => {
    if (!venueId || !formData.title) return;
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      venue_id: venueId,
      created_by: user?.id,
      title: formData.title,
      description: formData.description,
      start_time: formData.start_time,
      end_time: formData.end_time,
      event_type: formData.event_type,
      color: eventTypeColors[formData.event_type],
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
    });
  };

  const openNewEvent = (date: Date) => {
    setSelectedDate(date);
    resetForm();
    const dateStr = format(date, "yyyy-MM-dd");
    setFormData((prev) => ({
      ...prev,
      start_time: `${dateStr}T09:00`,
      end_time: `${dateStr}T17:00`,
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
    });
    setEditingId(event.id);
    setShowModal(true);
  };

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getEventsForDay = (date: Date) =>
    events.filter((e) => isSameDay(new Date(e.start_time), date));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <button
          onClick={() => openNewEvent(new Date())}
          className="btn-primary"
        >
          + New Event
        </button>
      </div>

      {!venueId && (
        <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
          <p className="text-[var(--muted)]">Create a venue in Settings to start managing events.</p>
        </div>
      )}

      {venueId && (
        <>
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="btn-secondary"
            >
              ← Prev
            </button>
            <h2 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="btn-secondary"
            >
              Next →
            </button>
          </div>

          {/* Calendar grid */}
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 bg-[var(--surface)]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div
                  key={d}
                  className="px-2 py-3 text-center text-xs font-medium text-[var(--muted)] border-b border-[var(--border)]"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7">
              {days.map((date, i) => {
                const dayEvents = getEventsForDay(date);
                return (
                  <div
                    key={i}
                    onClick={() => openNewEvent(date)}
                    className={`min-h-[100px] p-2 border-b border-r border-[var(--border)] cursor-pointer hover:bg-[var(--surface-hover)] transition ${
                      !isSameMonth(date, currentMonth) ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday(date)
                          ? "bg-[var(--primary)] text-white"
                          : ""
                      }`}
                    >
                      {format(date, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEvent(event);
                          }}
                          className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color + "30", color: event.color }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-[var(--muted)]">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Event" : "New Event"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="text-[var(--muted)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Event name"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Start</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_all_day}
                  onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                  className="w-4 h-4"
                />
                All day event
              </label>

              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary flex-1">
                  {editingId ? "Update" : "Create"} Event
                </button>
                {editingId && (
                  <button
                    onClick={() => { handleDelete(editingId); setShowModal(false); setEditingId(null); }}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
