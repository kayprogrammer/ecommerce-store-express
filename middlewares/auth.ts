import { NextFunction, Request, Response } from "express";
import { ErrorCode, RequestError } from "../config/handlers";
import { decodeAuth } from "../managers/users"
import { IUser } from "../models/accounts";
import { ACCOUNT_TYPE_CHOICES } from "../models/choices";

const getUser = async(token: string): Promise<IUser> => {
  // Extract the token from Authorization header
  const user = await decodeAuth(token)
  if (!user) throw new RequestError("Access token is invalid or expired", 401, ErrorCode.INVALID_TOKEN)
  return user
}
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if Authorization header exists
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) throw new RequestError("Unauthorized User", 401, ErrorCode.UNAUTHORIZED_USER);
    req.user = await getUser(req.headers.authorization.replace('Bearer ', ''));
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
    next();
  } catch (error) {
    next(error)
  }
};

export const authOrGuestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.user_ = null
    // Check if Authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      let user = await getUser(req.headers.authorization.replace('Bearer ', ''));
      req.user = user
      req.user_ = user
    }
    next();
  } catch (error) {
    next(error)
  }
};