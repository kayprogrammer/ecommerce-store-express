import { SellerApplicationSchema } from "../schemas/sellers"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"
import { ProductSchema, ProductsResponseSchema } from "../schemas/shop"
import { ErrorCode } from "../config/handlers"

const tags = ["Sellers"]

const sellerApplicationDocs = {
    post: {
        tags,
        summary: 'Seller Application',
        description: `
            Allows authenticated users to apply to become a seller
        `,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Seller Application", SellerApplicationSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Seller Application Successful Response', SUCCESS_STATUS, "Application Sent Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

// const SLUG_PARAM = 

const sellerProductsDocs = {
    get: {
        tags,
        summary: 'Products By Seller',
        description: `
            Allows anyone to fetch products of a seller
        `,
        parameters: [
            generateParamExample("slug", "Slug of the seller to fetch", "string", "john-clothing", "path"),
            ...generatePaginationParamExample("products")
        ],
        responses: {
            200: generateSwaggerResponseExample('Seller Products Successful Response', SUCCESS_STATUS, "Seller Products Fetched Successfully", ProductsResponseSchema),
            404: generateSwaggerResponseExample("Not Found", FAILURE_STATUS, "No approved seller with that slug", null, ErrorCode.NON_EXISTENT),
            500: ERROR_EXAMPLE_500
        }
    }
}

export { sellerApplicationDocs, sellerProductsDocs }