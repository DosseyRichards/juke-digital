"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMediaUpload, type MediaFile } from "@/lib/use-media-upload";

interface MediaLibraryProps {
  venueId: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}

export default function MediaLibrary({ venueId, onSelect, onClose }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { upload, deleteMedia, uploading } = useMediaUpload(venueId);
  const supabase = createClient();

  const loadFiles = useCallback(async () => {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });
    if (data) setFiles(data);
  }, [venueId, supabase]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleUpload = async (fileList: FileList) => {
    for (const file of Array.from(fileList)) {
      await upload(file);
    }
    loadFiles();
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete ${file.name}?`)) return;
    await deleteMedia(file.id, file.url);
    loadFiles();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold">Media Library</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-white text-xl">&times;</button>
        </div>

        {/* Upload zone */}
        <div
          className={`mx-6 mt-4 p-6 border-2 border-dashed rounded-xl text-center transition cursor-pointer ${
            dragOver
              ? "border-[var(--primary)] bg-[var(--primary)]/10"
              : "border-[var(--border)] hover:border-[var(--muted)]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = "image/*,video/*";
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              if (target.files?.length) handleUpload(target.files);
            };
            input.click();
          }}
        >
          {uploading ? (
            <p className="text-[var(--primary)]">Uploading...</p>
          ) : (
            <>
              <p className="text-[var(--muted)] mb-1">Drag & drop files here or click to browse</p>
              <p className="text-xs text-[var(--muted)]">Images and videos up to 50MB</p>
            </>
          )}
        </div>

        {/* File grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {files.length === 0 ? (
            <p className="text-center text-[var(--muted)] py-12">No media uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative rounded-lg border border-[var(--border)] overflow-hidden hover:border-[var(--primary)] transition cursor-pointer"
                  onClick={() => onSelect(file.url)}
                >
                  {file.type.startsWith("image/") ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-[var(--surface-hover)] flex items-center justify-center">
                      <span className="text-3xl">Video</span>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs truncate">{file.name}</p>
                    <p className="text-xs text-[var(--muted)]">{formatSize(file.size)}</p>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
