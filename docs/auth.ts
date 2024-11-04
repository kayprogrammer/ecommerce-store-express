import { ErrorCode } from "../config/handlers";
import { LoginSchema, RefreshTokenSchema, RegisterSchema, SetNewPasswordSchema, TokenSchema, TokensSchema, VerifyEmailSchema } from "../schemas/auth";
import { EmailSchema } from "../schemas/base";
import { ERROR_EXAMPLE_422, ERROR_EXAMPLE_500, ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN, FAILURE_STATUS, SUCCESS_STATUS } from "./base";
import { generateSwaggerExampleValue, generateSwaggerRequestExample, generateSwaggerResponseExample } from "./utils"

const tags = ['Auth (10)']

const registerDocs = {
    post: {
        tags: tags,
        summary: 'Register user',
        description: `This endpoint registers new users into our application.`,
        requestBody: generateSwaggerRequestExample("Register", RegisterSchema),
        responses: {
            201: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Registration successful", EmailSchema),
            422: ERROR_EXAMPLE_422,
            500: ERROR_EXAMPLE_500
        },
    }
};

const INCORRECT_EMAIL_EXAMPLE = generateSwaggerResponseExample('Incorrect Email', FAILURE_STATUS, "Incorrect Email", null, ErrorCode.INCORRECT_EMAIL)

const verifyEmailDocs = {
    post: {
        tags: tags,
        summary: 'Verify user email',
        description: `This endpoint verifies a user's email.`,
        requestBody: generateSwaggerRequestExample("Email", VerifyEmailSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Verification successful", EmailSchema),
            422: ERROR_EXAMPLE_422,
            404: INCORRECT_EMAIL_EXAMPLE,
            400: generateSwaggerResponseExample('Invalid/Expired OTP', FAILURE_STATUS, "OTP is Invalid or Expired", null, ErrorCode.INVALID_OTP),
            500: ERROR_EXAMPLE_500
        },
    }
};

const resendVerificationEmailDocs = {
    post: {
        tags: tags,
        summary: 'Resend Verification email',
        description: `This endpoint resends verification email.`,
        requestBody: generateSwaggerRequestExample("Email", EmailSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Email sent successful"),
            422: ERROR_EXAMPLE_422,
            404:INCORRECT_EMAIL_EXAMPLE,
            500: ERROR_EXAMPLE_500
        },
    }
};

const passwordResetRequestEmailDocs = {
    post: {
        tags: tags,
        summary: 'Password reset request',
        description: `This endpoint sends new password reset otp to the user's email.`,
        requestBody: resendVerificationEmailDocs.post.requestBody,
        responses: resendVerificationEmailDocs.post.responses,
    }
};

const passwordResetDocs = {
    post: {
        tags: tags,
        summary: 'Set New Password',
        description: `Verifies the password reset otp and updates the user's password.`,
        requestBody: generateSwaggerRequestExample("Set Password", SetNewPasswordSchema),
        responses: {
            200: generateSwaggerResponseExample('Successful response', SUCCESS_STATUS, "Password reset successful"),
            422: ERROR_EXAMPLE_422,
            404:INCORRECT_EMAIL_EXAMPLE,
            400: generateSwaggerResponseExample('Invalid/Expired OTP', FAILURE_STATUS, "OTP is Invalid or Expired", null, ErrorCode.INVALID_OTP),
            500: ERROR_EXAMPLE_500
        }
    }
};

const LOGIN_401 = generateSwaggerResponseExample('Invalid credentials', FAILURE_STATUS, "Invalid credentials!", null, ErrorCode.INVALID_CREDENTIALS)
LOGIN_401.content["application/json"].examples.example2 = generateSwaggerExampleValue("Unverified User", FAILURE_STATUS, "Unverified User", null, ErrorCode.UNVERIFIED_USER)

const loginDocs = {
    post: {
        tags: tags,
        summary: 'Login A User',
        description: `Generates access and refresh tokens for the user based on login credentials.`,
        requestBody: generateSwaggerRequestExample("Login", LoginSchema),
        responses: {
            200: generateSwaggerResponseExample('Login Successful response', SUCCESS_STATUS, "Login successful", TokensSchema),
            422: ERROR_EXAMPLE_422,
            401: LOGIN_401,
            500: ERROR_EXAMPLE_500
        }
    }
};

const GOOGLE_LOGIN_401 = generateSwaggerResponseExample('Invalid Token', FAILURE_STATUS, "Invalid Token!", null, ErrorCode.INVALID_TOKEN)
const GOOGLE_LOGIN_WITH_INVALID_ACCOUNT_401 = {
    ...GOOGLE_LOGIN_401,
    content: {
        'application/json': {
            examples: {
                example1: GOOGLE_LOGIN_401.content["application/json"].examples.example1,
                example2: generateSwaggerExampleValue("Invalid Auth", FAILURE_STATUS, "Requires password to sign in to this account", null, ErrorCode.INVALID_AUTH),
            },
        },
    },
};

const googleLoginDocs = {
    post: {
        tags: tags,
        summary: 'Login via google',
        description: `Generates access and refresh tokens for the user based on google auth token.`,
        requestBody: generateSwaggerRequestExample("Login", TokenSchema),
        responses: {
            201: generateSwaggerResponseExample('Login Successful response', SUCCESS_STATUS, "Login successful", TokensSchema),
            422: ERROR_EXAMPLE_422,
            401: GOOGLE_LOGIN_WITH_INVALID_ACCOUNT_401,
            500: ERROR_EXAMPLE_500
        }
    }
}

const refreshTokenDocs = {
    post: {
        tags: tags,
        summary: 'Refresh Auth Tokens',
        description: `Generates new access and refresh tokens for the user based on refresh token.`,
        requestBody: generateSwaggerRequestExample("Refresh token", RefreshTokenSchema),
        responses: {
            201: generateSwaggerResponseExample('Tokens refresh successful response', SUCCESS_STATUS, "Tokens refresh successful"),
            422: ERROR_EXAMPLE_422,
            401: generateSwaggerResponseExample('Invalid refresh token', FAILURE_STATUS, "Refresh token is invalid or expired!", null, ErrorCode.INVALID_TOKEN),
            500: ERROR_EXAMPLE_500
        }
    }
};

const logoutDocs = {
    get: {
        tags: tags,
        summary: 'Logout user',
        description: `Logout users by invalidating the current access and refresh tokens`,
        security: [{ BearerAuth: [] }], // Require BearerAuth for this endpoint
        responses: {
            200: generateSwaggerResponseExample('Logout successful response', SUCCESS_STATUS, "Logout Successful"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
};

const logoutAllDocs = {
    get: {
        tags: tags,
        summary: 'Logout user from all devices',
        description: `Logout users by invalidating all access and refresh tokens of that user`,
        security: [{ BearerAuth: [] }], // Require BearerAuth for this endpoint
        responses: {
            200: generateSwaggerResponseExample('Session Cleared response', SUCCESS_STATUS, "All Session Cleared Successfully"),
            401: ERROR_EXAMPLE_UNAUTHORIZED_USER_WITH_INVALID_TOKEN,
            500: ERROR_EXAMPLE_500
        }
    }
};

export { registerDocs, verifyEmailDocs, resendVerificationEmailDocs, passwordResetRequestEmailDocs, passwordResetDocs, loginDocs, googleLoginDocs, refreshTokenDocs, logoutDocs, logoutAllDocs }