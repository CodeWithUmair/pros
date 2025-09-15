// src/services/Connection/connection.dto.ts

export interface SendRequestDTO {
    requesterId: string;
    receiverId: string;
}

export interface RespondToRequestDTO {
    connectionId: string;
    userId: string;
    accept: boolean;
}

export interface GetMyConnectionsDTO {
    userId: string;
}

export interface GetPendingRequestsDTO {
    userId: string;
}
