import { facebookLoginDocs, googleLoginDocs, loginDocs, logoutAllDocs, logoutDocs, passwordResetDocs, passwordResetRequestEmailDocs, refreshTokenDocs, registerDocs, resendVerificationEmailDocs, verifyEmailDocs } from "./auth"
import { siteDetailDocs } from "./general"
import { countriesDocs, profileDocs, shippingAddressDocs, shippingAddressesDocs } from "./profiles"
import { sellerApplicationDocs, sellerProductDocs, sellerProductsDocs } from "./sellers"
import { categoriesDocs, categoryProductsDocs, checkoutDocs, orderDocs, productDocs, productsDocs, wishlistDocs } from "./shop"

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
    '/profiles': profileDocs,
    '/profiles/countries': countriesDocs,
    '/profiles/addresses': shippingAddressesDocs,
    '/profiles/addresses/{id}': shippingAddressDocs,

    // Shop routes
    '/shop/products': productsDocs,
    '/shop/products/{slug}': productDocs,
    '/shop/wishlist': wishlistDocs,
    '/shop/categories': categoriesDocs,
    '/shop/categories/{slug}': categoryProductsDocs,
    '/shop/checkout': checkoutDocs,
    '/shop/orders': orderDocs,
    
    // Seller routes
    '/sellers/application': sellerApplicationDocs,
    '/sellers/products': sellerProductsDocs,
    '/sellers/products/{slug}': sellerProductDocs,
}