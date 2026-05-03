import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, Maximize2, SkipForward, Repeat, Bookmark, Share2, ChevronRight, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { VIDEOS as MOCK_VIDEOS, type Category, type AmbientVideo } from "@/data/videos";
import { CategoryRail } from "./CategoryRail";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function AmbientPlayer() {
  const { user, signOut } = useAuth();
  const [activeCat, setActiveCat] = useState<Category | "Random">("Random");
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loop, setLoop] = useState(false);
  const [videos, setVideos] = useState<AmbientVideo[]>(MOCK_VIDEOS);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load approved videos from DB; fall back to mocks if none
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("id, title, location, category, video_url, created_at, profiles:profiles!videos_user_id_fkey(display_name)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(200);

      if (cancelled) return;
      if (error || !data || data.length === 0) {
        // keep mocks
        return;
      }

      const mapped: AmbientVideo[] = data
        .filter((v) => v.video_url)
        .map((v) => {
          const created = new Date(v.created_at);
          return {
            id: v.id,
            title: v.title,
            // @ts-expect-error joined relation
            author: v.profiles?.display_name ?? "Anonymous",
            location: v.location ?? "Somewhere",
            date: `${created.getHours().toString().padStart(2, "0")}:${created.getMinutes().toString().padStart(2, "0")}, ${created.toLocaleString("en-US", { month: "long", year: "numeric" })}`,
            category: v.category as Category,
            src: v.video_url as string,
          };
        });
      // Mix real submissions in front, append mocks for variety on a young site
      setVideos([...mapped, ...MOCK_VIDEOS]);
    })();
    return () => { cancelled = true; };
  }, []);

  const playlist = useMemo(() => {
    if (activeCat === "Random") return videos;
    const filtered = videos.filter((v) => v.category === activeCat);
    return filtered.length ? filtered : videos;
  }, [activeCat, videos]);

  useEffect(() => { setIndex(0); }, [activeCat]);

  const current = playlist[index % playlist.length];

  const next = () => {
    if (activeCat === "Random") {
      let n = Math.floor(Math.random() * playlist.length);
      if (n === index && playlist.length > 1) n = (n + 1) % playlist.length;
      setIndex(n);
    } else {
      setIndex((i) => (i + 1) % playlist.length);
    }
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden bg-black">
      <video
        ref={videoRef}
        key={current.src}
        src={current.src}
        autoPlay
        muted={muted}
        loop={loop}
        playsInline
        onEnded={() => !loop && next()}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      <div className="absolute left-5 top-4 z-20 font-sans text-[10px] uppercase tracking-[0.25em] text-white/85">
        {current.author}'s {current.category === "Window Views" ? "Window" : "View"}
      </div>

      <h1 className="absolute left-1/2 top-3 z-20 -translate-x-1/2 font-serif text-2xl italic tracking-wide text-white drop-shadow-sm md:text-3xl">
        MB.ent
      </h1>

      <div className="absolute right-5 top-4 z-20 text-right font-sans text-[10px] uppercase tracking-[0.25em] text-white/85">
        <div>{current.location}</div>
        <div className="text-white/60">{current.date}</div>
      </div>

      <CategoryRail active={activeCat} onSelect={setActiveCat} />

      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2">
        {user ? (
          <>
            <Link
              to="/upload"
              className="cursor-pointer rounded-sm border border-white/40 bg-black/20 px-3 py-1 font-sans text-[11px] uppercase tracking-widest text-white/90 backdrop-blur-sm transition hover:bg-white/10"
            >
              Submit yours
            </Link>
            <button
              onClick={signOut}
              title="Sign out"
              className="cursor-pointer rounded-sm border border-white/40 bg-black/20 p-1.5 font-sans text-white/85 backdrop-blur-sm transition hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="cursor-pointer rounded-sm border border-white/40 bg-black/20 px-3 py-1 font-sans text-[11px] uppercase tracking-widest text-white/90 backdrop-blur-sm transition hover:bg-white/10"
          >
            Sign in
          </Link>
        )}
        <div className="ml-2 flex items-center gap-3 text-white/85">
          <button title="Share" className="cursor-pointer transition hover:text-white"><Share2 className="h-4 w-4" /></button>
          <button title="Save" className="cursor-pointer transition hover:text-white"><Bookmark className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="absolute right-5 top-1/2 z-20 -translate-y-1/2">
        <button
          onClick={next}
          className="flex cursor-pointer items-center rounded-full border border-white/40 bg-black/25 p-2 font-serif text-sm italic text-white/90 backdrop-blur-md transition hover:bg-black/40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 text-white/85">
        <button title="Loop" onClick={() => setLoop((l) => !l)} className={`cursor-pointer transition hover:text-white ${loop ? "text-white" : ""}`}>
          <Repeat className="h-4 w-4" />
        </button>
        <button title="Next" onClick={next} className="cursor-pointer transition hover:text-white">
          <SkipForward className="h-4 w-4" />
        </button>
        <button title="Mute" onClick={() => setMuted((m) => !m)} className="cursor-pointer transition hover:text-white">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button title="Fullscreen" onClick={toggleFullscreen} className="cursor-pointer transition hover:text-white">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
