import { ErrorCode } from "../config/handlers"
import { CategorySchema, ProductSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema, WishlistCreateSchema } from "../schemas/shop"
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
            generateParamExample("name", "Filter Products By Name", "string", "Shirt"),
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
            200: generateSwaggerResponseExample('Product Successful Response', SUCCESS_STATUS, "Product Details Fetched Successfully", ProductSchema),
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
            200: generateSwaggerResponseExample('Product Successful Response', SUCCESS_STATUS, "Product Details Fetched Successfully", ProductSchema),
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
            generateParamExample("name", "Filter Products By Name", "string", "Shirt"),
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

export { productsDocs, productDocs, wishlistDocs, categoriesDocs, categoryProductsDocs }