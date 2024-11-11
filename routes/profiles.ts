import { NextFunction, Request, Response, Router } from "express";
import { validationMiddleware } from "../middlewares/error";
import { CountrySchema, ProfileEditSchema, ProfileSchema, ShippingAddressCreateSchema, ShippingAddressSchema } from "../schemas/profiles";
import { authMiddleware } from "../middlewares/auth";
import { upload, uploadImageToCloudinary } from "../config/file_processor";
import { CustomResponse } from "../config/utils";
import { Country, ShippingAddress } from "../models/profiles";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { shortUserPopulation } from "../managers/users";

const profilesRouter = Router();

/**
 * @route GET /
 * @description Get the current authenticated user profile
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(CustomResponse.success("Profile Retrieved Successfully", req.user, ProfileSchema));
});

/**
 * @route POST /
 * @description Updates a user's profile.
 */
profilesRouter.post('', authMiddleware, upload.single("avatar"), validationMiddleware(ProfileEditSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { name } = req.body;
        if (req.file) {
            user.avatar = await uploadImageToCloudinary(req.file.buffer, "avatar")
        }
        user.name = name
        await user.save()
        return res.status(200).json(
            CustomResponse.success(
                'Profile updated successful', 
                user, 
                ProfileSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /countries
 * @description Get all countries
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('/countries', async (req: Request, res: Response, next: NextFunction) => {
    const countries = await Country.find()
    return res.status(200).json(CustomResponse.success("Countries Retrieved Successfully", countries, CountrySchema));
});

/**
 * @route GET /addresses
 * @description Get the authenticated user shipping addresses
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('/addresses', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user
    const addresses = await ShippingAddress.find({ user: user._id }).populate([shortUserPopulation("user"), "country_"])
    return res.status(200).json(CustomResponse.success("Shipping Addresses Retrieved Successfully", addresses, ShippingAddressSchema));
});

/**
 * @route POST /addresses
 * @description Creates a shipping address.
 */
profilesRouter.post('/addresses', authMiddleware, validationMiddleware(ShippingAddressCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const data: ShippingAddressCreateSchema = req.body
        const country = await Country.findOne({ _id: data.countryId })
        if (!country) throw new ValidationErr("countryId", "No country with that ID")
        delete data.countryId
        const address = await ShippingAddress.create({ user: user._id, country_: country.id, ...data})
        address.country_ = country
        address.user = user

        return res.status(200).json(
            CustomResponse.success(
                'Address created successful', 
                address, 
                ShippingAddressSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

export default profilesRouter