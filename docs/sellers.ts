import { ProductCreateSchema, ProductEditSchema, SellerApplicationSchema, SellerDashboardSchema, VariantCreateSchema, VariantEditSchema } from "../schemas/sellers"
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, PRODUCT_NOT_FOUND_RESPONSE, SUCCESS_STATUS } from "./base"
import { generatePaginationParamExample, generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"
import { OrdersResponseSchema, ProductDetailSchema, ProductsResponseSchema, VariantSchema } from "../schemas/shop"
import { ErrorCode } from "../config/handlers"
import { ID_EXAMPLE } from "../schemas/base"
import { DELIVERY_STATUS_CHOICES, PAYMENT_STATUS_CHOICES } from "../models/choices"

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

const sellerDashboardDocs = {
    get: {
        tags,
        summary: "Get seller Dashboard",
        description: `
            Allows a seller to view his/her basic info including products and orders.
        `,
        security: [{ BearerAuth: [] }],
        parameters: generatePaginationParamExample("products/orders"),
        responses: {
            200: generateSwaggerResponseExample('Dashboard Successful Response', SUCCESS_STATUS, "Dashboard Fetched Successfully", SellerDashboardSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
}

const sellerProductsDocs = {
    get: {
        tags,
        summary: 'Products By Authenticated seller',
        description: `
            Allows an authenticated seller to fetch his/her products
        `,
        parameters: [
            generateParamExample("name", "Filter Products By Name", "string", ""),
            ...generatePaginationParamExample("products")
        ],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('seller Products Successful Response', SUCCESS_STATUS, "seller Products Fetched Successfully", ProductsResponseSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            400: generateSwaggerResponseExample("Invalid Param Response", FAILURE_STATUS, "Invalid status"),
            500: ERROR_EXAMPLE_500
        }
    },

    post: {
        tags,
        summary: 'Create a Product',
        description: `
            Allows a seller to create a product
        `,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Products create", ProductCreateSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Product Added Successfully Response', SUCCESS_STATUS, "Product Added Successfully", ProductDetailSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const SLUG_PARAM = generateParamExample("slug", "Slug of the product", "string", "fine-shirt", "path")
const sellerProductDocs = {
    get: {
        tags,
        summary: 'Fetch Single Product',
        description: `
            Allows anyone to get a single product
        `,
        parameters: [
            SLUG_PARAM,
            ...generatePaginationParamExample("reviews"),
        ],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Product Successful Response', SUCCESS_STATUS, "Product Details Fetched Successfully", ProductDetailSchema),
            404: PRODUCT_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    },
    put: {
        tags,
        summary: 'Update a Product',
        description: `
            Allows a seller to update a product
        `,
        security: [{ BearerAuth: [] }],
        parameters: [SLUG_PARAM],
        requestBody: generateSwaggerRequestExample("Products update", ProductEditSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Product Updated Successfully Response', SUCCESS_STATUS, "Product Updated Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: PRODUCT_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },

    delete: {
        tags,
        summary: 'Delete a Product',
        description: `
            Allows a seller to delete a product
            If there's already an existing confirmed order for the product, the stock will be 0 instead
        `,
        parameters: [SLUG_PARAM],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Product Deleted Successfully Response', SUCCESS_STATUS, "Product Deleted Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: PRODUCT_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const variantCreateDocs = {
    post: {
        tags,
        summary: 'Add variant to product',
        description: `
            Allows a seller to add a variant to a product
        `,
        security: [{ BearerAuth: [] }],
        parameters: [generateParamExample("slug", "Slug of the product", "string", "product-slug", "path")],
        requestBody: generateSwaggerRequestExample("Variant create", VariantCreateSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Variant Added Successfully Response', SUCCESS_STATUS, "Variant Added Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: PRODUCT_NOT_FOUND_RESPONSE,
            400: generateSwaggerResponseExample("Bad Request Variant", FAILURE_STATUS, "Variants max amount exceeded"),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
}

const PRODUCT_OR_VARIANT_NOT_FOUND_RESPONSE = generateSwaggerResponseExample('Variant or Product Not Found Error Response', FAILURE_STATUS, "Variant or Product does not exist")

const variantUpdateDeleteDocs = {
    put: {
        tags,
        summary: 'Update a variant in a product',
        description: `
            Allows a seller to update a variant in a product
        `,
        security: [{ BearerAuth: [] }],
        parameters: [
            generateParamExample("slug", "Slug of the product", "string", "product-slug", "path"),
            generateParamExample("id", "id of the variant", "string", ID_EXAMPLE, "path")
        ],
        requestBody: generateSwaggerRequestExample("Variant update", VariantEditSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Variant Updated Successfully Response', SUCCESS_STATUS, "Variant Updated Successfully", VariantSchema),
            400: generateSwaggerResponseExample("Bad Request Variant", FAILURE_STATUS, "Variants max amount exceeded"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: PRODUCT_OR_VARIANT_NOT_FOUND_RESPONSE,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },
    delete: {
        tags,
        summary: 'Delete a variant in a product',
        description: `
            Allows a seller to delete a variant in a product
            If there's already an existing confirmed order for that variant, the stock changes to 0 instead
        `,
        parameters: [
            generateParamExample("slug", "Slug of the product", "string", "product-slug", "path"),
            generateParamExample("id", "id of the variant", "string", ID_EXAMPLE, "path")
        ],
        security: [{ BearerAuth: [] }],
        responses: {
            200: generateSwaggerResponseExample('Variant Deleted Successfully Response', SUCCESS_STATUS, "Variant Deleted Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: PRODUCT_OR_VARIANT_NOT_FOUND_RESPONSE,
            500: ERROR_EXAMPLE_500
        }
    }
}

const sellerOrderDocs = {
    get: {
        tags,
        summary: "Get all orders partaining to a seller",
        description: `
            Allows a seller to get all orders partaining to his/her products.
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
            400: generateSwaggerResponseExample("Invalid Param Response", FAILURE_STATUS, "Invalid payment or delivery status"),
            500: ERROR_EXAMPLE_500
        }
    }
}

export { 
    sellerApplicationDocs, sellerDashboardDocs, sellerProductsDocs, sellerProductDocs, 
    variantCreateDocs, variantUpdateDeleteDocs, sellerOrderDocs
    
}