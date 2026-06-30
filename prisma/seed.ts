/**
 * Seed roster — ~10 women, ~10 men, 1 non-binary.
 *
 * "Interested in" is mixed to guarantee matches for straight men, straight
 * women, AND gay users (several men open to men, several women open to women).
 * Birth years are spread so elements / zodiac animals vary and Destined matches
 * surface. Portraits are committed SVG assets in /public/seed.
 */

import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Origin, Horoscope } from "circular-natal-horoscope-js";
import { elementFromYear } from "../src/lib/bazi";
import { animalFromYear, animalGlyph } from "../src/lib/zodiac";
import {
  sunElement,
  sunSignFromDate,
  signGlyph,
  SunSign,
} from "../src/lib/astrology";
import { lookupPlace } from "../src/lib/geo";
import { portraitSvg } from "./seed-portrait";

const prisma = new PrismaClient();

type Seed = {
  name: string;
  email: string;
  y: number;
  mo: number;
  d: number;
  time?: string; // HH:MM (enables moon/rising)
  place?: string;
  gender: "woman" | "man" | "nonbinary";
  interestedIn: "women" | "men" | "everyone";
  connection: "romance" | "friendship" | "both";
  heightCm: number;
  essence: string;
  bio: string;
  interests: string[];
  plan?: "aligned" | "aligned_plus" | "destined";
  verified?: boolean;
  extraPhotos?: number;
};

