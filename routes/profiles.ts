import { NextFunction, Request, Response, Router } from "express";
import { validationMiddleware } from "../middlewares/error";
import { CountrySchema, ProfileEditSchema, ProfileSchema, ShippingAddressInputSchema, ShippingAddressSchema } from "../schemas/profiles";
import { authMiddleware } from "../middlewares/auth";
import { upload, uploadFileToCloudinary } from "../config/file_processor";
import { CustomResponse, setDictAttr } from "../config/utils";
import { Country, IShippingAddress, ShippingAddress } from "../models/profiles";
import { NotFoundError, ValidationErr } from "../config/handlers";
import { shortUserPopulation } from "../managers/users";
import { FILE_FOLDER_CHOICES } from "../models/choices";

const profilesRouter = Router();

/**
 * @route GET /
 * @description Get the current authenticated user profile.
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.status(200).json(CustomResponse.success("Profile Retrieved Successfully", req.user, ProfileSchema));
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /
 * @description Updates a user's profile.
 */
profilesRouter.post('', authMiddleware, upload([{ name: "avatar", maxCount: 1 }], {}, {}), validationMiddleware(ProfileEditSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { name } = req.body;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const avatarFile = files.avatar?.[0];

        if (avatarFile) {
            user.avatar = await uploadFileToCloudinary(avatarFile.buffer, FILE_FOLDER_CHOICES.AVATAR)
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
    try {
        const countries = await Country.find()
        return res.status(200).json(CustomResponse.success("Countries Retrieved Successfully", countries, CountrySchema));
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /addresses
 * @description Get the authenticated user shipping addresses
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('/addresses', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const addresses = await ShippingAddress.find({ user: user._id }).populate([shortUserPopulation("user"), "country_"])
        return res.status(200).json(CustomResponse.success("Shipping Addresses Retrieved Successfully", addresses, ShippingAddressSchema));
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /addresses
 * @description Creates a shipping address.
 */
profilesRouter.post('/addresses', authMiddleware, validationMiddleware(ShippingAddressInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const data: ShippingAddressInputSchema = req.body
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

/**
 * @route GET /addresses/:id
 * @description Get a single shipping address of the authenticated user
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('/addresses/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const address = await ShippingAddress.findOne({ user: user._id, _id: req.params.id }).populate([shortUserPopulation("user"), "country_"])
        if(!address) throw new NotFoundError("User has no shipping address with that ID");
        return res.status(200).json(CustomResponse.success("Shipping Address Retrieved Successfully", address, ShippingAddressSchema));
    } catch (error) {
        next(error)
    }
});

/**
 * @route PUT /addresses/:id
 * @description Update a single shipping address of the authenticated user
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.put('/addresses/:id', authMiddleware, validationMiddleware(ShippingAddressInputSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        let address = await ShippingAddress.findOne({ user: user._id, _id: req.params.id })
        if(!address) throw new NotFoundError("User has no shipping address with that ID")

        const data = req.body
        const country = await Country.findOne({ _id: data.countryId })
        if (!country) throw new ValidationErr("countryId", "No country with that ID")
        delete data.countryId
        data.country_ = country
        address = setDictAttr(data, address) as IShippingAddress
        await address.save()
        address.user = user
        address.country_ = country
        return res.status(200).json(CustomResponse.success("Shipping Address Updated Successfully", address, ShippingAddressSchema));
    } catch (error) {
        next(error)
    }
});

/**
 * @route DELETE /addresses/:id
 * @description Deletes a single shipping address of the authenticated user
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.delete('/addresses/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const address = await ShippingAddress.findOne({ user: user._id, _id: req.params.id })
        if(!address) throw new NotFoundError("User has no shipping address with that ID")
        await address.deleteOne()
        return res.status(200).json(CustomResponse.success("Shipping Address Deleted Successfully"));
    } catch (error) {
        next(error)
    }
});

export default profilesRouter