"use server";

import { api } from '@web/trpc/server'
import { db } from "@web/server/db";
import { posts, likes, comments, users, chats, doctors, profilePictures } from "@web/server/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export const addPost = async (formData: FormData, img?: string, video?: string) => {
  try {
    const user = await api.users.currentUser();
    const userId = user?.id;

    if (!userId) {
      console.log("No userId found");
      throw new Error("User is not authenticated!");
    }

    const desc = formData.get("desc") as string;
    const Desc = z.string().min(1).max(255);
    const validatedDesc = Desc.safeParse(desc);

    if (!validatedDesc.success) {
      console.log("Description validation failed:", validatedDesc.error);
      return { error: "Invalid description" };
    }

    await db.insert(posts).values({
      desc: validatedDesc.data,
      userId,
      ...(img?.trim() && { img }),
      ...(video?.trim() && { video }),
    });

    revalidatePath("/community");
    return { success: true };
  } catch (err) {
    console.log("Error in addPost:", err);
    throw err;
  }
};

export const deletePost = async (postId: string) => {
  const user = await api.users.currentUser();
  const userId = user?.id;

  if (!userId) throw new Error("User is not authenticated!");

  try {
    await db.delete(posts).where(
      and(
        eq(posts.id, postId),
        eq(posts.userId, userId)
      )
    );
    revalidatePath("/community");
  } catch (err) {
    console.log(err);
  }
};

export const switchLike = async (postId: string) => {
  const user = await api.users.currentUser();
  const userId = user?.id;

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const existingLike = await db
      .select()
      .from(likes)
      .where(and(eq(likes.postId, postId), eq(likes.userId, userId)))
      .limit(1);

    if (existingLike.length > 0 && existingLike[0]) {
      await db
        .delete(likes)
        .where(eq(likes.id, existingLike[0].id));
    } else {
      await db
        .insert(likes)
        .values({
          postId,
          userId,
        });
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong");
  }
};

export const addComment = async (postId: string, desc: string) => {
  const user = await api.users.currentUser();
  const userId = user?.id;

  if (!userId) throw new Error("User is not authenticated!");

  try {
    const [createdComment] = await db
      .insert(comments)
      .values({
        desc,
        userId,
        postId,
      })
      .returning();

    // Get user with profile picture join
    const userData = await db
      .select({
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
        },
        profilePicture: profilePictures.url,
      })
      .from(users)
      .leftJoin(doctors, eq(users.id, doctors.userId))
      .leftJoin(profilePictures, eq(doctors.id, profilePictures.doctorId))
      .where(eq(users.id, userId))
      .limit(1);

    const commentWithUser = {
    ...createdComment,
    user: userData[0]?.user ?? {
        id: userId,
        firstName: '',
        lastName: '',
        role: 'patient' as const,
    },
    profilePicture: userData[0]?.profilePicture ?? null,
    };

    return commentWithUser;
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong!");
  }
};

export const initiateConsult = async (doctorId: string, patientId: string) => {
  const chatId = `${patientId}-${doctorId}`;
  
  const result = await db.insert(chats).values({
    id: chatId,
    doctorId,
    patientId,
  }).onConflictDoNothing().returning();
    
  redirect(`/community/chats/${chatId}`);
};