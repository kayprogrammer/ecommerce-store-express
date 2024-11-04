import express from "express";
import { IUser } from "../../models/accounts";

declare global {
  namespace Express {
    interface Request {
      user: IUser
      user_: IUser | null // For guest auth
    }
  }
}