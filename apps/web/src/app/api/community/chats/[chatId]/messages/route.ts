import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { messages, chats, users } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Server } from "socket.io";
import { createServer } from "http";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { userId } = await auth();
  const { chatId } = await params;
  const { content } = await request.json();

  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify user is part of this chat
  const [chat] = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.id, chatId),
        or(eq(chats.doctorId, userId), eq(chats.patientId, userId))
      )
    );

  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });

  // Insert message
  const [newMessage] = await db
    .insert(messages)
    .values({
      content,
      senderId: userId,
      chatId,
    })
    .returning();

  // Get sender info
  const [sender] = await db
    .select({ username: users.username })
    .from(users)
    .where(eq(users.id, userId));

  const messageWithSender = {
    ...newMessage,
    senderUsername: sender?.username,
  };

  // Emit to socket
  const io = (global as any).io;
  if (io) {
    io.to(chatId).emit("new-message", messageWithSender);
  }

  return NextResponse.json(messageWithSender);
}