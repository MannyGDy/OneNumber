import dotenv from "dotenv";
dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 8000;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/onenumber';

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-jwt-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Bcrypt Configuration
export const BCRYPT_SALT_ROUNDS = 12;

// Cookie Configuration
export const COOKIE_SECRET = process.env.COOKIE_SECRET || 'your-secret-cookie-key';

// Email Configuration
export const SMTP_HOST = process.env.SMTP_HOST || 'smtp.example.com';
export const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
export const SMTP_USERNAME = process.env.SMTP_MAIL || 'username';
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'password';
export const SMTP_FROM = process.env.SMTP_FROM || 'noreply@example.com';

export const APP_NAME = process.env.APP_NAME || 'OneNumber Web App';
export const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@onenumber';
export const LOGO_URL = process.env.LOGO_URL || 'https://one-number.vercel.app/assets/svgs/logos/OneNumber%20Orange%20logo.svg';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@onenumber';
export const ADMIN_PORTAL_URL = process.env.ADMIN_PORTAL_URL || 'https://one-number.vercel.app/admin/dashboard';

// Refresh Token Configurationß
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "dgdfgdfgdfggdfgdfggdfg";
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Frontend URL for links in emails
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