const ROSTER: Seed[] = [
  // ---------------------------- women ----------------------------
  {
    name: "Seraphina", email: "seraphina@souls.demo", y: 1990, mo: 6, d: 14,
    time: "08:20", place: "Singapore", gender: "woman", interestedIn: "men",
    connection: "romance", heightCm: 168,
    essence: "Reads poetry to plants and means it.",
    bio: "Curator by trade, romantic by nature. I believe a long dinner is the highest art form. Looking for someone who notices small things.",
    interests: ["Poetry", "Ceramics", "Slow mornings", "Jazz"],
    plan: "aligned_plus", verified: true, extraPhotos: 1,
  },
  {
    name: "Lena", email: "lena@souls.demo", y: 1994, mo: 2, d: 3,
    time: "14:05", place: "London", gender: "woman", interestedIn: "men",
    connection: "both", heightCm: 171,
    essence: "Will out-walk you and out-argue you, kindly.",
    bio: "Architect who sketches strangers on trains. I want depth, wit, and someone who texts back. Mountains over beaches.",
    interests: ["Architecture", "Hiking", "Film", "Espresso"],
    verified: true,
  },
  {
    name: "Mei", email: "mei@souls.demo", y: 1988, mo: 10, d: 22,
    time: "23:40", place: "Hong Kong", gender: "woman", interestedIn: "everyone",
    connection: "romance", heightCm: 163,
    essence: "Calm in a storm, mischief in the quiet.",
    bio: "Doctor, night-owl, tea hoarder. I value honesty over polish. Tell me something true.",
    interests: ["Tea", "Astronomy", "Cooking", "Long drives"],
    plan: "destined", verified: true, extraPhotos: 1,
  },
  {
    name: "Aurora", email: "aurora@souls.demo", y: 1996, mo: 4, d: 9,
    place: "Stockholm", gender: "woman", interestedIn: "men",
    connection: "romance", heightCm: 174,
    essence: "Designs jewellery, collects thunderstorms.",
    bio: "Maker of small beautiful things. Equal parts ambition and softness. Looking for a steady flame, not a spark that fizzles.",
    interests: ["Design", "Sea swimming", "Vinyl", "Wine"],
    verified: false,
  },
  {
    name: "Noor", email: "noor@souls.demo", y: 1992, mo: 8, d: 2,
    time: "06:15", place: "Dubai", gender: "woman", interestedIn: "men",
    connection: "friendship", heightCm: 166,
    essence: "Founder energy, grandmother wisdom.",
    bio: "Building a company and a good life. Here for genuine friendship first — the rest, we'll see. Loyalty is everything to me.",
    interests: ["Startups", "Calligraphy", "Padel", "Documentaries"],
    verified: true,
  },
  {
    name: "Priya", email: "priya@souls.demo", y: 1985, mo: 1, d: 27,
    time: "11:50", place: "Mumbai", gender: "woman", interestedIn: "men",
    connection: "romance", heightCm: 160,
    essence: "Laughs first, thinks deepest.",
    bio: "Editor of other people's stories, finally writing my own. I want warmth, banter, and someone unafraid of feeling things.",
    interests: ["Books", "Theatre", "Street food", "Yoga"],
    plan: "aligned_plus", verified: true,
  },
  {
    name: "Camille", email: "camille@souls.demo", y: 2000, mo: 5, d: 5,
    time: "19:30", place: "Paris", gender: "woman", interestedIn: "women",
    connection: "romance", heightCm: 169,
    essence: "Paints in the morning, dances at night.",
    bio: "Art student with old-soul taste. Looking for a woman who is gentle and a little fearless. Let's get lost in a museum.",
    interests: ["Painting", "Dancing", "Cinema", "Markets"],
    verified: false, extraPhotos: 1,
  },
  {
    name: "Ingrid", email: "ingrid@souls.demo", y: 1998, mo: 3, d: 18,
    place: "Copenhagen", gender: "woman", interestedIn: "women",
    connection: "both", heightCm: 176,
    essence: "Quietly competitive, openly kind.",
    bio: "Marine biologist who'd rather be in the water. Seeking a woman with curiosity and a steady heart. Friendship that becomes more is the dream.",
    interests: ["Diving", "Climbing", "Science", "Folk music"],
    verified: true,
  },
  {
    name: "Sofia", email: "sofia@souls.demo", y: 1991, mo: 11, d: 30,
    time: "02:10", place: "Barcelona", gender: "woman", interestedIn: "everyone",
    connection: "both", heightCm: 165,
    essence: "Open heart, discerning taste.",
    bio: "Chef and feeder of friends. I love deeply and cook better. Open to whatever feels real — romance, friendship, the whole orbit.",
    interests: ["Cooking", "Flamenco", "Travel", "Natural wine"],
    plan: "aligned_plus", verified: true, extraPhotos: 1,
  },
  {
    name: "Yuki", email: "yuki@souls.demo", y: 1986, mo: 7, d: 11,
    time: "16:45", place: "Tokyo", gender: "woman", interestedIn: "men",
    connection: "romance", heightCm: 162,
    essence: "Minimalist home, maximalist heart.",
    bio: "Product designer who believes in fewer, better things — including people. Looking for one worthy soul. Tea ceremonies and long silences welcome.",
    interests: ["Design", "Pottery", "Running", "Haiku"],
    verified: true,
  },
  // ----------------------------- men -----------------------------
  {
    name: "Adrian", email: "adrian@souls.demo", y: 1989, mo: 9, d: 8,
    time: "07:30", place: "New York", gender: "man", interestedIn: "women",
    connection: "romance", heightCm: 183,
    essence: "Reformed cynic, hopeless for the right person.",
    bio: "Lawyer who'd secretly rather be a novelist. I argue for a living and listen for a hobby. Looking for sharp, kind, and a little stubborn.",
    interests: ["Writing", "Whisky", "Chess", "Cycling"],
    plan: "aligned_plus", verified: true, extraPhotos: 1,
  },
  {
    name: "Mateo", email: "mateo@souls.demo", y: 1993, mo: 12, d: 1,
    time: "13:20", place: "Mexico City", gender: "man", interestedIn: "women",
    connection: "both", heightCm: 178,
    essence: "Makes everyone feel like the main character.",
    bio: "Musician and part-time philosopher. I collect records and conversations. Looking for someone to be curious with — friendship or more.",
    interests: ["Guitar", "Vinyl", "Football", "Cooking"],
    verified: true,
  },
  {
    name: "Kai", email: "kai@souls.demo", y: 1995, mo: 3, d: 25,
    time: "21:00", place: "Sydney", gender: "man", interestedIn: "men",
    connection: "romance", heightCm: 180,
    essence: "Surfs at dawn, reads philosophy at dusk.",
    bio: "Climate scientist with a soft spot for old films. Looking for a man who is thoughtful and warm. Bonus points for bad puns.",
    interests: ["Surfing", "Philosophy", "Cinema", "Coffee"],
    verified: true, extraPhotos: 1,
  },
  {
    name: "Julian", email: "julian@souls.demo", y: 1987, mo: 4, d: 16,
    time: "09:45", place: "Berlin", gender: "man", interestedIn: "men",
    connection: "both", heightCm: 185,
    essence: "Gallery-quiet, festival-loud.",
    bio: "Architect-turned-artist. I build things and feel things, in that order on a good day. Seeking a man with depth and humour.",
    interests: ["Art", "Techno", "Running", "Wine"],
    plan: "aligned_plus", verified: false,
  },
  {
    name: "Daniel", email: "daniel@souls.demo", y: 1990, mo: 6, d: 28,
    time: "05:55", place: "Toronto", gender: "man", interestedIn: "women",
    connection: "romance", heightCm: 187,
    essence: "Steady hands, restless mind.",
    bio: "Surgeon who bakes to relax. I want a partnership of equals — someone with their own orbit. Let's build something quietly extraordinary.",
    interests: ["Baking", "Trail running", "Astronomy", "Jazz"],
    verified: true, extraPhotos: 1,
  },
  {
    name: "Theo", email: "theo@souls.demo", y: 1997, mo: 1, d: 12,
    place: "Auckland", gender: "man", interestedIn: "everyone",
    connection: "romance", heightCm: 176,
    essence: "Earnest to a fault, and proud of it.",
    bio: "Teacher and weekend potter. I believe in slow love and good bread. Open-hearted about who that turns out to be.",
    interests: ["Pottery", "Teaching", "Bouldering", "Folk"],
    verified: false,
  },
  {
    name: "Marcus", email: "marcus@souls.demo", y: 1984, mo: 8, d: 19,
    time: "18:10", place: "Cape Town", gender: "man", interestedIn: "women",
    connection: "romance", heightCm: 189,
    essence: "Old-fashioned in the best ways.",
    bio: "Documentary filmmaker, perpetual traveller. I've seen a lot and still believe in this. Looking for a partner in wonder.",
    interests: ["Film", "Travel", "Diving", "History"],
    plan: "destined", verified: true,
  },
  {
    name: "Rohan", email: "rohan@souls.demo", y: 1992, mo: 5, d: 21,
    time: "10:30", place: "Bangalore", gender: "man", interestedIn: "women",
    connection: "friendship", heightCm: 175,
    essence: "Will plan the trip and remember your coffee order.",
    bio: "Engineer and serial hobbyist. Here for real friendship and whatever grows from it. I'm the friend who shows up.",
    interests: ["Cycling", "Board games", "Coffee", "Hiking"],
    verified: true,
  },
  {
    name: "Elias", email: "elias@souls.demo", y: 1999, mo: 2, d: 14,
    time: "22:25", place: "Lisbon", gender: "man", interestedIn: "men",
    connection: "romance", heightCm: 181,
    essence: "Soft-spoken, sharp-witted.",
    bio: "PhD student in astrophysics — yes, really. I look up a lot. Seeking a man who is gentle, curious, and unafraid of big questions.",
    interests: ["Astrophysics", "Piano", "Hiking", "Sci-fi"],
    verified: false, extraPhotos: 1,
  },
  {
    name: "Hiro", email: "hiro@souls.demo", y: 1983, mo: 11, d: 7,
    time: "12:00", place: "Osaka", gender: "man", interestedIn: "women",
    connection: "both", heightCm: 177,
    essence: "Master of the small grand gesture.",
    bio: "Restaurateur who treats every meal as a love letter. Settled, warm, ready. Looking for someone to share the table and the years.",
    interests: ["Cooking", "Sake", "Cycling", "Gardening"],
    plan: "aligned_plus", verified: true, extraPhotos: 1,
  },
  // -------------------------- non-binary -------------------------
  {
    name: "Sasha", email: "sasha@souls.demo", y: 1995, mo: 9, d: 3,
    time: "15:15", place: "Amsterdam", gender: "nonbinary", interestedIn: "everyone",
    connection: "both", heightCm: 172,
    essence: "Lives in the space between certainties.",
    bio: "Writer and DJ. I hold space for nuance and dance like no one's scoring. Open to all kinds of souls and all kinds of love.",
    interests: ["Writing", "DJing", "Tarot", "Cycling"],
    verified: true, extraPhotos: 1,
  },
];

