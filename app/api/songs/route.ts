import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [songs, total] = await Promise.all([
      prisma.song.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.song.count(),
    ]);

    const hasMore = skip + songs.length < total;

    return NextResponse.json({
      songs,
      hasMore,
      total,
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Error fetching songs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const song = await prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        year: body.year,
        genre: body.genre,
        duration: body.duration,
        lyrics: body.lyrics,
      },
    });
    return NextResponse.json(song);
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json({ error: "Error creating song" }, { status: 500 });
  }
}
