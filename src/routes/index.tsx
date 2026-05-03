import { createFileRoute } from "@tanstack/react-router";
import { AmbientPlayer } from "@/components/AmbientPlayer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AmbientLife — calm windows on the world" },
      {
        name: "description",
        content:
          "Slow, ambient video from real lives around the world. Open a window, hear the rain, watch a quiet drive — calm content for focus and rest.",
      },
      { property: "og:title", content: "AmbientLife — calm windows on the world" },
      {
        property: "og:description",
        content: "A minimalist platform for ambient lifestyle videos. The opposite of doomscrolling.",
      },
    ],
  }),
});

function Index() {
  return (
    <main>
      <h1 className="sr-only">AmbientLife — ambient lifestyle videos from around the world</h1>
      <AmbientPlayer />
    </main>
  );
}
