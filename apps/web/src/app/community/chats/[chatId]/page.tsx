import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { chats, users, messages } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import ChatRoom from "@/components/chats/ChatRoom";
import LeftMenu from "@/components/leftMenu/LeftMenu";
import RightMenu from "@/components/rightMenu/RightMenu";
import { sql } from "drizzle-orm";

const ChatPage = async ({ params }: { params: Promise<{ chatId: string[] }> }) => {
  const { userId } = await auth();
  const { chatId } = await params;

  if (!userId) redirect("/sign-in");

  const [chatData] = await db
    .select({
        id: chats.id,
        doctorId: chats.doctorId,
        patientId: chats.patientId,
        doctorName: sql<string>`doctor.name`.as('doctorName'),
        doctorSurname: sql<string>`doctor.surname`.as('doctorSurname'),
        doctorUsername: sql<string>`doctor.username`.as('doctorUsername'),
        patientUsername: sql<string>`patient.username`.as('patientUsername'),
        doctorAvatar: sql<string>`doctor.avatar`.as('doctorAvatar'),
        patientAvatar: sql<string>`patient.avatar`.as('patientAvatar'),
    })
    .from(chats)
    .leftJoin(sql`${users} as doctor`, sql`doctor.id = ${chats.doctorId}`)
    .leftJoin(sql`${users} as patient`, sql`patient.id = ${chats.patientId}`)
    .where(
        and(
        eq(chats.id, chatId),
        or(eq(chats.doctorId, userId), eq(chats.patientId, userId))
        )
    );

  if (!chatData) redirect("/chats");

  const chatMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      senderUsername: users.username,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  return (
    <div className="flex gap-6 pt-1 h-[calc(100vh-96px)] overflow-hidden">
        <div className="hidden xl:block w-[20%] overflow-y-auto">
            <LeftMenu type="home" />
        </div>
        <div className="w-full lg:w-[70%] xl:w-[50%] flex flex-col">
            <ChatRoom
            chatId={chatId}
            currentUserId={userId}
            messages={chatMessages}
            otherUserName={
            chatData.doctorId === userId
                ? chatData.patientUsername || "Anonymous"
                : (chatData.doctorName && chatData.doctorSurname 
                    ? `${chatData.doctorName} ${chatData.doctorSurname}` 
                    : chatData.doctorUsername || "Doctor")
            }
            otherUserAvatar={
                chatData.doctorId === userId 
                    ? chatData.patientAvatar 
                    : chatData.doctorAvatar
            }
            isOtherUserDoctor={chatData.doctorId !== userId}
            />
        </div>
        <div className="hidden lg:block w-[30%] overflow-y-auto">
            <RightMenu />
        </div>
    </div>
  );
};

export default ChatPage;