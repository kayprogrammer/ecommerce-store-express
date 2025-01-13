import { NextFunction, Request, Response, Router } from "express";
import { paginateModel, paginateRecords } from "../config/paginators";
import { Category, IReview, Order, OrderItem, Product, Review, Wishlist } from "../models/shop";
import { SELLER_POPULATION } from "../managers/users";
import { CustomResponse } from "../config/utils";
import { AddToCartSchema, CategorySchema, CheckoutSchema, OrderItemSchema, OrderSchema, OrdersResponseSchema, ProductDetailSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { authMiddleware, authOrGuestMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { confirmOrder, getOrderItems, getOrdersWithDetailedOrderItems, getProducts } from "../managers/shop";
import { getAvgRating } from "../models/utils";
import { ShippingAddress } from "../models/profiles";
import http from "../config/http";
import ENV from "../config/conf";
import { sendEmail } from "../config/emailer";
import { PAYMENT_STATUS_CHOICES } from "../models/choices";

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
        const product = await Product.findOne({ slug: req.params.slug })
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
            if (quantity > product.stock) throw new ValidationErr("quantity", "Quantity out of range")
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

/**
 * @route POST /checkout
 * @description Create/Confirm an order.
 */
shopRouter.post('/checkout', authMiddleware, validationMiddleware(CheckoutSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { shippingId } = req.body
        const shippingAddress = await ShippingAddress.findOne({ user: user._id, _id: shippingId }).populate("country_").select("-country_ -user")
        if (!shippingAddress) throw new NotFoundError("User has no shipping address with that ID")
        const order = await confirmOrder(user, shippingAddress)
        return res.status(201).json(CustomResponse.success(`Order created successfully`, order, OrderSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /orders
 * @description List all user orders.
 */
shopRouter.get('/orders', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { paymentStatus, deliveryStatus } = req.query
        const filter: Record<string,any> = { user: user._id }
        if (paymentStatus) filter.paymentStatus = paymentStatus
        if (deliveryStatus) filter.deliveryStatus = deliveryStatus
        const orderitems = await getOrdersWithDetailedOrderItems(filter)
        const data = await paginateRecords(req, orderitems)
        const ordersData = { orders: data.items, ...data }
        return res.status(200).json(CustomResponse.success(`Orders returned successfully`, ordersData, OrdersResponseSchema))
    } catch (error) {
        next(error)
    }
});

shopRouter.post("/webhook", async (req, res) => {
    const signature = req.headers["verif-hash"];
    if (!signature || (signature !== ENV.FLW_SECRET_HASH)) {
        // This request isn't from Flutterwave; discard
        res.status(401).end();
    }
    const payload = req.body;
    const response = await http.setBaseUrl(ENV.FLW_VERIFICATION_URL).setBearerToken(ENV.FLW_SECK).get("", { tx_ref: payload.txRef });
    const data = (await response.json())?.data
    if (!data) {
        // This transaction doesn't exist; discard
        res.status(200).end();
    }
    const status = data.status.toLowerCase();
    const customer = data.customer
    if (!customer) {
        // This customer doesn't exist; discard
        // Apply correct logging here later
        res.status(200).end();
    }
    const paymentData: { name: string, email: string, type: string, amount: number } = { 
        name: customer?.name.split(" ")[0], email: customer?.email, 
        type: status, amount: data.amount 
    }
    const order = await Order.findOne({ txRef: data.tx_ref })
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product', // Populate the product field inside each orderItem
                model: 'Product', // Ensure the model name matches your schema
            },
        })
    if (!order) {
        // This order doesn't exist; discard
        // Apply correct logging here later
        paymentData.type = "invalid"
        await sendEmail("payment-failed", null, paymentData)
        res.status(200).end();
        return
    }
    if (status === "successful") {
        const amountPaid = data.amount;
        if (amountPaid < order.total) {
            // This payment is more than the order total; discard
            // Apply correct logging here later
            order.paymentStatus = PAYMENT_STATUS_CHOICES.FAILED
            await order.save()
            paymentData.type = "failed"
            await sendEmail("payment-failed", null, paymentData)
            res.status(200).end();
            return
        }

        order.paymentStatus = PAYMENT_STATUS_CHOICES.SUCCESSFUL
        await order.save()
        await sendEmail("payment-success", null, paymentData)
    } else if (status === "failed") {
        order.paymentStatus = PAYMENT_STATUS_CHOICES.FAILED
        await order.save()
        await sendEmail("payment-failed", null, paymentData)
        res.status(200).end()
    }
    res.status(200).end()
});

export default shopRouter