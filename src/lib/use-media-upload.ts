"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface MediaFile {
  id: string;
  venue_id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export function useMediaUpload(venueId: string | null) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const upload = async (file: File): Promise<MediaFile | null> => {
    if (!venueId) return null;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const fileName = `${venueId}/${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);

    const { data, error } = await supabase
      .from("media")
      .insert({
        venue_id: venueId,
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      })
      .select()
      .single();

    setUploading(false);
    if (error) return null;
    return data;
  };

  const deleteMedia = async (mediaId: string, url: string) => {
    // Extract path from URL
    const path = url.split("/media/")[1];
    if (path) {
      await supabase.storage.from("media").remove([path]);
    }
    await supabase.from("media").delete().eq("id", mediaId);
  };

  return { upload, deleteMedia, uploading };
}
