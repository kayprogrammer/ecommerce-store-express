import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware, sellerMiddleware } from "../middlewares/auth";
import { upload, uploadFileToCloudinary } from "../config/file_processor";
import { validationMiddleware } from "../middlewares/error";
import { ProductCreateSchema, ProductEditSchema, SellerApplicationSchema, SellerDashboardSchema, VariantCreateSchema, VariantEditSchema } from "../schemas/sellers";
import { DELIVERY_STATUS_CHOICES, FILE_FOLDER_CHOICES, FILE_SIZE_CHOICES, PAYMENT_STATUS_CHOICES } from "../models/choices";
import { CustomResponse, setDictAttr } from "../config/utils";
import { ISeller, Seller } from "../models/sellers";
import { Category, ICategory, IReview, IVariant, Order, OrderItem, Product, Review } from "../models/shop";
import { InvalidParamError, NotFoundError, ValidationErr } from "../config/handlers";
import { paginateModel, paginateRecords } from "../config/paginators";
import { OrdersResponseSchema, ProductDetailSchema, ProductsResponseSchema, VariantSchema } from "../schemas/shop";
import { getProducts } from "../managers/shop";
import { getAvgRating } from "../models/utils";
import { SELLER_POPULATION } from "../managers/users";
import { isPartOfEnum } from "./utils";
import { getSellerOrdersWithDetailedOrderItems } from "../managers/sellers";

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
            const { priceOld, priceCurrent, stock, categorySlug, ...data } = req.body
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
            const product = await Product.create({ seller: seller._id, category: category._id, priceOld, priceCurrent, stock, ...data })
            product.seller = seller
            product.category = category
            return res.status(200).json(CustomResponse.success('Product Added Successfully', product, ProductDetailSchema))
        } catch (error) {
            next(error)
        }
    });

    /**
 * @route GET /products/:slug
 * @description Return single product.
 */
