"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  hourly_rate: number | null;
  is_active: boolean;
  hired_at: string;
  profile?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const roles = ["manager", "bartender", "server", "host", "barback"];

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { activeVenue } = useVenue();
  const venueId = activeVenue?.id ?? null;
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    role: "server",
    hourly_rate: "",
  });
  const [error, setError] = useState("");
  const supabase = createClient();

  const loadMembers = useCallback(async (vId: string) => {
    const { data } = await supabase
      .from("venue_members")
      .select(`
        *,
        profile:profiles!venue_members_user_id_fkey(full_name, email, phone)
      `)
      .eq("venue_id", vId)
      .order("created_at");

    if (data) {
      setMembers(data.map((m: Record<string, unknown>) => ({
        ...m,
        profile: Array.isArray(m.profile) ? m.profile[0] : m.profile,
      })) as TeamMember[]);
    }
  }, [supabase]);

  useEffect(() => {
    if (venueId) loadMembers(venueId);
  }, [venueId, loadMembers]);

  const handleAddMember = async () => {
    if (!venueId || !formData.email) return;
    setError("");

    // Look up user by email
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", formData.email)
      .limit(1);

    if (!profiles || profiles.length === 0) {
      setError("No user found with that email. They need to sign up first.");
      return;
    }

    const userId = profiles[0].id;

    const { error: insertError } = await supabase.from("venue_members").insert({
      venue_id: venueId,
      user_id: userId,
      role: formData.role,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
    });

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setShowModal(false);
    setFormData({ email: "", role: "server", hourly_rate: "" });
    loadMembers(venueId);
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !venueId) return;

    await supabase
      .from("venue_members")
      .update({
        role: formData.role,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
      })
      .eq("id", editingMember.id);

    setEditingMember(null);
    setShowModal(false);
    loadMembers(venueId);
  };

  const toggleActive = async (member: TeamMember) => {
    if (!venueId) return;
    await supabase
      .from("venue_members")
      .update({ is_active: !member.is_active })
      .eq("id", member.id);
    loadMembers(venueId);
  };

  const removeMember = async (id: string) => {
    if (!venueId || !confirm("Remove this team member?")) return;
    await supabase.from("venue_members").delete().eq("id", id);
    loadMembers(venueId);
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      email: member.profile?.email || "",
      role: member.role,
      hourly_rate: member.hourly_rate?.toString() || "",
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingMember(null);
    setFormData({ email: "", role: "server", hourly_rate: "" });
    setError("");
    setShowModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      manager: "var(--primary)",
      bartender: "var(--accent)",
      server: "var(--success)",
      host: "#ec4899",
      barback: "#06b6d4",
    };
    return colors[role] || "var(--muted)";
  };

  if (!venueId) {
    return (
      <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
        <p className="text-[var(--muted)]">Create a venue in Settings to manage your team.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{members.length} team members</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add Member
        </button>
      </div>

      {/* Role summary */}
      <div className="flex flex-wrap gap-3 mb-6">
        {roles.map((role) => {
          const count = members.filter((m) => m.role === role && m.is_active).length;
          return (
            <div
              key={role}
              className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm"
            >
              <span className="capitalize">{role}s</span>
              <span className="ml-2 font-bold" style={{ color: getRoleBadgeColor(role) }}>
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Members list */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="p-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
            <p className="text-[var(--muted)] mb-4">No team members yet</p>
            <button onClick={openAdd} className="btn-primary">
              Add Your First Team Member
            </button>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className={`p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-between ${
                !member.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: getRoleBadgeColor(member.role) }}
                >
                  {(member.profile?.full_name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {member.profile?.full_name || "Unknown"}
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{
                        backgroundColor: getRoleBadgeColor(member.role) + "20",
                        color: getRoleBadgeColor(member.role),
                      }}
                    >
                      {member.role}
                    </span>
                    {!member.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--muted)]/20 text-[var(--muted)]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {member.profile?.email}
                    {member.hourly_rate && ` · $${member.hourly_rate}/hr`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(member)} className="btn-secondary text-xs">
                  Edit
                </button>
                <button onClick={() => toggleActive(member)} className="btn-secondary text-xs">
                  {member.is_active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => removeMember(member.id)} className="text-[var(--muted)] hover:text-[var(--danger)] text-xs transition">
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingMember ? "Edit Member" : "Add Team Member"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingMember(null); }}
                className="text-[var(--muted)] hover:text-white"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="team@example.com"
                    className="w-full"
                  />
                  <p className="text-xs text-[var(--muted)] mt-1">
                    The employee must have a Juke Digital account first.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="15.00"
                  step="0.50"
                  className="w-full"
                />
              </div>

              <button
                onClick={editingMember ? handleUpdateMember : handleAddMember}
                className="btn-primary w-full"
              >
                {editingMember ? "Update Member" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
