import { Router, Request, Response, NextFunction } from "express";
import { CustomResponse } from "../config/utils";
import {  User } from "../models/accounts";
import { ErrorCode, NotFoundError, RequestError, ValidationErr } from "../config/handlers";
import { validationMiddleware } from "../middlewares/error"
import { checkPassword, createAccessToken, createRefreshToken, createUser, hashPassword, validateFacebookToken, validateGoogleToken, verifyRefreshToken } from "../managers/users";
import { EmailSchema } from "../schemas/base";
import { LoginSchema, RefreshTokenSchema, RegisterSchema, SetNewPasswordSchema, TokenSchema, TokensSchema, VerifyEmailSchema } from "../schemas/auth";
import { sendEmail } from "../config/emailer"
import { authMiddleware } from "../middlewares/auth";
import ENV from "../config/conf";
import { AUTH_TYPE_CHOICES } from "../models/choices";

const authRouter = Router();

/**
 * @route POST /register
 * @description Registers a new user and sends a confirmation email.
 * @param {Request} req - Express request object containing user registration data.
 * @param {Response} res - Express response object to send the registration success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with registration success message and user data.
 */
authRouter.post('/register', validationMiddleware(RegisterSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: RegisterSchema = req.body;

        const { email } = userData;
        const existingUser = await User.findOne({ email })
        if (existingUser) throw new ValidationErr("email", "Email already registered")

        const user = await createUser(req.body)
        // Send verification email
        await sendEmail("activate", user);
        return res.status(201).json(
            CustomResponse.success(
                'Registration successful', 
                user, 
                EmailSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /verify-email
 * @description Verify a user's email and sends a welcome email.
 * @param {Request} req - Express request object containing verification email data.
 * @param {Response} res - Express response object to send the verification success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/verify-email', validationMiddleware(VerifyEmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: VerifyEmailSchema = req.body;

        const { email, otp } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")

        if (user.isEmailVerified) return res.status(200).json(CustomResponse.success("Email already verified"))
    
        // Verify otp
        let currentDate = new Date() 
        if (user.otp !== otp || currentDate > user.otpExpiry) throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        
        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { otp: null, otpExpiry: null, isEmailVerified: true } }
        );
        // Send welcome email
        await sendEmail("welcome", user);
        return res.status(200).json(
            CustomResponse.success(
                'Verification successful', 
                user, 
                EmailSchema
            )    
        )
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /resend-verification-email
 * @description Resend a verification email to a user.
 * @param {Request} req - Express request object containing verification email data.
 * @param {Response} res - Express response object to send the email sent success response.
 * @param {NextFunction} next - Express middleware function to handle errors.
 * @throws {ValidationErr} If the email is already registered.
 * @returns {Response} - JSON response with success message
 */
authRouter.post('/resend-verification-email', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: EmailSchema = req.body;

        const { email } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")

        if (user.isEmailVerified) return res.status(200).json(CustomResponse.success("Email already verified"))

        // Send otp email
        await sendEmail("activate", user);
        return res.status(200).json(CustomResponse.success('Email sent successful'))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /send-password-reset-otp
 * @description This endpoint sends new password reset otp to the user's email.
 * We can use the verification email resend to do this actually, but I just wanted
 * to seperate it incase you have some special stuffs you might want to include here 
 */
authRouter.post('/send-password-reset-otp', validationMiddleware(EmailSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: EmailSchema = req.body;

        const { email } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")
        if (user.authType === AUTH_TYPE_CHOICES.GOOGLE) throw new RequestError("Cannot request password reset for account created via google sign in", 401, ErrorCode.INCORRECT_EMAIL)

        // Send otp email
        await sendEmail("reset", user);
        return res.status(200).json(CustomResponse.success('Email sent successful'))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /set-new-password
 * @description Verifies the password reset otp and updates the user's password.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/set-new-password', validationMiddleware(SetNewPasswordSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: SetNewPasswordSchema = req.body;

        const { email, otp, password } = userData;
        const user = await User.findOne({ email })
        if (!user) throw new NotFoundError("Incorrect email!")

        // Verify otp
        let currentDate = new Date() 
        if (user.otp !== otp || currentDate > user.otpExpiry) throw new RequestError("Otp is invalid or expired", 400, ErrorCode.INVALID_OTP)
        
        // Update user
        await User.updateOne(
            { _id: user._id },
            { $set: { otp: null, otpExpiry: null, password: await hashPassword(password as string) } }
        );
        // Send password reset success email
        await sendEmail("reset-success", user);
        return res.status(200).json(CustomResponse.success('Password reset successful'))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /login
 * @description Generates access and refresh tokens for the user based on login credentials.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/login', validationMiddleware(LoginSchema), async (req: Request, res: Response, next: NextFunction) => {   
    try {
        const userData: LoginSchema = req.body;

        const { email, password } = userData;
        const user = await User.findOne({ email })
        if (!user || !(await checkPassword(user, password as string))) throw new RequestError("Invalid credentials!", 400, ErrorCode.INVALID_CREDENTIALS);
        if (!user.isEmailVerified) throw new RequestError("Verify your email first", 400, ErrorCode.UNVERIFIED_USER);

        // Generate tokens
        const access = createAccessToken(user.id) 
        const refresh = createRefreshToken() 

        const tokens = { user, access, refresh }

        // Update user with access tokens
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successfully', tokens, TokensSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /google
 * @description Generates access and refresh tokens for the user based on google auth token.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/google', validationMiddleware(TokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: TokenSchema = req.body;
        const { token } = userData;
        // Validate token
        const { payload, error } = await validateGoogleToken(token as string)
        if (error) throw new RequestError(error, 401, ErrorCode.INVALID_TOKEN);

        // Get or Create User
        let user = await User.findOne({ email: payload.email })
        if (user && user.authType === AUTH_TYPE_CHOICES.GENERAL) throw new RequestError("Requires password to sign in to this account", 401, ErrorCode.INVALID_AUTH);
        else if (!user) {
            const userData = { name: payload.name, email: payload.email, password: ENV.SOCIAL_PASSWORD, avatar: payload.picture }
            user = await createUser(userData, true, AUTH_TYPE_CHOICES.GOOGLE)
        }

        // Generate tokens
        const access = createAccessToken(user.id) 
        const refresh = createRefreshToken() 

        // Update user with access and refresh tokens
        let tokens = { user, access, refresh }
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successful', tokens, TokensSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /facebook
 * @description Generates access and refresh tokens for the user based on facebook auth token.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/facebook', validationMiddleware(TokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData: TokenSchema = req.body;
        const { token } = userData;
        // Validate token
        const { payload, error } = await validateFacebookToken(token as string)
        if (error) throw new RequestError(error, 401, ErrorCode.INVALID_TOKEN);

        // Get or Create User
        let user = await User.findOne({ email: payload.email })
        if (user && user.authType === AUTH_TYPE_CHOICES.GENERAL) throw new RequestError("Requires password to sign in to this account", 401, ErrorCode.INVALID_AUTH);
        else if (!user) {
            const userData = { name: payload.name, email: payload.email, password: ENV.SOCIAL_PASSWORD, avatar: payload.picture }
            user = await createUser(userData, true, AUTH_TYPE_CHOICES.FACEBOOK)
        }

        // Generate tokens
        const access = createAccessToken(user.id) 
        const refresh = createRefreshToken() 

        // Update user with access and refresh tokens
        let tokens = { user, access, refresh }
        await User.updateOne(
            { _id: user._id },
            { $push: { tokens } }
        );
        return res.status(201).json(CustomResponse.success('Login successful', tokens, TokensSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route POST /refresh
 * @description Generates new access and refresh tokens for the user based on refresh token.
 * @returns {Response} - JSON response with success message.
 */
authRouter.post('/refresh', validationMiddleware(RefreshTokenSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken: string = req.body.refresh;
        const user = await User.findOne({ "tokens.refresh": refreshToken });
        if (!user || !(await verifyRefreshToken(refreshToken))) throw new RequestError("Refresh token is invalid or expired!", 401, ErrorCode.INVALID_TOKEN);

        // Generate new tokens
        const access = createAccessToken(user.id) 
        const refresh = createRefreshToken() 

        // Update user with access tokens
        let tokens = { user, access, refresh }
        await User.updateOne(
            { _id: user._id, "tokens.refresh": refreshToken },
            { $set: { "tokens.$": tokens } }
        );
        return res.status(201).json(CustomResponse.success('Tokens refreshed successfully', tokens, TokensSchema))
    } catch (error) {
        next(error)
    }
});

/**
 * @route GET /logout
 * @description Logout users by invalidating the current access and refresh tokens
 * @returns {Response} - JSON response with success message.
 */
authRouter.get('/logout', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const authorization = req.headers.authorization as string
        const token = authorization.replace('Bearer ', '');
        await User.updateOne(
            { _id: user._id, "tokens.access": token },
            { $pull: { tokens: { access: token } } }
        );
        return res.status(200).json(CustomResponse.success("Logout Successfully"))
    } catch (error) {
        next(error)
    }
});

export default authRouter;
