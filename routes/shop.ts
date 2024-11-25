import { NextFunction, Request, Response, Router } from "express";
import { paginateModel } from "../config/paginators";
import { Product } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { ProductSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema } from "../schemas/shop";
import { NotFoundError } from "../config/handlers";
import { authMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";

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

/**
 * @route GET /products/:slug
 * @description Return single product.
 */
shopRouter.get('/products/:slug', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate([SELLER_POPULATION, "category"])
        if (!product) throw new NotFoundError("Product does not exist!")
        return res.status(200).json(CustomResponse.success('Product Details Fetched Successfully', product, ProductSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /products/:slug
 * @description Write review.
 */
shopRouter.post('/products/:slug', authMiddleware, validationMiddleware(ReviewCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const product = await Product.findOne({ slug: req.params.slug })
        if (!product) throw new NotFoundError("Product does not exist!")

        const { rating, text } = req.body

        let review = product.reviews.find((review: any) => review.user = user._id)
        let action = "Added" 
        if (review) {
            review.text = text
            review.rating = rating
            action = "Updated"
        } else {
            product.reviews.push({ user: user._id, text, rating })
        }
        await product.save()
        review = { user, text, rating }
        return res.status(200).json(CustomResponse.success(
            `Review ${action} Successfully`, review, ReviewSchema
        ))
    } catch (error) {
        next(error)
    }
});

export default shopRouter