import { NextFunction, Request, Response, Router } from "express";
import { paginateModel } from "../config/paginators";
import { Product } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { ProductsResponseSchema } from "../schemas/shop";

const shopRouter = Router();

/**
 * @route GET /products
 * @description Return all products.
 */
shopRouter.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await paginateModel(req, Product, {}, [SELLER_POPULATION, "category"], { createdAt: -1 })
        const productsData = { products: data.items, ...data }
        return res.status(200).json(CustomResponse.success('Products Fetched Successfully', productsData, ProductsResponseSchema))
    } catch (error) {
        next(error)
    }
});

export default shopRouter