import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { IUser, User } from '../models/accounts';
import ENV from '../config/conf';
import { Types } from 'mongoose';
import * as jwt from "jsonwebtoken";
import { randomStr } from '../config/utils';
import { AUTH_TYPE_CHOICES } from '../models/choices';
import FB from "fb";
import axios from 'axios';

const hashPassword = async (password: string) => {
    const hashedPassword: string = await bcrypt.hash(password, 10) 
    return hashedPassword
}

const checkPassword = async (user: IUser, password: string) => {
    return await bcrypt.compare(password, user.password)
}

const createUser = async (userData: Record<string,any>, isEmailVerified: boolean = false, authType: AUTH_TYPE_CHOICES = AUTH_TYPE_CHOICES.GENERAL) => {
    const { password, ...otherUserData } = userData;

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ password: hashedPassword, isEmailVerified, authType,  ...otherUserData });
    return newUser; 
};

const createOtp = async (user: IUser): Promise<number> => {
    const otp: number = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + ENV.EMAIL_OTP_EXPIRE_SECONDS * 1000); // OTP expiry in 15 minutes

    try {
        await User.updateOne(
            { _id: user._id },
            { $set: { otp, otpExpiry } }
        );
    } catch (error) {
        console.error('Error updating OTP and expiry:', error);
        throw error;
    }
    return otp
};

// Authentication Tokens
const ALGORITHM = "HS256"
const createAccessToken = (userId: Types.ObjectId) => {
    let payload = { userId, exp: Math.floor(Date.now() / 1000) + (ENV.ACCESS_TOKEN_EXPIRE_MINUTES * 60)}
    return jwt.sign(payload, ENV.SECRET_KEY, { algorithm: ALGORITHM });
}

const createRefreshToken = () => {
    const payload: Record<string, string|number> = { data: randomStr(10), exp: Math.floor(Date.now() / 1000) + (ENV.REFRESH_TOKEN_EXPIRE_MINUTES * 60) }
    return jwt.sign(payload, ENV.SECRET_KEY, { algorithm: ALGORITHM });
}

const verifyAsync = (token: string, secret: string) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, payload) => {
            if (err) {
                reject(err);
            } else {
                resolve(payload);
            }
        });
    });
}

const verifyRefreshToken = async (token: string) => {
    try {
      const decoded = await verifyAsync(token, ENV.SECRET_KEY) as any;
      return true
    } catch (error) {
        return false;
    }
}

const decodeAuth = async (token: string): Promise<IUser | null> => {
    try {
      const decoded = await verifyAsync(token, ENV.SECRET_KEY) as { userId?: string };
      const userId = decoded?.userId;
        
      if (!userId) {
        return null;
      }
  
      const user = await User.findOne({ _id: userId, "tokens.access": token });
      return user;
    } catch (error) {
      return null;
    }
}

const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

const validateGoogleToken = async (authToken: string): Promise<Record<string,any>> => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: authToken,
            audience: ENV.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload || !payload['sub']) {
            return { payload: null, error: 'Invalid Auth Token' };
        }
        return { payload, error: null };
    } catch (error) {
        return { payload: null, error: 'Invalid Auth Token' };
    }
}

const validateFacebookToken = async (authToken: string): Promise<Record<string,any>> => {
    try {
        // Validate token by checking against the app ID
        const appResponse = await axios.get(`https://graph.facebook.com/app`, {
            params: { access_token: authToken }
        });
        if (parseInt(appResponse.data.id) !== ENV.FACEBOOK_APP_ID) return { user: null, error: "Invalid Auth Token" };
        // Fetch user profile with name, email, and profile picture URL only
        const profileResponse = await axios.get("https://graph.facebook.com/me", {
            params: {
                access_token: authToken,
                fields: "id,name,email,picture.type(large){url}"
            }
        });
        const data = profileResponse.data
        const payload = { name: data.name, email: data.email, picture: data.picture.data.url }
        return { payload, error: null };
    } catch (error) {
        return { payload: null, error: 'Invalid Auth Token' };
    }
}

const shortUserPopulation = (field: string) => ({path: field, select: "name avatar"})

const SELLER_POPULATION = {path: "seller", select: "name slug image"}

export { createUser, createOtp, hashPassword, checkPassword, createAccessToken, createRefreshToken, verifyRefreshToken, decodeAuth, validateGoogleToken, validateFacebookToken, shortUserPopulation, SELLER_POPULATION };
