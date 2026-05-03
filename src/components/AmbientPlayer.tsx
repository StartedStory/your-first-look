import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, Maximize2, SkipForward, Repeat, Search, Bookmark, Share2 } from "lucide-react";
import { VIDEOS, type Category } from "@/data/videos";
import { CategoryRail } from "./CategoryRail";

export function AmbientPlayer() {
  const [activeCat, setActiveCat] = useState<Category | "Random">("Random");
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [loop, setLoop] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playlist = useMemo(() => {
    if (activeCat === "Random") return VIDEOS;
    const filtered = VIDEOS.filter((v) => v.category === activeCat);
    return filtered.length ? filtered : VIDEOS;
  }, [activeCat]);

  useEffect(() => {
    setIndex(0);
  }, [activeCat]);

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

      {/* subtle vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* Top-left author */}
      <div className="absolute left-5 top-4 z-20 font-sans text-[10px] uppercase tracking-[0.25em] text-white/85">
        {current.author}'s {current.category === "Window Views" ? "Window" : "View"}
      </div>

      {/* Top-center wordmark */}
      <h1 className="absolute left-1/2 top-3 z-20 -translate-x-1/2 font-serif text-2xl italic tracking-wide text-white drop-shadow-sm md:text-3xl">
        AmbientLife
      </h1>

      {/* Top-right location */}
      <div className="absolute right-5 top-4 z-20 text-right font-sans text-[10px] uppercase tracking-[0.25em] text-white/85">
        <div>{current.location}</div>
        <div className="text-white/60">{current.date}</div>
      </div>

      {/* Right rail categories */}
      <CategoryRail active={activeCat} onSelect={setActiveCat} />

      {/* Bottom-left actions */}
      <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2">
        <button className="rounded-sm border border-white/40 bg-black/20 px-3 py-1 font-sans text-[11px] uppercase tracking-widest text-white/90 backdrop-blur-sm transition hover:bg-white/10">
          Upgrade
        </button>
        <button className="rounded-sm border border-white/40 bg-black/20 px-3 py-1 font-sans text-[11px] uppercase tracking-widest text-white/90 backdrop-blur-sm transition hover:bg-white/10">
          Submit yours
        </button>
        <div className="ml-2 flex items-center gap-3 text-white/85">
          <button title="Share" className="transition hover:text-white"><Share2 className="h-4 w-4" /></button>
          <button title="Save" className="transition hover:text-white"><Bookmark className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Bottom-center search-like next */}
      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
        <button
          onClick={next}
          className="flex items-center gap-3 rounded-full border border-white/40 bg-black/25 px-5 py-2 font-serif text-sm italic text-white/90 backdrop-blur-md transition hover:bg-black/40"
        >
          <span>Open a window somewhere in the world</span>
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Bottom-right controls */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-3 text-white/85">
        <button title="Loop" onClick={() => setLoop((l) => !l)} className={`transition hover:text-white ${loop ? "text-white" : ""}`}>
          <Repeat className="h-4 w-4" />
        </button>
        <button title="Next" onClick={next} className="transition hover:text-white">
          <SkipForward className="h-4 w-4" />
        </button>
        <button title="Mute" onClick={() => setMuted((m) => !m)} className="transition hover:text-white">
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
        <button title="Fullscreen" onClick={toggleFullscreen} className="transition hover:text-white">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
