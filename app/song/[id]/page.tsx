"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Music,
  User,
  Calendar,
  Clock,
  Disc,
  Loader2,
} from "lucide-react";
import Ad from "@/app/components/Ad";

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  year: number;
  genre: string;
  duration: string;
  lyrics: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function SongDetails() {
  const params = useParams();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const response = await fetch(`/api/songs/${params.id}`);
        if (!response.ok) {
          throw new Error("Song not found");
        }
        const data = await response.json();
        setSong(data);
      } catch (error) {
        console.error("Error fetching song:", error);
        setSong(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSong();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-vintage-brown animate-spin" />
          <p className="text-vintage-brown">Loading song details...</p>
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="vintage-card p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-vintage-brown mb-4">
            Song Not Found
          </h2>
          <button
            onClick={() => router.push("/")}
            className="vintage-button px-6 py-3 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="vintage-button px-4 py-2 rounded-lg mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Songs
        </button>

        <div className="vintage-border p-8 bg-vintage-cream rounded-lg">
          <h1
            className="text-3xl md:text-5xl font-bold text-vintage-brown mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {song.title}
          </h1>
          <p className="text-xl text-vintage-brown">by {song.artist}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Song Info */}
        <div className="lg:col-span-1">
          <div className="vintage-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-vintage-brown mb-4 flex items-center gap-2">
              <Disc className="text-vintage-gold" />
              Song Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-vintage-brown" size={20} />
                <div>
                  <p className="text-sm text-vintage-brown opacity-70">
                    Artist
                  </p>
                  <p className="font-medium text-vintage-brown">
                    {song.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Music className="text-vintage-brown" size={20} />
                <div>
                  <p className="text-sm text-vintage-brown opacity-70">Album</p>
                  <p className="font-medium text-vintage-brown">{song.album}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="text-vintage-brown" size={20} />
                <div>
                  <p className="text-sm text-vintage-brown opacity-70">Year</p>
                  <p className="font-medium text-vintage-brown">{song.year}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-vintage-brown" size={20} />
                <div>
                  <p className="text-sm text-vintage-brown opacity-70">
                    Duration
                  </p>
                  <p className="font-medium text-vintage-brown">
                    {song.duration}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-vintage-brown">
                <span className="inline-block bg-vintage-paper text-vintage-brown px-3 py-1 rounded-full text-sm font-medium">
                  {song.genre}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lyrics */}
        <div className="lg:col-span-2">
          <div className="vintage-card p-6 rounded-lg">
            <h3 className="text-xl font-bold text-vintage-brown mb-6 flex items-center gap-2">
              <Music className="text-vintage-gold" />
              Lyrics
            </h3>

            <div className="typewriter-text p-6 rounded-lg bg-vintage-paper">
              <pre className="whitespace-pre-wrap text-vintage-brown leading-relaxed font-mono">
                {song.lyrics}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <Ad slot="1589065178" format="auto" style={{ textAlign: "center" }} />
      <Ad slot="9076080051" format="auto" style={{ textAlign: "center" }} />

    </div>
  );
}
