import { Response } from "express";
import { IUser } from "../models/user.model";
import { IAdmin } from "../models/admin.model";
import jwt from "jsonwebtoken";

type UserType = IUser | IAdmin;

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}


declare module 'express-serve-static-core' {
  interface Request {
    user?: IUser | IAdmin;
    userType?: string;
  }
}

// Helper to get token expiry from env
const getTokenExpiry = (type: string): number => {
  const envKey = `${type.toUpperCase()}_TOKEN_EXPIRE`;
  const defaultValues: { [key: string]: string } = {
    access: "159200000",    // 
    refresh: "459200000"   // 5 days
  };
  return parseInt(process.env[envKey] || defaultValues[type], 10);
};

// Create token options
const createTokenOptions = (expireTime: number): ITokenOptions => ({
  expires: new Date(Date.now() + expireTime * 60 * 1000), // Convert minutes to milliseconds
  maxAge: expireTime * 60 * 1000,
  httpOnly: true,
  secure: true,
  sameSite: "none",
});

export const accessTokenOptions: ITokenOptions = createTokenOptions(getTokenExpiry("access"));
export const refreshTokenOptions: ITokenOptions = createTokenOptions(getTokenExpiry("refresh"));

// Sign JWT token
const signToken = (
  user: UserType,
  type: "access" | "refresh"
): string => {
  const secret = type === "access"
    ? process.env.ACCESS_TOKEN
    : process.env.REFRESH_TOKEN;

  const expiry = type === "access"
    ? getTokenExpiry("access") + "m"
    : getTokenExpiry("refresh") + "m";

  return jwt.sign(
    {
      id: user.id.toString(),
      role: user.role
    },
    secret as string,
    { expiresIn: expiry }
  );
};

export const sendToken = async (
  user: any,
  statusCode: number,
  res: Response,
  type: "user" | "admin"
) => {
  try {
    const accessToken = signToken(user, "access");
    const refreshToken = signToken(user, "refresh");





    // Set cookies with secure flag always enabled
    const cookieOptions = {
      ...accessTokenOptions,
      secure: true
    };

    res.cookie("access_token", accessToken, cookieOptions);
    res.cookie("refresh_token", refreshToken, {
      ...refreshTokenOptions,
      secure: true
    });



    res.status(statusCode).json({
      success: true,
      accountType: type,
      user: user.toJSON(),
      accessToken,
    });
  } catch (error) {
    console.error("SendToken Error:", error);
    throw error;
  }
};


[]