export type Category =
  | "Window Views"
  | "Driving"
  | "Cooking"
  | "Fireplace"
  | "Rain"
  | "Nature"
  | "Studio"
  | "City Walks"
  | "Night";

export const CATEGORIES: Category[] = [
  "Window Views",
  "Driving",
  "Cooking",
  "Fireplace",
  "Rain",
  "Nature",
  "Studio",
  "City Walks",
  "Night",
];

export type AmbientVideo = {
  id: string;
  title: string;
  author: string;
  location: string;
  date: string;
  category: Category;
  src: string;
};

// Public-domain / CC ambient sample videos
export const VIDEOS: AmbientVideo[] = [
  {
    id: "1",
    title: "Amina's Window",
    author: "Amina",
    location: "Tyumen, Russia",
    date: "08:14, January 2026",
    category: "Window Views",
    src: "https://cdn.coverr.co/videos/coverr-snowy-mountain-village-1573/1080p.mp4",
  },
  {
    id: "2",
    title: "Rainy Afternoon",
    author: "Hiro",
    location: "Kyoto, Japan",
    date: "16:42, March 2026",
    category: "Rain",
    src: "https://cdn.coverr.co/videos/coverr-raindrops-on-a-window-7665/1080p.mp4",
  },
  {
    id: "3",
    title: "Quiet Drive Home",
    author: "Marco",
    location: "Tuscany, Italy",
    date: "18:05, June 2026",
    category: "Driving",
    src: "https://cdn.coverr.co/videos/coverr-driving-through-a-tunnel-2693/1080p.mp4",
  },
  {
    id: "4",
    title: "Hearth",
    author: "Elin",
    location: "Bergen, Norway",
    date: "21:30, December 2026",
    category: "Fireplace",
    src: "https://cdn.coverr.co/videos/coverr-fireplace-with-burning-wood-9043/1080p.mp4",
  },
  {
    id: "5",
    title: "Slow Morning Loaf",
    author: "Camille",
    location: "Lyon, France",
    date: "07:55, April 2026",
    category: "Cooking",
    src: "https://cdn.coverr.co/videos/coverr-kneading-dough-5151/1080p.mp4",
  },
  {
    id: "6",
    title: "Forest Breath",
    author: "Yuki",
    location: "Hokkaido, Japan",
    date: "10:12, May 2026",
    category: "Nature",
    src: "https://cdn.coverr.co/videos/coverr-walking-through-a-forest-1573/1080p.mp4",
  },
  {
    id: "7",
    title: "City After Dark",
    author: "Liam",
    location: "Lisbon, Portugal",
    date: "23:48, August 2026",
    category: "Night",
    src: "https://cdn.coverr.co/videos/coverr-night-city-traffic-1573/1080p.mp4",
  },
];
