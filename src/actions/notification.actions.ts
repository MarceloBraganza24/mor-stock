"use server";

import { requireRoles } from "@/lib/auth-utils";
import { connectDB } from "@/lib/mongodb";
import { InternalNotification } from "@/models/InternalNotification";

export async function getInternalNotifications() {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  const notifications = await InternalNotification.find({
    store: session.user.store!,
  })
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = notifications.filter(
    (n) => !n.isRead
  ).length;

  return JSON.parse(
    JSON.stringify({
      notifications,
      unreadCount,
    })
  );
}

export async function markNotificationAsRead(id: string) {
  const session = await requireRoles(["OWNER"]);

  await connectDB();

  await InternalNotification.findOneAndUpdate(
    {
      _id: id,
      store: session.user.store!,
    },
    {
      isRead: true,
    }
  );
}