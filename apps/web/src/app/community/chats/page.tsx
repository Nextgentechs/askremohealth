import { api } from '@web/trpc/server'
import { db } from "@web/server/db";
import { chats, users, doctors, profilePictures } from "@web/server/db/schema";
import { eq, or } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import LeftMenu from "@web/components/community/leftMenu/LeftMenu";
import RightMenu from "@web/components/community/rightMenu/RightMenu";
import { sql } from "drizzle-orm";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";

const ChatsPage = async () => {
  const user = await api.users.currentUser();
  if (!user) redirect("/auth");
  const userId = user.id;

  const userChats = await db
    .select({
      id: chats.id,
      doctorId: chats.doctorId,
      patientId: chats.patientId,
      createdAt: chats.createdAt,
      doctorFirstName: sql<string>`doctor.first_name`.as('doctorFirstName'),
      doctorLastName: sql<string>`doctor.last_name`.as('doctorLastName'),
      doctorProfilePicture: sql<string>`doctor_profile.url`.as('doctorProfilePicture'),
      patientFirstName: sql<string>`patient.first_name`.as('patientFirstName'),
      patientLastName: sql<string>`patient.last_name`.as('patientLastName'),
    })
    .from(chats)
    .leftJoin(sql`${users} as doctor`, sql`doctor.id = ${chats.doctorId}`)
    .leftJoin(sql`${users} as patient`, sql`patient.id = ${chats.patientId}`)
    .leftJoin(sql`${doctors} as doctor_info`, sql`doctor_info.user_id = doctor.id`)
    .leftJoin(sql`${profilePictures} as doctor_profile`, sql`doctor_profile.doctor_id = doctor_info.id`)
    .where(or(eq(chats.doctorId, userId), eq(chats.patientId, userId)));


  return (
    <div className="flex gap-6 pt-1 h-[calc(100vh-96px)] overflow-hidden">
      <div className="hidden xl:block w-[20%] overflow-y-auto">
        <LeftMenu type="home" />
      </div>
      <div className="w-full lg:w-[70%] xl:w-[50%] overflow-y-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold ml-4">My Chats</h1>
          {userChats.length === 0 ? (
            <p className="text-gray-700 ml-4 mt-4">You don&apos;t have any chats initiated</p>
          ) : (
          <div className="space-y-2">
            {userChats.map((chat) => {
                const isDoctor = chat.doctorId === userId;
                const otherUserName = isDoctor 
                    ? (chat.patientFirstName && chat.patientLastName 
                        ? `${chat.patientFirstName} ${chat.patientLastName}` 
                        : "Anonymous Patient")
                    : (chat.doctorFirstName && chat.doctorLastName 
                        ? `${chat.doctorFirstName} ${chat.doctorLastName}` 
                        : "Doctor");
                const otherUserProfilePicture = isDoctor ? null : chat.doctorProfilePicture;
                const isOtherUserDoctor = !isDoctor;

                return (
                    <Link
                        key={chat.id}
                        href={`/community/chats/${chat.id}`}
                        className="block p-4 rounded-lg hover:bg-gray-200"
                    >
                        <div className="flex items-center gap-4">
                            <Image
                                src={otherUserProfilePicture ?? "/assets/community/noAvatar.png"}
                                alt={otherUserName}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded-full object-cover"
                                unoptimized={otherUserProfilePicture == null}
                            />
                            <div>
                                <div className="flex items-center gap-0.5">
                                    <div className="font-medium">{otherUserName}</div>
                                    {isOtherUserDoctor && (
                                        <BadgeCheck size={20} className="fill-violet-900 text-white" />
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Started {chat.createdAt.toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
          </div>
          )}  
        </div>
      </div>
      <div className="hidden lg:block w-[30%] overflow-y-auto">
        <RightMenu />
      </div>
    </div>
  );
};

export default ChatsPage;