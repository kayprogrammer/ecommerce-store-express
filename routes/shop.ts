import { NextFunction, Request, Response, Router } from "express";
import { paginateModel } from "../config/paginators";
import { Product, Wishlist } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { ProductSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop";
import { NotFoundError, RequestError } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
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

/**
 * @route GET /wishlist
 * @description Return all products in a wishlist.
 */
shopRouter.get('/wishlist', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user_
        const wishlistProductIDs = (await Wishlist.find({ $or: [{ user: user._id }, { guest: user._id }] }, "_id")).map(doc => doc.product)
        const data = await paginateModel(req, Product, { _id: { $in: wishlistProductIDs } }, [SELLER_POPULATION, "category"], { createdAt: -1 })
        const productsData = { products: data.items, ...data }
        return res.status(200).json(CustomResponse.success('Wishlist Products Fetched Successfully', productsData, ProductsResponseSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /wishlist
 * @description Add or remove a product from wishlist.
 */
shopRouter.post('/wishlist', authOrGuestMiddleware, validationMiddleware(WishlistCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user_
        const product = await Product.findOne({ slug: req.body.slug })
        if(!product) throw new NotFoundError("Product Not Found") 
        const wishlist = await Wishlist.findOne({ $or: [{ user: user._id }, { guest: user._id }], product: product._id })
        let responseMessageSubstring = "Removed From"
        if (wishlist) {
            await wishlist.deleteOne()
        } else {
            const dataToCreate = { product: product._id, [ "email" in user ? "user" : "guest" ]: user._id };
            await Wishlist.create(dataToCreate)
            responseMessageSubstring = "Added To"
        }
        return res.status(200).json(CustomResponse.success(`Product ${responseMessageSubstring} Wishlist`))
    } catch (error) {
        next(error)
    }
});

export default shopRouter