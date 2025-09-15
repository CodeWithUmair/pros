import prisma from "../../config/db";
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

    return prisma.connection.create({
        data: { requesterId, receiverId },
    });
};

export const respondToRequest = async ({ connectionId, userId, accept }: RespondToRequestDTO) => {
    const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection) throw new Error("Request not found.");
    if (connection.receiverId !== userId) throw new Error("Not authorized.");

    return prisma.connection.update({
        where: { id: connectionId },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
    });
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
