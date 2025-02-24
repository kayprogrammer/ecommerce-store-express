import { ErrorCode } from "../config/handlers"
import { DELIVERY_STATUS_CHOICES, PAYMENT_STATUS_CHOICES } from "../models/choices"
import { AddToCartSchema, CategorySchema, CheckoutSchema, OrderItemSchema, OrderSchema, OrdersResponseSchema, ProductDetailSchema, ProductListSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Shop"]

const productsDocs = {
    get: {
        tags,
        summary: 'Fetch Latest Products',
        description: `
            Allows anyone to fetch a paginated data of the latest products
        `,
        parameters: [
            generateParamExample("name", "Filter Products By Name", "string", ""),
            ...generatePaginationParamExample("products")
        ],
        security: [{ BearerAuth: [], GuestAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Products Successful Response', SUCCESS_STATUS, "Products Fetched Successfully", ProductsResponseSchema),
            500: ERROR_EXAMPLE_500
        }
    }
}

const SLUG_PARAM = generateParamExample("slug", "Slug of the product", "string", "fine-shirt", "path") 

const productDocs = {
    get: {
        tags,
        summary: 'Fetch Single Product',
        description: `
            Allows anyone to get a single product
        `,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [], GuestAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Product Successful Response', SUCCESS_STATUS, "Product Details Fetched Successfully", ProductDetailSchema),
            404: generateSwaggerResponseExample('Not Found Response', FAILURE_STATUS, "Product does not exist!", null, ErrorCode.NON_EXISTENT),
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Add a review',
        description: `
            Allows anyone to add a review to a product
        `,
        parameters: [SLUG_PARAM],
        requestBody: generateSwaggerRequestExample("Review", ReviewCreateSchema),
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Product Review Successful Response', SUCCESS_STATUS, "Review Added Successfully", ReviewSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: generateSwaggerResponseExample('Not Found Response', FAILURE_STATUS, "Product does not exist!", null, ErrorCode.NON_EXISTENT),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const wishlistDocs = {
    get: {
        tags,
        summary: 'Fetch Products From Wishlist',
        description: `
            Allows both auth users and guests to get products in their wishlist
        `,
        parameters: generatePaginationParamExample("products"),
        security: [{ BearerAuth: [], GuestAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Product Successful Response', SUCCESS_STATUS, "Wishlist Products Fetched Successfully", ProductListSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Add/Remove Wishlist Product',
        description: `
            Allows an authenticated user or guest to add or remove a product to and from their wishlist
        `,
        requestBody: generateSwaggerRequestExample("Product", WishlistCreateSchema),
        security: [{ BearerAuth: [], GuestAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Wishlist Add Successful Response', SUCCESS_STATUS, "Product Added To Wishlist"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: generateSwaggerResponseExample('Not Found Response', FAILURE_STATUS, "Product does not exist!", null, ErrorCode.NON_EXISTENT),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const categoriesDocs = {
    get: {
        tags,
        summary: 'Fetch All Categories',
        description: `
            Allows anyone to fetch all categories
        `,
        responses: {
            200: generateSwaggerResponseExample('Categories Successful Response', SUCCESS_STATUS, "Categories Fetched Successfully", CategorySchema, null, true),
            500: ERROR_EXAMPLE_500
        }
    }
}

const categoryProductsDocs = {
    get: {
        tags,
        summary: 'Fetch All Products In A Category',
        description: `
            Allows anyone to fetch all products in a category.
        `,
        parameters: [
            generateParamExample("name", "Filter Products By Name", "string", ""),
            generateParamExample("slug", "Filter Products By Category Slug", "string", "clothing", "path"),
            ...generatePaginationParamExample("products")
        ],
        responses: {
            200: generateSwaggerResponseExample('Categories Successful Response', SUCCESS_STATUS, "Categories Fetched Successfully", CategorySchema, null, true),
            404: generateSwaggerResponseExample('Not Found Response', FAILURE_STATUS, "Category does not exist!", null, ErrorCode.NON_EXISTENT),
            500: ERROR_EXAMPLE_500
        }
    }
}

const cartDocs = {
    get: {
        tags,
        summary: "Get all items in user's cart",
        description: `
            Allows users to retrieve items in their cart.
        `,
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Cart Successful Response', SUCCESS_STATUS, "Cart Fetched Successfully", OrderItemSchema, null, true),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Add/Update/Remove item to & from cart.',
        description: `
            Allows users to add/update/remove item to, in and from cart.
            To remove the item from cart. Just set the quantity to 0
        `,
        requestBody: generateSwaggerRequestExample("Item", AddToCartSchema),
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('OrderItem added/updated/removed Successful Response', SUCCESS_STATUS, "Orderitem Added Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const checkoutDocs = {
    post: {
        tags,
        summary: 'Create/Confirm an order.',
        description: `
            Allows users to create/confirm an order.
        `,
        requestBody: generateSwaggerRequestExample("Checkout", CheckoutSchema),
        security: [{ BearerAuth: [] }],
        responses: {
            201: generateSwaggerResponseExample('Order created successfully Response', SUCCESS_STATUS, "Order created successfully", OrderSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: generateSwaggerResponseExample('Not Found Response', FAILURE_STATUS, "User has no shipping address with that ID!", null, ErrorCode.NON_EXISTENT),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const orderDocs = {
    get: {
        tags,
        summary: "Get all orders for a user",
        description: `
            Allows users to retrieve all their orders.
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
            generateParamExample("paymentStatus", "Payment status of the order (Pending, Processing, Successful, Cancelled, Failed)", 'string', ""),
            generateParamExample("deliveryStatus", "Delivery status of the order (Pending, Packing, Shipping, Arriving, Success)", 'string', ""),
            ...generatePaginationParamExample("orders")
        ],
        responses: {
            200: generateSwaggerResponseExample('Orders Successful Response', SUCCESS_STATUS, "Orders Fetched Successfully", OrdersResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
}

export { productsDocs, productDocs, wishlistDocs, categoriesDocs, categoryProductsDocs, cartDocs, checkoutDocs, orderDocs }