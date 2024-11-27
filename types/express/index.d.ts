import express from "express";
import { IGuest, IUser } from "../../models/accounts";

declare global {
  namespace Express {
    interface Request {
      user: IUser
      user_: IUser | IGuest
    }
  }
}