sellerRouter.get('/products/:slug', sellerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const product = await Product.findOne({ slug: req.params.slug, seller: user.seller._id }).populate([SELLER_POPULATION, "category"])
        if (!product) throw new NotFoundError("Seller Product does not exist!")
        
        // Set reviews count & avgRating
        const data = await paginateModel(req, Review, { product: product._id }, "user", { rating: -1 } )
        product.avgRating = getAvgRating(data.items as IReview[])
        product.reviews = data
        await product.save()
        return res.status(200).json(CustomResponse.success('Seller Product Details Fetched Successfully', product, ProductDetailSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route PUT /products/:slug
 * @description Allows a seller to edit a product.
 */
sellerRouter.put(
    '/products/:slug', 
    sellerMiddleware, 
    upload(productFileFields, productFileSizes, {}),
    validationMiddleware(ProductEditSchema), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const { name, desc, priceOld, priceCurrent, stock, categorySlug } = req.body
            const product = await Product.findOne({ seller: user.seller._id, slug: req.params.slug }).populate("category")
            if (!product) throw new NotFoundError("Product does not exist")
            const orderitemExists = await OrderItem.exists({ product: product._id, order: { $ne: null } })
            const dataToUpdate: Record<string,any> = {}
            if (desc) dataToUpdate.desc = desc
            if (stock) dataToUpdate.stock = stock
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (orderitemExists) {
                if (name) throw new ValidationErr("name", "Cannot edit name for product with an existing order.")
                if (priceOld || priceCurrent) throw new ValidationErr("priceCurrent", "Cannot edit price for product with an existing order.")
                if (categorySlug && (product.category as ICategory).slug !== categorySlug) throw new ValidationErr("categorySlug", "Cannot change category for product with an existing order.")
                if (files.image1?.[0] || files.image2?.[0] || files.image3?.[0] ) throw new ValidationErr("image", "Cannot add or change images for product with an existing order.")
            } else {
                if (priceOld || priceCurrent) {
                    const priceOl = priceOld || product.priceOld 
                    const priceCurr = priceCurrent || product.priceCurrent 
                    if (priceCurr > priceOl) throw new ValidationErr("priceCurrent", "Cannot be more than old price")
                    dataToUpdate.priceOld = priceOl
                    dataToUpdate.priceCurrent = priceCurr
                } 
                if (categorySlug) {
                    const category = await Category.findOne({ slug: categorySlug })
                    if(!category) throw new ValidationErr("categorySlug", "Invalid category")
                    dataToUpdate.category = category._id
                }
                if (name) dataToUpdate.name = name

                // Handle file uploads
                const uploadedFiles = await Promise.all(
                    Object.entries(files).map(async ([fieldname, fileList]) => {
                        const file = fileList[0];
                        return { fieldname, url: await uploadFileToCloudinary(file.buffer, FILE_FOLDER_CHOICES.PRODUCT) };
                    })
                );

                // Map uploaded file URLs
                const fileMapping: Record<string, string | null> = {};
                uploadedFiles.forEach(({ fieldname, url }) => {
                    fileMapping[fieldname] = url;
                });

                // Assign uploaded URLs to general product images
                if (fileMapping.image1) dataToUpdate.image1 = fileMapping.image1;
                if (fileMapping.image2) dataToUpdate.image2 = fileMapping.image2; 
                if (fileMapping.image3) dataToUpdate.image3 = fileMapping.image3; 
            }

            await Product.updateOne({ _id: product._id }, { $set: dataToUpdate } )
            return res.status(200).json(CustomResponse.success('Product Updated Successfully'))
        } catch (error) {
            next(error)
        }
    });

    /**
 * @route DELETE /products/:slug
 * @description Allows a seller to delete a product.
 */
sellerRouter.delete(
    '/products/:slug', 
    sellerMiddleware, 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const product = await Product.findOne({ seller: user.seller._id, slug: req.params.slug })
            if (!product) throw new NotFoundError("Product does not exist")
            const orderitemExists = await OrderItem.exists({ product: product._id, order: { $ne: null } })
            if (orderitemExists) {
                product.stock = 0
                await product.save()
            } else {
                await product.deleteOne({})
            }
            return res.status(200).json(CustomResponse.success('Product Deleted Successfully'))
        } catch (error) {
            next(error)
        }
    });

const variantFileFields = [{ name: "image" }] as any;
const variantFileSizes = { image: FILE_SIZE_CHOICES.PRODUCT }
    
/**
 * @route POST /products/:slug
 * @description Allows a seller to add a variant to a product.
 */
sellerRouter.post(
    '/products/:slug/variants', 
    sellerMiddleware, 
    upload(variantFileFields, variantFileSizes, {}),
    validationMiddleware(VariantCreateSchema), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const data = req.body
            const { size, color } = data
            if (!size && !color) throw new ValidationErr("color", "Please enter a size or color")
            const product = await Product.findOne({ seller: user.seller._id, slug: req.params.slug })
            if(!product) throw new NotFoundError("Product does not exist")
            
            // Handle file upload
            const files = req.files as { [fieldname: string]: Express.Multer.File[] }
            data.image = await uploadFileToCloudinary(files.image?.[0]?.buffer, FILE_FOLDER_CHOICES.PRODUCT) 
            product.variants.push(data)
            await product.save()
            return res.status(200).json(CustomResponse.success('Variant Added Successfully'))
        } catch (error) {
            next(error)
        }
    });

    /**
 * @route PUT /products/:slug/variants/:id
 * @description Allows a seller to edit a variant to a product.
 */
