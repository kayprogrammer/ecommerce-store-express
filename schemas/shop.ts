import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import { COLOR_CHOICES, SIZE_CHOICES } from "../models/choices";
import { generateSwaggerExampleFromSchema } from "../docs/utils";
import { PaginatedResponseSchema } from "./base";

export class SellerSchema {
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
}

export class ProductSchema {
    @Expose()
    @Example(generateSwaggerExampleFromSchema(SellerSchema))
    @Type(() => SellerSchema)
    seller?: SellerSchema

    @Expose()
    @Example("Good Shoes")
    name?: string;

    @Expose()
    @Example("good-shoes")
    slug?: string;

    @Expose()
    @Example("This is a nice shoe")
    desc?: string;

    @Expose()
    @Example(200.50)
    priceOld?: string;

    @Expose()
    @Example(150.50)
    priceCurrent?: string;

    @Expose(generateSwaggerExampleFromSchema(CategorySchema))
    @Example(20)
    @Type(() => CategorySchema)
    category?: CategorySchema;

    @Expose()
    @Example(10)
    generalStock?: number;

    @Expose()
    @Example([generateSwaggerExampleFromSchema(VariantSchema)])
    @Type(() => VariantSchema)
    variants?: VariantSchema[];

    @Expose()
    @Example(1)
    reviewsCount?: number;

    @Expose()
    @Example(1)
    avgRating?: number;

    @Expose()
    @Example(true)
    wishlisted?: boolean;

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

export class ProductsResponseSchema extends PaginatedResponseSchema {
    @Expose()
    @Type(() => ProductSchema)
    @Example([generateSwaggerExampleFromSchema(ProductSchema)])
    products?: ProductSchema[]
}