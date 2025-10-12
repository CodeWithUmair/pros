import prisma from "../../config/db";
import { getIo } from "../../socket";
import { sendPushNotification } from "../fcm-service";
import {
  SendRequestDTO,
  RespondToRequestDTO,
  GetMyConnectionsDTO,
  GetPendingRequestsDTO,
} from "./DTO";

export const sendRequest = async ({ requesterId, receiverId }: SendRequestDTO) => {
  if (requesterId === receiverId) throw new Error("You cannot connect with yourself.");

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });
  if (existing) throw new Error("Connection already exists or pending.");

  // ✅ Get requester info (to show name)
  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: { id: true, name: true },
  });

  const connection = await prisma.connection.create({
    data: { requesterId, receiverId },
  });

  // ✅ Create a more readable notification
  const content = `You have a new connection request from ${requester?.name || "a user"}`;

  const notification = await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "CONNECTION",
      content,
      meta: requester ? { requesterId: requester.id } : null
    },
  });

  // ✅ Emit via socket
  try {
    const io = getIo();
    console.log("🔔 Emitting notification to:", receiverId);
    io.to(String(receiverId)).emit("receive_notification", notification);
  } catch (err) {
    console.error("Socket emit failed:", err);
  }

  // ✅ Optional: send FCM push
  try {
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (receiver?.fcmToken) {
      sendPushNotification(receiver.fcmToken, "New Connection Request", content);
    }
  } catch (err) {
    console.error("FCM push failed:", err);
  }

  return connection;
};

export const respondToRequest = async ({ connectionId, userId, accept }: RespondToRequestDTO) => {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
    include: { requester: true, receiver: true },
  });

  if (!connection) throw new Error("Request not found.");
  if (connection.receiverId !== userId) throw new Error("Not authorized.");

  const updatedConnection = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: accept ? "ACCEPTED" : "REJECTED" },
    include: { requester: true, receiver: true },
  });

  if (accept) {
    const notification = await prisma.notification.create({
      data: {
        userId: connection.requesterId,
        type: "CONNECTION",
        content: `${connection.receiver.name} accepted your connection request!`,
      },
    });

    try {

      console.log("🔔 Emitting notification to:", connection.requesterId);

      const io = getIo();
      io.to(connection.requesterId).emit("receive_notification", notification);
    } catch (err) {
      console.error("Socket emit failed:", err);
    }

    try {
      if (connection.requester.fcmToken) {
        sendPushNotification(
          connection.requester.fcmToken,
          "Connection Accepted",
          `${connection.receiver.name} accepted your request`
        );
      }
    } catch (err) {
      console.error("FCM push failed:", err);
    }
  }
  return updatedConnection;
};

export const getMyConnections = async ({ userId }: GetMyConnectionsDTO) => {
  const connections = await prisma.connection.findMany({
    where: {
      OR: [
        { requesterId: userId, status: "ACCEPTED" },
        { receiverId: userId, status: "ACCEPTED" },
      ],
    },
    include: { requester: true, receiver: true },
  });

  return connections.map((c) =>
    c.requesterId === userId ? c.receiver : c.requester
  );
};

export const getPendingRequests = async ({ userId }: GetPendingRequestsDTO) => {
  return prisma.connection.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: { requester: true },
  });
};
