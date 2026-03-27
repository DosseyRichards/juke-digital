"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";
import { format } from "date-fns";

interface Customer {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  opted_in: boolean;
}

interface Campaign {
  id: string;
  name: string;
  message: string;
  target_tags: string[];
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

interface Message {
  id: string;
  message: string;
  direction: string;
  status: string;
  sent_at: string;
  customer_id: string;
}

export default function SMSPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { activeVenue } = useVenue();
  const venueId = activeVenue?.id ?? null;
  const [activeTab, setActiveTab] = useState<"campaigns" | "messages" | "compose">("campaigns");
  const [composeData, setComposeData] = useState({
    name: "",
    message: "",
    targetTags: [] as string[],
    scheduleDate: "",
  });
  const [newTag, setNewTag] = useState("");
  const supabase = createClient();

  const loadData = useCallback(async (vId: string) => {
    const [campaignsRes, messagesRes, customersRes] = await Promise.all([
      supabase.from("sms_campaigns").select("*").eq("venue_id", vId).order("created_at", { ascending: false }),
      supabase.from("sms_messages").select("*").eq("venue_id", vId).order("sent_at", { ascending: false }).limit(50),
      supabase.from("customers").select("*").eq("venue_id", vId).eq("opted_in", true),
    ]);
    if (campaignsRes.data) setCampaigns(campaignsRes.data);
    if (messagesRes.data) setMessages(messagesRes.data);
    if (customersRes.data) setCustomers(customersRes.data);
  }, [supabase]);

  useEffect(() => {
    if (venueId) loadData(venueId);
  }, [venueId, loadData]);

  const allTags = [...new Set(customers.flatMap((c) => c.tags))];

  const toggleTag = (tag: string) => {
    setComposeData((prev) => ({
      ...prev,
      targetTags: prev.targetTags.includes(tag)
        ? prev.targetTags.filter((t) => t !== tag)
        : [...prev.targetTags, tag],
    }));
  };

  const getMatchingCustomers = () => {
    if (composeData.targetTags.length === 0) return customers;
    return customers.filter((c) =>
      composeData.targetTags.some((tag) => c.tags.includes(tag))
    );
  };

  const createCampaign = async (sendNow: boolean) => {
    if (!venueId || !composeData.name || !composeData.message) return;
    const { data: { user } } = await supabase.auth.getUser();

    const matching = getMatchingCustomers();

    const { data: campaign } = await supabase
      .from("sms_campaigns")
      .insert({
        venue_id: venueId,
        created_by: user?.id,
        name: composeData.name,
        message: composeData.message,
        target_tags: composeData.targetTags,
        status: sendNow ? "sent" : composeData.scheduleDate ? "scheduled" : "draft",
        scheduled_at: composeData.scheduleDate || null,
        sent_at: sendNow ? new Date().toISOString() : null,
        recipient_count: matching.length,
      })
      .select()
      .single();

    if (campaign && sendNow) {
      // Create message records for each customer
      const messageRecords = matching.map((customer) => ({
        campaign_id: campaign.id,
        customer_id: customer.id,
        venue_id: venueId,
        direction: "outbound" as const,
        message: composeData.message,
        status: "sent" as const,
      }));

      if (messageRecords.length > 0) {
        await supabase.from("sms_messages").insert(messageRecords);
      }
    }

    setComposeData({ name: "", message: "", targetTags: [], scheduleDate: "" });
    setActiveTab("campaigns");
    loadData(venueId);
  };

  const deleteCampaign = async (id: string) => {
    if (!venueId) return;
    await supabase.from("sms_campaigns").delete().eq("id", id);
    loadData(venueId);
  };

  if (!venueId) {
    return (
      <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
        <p className="text-[var(--muted)]">Create a venue in Settings to manage SMS campaigns.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">SMS Management</h1>
        <button
          onClick={() => setActiveTab("compose")}
          className="btn-primary"
        >
          + New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["campaigns", "messages", "compose"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-white border border-[var(--border)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Campaigns list */}
      {activeTab === "campaigns" && (
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <div className="p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <p className="text-[var(--muted)] mb-4">No campaigns yet</p>
              <button onClick={() => setActiveTab("compose")} className="btn-primary">
                Create Your First Campaign
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        campaign.status === "sent"
                          ? "bg-[var(--success)]/20 text-[var(--success)]"
                          : campaign.status === "scheduled"
                          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                          : campaign.status === "draft"
                          ? "bg-[var(--muted)]/20 text-[var(--muted)]"
                          : "bg-[var(--danger)]/20 text-[var(--danger)]"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mt-1 truncate max-w-md">
                    {campaign.message}
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-[var(--muted)]">
                    <span>{campaign.recipient_count} recipients</span>
                    {campaign.sent_at && (
                      <span>Sent {format(new Date(campaign.sent_at), "MMM d, yyyy")}</span>
                    )}
                    {campaign.scheduled_at && campaign.status === "scheduled" && (
                      <span>Scheduled for {format(new Date(campaign.scheduled_at), "MMM d, yyyy h:mm a")}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteCampaign(campaign.id)}
                  className="text-[var(--muted)] hover:text-[var(--danger)] transition text-sm"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages log */}
      {activeTab === "messages" && (
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
              <p className="text-[var(--muted)]">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg text-sm ${
                  msg.direction === "outbound"
                    ? "bg-[var(--primary)]/10 border border-[var(--primary)]/20 ml-8"
                    : "bg-[var(--surface)] border border-[var(--border)] mr-8"
                }`}
              >
                <p>{msg.message}</p>
                <div className="flex gap-2 mt-1 text-xs text-[var(--muted)]">
                  <span>{msg.direction === "outbound" ? "Sent" : "Received"}</span>
                  <span>{format(new Date(msg.sent_at), "MMM d, h:mm a")}</span>
                  <span className={msg.status === "delivered" ? "text-[var(--success)]" : ""}>
                    {msg.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Compose */}
      {activeTab === "compose" && (
        <div className="max-w-2xl space-y-4">
          <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input
                value={composeData.name}
                onChange={(e) => setComposeData({ ...composeData, name: e.target.value })}
                placeholder="e.g., Friday Night Special"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                value={composeData.message}
                onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                placeholder="Type your message..."
                rows={4}
                className="w-full"
                maxLength={160}
              />
              <div className="text-xs text-[var(--muted)] mt-1">
                {composeData.message.length}/160 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1 rounded-full transition ${
                      composeData.targetTags.includes(tag)
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--surface-hover)] text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add custom tag..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTag.trim()) {
                      toggleTag(newTag.trim());
                      setNewTag("");
                    }
                  }}
                />
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">
                {composeData.targetTags.length === 0
                  ? `All ${customers.length} opted-in customers`
                  : `${getMatchingCustomers().length} customers match selected tags`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Schedule (optional)</label>
              <input
                type="datetime-local"
                value={composeData.scheduleDate}
                onChange={(e) => setComposeData({ ...composeData, scheduleDate: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => createCampaign(true)}
                className="btn-primary"
                disabled={!composeData.name || !composeData.message}
              >
                Send Now
              </button>
              <button
                onClick={() => createCampaign(false)}
                className="btn-secondary"
                disabled={!composeData.name || !composeData.message}
              >
                {composeData.scheduleDate ? "Schedule" : "Save Draft"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
