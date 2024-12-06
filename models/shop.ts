import { model, Schema } from "mongoose";
import { IBase } from "./base";
import { Types } from "mongoose";
import { ISeller } from "./sellers";
import { COLOR_CHOICES, DELIVERY_STATUS_CHOICES, PAYMENT_STATUS_CHOICES, RATING_CHOICES, SIZE_CHOICES } from "./choices";
import { IGuest, IUser } from "./accounts";
import slugify from "slugify";
import mongoose from "mongoose";
import { generateRandomCode, generateRandomNumber, generateUniqueCode } from "./utils";

// Define the interface for the Category model
interface ICategory extends IBase {
    name: string; 
    slug: string;
    image: string;
}

// Create the Category schema
const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, maxlength: 500 },
    slug: { type: String, unique: true, maxlength: 1000 },
    image: { type: String },
}, { timestamps: true });

const Category = model<ICategory>('Category', CategorySchema);

interface IVariant {
    size: SIZE_CHOICES, 
    color: COLOR_CHOICES, 
    stock: number, 
    image: string,
    price: number;
}

// Define the interface for the Product model
interface IProduct extends IBase {
    seller: Types.ObjectId | ISeller
    name: string; 
    slug: string;
    desc: string;
    priceOld: number;
    priceCurrent: number;
    category: Types.ObjectId | ICategory
    generalStock: number; // If variants exists then it should be 0
    variants: IVariant[]; // Image url is for color variants 
    image1: string;
    image2: string;
    image3: string;

    reviews: { user: Types.ObjectId | IUser, text: string, rating: RATING_CHOICES }[]
    reviewsCount: number;
    avgRating: number;
    wishlisted: boolean;
}
  
// Create the Product schema
const ProductSchema = new Schema<IProduct>({
    seller: { type: Schema.Types.ObjectId, ref: 'Seller' },
    name: { type: String, required: true, maxlength: 500 },
    slug: { type: String },
    desc: { type: String, required: true },
    priceOld: { type: Number, default: null },
    priceCurrent: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    generalStock: { 
        type: Number, default: null,
        validate: {
            validator: function (value) {
                // If there are variants, generalStock should be undefined or 0
                return !this.variants || this.variants.length === 0 || value === 0;
            },
            message: 'General stock should not be set when variants exist.'
        }
    },

    variants: [{ 
        size: { type: String, enum: SIZE_CHOICES, required: false }, 
        color: { type: String, enum: COLOR_CHOICES, required: false },
        stock: { type: Number, default: 1 },
        image: { type: String, required: false },
        price: { type: Number, required: true },
    }],
    image1: { type: String, required: true },
    image2: { type: String, default: null },
    image3: { type: String, default: null },

    reviews: [{ 
        user: { type: Schema.Types.ObjectId, ref: 'User' }, 
        text: { type: String, maxlength: 500 },
        rating: { type: Number, enum: RATING_CHOICES },
    }],
}, { timestamps: true });
  
ProductSchema.pre('save', async function (next) {
    try {
        if (this.isModified('name') || this.isNew) {
        // Generate base slug
        const baseSlug = slugify(this.name, { lower: true, strict: true });
        let slug = baseSlug

        // Check for uniqueness
        while (await mongoose.model('Product').exists({ slug })) {
            slug = `${baseSlug}-${generateRandomNumber()}`;
        }
        this.slug = slug;
        }
        next();
    } catch (error: any) {
        next(error)
    }
});

ProductSchema.virtual('reviewsCount').get(function(this: IProduct) {
    return this.reviews.length;
});

ProductSchema.virtual('avgRating').get(function(this: IProduct) {
    const reviews = this.reviews
    return reviews.reduce((sum, item) => sum + (item["rating"] || 0), 0) / reviews.length || 0;
});

// Create the Product model
const Product = model<IProduct>('Product', ProductSchema);

// Define the interface for the Wishlist model
interface IWishlist extends IBase {
    user: Types.ObjectId | IUser;
    product: Types.ObjectId | IProduct; 
    guest: Types.ObjectId | IGuest; 
}

