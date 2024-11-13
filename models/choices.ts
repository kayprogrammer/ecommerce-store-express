enum ACCOUNT_TYPE_CHOICES {
    SELLER = "Seller",
    BUYER = "Buyer",
    STAFF = "Staff",
    SUPERUSER = "Super user"
}

enum AUTH_TYPE_CHOICES {
    GENERAL = "General",
    GOOGLE = "Google",
    FACEBOOK = "Facebook",
}

enum BUSINESS_TYPE_CHOICES {
    SOLE_PROPRIETORSHIP = "Sole Proprietorship",
    LLC = "Limited Liability Company (LLC)",
    CORPORATION = "Corporation",
    PARTNERSHIP = "Partnership"
}

export { AUTH_TYPE_CHOICES, ACCOUNT_TYPE_CHOICES, BUSINESS_TYPE_CHOICES }