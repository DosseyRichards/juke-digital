"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useVenue } from "@/lib/venue-context";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  opted_in: boolean;
  notes: string;
  visit_count: number;
  last_visit: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const { activeVenue } = useVenue();
  const venueId = activeVenue?.id ?? null;
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    tags: "",
    notes: "",
    opted_in: true,
  });
  const supabase = createClient();

  const loadCustomers = useCallback(async (vId: string) => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("venue_id", vId)
      .order("created_at", { ascending: false });
    if (data) setCustomers(data);
  }, [supabase]);

  useEffect(() => {
    if (venueId) loadCustomers(venueId);
  }, [venueId, loadCustomers]);

  const allTags = [...new Set(customers.flatMap((c) => c.tags))];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || c.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const handleSave = async () => {
    if (!venueId || !formData.name || !formData.phone) return;

    const payload = {
      venue_id: venueId,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: formData.notes,
      opted_in: formData.opted_in,
    };

    if (editingCustomer) {
      await supabase.from("customers").update(payload).eq("id", editingCustomer.id);
    } else {
      await supabase.from("customers").insert(payload);
    }

    setShowModal(false);
    setEditingCustomer(null);
    resetForm();
    loadCustomers(venueId);
  };

  const deleteCustomer = async (id: string) => {
    if (!venueId || !confirm("Delete this customer?")) return;
    await supabase.from("customers").delete().eq("id", id);
    loadCustomers(venueId);
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", tags: "", notes: "", opted_in: true });
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      tags: customer.tags.join(", "),
      notes: customer.notes || "",
      opted_in: customer.opted_in,
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingCustomer(null);
    resetForm();
    setShowModal(true);
  };

  if (!venueId) {
    return (
      <div className="p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-center">
        <p className="text-[var(--muted)]">Create a venue in Settings to manage customers.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {customers.length} total · {customers.filter((c) => c.opted_in).length} opted in
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add Customer
        </button>
      </div>

      {/* Search and filter */}
      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="flex-1"
        />
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="w-48"
        >
          <option value="">All tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {/* Customer list */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--surface)]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)]">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)] hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)] hidden lg:table-cell">Tags</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)] hidden lg:table-cell">Visits</th>
                <th className="text-left px-4 py-3 font-medium text-[var(--muted)]">SMS</th>
                <th className="text-right px-4 py-3 font-medium text-[var(--muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[var(--muted)]">
                    {customers.length === 0 ? "No customers yet" : "No matching customers"}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-t border-[var(--border)] hover:bg-[var(--surface-hover)] transition"
                  >
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{customer.phone}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden md:table-cell">
                      {customer.email || "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-[var(--muted)]">
                      {customer.visit_count}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          customer.opted_in
                            ? "bg-[var(--success)]/20 text-[var(--success)]"
                            : "bg-[var(--muted)]/20 text-[var(--muted)]"
                        }`}
                      >
                        {customer.opted_in ? "Opted In" : "Opted Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(customer)}
                        className="text-[var(--muted)] hover:text-white text-xs mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCustomer(customer.id)}
                        className="text-[var(--muted)] hover:text-[var(--danger)] text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <button
                onClick={() => { setShowModal(false); setEditingCustomer(null); }}
                className="text-[var(--muted)] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Customer name"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="vip, regular, friday-crowd"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this customer..."
                  rows={2}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.opted_in}
                  onChange={(e) => setFormData({ ...formData, opted_in: e.target.checked })}
                  className="w-4 h-4"
                />
                Opted in to SMS
              </label>

              <button onClick={handleSave} className="btn-primary w-full">
                {editingCustomer ? "Update" : "Add"} Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