sellerRouter.put(
    '/products/:slug/variants/:id', 
    sellerMiddleware, 
    upload(variantFileFields, variantFileSizes, {}),
    validationMiddleware(VariantEditSchema), 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user
            const { size, color, price, stock, desc } = req.body


            const product = await Product.findOne({ seller: user.seller._id, slug: req.params.slug })
            if(!product) throw new NotFoundError("Seller Product does not exist")
            
            const variant: IVariant | undefined = product.variants.find((variant: IVariant) => variant._id.toString() === req.params.id )
            if (!variant) throw new NotFoundError("Variant doesn't exist for that product")

            // Cannot edit a variant price or picture that already has an confirmed order
            // Just create another and set the existing variant stock to 0
            const orderitemExists = await OrderItem.exists({ product: product._id, variant: variant._id, order: { $ne: null } })
            if (orderitemExists) {
                if (size) throw new ValidationErr("size", "Size is unchangeable")
                if (color) throw new ValidationErr("color", "Color is unchangeable")
                if (price) throw new ValidationErr("price", "Price is unchangeable")
                if (desc) throw new ValidationErr("desc", "Description is unchangeable")
            } else {
                if (size) variant.size = size
                if (color) variant.color = color
                if (price) variant.price = price
                if (desc) variant.desc = desc
            }
            if (stock) variant.stock = stock
            // Handle file upload
            const files = req.files as { [fieldname: string]: Express.Multer.File[] }
            const image = await uploadFileToCloudinary(files.image?.[0]?.buffer, FILE_FOLDER_CHOICES.PRODUCT) 
            if (image) variant.image = image
            await product.save()
            // Ignore null values when updating from dict
            return res.status(200).json(CustomResponse.success('Variant Updated Successfully', variant, VariantSchema))
        } catch (error) {
            next(error)
        }
    });

/**
 * @route DELETE /products/:slug/variants/:id
 * @description Allows a seller to delete a variant from a product.
 */
sellerRouter.delete('/products/:slug/variants/:id', sellerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const product = await Product.findOne({ seller: user.seller._id, slug: req.params.slug })
        if(!product) throw new NotFoundError("Seller Product does not exist")
        
        const variant: IVariant | undefined = product.variants.find((variant: IVariant) => variant._id.toString() === req.params.id )
        if (!variant) throw new NotFoundError("Variant doesn't exist for that product")

        // Cannot remove a variant that already has an confirmed order
        // Just set the existing variant stock to 0
        const orderitemExists = await OrderItem.exists({ product: product._id, variant: variant._id, order: { $ne: null } })
        if (orderitemExists) {
            // Set the stock to 0
            variant.stock = 0
            await product.save()
        } else {
            // Remove the variant entirely
            product.variants.pull({ _id: variant._id })
            await product.save()
        }
        return res.status(200).json(CustomResponse.success('Variant Deleted Successfully'))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /orders
 * @description List all seller orders.
 */
sellerRouter.get('/orders', sellerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { paymentStatus, deliveryStatus } = req.query
        if (paymentStatus && !isPartOfEnum(paymentStatus as string, PAYMENT_STATUS_CHOICES)) throw new InvalidParamError("Invalid payment status")
        if (deliveryStatus && !isPartOfEnum(deliveryStatus as string, DELIVERY_STATUS_CHOICES)) throw new InvalidParamError("Invalid delivery status")

        const filter: Record<string,any> = {}
        if (paymentStatus) filter.paymentStatus = paymentStatus
        const orders = await getSellerOrdersWithDetailedOrderItems(filter, user.seller._id, deliveryStatus as string | null)
        const data = await paginateRecords(req, orders)
        const ordersData = { orders: data.items, ...data }
        return res.status(200).json(CustomResponse.success(`Orders returned successfully`, ordersData, OrdersResponseSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /dashboard
 * @description Seller Dashboard.
 */
sellerRouter.get('/dashboard', sellerMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const seller = req.user.seller
        const products = await getProducts(null, { seller: seller._id })
        const productsData = await paginateRecords(req, products)
        const orders = await getSellerOrdersWithDetailedOrderItems({}, seller._id)
        const ordersData = await paginateRecords(req, orders)

        const sellerData = {
            name: seller.name, image: seller.image,
            productsData: { products: productsData.items, ...productsData }, 
            ordersData: { orders: ordersData.items, ...ordersData }
        }
        return res.status(200).json(CustomResponse.success(`Dashboard returned successfully`, sellerData, SellerDashboardSchema))
    } catch (error) {
        next(error)
    }
});

export default sellerRouter;