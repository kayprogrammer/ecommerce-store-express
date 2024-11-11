import { NextFunction, Request, Response, Router } from "express";
import { validationMiddleware } from "../middlewares/error";
import { ProfileEditSchema, ProfileSchema } from "../schemas/profiles";
import { authMiddleware } from "../middlewares/auth";
import { upload, uploadImageToCloudinary } from "../config/file_processor";
import { CustomResponse } from "../config/utils";

const profilesRouter = Router();

/**
 * @route GET /
 * @description Get the current authenticated user profile
 * @returns {Response} - JSON response with success message.
 */
profilesRouter.get('', authMiddleware, (req: Request, res: Response, next: NextFunction) => {
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

export default profilesRouter