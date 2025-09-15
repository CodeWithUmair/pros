import { Request, Response, NextFunction } from "express";
import * as connectionService from "../services/Connection/connection.service";
import { AuthenticatedRequest } from "../types/express";

// POST /connections/:receiverId
export const sendRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const connection = await connectionService.sendRequest({
            requesterId: req.user!.id,
            receiverId: req.params.receiverId,
        });
        res.status(201).json(connection);
    } catch (err) {
        next(err);
    }
};

// PATCH /connections/:id/respond
export const respondToRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const connection = await connectionService.respondToRequest({
            connectionId: req.params.id,
            userId: req.user!.id,
            accept: req.body.accept,
        });
        res.json(connection);
    } catch (err) {
        next(err);
    }
};

// GET /connections/me
export const getMyConnections = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const connections = await connectionService.getMyConnections({
            userId: req.user!.id,
        });
        res.json(connections);
    } catch (err) {
        next(err);
    }
};

// GET /connections/pending
export const getPendingRequests = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const requests = await connectionService.getPendingRequests({
            userId: req.user!.id,
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
};
