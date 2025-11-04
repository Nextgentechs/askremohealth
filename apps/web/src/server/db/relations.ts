import { relations } from 'drizzle-orm'
import {
  appointmentLogs,
  appointments,
  certificates,
  doctors,
  facilities,
  adminUser,
  operatingHours,
  patients,
  profilePictures,
  specialties,
  subSpecialties,
  reviews,
  appointmentAttachments,
  users,
  articles,
  article_images,
  notifications,
  officeLocation,
  labs,
  labTestsAvailable,
  tests,
  labAvailability,
  labAppointments,
  likes,
  posts,
  comments,
  chats,
  messages
} from './schema'

export const doctorRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  specialty: one(specialties, {
    fields: [doctors.specialty],
    references: [specialties.id],
  }),
  facility: one(facilities, {
    fields: [doctors.facility],
    references: [facilities.placeId],
  }),
  office: one(officeLocation, {
    fields: [doctors.officeId],
    references: [officeLocation.placeId],
  }),
  profilePicture: one(profilePictures, {
    fields: [doctors.id],
    references: [profilePictures.doctorId],
  }),
  certificates: many(certificates),
  operatingHours: many(operatingHours),
  appointments: many(appointments),
  reviews: many(reviews),
}))

export const adminRelations = relations(adminUser, ({ one, many }) => ({
  user: one(users, {
    fields: [adminUser.userId],
    references: [users.id],
  }),
  
}));

export const patientRelations = relations(patients, ({ many,one }) => ({
  appointments: many(appointments),
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),

}))

export const userRelations = relations(users, ({ one,many }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  patient: one(patients, {
    fields: [users.id],
    references: [patients.userId],
  }),
  notifications: many(notifications),
  articles: many(articles),
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  sentMessages: many(messages),
  doctorChats: many(chats, {
    relationName: 'doctorChats',
  }),
  patientChats: many(chats, {
    relationName: 'patientChats',
  }),
}));


export const facilityRelations = relations(facilities, ({ many }) => ({
  doctors: many(doctors),
}))

export const officeRelations = relations(officeLocation, ({many}) => ({
  doctors: many(doctors),
}) )

export const appointmentRelations = relations(
  appointments,
  ({ one, many }) => ({
    doctor: one(doctors, {
      fields: [appointments.doctorId],
      references: [doctors.id],
    }),
    patient: one(patients, {
      fields: [appointments.patientId],
      references: [patients.id],
    }),
    logs: many(appointmentLogs),
    review: one(reviews, {
      fields: [appointments.id],
      references: [reviews.appointmentId],
    }),
    attachments: many(appointmentAttachments),
  }),
)

export const appointmentLogRelations = relations(
  appointmentLogs,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentLogs.appointmentId],
      references: [appointments.id],
    }),
  }),
)

export const specialtyRelations = relations(specialties, ({ many }) => ({
  doctors: many(doctors),
  subspecialties: many(subSpecialties),
}))

export const certificateRelations = relations(certificates, ({ one }) => ({
  doctor: one(doctors, {
    fields: [certificates.doctorId],
    references: [doctors.id],
  }),
}))

export const operatingHourRelations = relations(operatingHours, ({ one }) => ({
  doctor: one(doctors, {
    fields: [operatingHours.doctorId],
    references: [doctors.id],
  }),
}))

export const reviewRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
  doctor: one(doctors, {
    fields: [reviews.doctorId],
    references: [doctors.id],
  }),
}))

export const appointmentAttachmentRelations = relations(
  appointmentAttachments,
  ({ one }) => ({
    appointment: one(appointments, {
      fields: [appointmentAttachments.appointmentId],
      references: [appointments.id],
    }),
  }),
)

export const profilePictureRelations = relations(
  profilePictures,
  ({ one }) => ({
    doctor: one(doctors, {
      fields: [profilePictures.doctorId],
      references: [doctors.id],
    }),
  }),
) 

export const articleRelations = relations(articles, ({ one }) => ({
  image: one(article_images, {
    fields: [articles.id],
    references: [article_images.articleId],
  }),
}))

export const articleImageRelations = relations(article_images, ({ one }) => ({
  article: one(articles, {
    fields: [article_images.articleId],
    references: [articles.id],
  }),
}))

export const labRelations = relations(labs, ({ one, many }) => ({
  user: one(users, {
    fields: [labs.user_id],
    references: [users.id],
  }),
  labTestsAvailable: many(labTestsAvailable),
   availability: many(labAvailability),
}));

export const userLabRelations = relations(users, ({ one }) => ({
  lab: one(labs, {
    fields: [users.id],
    references: [labs.user_id],
  }),
}));

export const labTestsAvailableRelations = relations(labTestsAvailable, ({ one }) => ({
  test: one(tests, {
    fields: [labTestsAvailable.testId],
    references: [tests.id],
  }),
}));

export const labTestsAvailableRelationsExtended = relations(
  labTestsAvailable,
  ({ one }) => ({
    test: one(tests, {
      fields: [labTestsAvailable.testId],
      references: [tests.id],
    }),
  })
);

export const labAvailabilityRelations = relations(labAvailability, ({ one }) => ({
  lab: one(labs, {
    fields: [labAvailability.lab_id],
    references: [labs.placeId],
  }),
}));

export const labAppointmentRelations = relations(
  labAppointments,
  ({ one }) => ({
    lab: one(labs, {
      fields: [labAppointments.labId],
      references: [labs.placeId],
    }),
    patient: one(patients, {
      fields: [labAppointments.patientId],
      references: [patients.id],
    }),
    doctor: one(doctors, {
      fields: [labAppointments.doctorId],
      references: [doctors.id],
    }),
  }),
);

// Community module

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'replies',
  }),
  replies: many(comments, {
    relationName: 'replies',
  }),
  likes: many(likes),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [likes.commentId],
    references: [comments.id],
  }),
}))

export const chatsRelations = relations(chats, ({ one, many }) => ({
  doctor: one(users, {
    fields: [chats.doctorId],
    references: [users.id],
  }),
  patient: one(users, {
    fields: [chats.patientId],
    references: [users.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}))