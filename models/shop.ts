import { model, Schema } from "mongoose";
import { IBase } from "./base";
import { Types } from "mongoose";
import { ISeller } from "./sellers";
import { COLOR_CHOICES, SIZE_CHOICES } from "./choices";

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
    variants: { size: SIZE_CHOICES, color: COLOR_CHOICES, stock: number, image: string }[]; // Image url is for color variants 
    image1: string;
    image2: string;
    image3: string;
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
        size: { type: String, required: false }, 
        color: { type: String, required: false },
        stock: { type: Number, default: 1 },
        image: { type: String, required: false },
    }],
    image1: { type: String, required: true },
    image2: { type: String, default: null },
    image3: { type: String, default: null },
}, { timestamps: true });
  
// Create the Product model
const Product = model<IProduct>('Product', ProductSchema);

export { ICategory, Category, IProduct, Product }