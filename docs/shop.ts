import { ErrorCode } from "../config/handlers"
import { ProductSchema, ProductsResponseSchema, ReviewCreateSchema, ReviewSchema } from "../schemas/shop"
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
        parameters: generatePaginationParamExample("products"),
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

export { productsDocs, productDocs }