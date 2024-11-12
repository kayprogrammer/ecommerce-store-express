import { ErrorCode } from "../config/handlers";
import { ID_EXAMPLE } from "../schemas/base";
import { CountrySchema, ProfileEditSchema, ShippingAddressInputSchema, ShippingAddressSchema } from "../schemas/profiles";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateParamExample, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

const tags = ["Profiles"]

const profileDocs = {
    get: {
        tags,
        summary: 'View Profile',
        description: `Allows authenticated users to view their profile`,
        security: [{ BearerAuth: [] }], // Require BearerAuth for this endpoint
        responses: {
            200: generateSwaggerResponseExample('Profile view successful response', SUCCESS_STATUS, "Profile Retrieved Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Update Profile',
        description: `Allows authenticated users to update their profile`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Profile", ProfileEditSchema, "multipart/form-data"),
        responses: {
            200: generateSwaggerResponseExample('Profile update successful response', SUCCESS_STATUS, "Profile updated successful"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
};

const countriesDocs = {
    get: {
        tags,
        summary: 'View All Countries',
        description: `Allows people to view all countries`,
        security: [{ BearerAuth: [] }], 
        responses: {
            200: generateSwaggerResponseExample('Countries successful response', SUCCESS_STATUS, "Countries Retrieved Successfully", CountrySchema, null, true),
            500: ERROR_EXAMPLE_500
        }
    }
}

const shippingAddressesDocs = {
    get: {
        tags,
        summary: 'View Shipping Addresses',
        description: `Allows authenticated users to view all their created shipping addresses`,
        security: [{ BearerAuth: [] }], 
        responses: {
            200: generateSwaggerResponseExample('Shipping Addresses successful response', SUCCESS_STATUS, "Shipping Addresses Retrieved Successfully", ShippingAddressSchema, null, true),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Create Shipping Address',
        description: `Allows authenticated users to create a shipping address`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Shipping address", ShippingAddressInputSchema),
        responses: {
            200: generateSwaggerResponseExample('Shipping Address Creation successful response', SUCCESS_STATUS, "Address created successful", ShippingAddressSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
};

const SHIPPING_404 = generateSwaggerResponseExample("Shipping address not found", FAILURE_STATUS, "User has no shipping address with that ID", null, ErrorCode.NON_EXISTENT)
const SHIPPING_ID_PARAM = generateParamExample("id", "ID of the shipping address", "string", ID_EXAMPLE, "path")

const shippingAddressDocs = {
    get: {
        tags,
        summary: 'View Shipping Address',
        description: `Allows authenticated users to view a single shipping address`,
        security: [{ BearerAuth: [] }], 
        parameters: [SHIPPING_ID_PARAM],
        responses: {
            200: generateSwaggerResponseExample('Shipping Address successful response', SUCCESS_STATUS, "Shipping Address Retrieved Successfully", ShippingAddressSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: SHIPPING_404,
            500: ERROR_EXAMPLE_500
        }
    },
    put: {
        tags,
        summary: 'Update Shipping Address',
        description: `Allows authenticated users to update a shipping address`,
        security: [{ BearerAuth: [] }],
        parameters: [SHIPPING_ID_PARAM],
        requestBody: generateSwaggerRequestExample("Shipping address", ShippingAddressInputSchema),
        responses: {
            200: generateSwaggerResponseExample('Shipping Address Update successful response', SUCCESS_STATUS, "Address updated successful", ShippingAddressSchema),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: SHIPPING_404,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    },

    delete: {
        tags,
        summary: 'Delete Shipping Address',
        description: `Allows authenticated users to delete a shipping address`,
        security: [{ BearerAuth: [] }],
        parameters: [SHIPPING_ID_PARAM],
        responses: {
            200: generateSwaggerResponseExample('Shipping Address Delete successful response', SUCCESS_STATUS, "Address deleted successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            404: SHIPPING_404,
            500: ERROR_EXAMPLE_500
        }
    }
};


export { profileDocs, countriesDocs, shippingAddressesDocs, shippingAddressDocs }