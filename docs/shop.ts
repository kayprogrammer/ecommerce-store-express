import { ProductsResponseSchema } from "../schemas/shop"
import { ERROR_EXAMPLE_500, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateSwaggerResponseExample } from "./utils"

const tags = ["Shop"]

const productsDocs = {
    get: {
        tags,
        summary: 'Fetch Latest Products',
        description: `Allows anyone to fetch a paginated data of the latest products`,
        parameters: generatePaginationParamExample("products"),
        responses: {
            200: generateSwaggerResponseExample('Products Successful Response', SUCCESS_STATUS, "Products Fetched Successfully", ProductsResponseSchema),
            500: ERROR_EXAMPLE_500
        }
    }
}

export { productsDocs }