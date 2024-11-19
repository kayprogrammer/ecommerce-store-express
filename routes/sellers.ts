import { NextFunction, Request, Response, Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { upload, uploadFileToCloudinary } from "../config/file_processor";
import { validationMiddleware } from "../middlewares/error";
import { SellerApplicationSchema } from "../schemas/sellers";
import { FILE_FOLDER_CHOICES, FILE_SIZE_CHOICES } from "../models/choices";
import { CustomResponse, setDictAttr } from "../config/utils";
import { ISeller, Seller } from "../models/sellers";
import { Category } from "../models/shop";
import { ValidationErr } from "../config/handlers";

const sellerRouter = Router();

const fileFields = [
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
            const governmentIdFile = files.governmentId?.[0];
            const proofOfAddressFile = files.proofOfAddress?.[0];
            const businessLicenseFile = files.businessLicense?.[0];

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

export default sellerRouter;