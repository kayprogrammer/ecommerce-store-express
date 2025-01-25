import { NextFunction, Request, Response } from "express";
import { ErrorCode, RequestError, UnauthorizedError } from "../config/handlers";
import { decodeAuth } from "../managers/users"
import { Guest, IUser } from "../models/accounts";
import { ACCOUNT_TYPE_CHOICES, SELLER_STATUS_CHOICES } from "../models/choices";
import { Seller } from "../models/sellers";

const getUser = async(token: string): Promise<IUser> => {
  // Extract the token from Authorization header
  const user = await decodeAuth(token)
  if (!user) throw new UnauthorizedError("Access token is invalid or expired", ErrorCode.INVALID_TOKEN)
  return user
}
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) throw new UnauthorizedError("Unauthorized User");
    req.user = await getUser(req.headers.authorization.replace('Bearer ', ''));
    next();
  } catch (error) {
    next(error)
  }
};

export const sellerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) throw new UnauthorizedError("Unauthorized User");
    const user = await getUser(req.headers.authorization.replace('Bearer ', ''));
    const seller = await Seller.findOne({ user: user._id, status: SELLER_STATUS_CHOICES.APPROVED })
    if (!seller) throw new UnauthorizedError("For Sellers Only", ErrorCode.SELLERS_ONLY)
    user.seller = seller
    req.user = user;
    next();
  } catch (error) {
    next(error)
  }
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) throw new RequestError("Unauthorized User", 401, ErrorCode.UNAUTHORIZED_USER);
    const user = await getUser(req.headers.authorization.replace('Bearer ', ''));
    if(user.accountType !== ACCOUNT_TYPE_CHOICES.SUPERUSER && user.accountType !== ACCOUNT_TYPE_CHOICES.STAFF) throw new RequestError("For Admins only", 401, ErrorCode.ADMINS_ONLY)
    req.user = user
    next();
  } catch (error) {
    next(error)
  }
};

export const authOrGuestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if Authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      req.user_ = await getUser(req.headers.authorization.replace('Bearer ', ''));
    } else {
      // Get or create GuestUser
      let guest = await Guest.findOne({ _id: req.headers.guest })
      if (!guest) guest = await Guest.create({})
      req.user_ = guest
    }
    next();
  } catch (error) {
    next(error)
  }
};