function computeChart(s: Seed): {
  sun: SunSign;
  moon: SunSign | null;
  rising: SunSign | null;
} {
  const fallbackSun = sunSignFromDate(s.mo, s.d);
  const hasTP = !!(s.time && s.place);
  let hour = 12;
  let minute = 0;
  if (s.time) {
    const [h, m] = s.time.split(":").map(Number);
    hour = h;
    minute = m;
  }
  const geo = s.place ? lookupPlace(s.place) : null;
  try {
    const origin = new Origin({
      year: s.y,
      month: s.mo - 1,
      date: s.d,
      hour,
      minute,
      latitude: geo?.lat ?? 0,
      longitude: geo?.lon ?? 0,
    });
    const h = new Horoscope({ origin, houseSystem: "whole-sign", zodiac: "tropical" });
    const sun = (h.CelestialBodies?.sun?.Sign?.label as SunSign) ?? fallbackSun;
    const moon = hasTP ? ((h.CelestialBodies?.moon?.Sign?.label as SunSign) ?? null) : null;
    const rising = hasTP ? ((h.Ascendant?.Sign?.label as SunSign) ?? null) : null;
    return { sun, moon, rising };
  } catch {
    return { sun: fallbackSun, moon: null, rising: null };
  }
}

function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

async function main() {
  const seedDir = path.join(process.cwd(), "public", "seed");
  await fs.mkdir(seedDir, { recursive: true });

  // Clear previous seed users (and their relations cascade).
  await prisma.user.deleteMany({ where: { isSeed: true } });

  const passwordHash = await bcrypt.hash("souls-demo-1234", 10);

  for (let i = 0; i < ROSTER.length; i++) {
    const s = ROSTER[i];
    const chart = computeChart(s);
    const baziElement = elementFromYear(s.y);
    const zodiacAnimal = animalFromYear(s.y);
    const dob = new Date(Date.UTC(s.y, s.mo - 1, s.d));
    const geo = s.place ? lookupPlace(s.place) : null;

    // Write portrait asset(s).
    const slug = s.email.split("@")[0];
    const photoUrls: string[] = [];
    const photoCount = 1 + (s.extraPhotos ?? 0);
    for (let p = 0; p < photoCount; p++) {
      const svg = portraitSvg({
        initials: initials(s.name),
        glyph: p % 2 === 0 ? animalGlyph(zodiacAnimal) : signGlyph(chart.sun),
        sign: p % 2 === 0 ? chart.sun : zodiacAnimal,
        variant: i + p,
      });
      const file = `${slug}-${p}.svg`;
      await fs.writeFile(path.join(seedDir, file), svg, "utf8");
      photoUrls.push(`/seed/${file}`);
    }

    await prisma.user.create({
      data: {
        email: s.email,
        passwordHash,
        name: s.name,
        bio: s.bio,
        essence: s.essence,
        interests: JSON.stringify(s.interests),
        heightCm: s.heightCm,
        dob,
        birthHour: s.time ? Number(s.time.split(":")[0]) : null,
        birthMinute: s.time ? Number(s.time.split(":")[1]) : null,
        birthPlace: geo?.label ?? s.place ?? null,
        birthLat: geo?.lat ?? null,
        birthLon: geo?.lon ?? null,
        gender: s.gender,
        interestedIn: s.interestedIn,
        connection: s.connection,
        sunSign: chart.sun,
        moonSign: chart.moon,
        risingSign: chart.rising,
        sunElement: sunElement(chart.sun),
        baziElement,
        zodiacAnimal,
        plan: s.plan ?? "aligned",
        verified: s.verified ?? false,
        birthLocked: s.verified ?? false,
        isSeed: true,
        onboardingComplete: true,
        photos: {
          create: photoUrls.map((url, idx) => ({
            url,
            sort: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    console.log(`  ✓ ${s.name} — ${baziElement} · ${chart.sun} · ${zodiacAnimal}`);
  }

  const count = await prisma.user.count({ where: { isSeed: true } });
  console.log(`\nSeeded ${count} souls.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
