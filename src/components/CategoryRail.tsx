import { Home, Car, Utensils, Flame, CloudRain, Trees, Briefcase, Footprints, Moon, Shuffle } from "lucide-react";
import type { Category } from "@/data/videos";
import { CATEGORIES } from "@/data/videos";

const ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  "Window Views": Home,
  Driving: Car,
  Cooking: Utensils,
  Fireplace: Flame,
  Rain: CloudRain,
  Nature: Trees,
  Studio: Briefcase,
  "City Walks": Footprints,
  Night: Moon,
};

type Props = {
  active: Category | "Random";
  onSelect: (c: Category | "Random") => void;
};

export function CategoryRail({ active, onSelect }: Props) {
  return (
    <div className="pointer-events-auto absolute right-3 top-1/2 z-20 -translate-y-1/2">
      <ul className="flex flex-col items-center gap-1 rounded-full bg-black/15 px-1 py-2 backdrop-blur-sm">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c];
          const isActive = active === c;
          return (
            <li key={c}>
              <button
                onClick={() => onSelect(c)}
                title={c}
                className={`group flex h-9 w-9 items-center justify-center rounded-full transition ${
                  isActive ? "bg-white/90 text-black" : "text-white/85 hover:bg-white/15"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            </li>
          );
        })}
        <li className="my-1 h-px w-5 bg-white/25" />
        <li>
          <button
            onClick={() => onSelect("Random")}
            title="Random"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              active === "Random" ? "bg-white/90 text-black" : "text-white/85 hover:bg-white/15"
            }`}
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </li>
      </ul>
    </div>
  );
}
