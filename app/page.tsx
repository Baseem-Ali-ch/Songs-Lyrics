"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Music,
  Clock,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Ad from "./components/Ad";

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

export default function Dashboard() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "artist" | "year">("title");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const genres = useMemo(
    () => [...new Set((songs || []).map((song) => song.genre))],
    [songs]
  );

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      const response = await fetch(`/api/songs?page=${pageNum}&limit=6`);
      const data = await response.json();

      if (pageNum === 1) {
        setSongs(data.songs);
      } else {
        setSongs((prev) => [...prev, ...data.songs]);
      }

      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchSongs(page + 1);
  };

  const filteredAndSortedSongs = useMemo(() => {
    const filtered = (songs || []).filter((song) => {
      const matchesSearch =
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.album.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = !selectedGenre || song.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "year":
          return b.year - a.year;
        default:
          return 0;
      }
    });
  }, [songs, searchTerm, selectedGenre, sortBy]);

  const handleAdminClick = () => {
    setIsAdminLoading(true);
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="text-center mb-12">
        <div className="vintage-border p-8 mb-8 bg-vintage-cream">
          <h1
            className="text-4xl md:text-6xl font-bold text-vintage-brown mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            🎵 Jukebox Verse 🎵
          </h1>
          <p className="text-lg text-vintage-brown typewriter-text inline-block px-4 py-2">
            {'A "universe" of song verses at your fingertips.'}
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleAdminClick}
            disabled={isAdminLoading}
            className="vintage-button px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {isAdminLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              "Admin Portal"
            )}
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="vintage-card p-6 mb-8 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-brown"
              size={20}
            />
            <input
              type="text"
              placeholder="Search songs, artists, albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vintage-input w-full pl-10 pr-4 py-3 rounded-lg"
            />
          </div>

          {/* Genre Filter */}
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-brown"
              size={20}
            />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="vintage-input w-full pl-10 pr-4 py-3 rounded-lg appearance-none"
            >
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "title" | "artist" | "year")
              }
              className="vintage-input w-full px-4 py-3 rounded-lg"
            >
              <option value="title">Sort by Title</option>
              <option value="artist">Sort by Artist</option>
              <option value="year">Sort by Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-vintage-brown animate-spin" />
            <p className="text-vintage-brown">Loading songs...</p>
          </div>
        </div>
      ) : filteredAndSortedSongs.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <div className="vintage-card p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-vintage-brown mb-4">
              No Songs Found
            </h2>
            <p className="text-vintage-brown mb-6">
              {searchTerm || selectedGenre
                ? "Try adjusting your search or filters"
                : "Be the first to add a song to the collection"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredAndSortedSongs.map((song) => (
              <Link key={song.id} href={`/song/${song.id}`}>
                <div className="vintage-card p-6 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <Music className="text-vintage-gold" size={24} />
                    <span className="text-sm text-vintage-brown bg-vintage-paper px-2 py-1 rounded">
                      {song.genre}
                    </span>
                  </div>

                  <h3
                    className="text-xl font-bold text-vintage-brown mb-2"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {song.title}
                  </h3>

                  <div className="space-y-2 text-vintage-brown">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      <span className="font-medium">{song.artist}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Music size={16} />
                      <span>{song.album}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{song.year}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{song.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center mb-8">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="vintage-button px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading more songs...
                  </>
                ) : (
                  "Load More Songs"
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Ad before footer */}
      <Ad slot="1589065178" format="auto" style={{ textAlign: "center" }} />

      {/* Footer */}
      <footer className="text-center mt-16 p-8 vintage-card rounded-lg">
        <p className="text-vintage-brown typewriter-text">
          © 2025 Songs Lyrics – The definitive source for all song lyrics.
        </p>
      </footer>
    </div>
  );
}
