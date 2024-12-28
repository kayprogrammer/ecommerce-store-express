import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware, sellerMiddleware } from "../middlewares/auth";
import { upload, uploadFileToCloudinary } from "../config/file_processor";
import { validationMiddleware } from "../middlewares/error";
import { ProductCreateSchema, SellerApplicationSchema } from "../schemas/sellers";
import { FILE_FOLDER_CHOICES, FILE_SIZE_CHOICES } from "../models/choices";
import { CustomResponse, setDictAttr } from "../config/utils";
import { ISeller, Seller } from "../models/sellers";
import { Category, Product } from "../models/shop";
import { InvalidParamError, NotFoundError, ValidationErr } from "../config/handlers";
import { paginateModel, paginateRecords } from "../config/paginators";
import { SELLER_POPULATION } from "../managers/users";
import { ProductDetailSchema, ProductsResponseSchema } from "../schemas/shop";
import { isPartOfEnum } from "./utils";
import { getProducts } from "../managers/shop";

const sellerRouter = Router();

const fileFields = [
    { name: "image", maxCount: 1 },
    { name: "governmentId", maxCount: 1 },
    { name: "proofOfAddress", maxCount: 1 },
    { name: "businessLicense", maxCount: 1 }  
];
const fileSizes = { governmentId: FILE_SIZE_CHOICES.ID, proofOfAddress: FILE_SIZE_CHOICES.ID, businessLicense: FILE_SIZE_CHOICES.ID }

/**
 * @route POST /application
 * @description Apply to become a seller.
 */
sellerRouter.post('/application', 
    authMiddleware, 
    upload(fileFields, fileSizes, {}),
    validationMiddleware(SellerApplicationSchema), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const data = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imageFIle = files.image?.[0];
            const governmentIdFile = files.governmentId?.[0];
            const proofOfAddressFile = files.proofOfAddress?.[0];
            const businessLicenseFile = files.businessLicense?.[0];

            data.image = await uploadFileToCloudinary(imageFIle?.buffer, FILE_FOLDER_CHOICES.AVATAR)
            data.governmentId = await uploadFileToCloudinary(governmentIdFile?.buffer, FILE_FOLDER_CHOICES.ID)
            data.proofOfAddress = await uploadFileToCloudinary(proofOfAddressFile?.buffer, FILE_FOLDER_CHOICES.ID)
            data.businessLicense = await uploadFileToCloudinary(businessLicenseFile?.buffer, FILE_FOLDER_CHOICES.ID)

            // Validate category
            const productCategorySlugs = typeof data.productCategorySlugs === "string" ? data.productCategorySlugs.split(',') : data.productCategorySlugs 
            const categories = await Category.find({ slug: { $in: productCategorySlugs } }, { _id: 1 })
            if (categories.length < 1) throw new ValidationErr("productCategorySlugs", "Please enter at least one valid category slug")
            delete data.productCategorySlugs
            data.productCategories = categories.map(category => category._id)

            let seller = await Seller.findOne({ user: user._id })
            if (seller) {
                seller = setDictAttr(data, seller) as ISeller
                await seller.save()
            } else {
                seller = await Seller.create({ user: user._id, ...data })
            }
            return res.status(200).json(CustomResponse.success('Application Sent Successfully'))
        } catch (error) {
            next(error)
        }
});

/**
 * @route GET /products
 * @description Return all products belonging to a seller by a seller.
 */
sellerRouter.get('/products', sellerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { name } = req.query;

        const filter: Record<string,any> = { seller: user.seller._id }
        if (name) filter.name = { $regex: name, $options: "i" }

        const products = await getProducts(null, filter)
        const data = await paginateRecords(req, products)
        const productsData = { products: data.items, ...data }
        return res.status(200).json(CustomResponse.success('Seller Products Fetched Successfully', productsData, ProductsResponseSchema))
    } catch (error) {
        next(error)
    }
});

const productFileFields = [
    { name: "image1" }, { name: "image2" }, { name: "image3" },
] as any;

const productFileSizes = { 
    image1: FILE_SIZE_CHOICES.PRODUCT, image2: FILE_SIZE_CHOICES.PRODUCT, 
    image3: FILE_SIZE_CHOICES.PRODUCT
}

/**
 * @route POST /products
 * @description Allows a seller to create a product.
 */
sellerRouter.post(
    '/products', 
    sellerMiddleware, 
    upload(productFileFields, productFileSizes, {}),
    validationMiddleware(ProductCreateSchema), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const { priceOld, priceCurrent, generalStock, categorySlug, ...data } = req.body
            if (priceCurrent > priceOld) throw new ValidationErr("priceCurrent", "Cannot be more than old price")
            
            const category = await Category.findOne({ slug: categorySlug })
            if(!category) throw new ValidationErr("categorySlug", "Invalid category")
            

            // Handle file uploads
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            if (!files?.image1?.[0]) throw new ValidationErr("image1", "Enter an image")
            const uploadedFiles = await Promise.all(
                Object.entries(files).map(async ([fieldname, fileList]) => {
                    const file = fileList[0];
                    return { fieldname, url: await uploadFileToCloudinary(file.buffer, FILE_FOLDER_CHOICES.PRODUCT) };
                })
            );

            // Map uploaded file URLs
            const fileMapping: Record<string, any> = {};
            uploadedFiles.forEach(({ fieldname, url }) => {
                fileMapping[fieldname] = url;
            });

            // Assign uploaded URLs to general product images
            data.image1 = fileMapping.image1;
            data.image2 = fileMapping.image2;
            data.image3 = fileMapping.image3;

            const seller = user.seller
            const product = await Product.create({ seller: seller._id, category: category._id, priceOld, priceCurrent, generalStock, ...data })
            product.seller = seller
            product.category = category
            return res.status(200).json(CustomResponse.success('Product Added Successfully', product, ProductDetailSchema))
        } catch (error) {
            next(error)
        }
    });


export default sellerRouter;