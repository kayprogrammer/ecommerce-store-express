import mongoose from "mongoose"
import ENV from "../config/conf"
import { createUser } from "../managers/users"
import { IUser, User } from "../models/accounts"
import SiteDetail from "../models/general"
import connectDB from "../config/db"
import { Country } from 'country-state-city';
import { Country as CountryModel, ICountry } from "../models/profiles"
import { Category, ICategory, IProduct, Product } from "../models/shop"
import slugify from "slugify"
import seedData from "./seed.json"
import { ISeller, Seller } from "../models/sellers"
import * as path from "path";
import * as fs from "fs";
import mime from 'mime-types';

import { uploadFileToCloudinary } from "../config/file_processor"
import { COLOR_CHOICES, FILE_FOLDER_CHOICES, SELLER_STATUS_CHOICES, SIZE_CHOICES } from "../models/choices"
import { getRandomItem } from "../config/utils"

// Define base directory
const CURRENT_DIR = path.resolve(__dirname);
// Define image directories
const testImagesDirectory = path.join(CURRENT_DIR, "images");
const testCategoryImagesDirectory = path.join(testImagesDirectory, "categories");
const testProductImagesDirectory = path.join(testImagesDirectory, "products");

const createSuperuser = async (): Promise<IUser> => {
    let userDoc = { email: ENV.FIRST_SUPERUSER_EMAIL, password: ENV.FIRST_SUPERUSER_PASSWORD, name: "Test Admin" }
    let user = await User.findOne({ email: userDoc.email })
    if (!user) user = await createUser(userDoc, true)
    return user
}

const createReviewer = async () => {
    let userDoc = { email: ENV.FIRST_REVIEWER_EMAIL, password: ENV.FIRST_REVIEWER_PASSWORD, name: "Test Reviewer" }
    const existingUser = await User.findOne({ email: userDoc.email })
    if (!existingUser) await createUser(userDoc, true)
}

const createCountries = async (): Promise<ICountry[]> => {
    let countries = await CountryModel.find().select("_id")
    if (countries.length < 1) {
        const countriesData = Country.getAllCountries();
        const countryDocs = countriesData.map(c => ({
            name: c.name,
            code: c.isoCode,
        }));
        countries = await CountryModel.insertMany(countryDocs);
    } 
    return countries
}

const createProductCategories = async (): Promise<ICategory[]> => {
    let categories = await Category.find().select("_id")
    if (categories.length < 1) {
        if (fs.existsSync(testCategoryImagesDirectory)) {
            const images = fs.readdirSync(testCategoryImagesDirectory);
            const categoryDocs = await Promise.all(images.map(async (image, index) => {
                // Upload image
                const imagePath = path.join(testCategoryImagesDirectory, image);
                const imageBuffer = fs.readFileSync(imagePath)
                const imageUrl = await uploadFileToCloudinary(imageBuffer, FILE_FOLDER_CHOICES.CATEGORY);

                // Prepare category data
                const categoryName = seedData.categories[index];
                return {
                    name: categoryName,
                    slug: slugify(categoryName, { lower: true }),
                    image: imageUrl as string
                };
            }));
            categories = await Category.insertMany(categoryDocs);
        } else {
            console.log(`Directory ${testProductImagesDirectory} does not exist.`);
        }
    } 
    return categories
}

const createProducts = async (seller: ISeller, categories: ICategory[]): Promise<IProduct[]> => {
    let products: IProduct[] = await Product.find().select("_id")
    if (products.length < 1) {
        if (fs.existsSync(testProductImagesDirectory)) {
            const images = fs.readdirSync(testProductImagesDirectory);

            const productDocs = await Promise.all(images.map(async (image, index) => {
                // Upload image
                const imagePath = path.join(testProductImagesDirectory, image);
                const imageBuffer = fs.readFileSync(imagePath)
                const imageMimetype = mime.lookup(imagePath) || 'application/octet-stream';
                const imageFile = { buffer: imageBuffer, mimetype: imageMimetype } as Express.Multer.File
                const imageUrl = await uploadFileToCloudinary(imageFile.buffer, FILE_FOLDER_CHOICES.PRODUCT);

                const category = getRandomItem(categories)
                const productName = seedData.products[index]
                const docs: Record<string,any> = { 
                    seller: seller._id, name: productName, slug:  slugify(productName, { lower: true }),
                    category: category._id, desc: "This is a good product", priceOld: (index + 1) * 50,
                    priceCurrent: (index + 1) * 45, stock: (index + 1) * 20, image1: imageUrl,
                };
                if (index === 1) {
                    // Create some variants for at least a product
                    docs.stock = 0
                    docs.variants = [
                        { size: SIZE_CHOICES.M, color: COLOR_CHOICES.GREEN, desc: "Ideal for medium-sized machinery, dimensions: 100x100x100cm", stock: 30, image: "https://ala.com", price: 10000 },
                        { size: SIZE_CHOICES.S, color: COLOR_CHOICES.BLACK, desc: "Ideal for medium-sized machinery, dimensions: 300x400x500cm", stock: 60, image: "https://alaaa.com", price: 20000 },
                        { size: SIZE_CHOICES.XS, color: COLOR_CHOICES.WHITE, desc: "Ideal for medium-sized machinery, dimensions: 600x700x800cm", stock: 50, image: "https://alsa.com", price: 30000 },
                    ]
                }
                return docs
            }));
            products = await Product.insertMany(productDocs) as IProduct[]
        } else {
            console.log(`Directory ${testProductImagesDirectory} does not exist.`);
        }
    } 
    return products
}

const createSeller = async (admin: IUser, country: ICountry, category: ICategory): Promise<ISeller> => {
    let seller = await Seller.findOne({ user: admin._id })
    if (!seller) seller = await Seller.create({ user: admin._id, country_: country._id, productCategories: [category._id], status: SELLER_STATUS_CHOICES.APPROVED, ...seedData.seller })
    return seller
}

const createData = async () => {
    console.log("GENERATING INITIAL DATA....")
    await connectDB()
    const admin = await createSuperuser()
    await createReviewer()
    await SiteDetail.getOrCreate({})
    const countries = await createCountries()
    const categories = await createProductCategories()
    const seller = await createSeller(admin, countries[0], categories[0])
    await createProducts(seller, categories)
    mongoose.disconnect()
    console.log("INITIAL DATA GENERATED....")
}

createData()