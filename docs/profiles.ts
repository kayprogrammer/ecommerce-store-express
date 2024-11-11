import { ProfileEditSchema, ShippingAddressCreateSchema } from "../schemas/profiles";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, SUCCESS_STATUS } from "./base";
import { generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils";

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
            200: generateSwaggerResponseExample('Countries successful response', SUCCESS_STATUS, "Countries Retrieved Successfully"),
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
            200: generateSwaggerResponseExample('Shipping Addresses successful response', SUCCESS_STATUS, "Shipping Addresses Retrieved Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    },
    post: {
        tags,
        summary: 'Create Shipping Address',
        description: `Allows authenticated users to create a shipping address`,
        security: [{ BearerAuth: [] }],
        requestBody: generateSwaggerRequestExample("Shipping address", ShippingAddressCreateSchema),
        responses: {
            200: generateSwaggerResponseExample('Shipping Address Creation successful response', SUCCESS_STATUS, "Address created successful"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        }
    }
};


export { profileDocs, countriesDocs, shippingAddressesDocs }