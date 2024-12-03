import { NextFunction, Request, Response, Router } from "express";
import { paginateModel, paginateRecords } from "../config/paginators";
import { Category, Product, Wishlist } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { CategorySchema, ProductSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop";
import { NotFoundError } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { getProducts } from "../managers/shop";

const shopRouter = Router();

/**
 * @route GET /products
 * @description Return all products.
 */
shopRouter.get('/products', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nameFilter = req.query.name as string | null
        const products = await getProducts(req.user_, nameFilter)
        const data = await paginateRecords(req, products)
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
shopRouter.get('/products/:slug', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user_
        const product = await Product.findOne({ slug: req.params.slug }).populate([SELLER_POPULATION, "category"])
        if (!product) throw new NotFoundError("Product does not exist!")
        product.wishlisted = (await Wishlist.exists({ product: product._id, $or: [{ user: user._id }, { guest: user._id }] })) ? true : false
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
        const wishlistProductIDs = (await Wishlist.find({ $or: [{ user: user._id }, { guest: user._id }] }, "product")).map(doc => doc.product)
        const data = await paginateModel(req, Product, { _id: { $in: wishlistProductIDs } }, [SELLER_POPULATION, "category"], { createdAt: -1 })
        const productsData = { products: data.items, ...data }
        const guestId = "email" in user ? null : user.id
        return res.status(200).json(CustomResponse.success('Wishlist Products Fetched Successfully', productsData, ProductsResponseSchema, guestId))
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
        const guestId = "email" in user ? null : user.id
        return res.status(200).json(CustomResponse.success(`Product ${responseMessageSubstring} Wishlist`, guestId))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /categories
 * @description Return all categories.
 */
shopRouter.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.find({})
        return res.status(200).json(CustomResponse.success('Categories Fetched Successfully', categories, CategorySchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /categories/:slug
 * @description Return all products in a category.
 */
// shopRouter.get('/products', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const nameFilter = req.query.name as string | null
//         const products = await getProducts(req.user_, nameFilter)
//         const data = await paginateRecords(req, products)
//         const productsData = { products: data.items, ...data }
//         return res.status(200).json(CustomResponse.success('Products Fetched Successfully', productsData, ProductsResponseSchema))
//     } catch (error) {
//         next(error)
//     }
// });


export default shopRouter