// Create the Wishlist schema
const WishlistSchema = new Schema<IWishlist>({
    user: { type: Schema.Types.ObjectId, required: function () {return !this.guest}, ref: 'User', default: null },
    guest: { type: Schema.Types.ObjectId, required: function () {return !this.user}, ref: 'Guest', default: null },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
}, { timestamps: true });

// Define unique constraints
WishlistSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
WishlistSchema.index({ guest: 1, product: 1 }, { unique: true, sparse: true });

const Wishlist = model<IWishlist>('Wishlist', WishlistSchema);

// Define the interface for the Coupon model
interface ICoupon extends IBase {
    code: string;
    expiryDate: Date;
    percentageOff: number;
}

// Create the Coupon schema
const CouponSchema = new Schema<ICoupon>({
    code: { type: String },
    expiryDate: { type: Date, default: null },
    percentageOff: { type: Number, min: 5, max: 100, default: 10 }
}, { timestamps: true });

CouponSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            this.code = await generateUniqueCode("Coupon", "code", 15)
        }
        next();
    } catch (error: any) {
        next(error)
    }
});

const Coupon = model<ICoupon>('Coupon', CouponSchema);

// Define the interface for the ShippingDetails model
interface IShippingAddress {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipcode: number;
}

// Define the interface for the Order model
interface IOrder extends IBase {
    user: Types.ObjectId | IUser;
    txRef: string;
    paymentStatus: PAYMENT_STATUS_CHOICES;
    deliveryStatus: DELIVERY_STATUS_CHOICES;
    coupon: Types.ObjectId | ICoupon | null; 
    dateDelivered: Date | null;
    shippingDetails: IShippingAddress;
}

// Create the Order schema
const OrderSchema = new Schema<IOrder>({
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    txRef: { type: String },
    paymentStatus: { type: String, enum: PAYMENT_STATUS_CHOICES, default: PAYMENT_STATUS_CHOICES.PENDING },
    deliveryStatus: { type: String, enum: DELIVERY_STATUS_CHOICES, default: DELIVERY_STATUS_CHOICES.PENDING },
    coupon: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    dateDelivered: { type: Date, default: null },
    shippingDetails: { 
        name: { type: String, maxlength: 100 }, email: { type: String },
        phone: { type: String, maxlength: 20 }, address: { type: String, maxlength: 100}, 
        city: { type: String }, state: { type: String }, 
        country: { type: String }, zipcode: { type: Number }, 
    }
}, { timestamps: true });

OrderSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            this.txRef = await generateUniqueCode("Order", "txRef", 50)
        }
        next();
    } catch (error: any) {
        next(error)
    }
});

const Order = model<IOrder>('Order', OrderSchema);

// Define the interface for the OrderItem model
interface IOrderItem extends IBase {
    user: Types.ObjectId | IUser;
    guest: Types.ObjectId | IGuest; 
    product: Types.ObjectId | IProduct; 
    order: Types.ObjectId | IOrder; 
    quantity: number;
    variant: Types.ObjectId | IVariant;
}

// Create the OrderItem schema
const OrderItemSchema = new Schema<IOrderItem>({
    user: { type: Schema.Types.ObjectId, required: function () {return !this.guest}, ref: 'User', default: null },
    guest: { type: Schema.Types.ObjectId, required: function () {return !this.user}, ref: 'Guest', default: null },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    quantity: { type: Number, default: 1, min: 1 },
    variant: { type: Schema.Types.ObjectId, default: null }
}, { timestamps: true });

// Define unique constraints
OrderItemSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
OrderItemSchema.index({ guest: 1, product: 1 }, { unique: true, sparse: true });

const OrderItem = model<IOrderItem>('OrderItem', OrderItemSchema);

export { ICategory, Category, IProduct, Product, IWishlist, Wishlist, ICoupon, Coupon, IOrder, Order, IOrderItem, OrderItem }