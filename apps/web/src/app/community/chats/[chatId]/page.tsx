import { auth } from "@clerk/nextjs/server";
import { db } from "@web/server/db";
import { chats, users, messages, doctors, profilePictures } from "@web/server/db/schema";
import { eq, and, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import ChatRoom from "@web/components/community/chats/ChatRoom";
import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import { sql } from "drizzle-orm";

const ChatPage = async ({ params }: { params: Promise<{ chatId: string[] }> }) => {
  const { userId } = await auth();
  const { chatId } = await params;
  const chatIdString = Array.isArray(chatId) ? chatId[0] : chatId;
  if (!chatIdString) redirect("/community/chats");

  if (!userId) redirect("/auth");

  const [chatData] = await db
    .select({
        id: chats.id,
        doctorId: chats.doctorId,
        patientId: chats.patientId,
        doctorFirstName: sql<string>`doctor.first_name`.as('doctorFirstName'),
        doctorLastName: sql<string>`doctor.last_name`.as('doctorLastName'),
        patientFirstName: sql<string>`patient.first_name`.as('patientFirstName'),
        patientLastName: sql<string>`patient.last_name`.as('patientLastName'),
        doctorProfilePicture: sql<string>`doctor_profile.url`.as('doctorProfilePicture'),
    })
    .from(chats)
    .leftJoin(sql`${users} as doctor`, sql`doctor.id = ${chats.doctorId}`)
    .leftJoin(sql`${users} as patient`, sql`patient.id = ${chats.patientId}`)
    .leftJoin(sql`${doctors} as doctor_info`, sql`doctor_info.user_id = doctor.id`)
    .leftJoin(sql`${profilePictures} as doctor_profile`, sql`doctor_profile.doctor_id = doctor_info.id`)
    .where(
        and(
        eq(chats.id, chatIdString),
        or(eq(chats.doctorId, userId), eq(chats.patientId, userId))
        )
    );

  if (!chatData) redirect("/community/chats");

  const chatMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      senderId: messages.senderId,
      createdAt: messages.createdAt,
      senderFirstName: users.firstName,
      senderLastName: users.lastName,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.chatId, chatIdString))
    .orderBy(messages.createdAt);

  return (
    <div className="flex gap-6 pt-1 h-[calc(100vh-96px)] overflow-hidden">
        <div className="hidden xl:block w-[20%] overflow-y-auto">
            <LeftMenu type="home" />
        </div>
        <div className="w-full lg:w-[70%] xl:w-[50%] flex flex-col">
            <ChatRoom
            chatId={chatIdString}
            currentUserId={userId}
            messages={chatMessages}
            otherUserName={
            chatData.doctorId === userId
                ? (chatData.patientFirstName && chatData.patientLastName 
                    ? `${chatData.patientFirstName} ${chatData.patientLastName}` 
                    : "Anonymous")
                : (chatData.doctorFirstName && chatData.doctorLastName 
                    ? `${chatData.doctorFirstName} ${chatData.doctorLastName}` 
                    : "Doctor")
            }
            otherUserProfilePicture={
                chatData.doctorId === userId 
                    ? null 
                    : chatData.doctorProfilePicture
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