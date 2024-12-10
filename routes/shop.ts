import { NextFunction, Request, Response, Router } from "express";
import { paginateModel, paginateRecords } from "../config/paginators";
import { Category, IReview, OrderItem, Product, Review, Wishlist } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { AddToCartSchema, CategorySchema, OrderItemSchema, ProductDetailSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { getOrderItems, getProducts } from "../managers/shop";
import { getAvgRating } from "../models/utils";

const shopRouter = Router();

/**
 * @route GET /products
 * @description Return all products.
 */
shopRouter.get('/products', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nameFilter = req.query.name as string | null
        const filter: Record<string,any> = {}
        if (nameFilter) filter.name = { $regex: nameFilter, $options: "i" }
        const products = await getProducts(req.user_, filter)
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
        
        // Set reviews count & avgRating
        const data = await paginateModel(req, Review, { product: product._id }, "user", { rating: -1 } )
        product.avgRating = getAvgRating(data.items as IReview[])
        product.reviews = data
        return res.status(200).json(CustomResponse.success('Product Details Fetched Successfully', product, ProductDetailSchema))
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
        const product = await Product.findOne({ slug: req.params.slug, isApproved: true })
        if (!product) throw new NotFoundError("Product does not exist!")

        const { rating, text } = req.body

        let review = await Review.findOne({ product: product._id, user: user._id }).populate("user")
        let action = "Added" 
        if (review) {
            review.text = text
            review.rating = rating
            await review.save()
            action = "Updated"
        } else {
            review = await Review.create({ user: user._id, product: product._id, text, rating })
            review.user = user
        }
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
shopRouter.get('/categories/:slug', authOrGuestMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
        if (!category) throw new NotFoundError("Category does not exist")

        const filter: Record<string,any> = { "category._id": category._id }
        const nameFilter = req.query.name as string | null
        if (nameFilter) filter.name = { $regex: nameFilter, $options: "i" }

        const products = await getProducts(req.user_, filter)
        const data = await paginateRecords(req, products)
        const productsData = { products: data.items, ...data }
        return res.status(200).json(CustomResponse.success('Category Products Fetched Successfully', productsData, ProductsResponseSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /cart
 * @description Return guest or user's cart.
 */
shopRouter.get('/cart', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user_
        const orderitems = await getOrderItems(user)
        return res.status(200).json(CustomResponse.success('Orderitems Fetched Successfully', orderitems, OrderItemSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /cart
 * @description Add/Update/Remove item to & from cart.
 */
shopRouter.post('/cart', authMiddleware, validationMiddleware(AddToCartSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user_
        const { slug, quantity, variantId } = req.body
        const product = await Product.findOne({ slug })
        const userKey = 'email' in user ? "user" : "guest"
        const dataToCreate: Record<string, any> = { [userKey]: user._id };
        if (!product) throw new ValidationErr("slug", "Product does not exist")
        if (variantId) {
            const variant = product.variants.find((variant) => variant._id.toString() === variantId)
            if (!variant) throw new ValidationErr("variantId", "Product has no variants with that ID")
            if (quantity > variant.stock) throw new ValidationErr("quantity", "Quantity out of range for the particular variant")
            dataToCreate.variant = variantId
        } else {
            if (product.variants.length > 0) throw new ValidationErr("variantId", "Please add a variant")
            if (quantity > product.generalStock) throw new ValidationErr("quantity", "Quantity out of range")
        }
        let responseMessageSubstring = "Updated In"
        if (quantity === 0) {
            // Remove from cart
            await OrderItem.deleteOne({ [userKey]: user._id, product: product._id })
            responseMessageSubstring = "Removed From"
        } else {
            // Update Orderitem
            const orderitem = await OrderItem.findOneAndUpdate(
                { [userKey]: user._id, product: product._id, variant: variantId, order: null },
                { quantity, variant: variantId }
            )
            if (!orderitem) {
                // Create Orderitem
                await OrderItem.create({ [userKey]: user._id, product: product._id, quantity, variant: variantId }) 
                responseMessageSubstring = "Added To"
            }
        }
        return res.status(200).json(CustomResponse.success(`Orderitem ${responseMessageSubstring} Cart Successfully`))
    } catch (error) {
        next(error)
    }
});

export default shopRouter