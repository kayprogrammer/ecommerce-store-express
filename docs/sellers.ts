import { SellerApplicationSchema } from "../schemas/sellers"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, SUCCESS_STATUS } from "./base"
import { generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Sellers"]

const sellerApplicationDocs = {
    post: {
        tags,
        summary: 'Seller Application',
        description: `Allows authenticated users to apply to become a seller`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Seller Application", SellerApplicationSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Seller Application Successful Response', SUCCESS_STATUS, "Application Successful"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

export { sellerApplicationDocs }