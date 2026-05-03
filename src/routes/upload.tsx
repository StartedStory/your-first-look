import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORIES, type Category } from "@/data/videos";
import { toast } from "sonner";
import { ArrowLeft, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Submit a window — MB.ent" },
      { name: "description", content: "Share an ambient video from your window. Uploads are reviewed before publishing." },
    ],
  }),
});

const titleSchema = z.string().trim().min(2).max(120);
const locSchema = z.string().trim().max(120).optional();
const descSchema = z.string().trim().max(500).optional();

const MAX_BYTES = 2 * 1024 * 1024 * 1024; // 2GB hard cap
const ACCEPTED = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];

function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("Window Views");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      toast.error("Unsupported file type. Use MP4, WebM, or MOV.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File too large. Max 2GB.");
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    try {
      titleSchema.parse(title);
      locSchema.parse(location || undefined);
      descSchema.parse(description || undefined);
    } catch (err) {
      toast.error(err instanceof z.ZodError ? err.errors[0]?.message ?? "Invalid input" : "Invalid input");
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Resumable / chunked upload — Supabase handles large files in chunks under the hood
      const { error: upErr } = await supabase.storage
        .from("videos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (upErr) throw upErr;
      setProgress(90);

      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);

      const { error: dbErr } = await supabase.from("videos").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        category,
        video_path: path,
        video_url: pub.publicUrl,
        size_bytes: file.size,
        status: "pending",
      });
      if (dbErr) throw dbErr;

      setProgress(100);
      toast.success("Submitted. Pending review.");
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  const sizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : null;
  const isLarge = !!file && file.size > 100 * 1024 * 1024;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <Link to="/" className="font-serif text-xl italic">MB.ent</Link>
        <div className="w-16" />
      </header>

      <main className="mx-auto max-w-xl px-6 py-12">
        <h1 className="font-serif text-4xl italic">Submit a window.</h1>
        <p className="mt-3 font-sans text-sm text-white/60">
          Share something quiet. Your upload will be reviewed before going live.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.25em] text-white/60">Video file</label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-white/30 bg-white/5 px-6 py-10 transition hover:bg-white/10"
            >
              <UploadCloud className="h-6 w-6 text-white/70" />
              <span className="mt-3 font-sans text-sm">
                {file ? file.name : "Click to choose a video"}
              </span>
              <span className="mt-1 font-sans text-xs text-white/40">
                MP4 / WebM / MOV — up to 2GB
              </span>
              {sizeMB && (
                <span className="mt-2 font-sans text-xs text-white/60">{sizeMB} MB</span>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
            {isLarge && (
              <p className="mt-2 font-sans text-xs text-white/50">
                Large file detected — this may take several minutes. Keep this tab open.
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.25em] text-white/60">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required maxLength={120}
              placeholder="Amina's window"
              className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/30 focus:border-white/70 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.25em] text-white/60">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={120}
                placeholder="Tyumen, Russia"
                className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/30 focus:border-white/70 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.25em] text-white/60">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm focus:border-white/70 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-black">{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-sans text-[10px] uppercase tracking-[0.25em] text-white/60">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="A quiet morning by the window."
              className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/30 focus:border-white/70 focus:outline-none"
            />
          </div>

          {busy && (
            <div className="space-y-1">
              <div className="h-1 w-full overflow-hidden bg-white/10">
                <div className="h-full bg-white transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/50">
                Uploading…
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!file || busy}
            className="w-full cursor-pointer rounded-sm border border-white bg-white px-3 py-3 font-sans text-xs uppercase tracking-[0.25em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Uploading…" : "Submit for review"}
          </button>
        </form>
      </main>
    </div>
  );
}
