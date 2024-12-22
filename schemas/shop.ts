import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { COLOR_CHOICES, DELIVERY_STATUS_CHOICES, PAYMENT_STATUS_CHOICES, RATING_CHOICES, SIZE_CHOICES } from "../models/choices";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { DATETIME_EXAMPLE, ID_EXAMPLE, PaginatedResponseSchema, UserSchema } from "./base";
import { IsEnum, IsMongoId, IsOptional, Length } from "class-validator";
import { ShippingAddressBaseSchema } from "./profiles";

export class VendorSchema {
    @Expose()
    @Example("John Doe Stores")
    name?: string;

    @Expose()
    @Example("john-doe-stores")
    slug?: string;

    @Expose()
    @Example("https://img.url")
    image?: string;
}

export class CategorySchema {
    @Expose()
    @Example("Clothing")
    name?: string;

    @Expose()
    @Example("clothing")
    slug?: string;

    @Expose()
    @Example("https://image.url/clothing")
    image?: string;
}

export class VariantSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    _id?: string;

    @Expose()
    @Example(SIZE_CHOICES.M)
    size?: SIZE_CHOICES;

    @Expose()
    @Example(COLOR_CHOICES.RED)
    color?: COLOR_CHOICES;

    @Expose()
    @Example(20)
    stock?: number;

    @Expose()
    @Example("https://image.url/shoeee")
    image?: string;

    @Expose()
    @Example(200.50)
    price?: string;
}

export class ReviewSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    id?: string;

    @Expose()
    user?: UserSchema;

    @Expose()
    @Example(RATING_CHOICES.THREE)
    rating?: RATING_CHOICES;

    @Expose()
    @Example("This is the best Product")
    text?: string;

    @Expose()
    @Example(DATETIME_EXAMPLE)
    createdAt?: Date;

    @Expose()
    @Example(DATETIME_EXAMPLE)
    updatedAt?: Date;
}

export class ReviewsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => ReviewSchema)
    @Example([generateSwaggerExampleFromSchema(ReviewSchema)])
    items?: ReviewSchema[]
}

export class ProductListSchema {
    @Expose()
    @Example("Good Shoes")
    name?: string;

    @Expose()
    @Example("good-shoes")
    slug?: string;

    @Expose()
    @Example(200.50)
    priceOld?: string;

    @Expose()
    @Example(150.50)
    priceCurrent?: string;

    @Expose()
    @Type(() => CategorySchema)
    category?: CategorySchema;

    @Expose()
    @Example(1)
    reviewsCount?: number;

    @Expose()
    @Example(1)
    avgRating?: number;

    @Expose()
    @Example(true)
    carted?: boolean;

    @Expose()
    @Example("https://image.url/shoes")
    image1?: string;

    @Expose()
    @Example("https://image.url/shoes-back")
    image2?: string;

    @Expose()
    @Example("https://image.url/shoes-side")
    image3?: string;
}

export class ProductDetailSchema extends ProductListSchema {
    @Expose()
    @Type(() => VendorSchema)
    vendor?: VendorSchema

    @Expose()
    @Example("This is a nice shoe")
    desc?: string;

    @Expose()
    @Example(10)
    generalStock?: number;

    @Expose()
    @Example([generateSwaggerExampleFromSchema(VariantSchema)])
    @Type(() => VariantSchema)
    variants?: VariantSchema[];

    @Expose()
    @Type(() => ReviewsResponseSchema)
    reviews?: ReviewsResponseSchema;
}

export class ProductsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => ProductListSchema)
    @Example([generateSwaggerExampleFromSchema(ProductListSchema)])
    products?: ProductListSchema[]
}

export class ReviewCreateSchema {
    @Expose()
    @IsEnum(RATING_CHOICES)
    @Example(RATING_CHOICES.THREE)
    rating?: RATING_CHOICES;

    @Expose()
    @Length(5, 500)
    @Example("This is the best Product")
    text?: string;
}

export class WishlistCreateSchema {
    @Expose()
    @Example("black-shoe")
    @Length(3, 2000)
    slug?: string;
}

export class OrderitemProductSchema {
    @Expose()
    vendor?: VendorSchema;

    @Expose()
    @Example("Good shoes")
    name?: string;

    @Expose()
    @Example("good-shoes")
    slug?: string;

    @Expose()
    @Example("10000.35")
    priceCurrent?: string;

    @Expose()
    @Example("https://product-img.url")
    image1?: string;
}

export class OrderItemSchema {
    @Expose()
    product?: OrderitemProductSchema;

    @Expose()
    @Example(5)
    quantity?: number;

    @Expose()
    variant?: VariantSchema;

    @Expose()
    @Example("10000.35")
    total?: string;
}

export class AddToCartSchema {
    @Expose()
    @Example("good-prod")
    slug?: string;
    
    @Expose()
    @Example(3)
    quantity?: number;

    @Expose()
    @Example(ID_EXAMPLE)
    @IsOptional()
    @IsMongoId()
    variantId?: number;
}

export class CheckoutSchema {
    @Expose()
    @Example(ID_EXAMPLE)
    @IsMongoId()
    shippingId?: string;
}

export class OrderSchema {
    @Expose()
    @Example("AJSJSJ2J2J32HSDKSK")
    txRef?: string;
    
    @Expose()
    @Example(PAYMENT_STATUS_CHOICES.PENDING)
    paymentStatus?: PAYMENT_STATUS_CHOICES;
    
    @Expose()
    @Example(DELIVERY_STATUS_CHOICES.PENDING)
    deliveryStatus?: DELIVERY_STATUS_CHOICES;
    
    @Expose()
    @Example(DATETIME_EXAMPLE)
    dateDelivered?: Date;
    
    @Expose()
    shippingDetails?: ShippingAddressBaseSchema;
    
    @Expose()
    @Example("15000")
    total?: number;

    @Expose()
    @Type(() => OrderItemSchema)
    @Example([generateSwaggerExampleFromSchema(OrderItemSchema)])
    orderItems?: OrderItemSchema[]
}

export class OrdersResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => OrderSchema)
    @Example([generateSwaggerExampleFromSchema(OrderSchema)])
    orders?: OrderSchema[]
}