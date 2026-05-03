import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — MB.ent" },
      { name: "description", content: "Sign in or create an account to share your ambient videos on MB.ent." },
    ],
  }),
});

const emailSchema = z.string().trim().email({ message: "Enter a valid email" }).max(255);
const passwordSchema = z.string().min(8, { message: "Min 8 characters" }).max(72);
const nameSchema = z.string().trim().min(1, { message: "Name required" }).max(60);

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const emailV = emailSchema.parse(email);
      const passV = passwordSchema.parse(password);
      if (mode === "signup") {
        const nameV = nameSchema.parse(displayName);
        const { error } = await supabase.auth.signUp({
          email: emailV,
          password: passV,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: nameV },
          },
        });
        if (error) throw error;
        toast.success("Account created. Welcome.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: emailV, password: passV });
        if (error) throw error;
        toast.success("Signed in.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <video
        autoPlay muted loop playsInline
        src="https://cdn.coverr.co/videos/coverr-raindrops-on-a-window-7665/1080p.mp4"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      <Link to="/" className="absolute left-6 top-5 z-10 font-serif text-2xl italic tracking-wide text-white/95">
        MB.ent
      </Link>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl italic">
            {mode === "signin" ? "Welcome back." : "Open an account."}
          </h1>
          <p className="mt-2 font-sans text-xs uppercase tracking-[0.25em] text-white/60">
            {mode === "signin" ? "Sign in to continue" : "Share your window with the world"}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                maxLength={60}
                className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/40 focus:border-white/70 focus:outline-none"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/40 focus:border-white/70 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-sm border border-white/30 bg-white/5 px-3 py-2.5 font-sans text-sm placeholder:text-white/40 focus:border-white/70 focus:outline-none"
            />

            <button
              type="submit"
              disabled={busy}
              className="w-full cursor-pointer rounded-sm border border-white bg-white px-3 py-2.5 font-sans text-xs uppercase tracking-[0.25em] text-black transition hover:bg-white/90 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-white/50">or</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full cursor-pointer rounded-sm border border-white/40 bg-transparent px-3 py-2.5 font-sans text-xs uppercase tracking-[0.25em] text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-6 w-full cursor-pointer text-center font-sans text-xs text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          >
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
