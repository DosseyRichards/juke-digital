"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  logo_url: string;
  website_theme: Record<string, string>;
  owner_id: string;
}

interface VenueContextType {
  venues: Venue[];
  activeVenue: Venue | null;
  setActiveVenue: (venue: Venue) => void;
  loading: boolean;
  refreshVenues: () => Promise<void>;
  userId: string | null;
}

const VenueContext = createContext<VenueContextType>({
  venues: [],
  activeVenue: null,
  setActiveVenue: () => {},
  loading: true,
  refreshVenues: async () => {},
  userId: null,
});

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [activeVenue, setActiveVenueState] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const loadVenues = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    const { data } = await supabase
      .from("venues")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at");

    if (data) {
      setVenues(data);
      // Restore last active venue from localStorage or pick first
      const savedId = typeof window !== "undefined" ? localStorage.getItem("activeVenueId") : null;
      const saved = savedId ? data.find((v) => v.id === savedId) : null;
      if (saved) {
        setActiveVenueState(saved);
      } else if (data.length > 0 && !activeVenue) {
        setActiveVenueState(data[0]);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadVenues();
  }, [loadVenues]);

  const setActiveVenue = (venue: Venue) => {
    setActiveVenueState(venue);
    if (typeof window !== "undefined") {
      localStorage.setItem("activeVenueId", venue.id);
    }
  };

  return (
    <VenueContext.Provider
      value={{
        venues,
        activeVenue,
        setActiveVenue,
        loading,
        refreshVenues: loadVenues,
        userId,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}

export function useVenue() {
  return useContext(VenueContext);
}
