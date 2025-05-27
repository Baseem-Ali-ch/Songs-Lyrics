"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Search,
  Music,
  User,
  Calendar,
  Clock,
  Disc,
  Loader2,
} from "lucide-react";
import { prisma } from "@/lib/db";

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

export default function AdminDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    song: Song | null;
  }>({
    show: false,
    song: null,
  });
  const [viewModal, setViewModal] = useState<{
    show: boolean;
    song: Song | null;
  }>({
    show: false,
    song: null,
  });
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("adminLoggedIn");
    if (loggedIn === "true") {
      setIsAuthenticated(true);
      fetchSongs();
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchSongs = async (pageNum = 1) => {
    try {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      const response = await fetch(`/api/songs?page=${pageNum}&limit=10`);
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

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    router.push("/");
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/songs/${id}`, {
        method: "DELETE",
      });
      setSongs(songs.filter((song) => song.id !== id));
      setDeleteModal({ show: false, song: null });
    } catch (error) {
      console.error("Error deleting song:", error);
    }
  };

  const handleAddSong = async (newSong: Omit<Song, "id">) => {
    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSong),
      });
      const addedSong = await response.json();
      setSongs([...songs, addedSong]);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding song:", error);
    }
  };

  const handleEditSong = async (updatedSong: Song) => {
    try {
      const response = await fetch(`/api/songs/${updatedSong.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSong),
      });
      const editedSong = await response.json();
      setSongs(
        songs.map((song) => (song.id === editedSong.id ? editedSong : song))
      );
      setEditingSong(null);
    } catch (error) {
      console.error("Error updating song:", error);
    }
  };

  const filteredSongs = (songs || []).filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="vintage-border p-6 bg-vintage-cream rounded-lg mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1
              className="text-3xl font-bold text-vintage-brown"
              style={{ fontFamily: "Georgia, serif" }}
            >
              🎵 Admin Dashboard
            </h1>
            <p className="text-vintage-brown">Manage your song collection</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLogout}
              className="vintage-button px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="vintage-card p-6 rounded-lg mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vintage-brown"
              size={20}
            />
            <input
              type="text"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="vintage-input w-full pl-10 pr-4 py-3 rounded-lg"
            />
          </div>

          {/* Add Song Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="vintage-button px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Song
          </button>
        </div>
      </div>

      {/* Songs Table */}
      <div className="vintage-card rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-vintage-brown animate-spin" />
              <p className="text-vintage-brown">Loading songs...</p>
            </div>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="vintage-card p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold text-vintage-brown mb-4">
                No Songs Found
              </h2>
              <p className="text-vintage-brown mb-6">
                {searchTerm
                  ? "Try adjusting your search"
                  : "Click 'Add New Song' to start building your collection"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="vintage-button px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  Add New Song
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-vintage-paper border-b-2 border-vintage-brown">
                  <tr>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Title
                    </th>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Artist
                    </th>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Album
                    </th>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Year
                    </th>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Genre
                    </th>
                    <th className="text-left p-4 text-vintage-brown font-bold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, index) => (
                    <tr
                      key={song.id}
                      className={
                        index % 2 === 0 ? "bg-vintage-cream" : "bg-white"
                      }
                    >
                      <td className="p-4 text-vintage-brown font-medium">
                        {song.title}
                      </td>
                      <td className="p-4 text-vintage-brown">{song.artist}</td>
                      <td className="p-4 text-vintage-brown">{song.album}</td>
                      <td className="p-4 text-vintage-brown">{song.year}</td>
                      <td className="p-4 text-vintage-brown">{song.genre}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewModal({ show: true, song })}
                            className="p-2 bg-vintage-gold text-white rounded hover:bg-vintage-brown transition-colors"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setEditingSong(song)}
                            className="p-2 bg-vintage-brown text-white rounded hover:bg-vintage-gold transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteModal({ show: true, song })}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="p-4 border-t border-vintage-brown">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full vintage-button px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
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
      </div>

      {/* Add/Edit Song Modal */}
      {(showAddForm || editingSong) && (
        <SongForm
          song={editingSong}
          onSave={editingSong ? handleEditSong : handleAddSong}
          onCancel={() => {
            setShowAddForm(false);
            setEditingSong(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.song && (
        <DeleteConfirmationModal
          song={deleteModal.song}
          onConfirm={handleDelete}
          onCancel={() => setDeleteModal({ show: false, song: null })}
        />
      )}

      {/* View Song Modal */}
      {viewModal.show && viewModal.song && (
        <ViewSongModal
          song={viewModal.song}
          onClose={() => setViewModal({ show: false, song: null })}
        />
      )}
    </div>
  );
}

// Song Form Component
function SongForm({
  song,
  onSave,
  onCancel,
}: {
  song?: Song | null;
  onSave: (song: any) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: song?.title || "",
    artist: song?.artist || "",
    album: song?.album || "",
    year: song?.year || new Date().getFullYear(),
    genre: song?.genre || "",
    duration: song?.duration || "",
    lyrics: song?.lyrics || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(song ? { ...formData, id: song.id } : formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="vintage-card p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-vintage-brown mb-6">
          {song ? "Edit Song" : "Add New Song"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Artist
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) =>
                  setFormData({ ...formData, artist: e.target.value })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Album
              </label>
              <input
                type="text"
                value={formData.album}
                onChange={(e) =>
                  setFormData({ ...formData, album: e.target.value })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    year: Number.parseInt(e.target.value),
                  })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Genre
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-vintage-brown font-medium mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="vintage-input w-full px-4 py-3 rounded-lg"
                placeholder="e.g., 3:45"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-vintage-brown font-medium mb-2">
              Lyrics
            </label>
            <textarea
              value={formData.lyrics}
              onChange={(e) =>
                setFormData({ ...formData, lyrics: e.target.value })
              }
              className="vintage-input w-full px-4 py-3 rounded-lg h-40"
              placeholder="Enter song lyrics..."
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="vintage-button px-6 py-3 rounded-lg flex-1"
              disabled={loading}
            >
              {loading
                ? song
                  ? "Updating..."
                  : "Adding..."
                : song
                ? "Update Song"
                : "Add Song"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg flex-1 hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({
  song,
  onConfirm,
  onCancel,
}: {
  song: Song;
  onConfirm: (id: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(song.id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="vintage-card p-6 rounded-lg max-w-md w-full">
        <h3 className="text-2xl font-bold text-vintage-brown mb-4">
          Delete Song
        </h3>
        <p className="text-vintage-brown mb-6">
          Are you sure you want to delete "{song.title}" by {song.artist}? This
          action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-3 rounded-lg flex-1 hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg flex-1 hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// View Song Modal Component
function ViewSongModal({ song, onClose }: { song: Song; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="vintage-card p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-bold text-vintage-brown">
            Song Details
          </h3>
          <button
            onClick={onClose}
            className="text-vintage-brown hover:text-vintage-gold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Song Info */}
          <div className="lg:col-span-1">
            <div className="vintage-card p-6 rounded-lg">
              <h4 className="text-xl font-bold text-vintage-brown mb-4 flex items-center gap-2">
                <Disc className="text-vintage-gold" />
                Song Information
              </h4>

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
                    <p className="text-sm text-vintage-brown opacity-70">
                      Album
                    </p>
                    <p className="font-medium text-vintage-brown">
                      {song.album}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-vintage-brown" size={20} />
                  <div>
                    <p className="text-sm text-vintage-brown opacity-70">
                      Year
                    </p>
                    <p className="font-medium text-vintage-brown">
                      {song.year}
                    </p>
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
              <h4 className="text-xl font-bold text-vintage-brown mb-6 flex items-center gap-2">
                <Music className="text-vintage-gold" />
                Lyrics
              </h4>

              <div className="typewriter-text p-6 rounded-lg bg-vintage-paper">
                <pre className="whitespace-pre-wrap text-vintage-brown leading-relaxed font-mono">
                  {song.lyrics}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
