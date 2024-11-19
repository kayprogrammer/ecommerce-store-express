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

enum COLOR_CHOICES {
    BLACK = "Black",
    WHITE = "White",
    GRAY = "Gray",
    BROWN = "Brown",
    NAVY = "Navy",
    BEIGE = "Beige",
    TAN = "Tan",
    OLIVE = "Olive",
    CHARCOAL = "Charcoal",
    RED = "Red",
    BLUE = "Blue",
    GREEN = "Green",
    YELLOW = "Yellow",
    PINK = "Pink",
    LIGHT_BLUE = "Light Blue",
    MINT_GREEN = "Mint Green",
    LAVENDER = "Lavender",
    PEACH = "Peach",
    BURGUNDY = "Burgundy",
    MUSTARD = "Mustard",
    TEAL = "Teal",
    CORAL = "Coral",
    AQUA = "Aqua",
    GOLD = "Gold",
    SILVER = "Silver",
    BRONZE = "Bronze",
    COPPER = "Copper",
    LIGHT_GRAY = "Light Gray",
    IVORY = "Ivory",
    MAROON = "Maroon",
    FUCHSIA = "Fuchsia",
    LIME = "Lime",
    CREAM = "Cream",
    SLATE = "Slate",
    INDIGO = "Indigo",
    TURQUOISE = "Turquoise",
    SAGE = "Sage",
    CHARTREUSE = "Chartreuse",
    PLUM = "Plum",
    RASPBERRY = "Raspberry",
    TANGERINE = "Tangerine",
    AMBER = "Amber",
    JADE = "Jade",
    EMERALD = "Emerald",
    PEARL = "Pearl",
    RUBY = "Ruby",
    TOPAZ = "Topaz",
    SAPPHIRE = "Sapphire",
    OPAL = "Opal",
    PERIWINKLE = "Periwinkle",
    SEAFOAM = "Seafoam",
    LILAC = "Lilac",
    CINNAMON = "Cinnamon"
}

enum SIZE_CHOICES {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
}

enum FILE_SIZE_CHOICES {
    PROFILE = 2 * 1024 * 1024, // 2MB
    PRODUCT = PROFILE, // 2MB
    ID = 1 * 1024 * 1024 // 1MB
}

const FILE_TYPE_CHOICES = {
    IMAGE: ['image/jpeg', 'image/png'],
    DOC: ["application/pdf"]
}

enum FILE_FOLDER_CHOICES {
    AVATAR = "avatars",
    PRODUCT = "products",
    ID = "ids",
}


export { AUTH_TYPE_CHOICES, ACCOUNT_TYPE_CHOICES, BUSINESS_TYPE_CHOICES, COLOR_CHOICES, SIZE_CHOICES, FILE_SIZE_CHOICES, FILE_TYPE_CHOICES, FILE_FOLDER_CHOICES }