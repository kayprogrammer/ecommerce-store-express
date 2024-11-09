import { facebookLoginDocs, googleLoginDocs, loginDocs, logoutAllDocs, logoutDocs, passwordResetDocs, passwordResetRequestEmailDocs, refreshTokenDocs, registerDocs, resendVerificationEmailDocs, verifyEmailDocs } from "./auth"
import { siteDetailDocs } from "./general"

export const SWAGGER_PATHS = {
    // General routes
    '/general/site-detail': siteDetailDocs,

    // Auth routes
    '/auth/register': registerDocs,
    '/auth/verify-email': verifyEmailDocs,
    '/auth/resend-verification-email': resendVerificationEmailDocs,
    '/auth/send-password-reset-otp': passwordResetRequestEmailDocs,
    '/auth/set-new-password': passwordResetDocs,
    '/auth/login': loginDocs,
    '/auth/google': googleLoginDocs,
    '/auth/facebook': facebookLoginDocs,
    '/auth/refresh': refreshTokenDocs,
    '/auth/logout': logoutDocs,
    '/auth/logout/all': logoutAllDocs,

    // Profiles routes
}