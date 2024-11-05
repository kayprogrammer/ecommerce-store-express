import { Router, Request, Response, NextFunction } from "express";
import SiteDetail from "../models/general";
import { SiteDetailSchema } from "../schemas/general";
import { CustomResponse } from "../config/utils";

const generalRouter = Router();

generalRouter.get('/site-detail', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const siteDetail = await SiteDetail.getOrCreate({})
        return res.status(200).json(
            CustomResponse.success(
                'Site Details Fetched', 
                siteDetail, 
                SiteDetailSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

export default generalRouter;