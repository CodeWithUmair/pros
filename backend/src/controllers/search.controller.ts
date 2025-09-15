// src/controllers/search.controller.ts
import { Request, Response, NextFunction } from "express";
import * as searchService from "../services/Search/search.service";

export const searchController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { query, type } = req.query as { query?: string; type?: string };

        if (!query) {
            res.status(400).json({ message: "Query parameter is required" });
            return;
        }

        const results = await searchService.search({ query, type });
        res.json(results);
    } catch (err) {
        next(err);
    }
};
