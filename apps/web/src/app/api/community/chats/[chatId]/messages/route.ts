import { db } from '@web/server/db'
import { chats, messages } from '@web/server/db/schema'
import { api } from '@web/trpc/server'
import { and, eq, or } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> },
) {
  const user = await api.users.currentUser()
  const userId = user?.id

  const { chatId } = await params
  const { content } = await request.json()

  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify user is part of this chat
  const [chat] = await db
    .select()
    .from(chats)
    .where(
      and(
        eq(chats.id, chatId),
        or(eq(chats.doctorId, userId), eq(chats.patientId, userId)),
      ),
    )

  if (!chat)
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })

  // Insert message
  const [newMessage] = await db
    .insert(messages)
    .values({
      content,
      userId,
      senderId: userId,
      chatId,
    })
    .returning()

  // Get sender info
  const messageWithSender = {
    ...newMessage,
    senderUsername: `${user.firstName} ${user.lastName}`,
  }

  // Emit to socket
  const io = globalThis.ioServer
  if (io) {
    io.to(chatId).emit('new-message', messageWithSender)
  }

  return NextResponse.json(messageWithSender)
}
