import jwt from "jsonwebtoken";
import config from "../../config";
import { AppError } from "../../middlewares/errors";
import { UserRole } from "../../modules/User/user.interface";
import UserModel from "../../modules/User/user.model";
const JWT_SECRET = config.secretToken || "your_jwt_secret";
const JWT_REFRESH_SECRET =
  config.secretRefreshToken || "your_refresh_jwt_secret";
const ACCESS_TOKEN_EXPIRY = config.accessTokenExpiration || "1h";
const REFRESH_TOKEN_EXPIRY = config.refreshTokenExpiration || "7d";
export const generateAccessToken = (userId: string, role: UserRole): string => {
  try {
    const payload = { userId, role };

    // Generate access token with short expiration time (e.g., 1 hour)
    const accessToken = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: "1h", // Access token expires in 1 hour
    });

    return accessToken;
  } catch (error) {
    throw new AppError("Failed to generate access token", 500);
  }
};
export const generateRefreshToken = async (
  userId: string
): Promise<string | undefined> => {
  try {
    const payload = { userId };

    // Generate refresh token with longer expiration time
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET as string, {
      expiresIn: "7d", // Refresh token expires in 7 days
    });

    // Optionally store the refresh token in the database, associated with the user
    await UserModel.findByIdAndUpdate(userId, { refreshToken });

    return refreshToken;
  } catch (error) {
    throw new AppError("Failed to generate refresh token", 500);
  }
};
