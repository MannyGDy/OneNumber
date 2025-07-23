import crypto from 'crypto';
import base32 from 'hi-base32';
import QRCode from 'qrcode';
import { APP_NAME } from '../config/env';

// TOTP settings
const TOTP_WINDOW = 1; // Number of 30-second windows to check (before and after current time)
const TOTP_DIGITS = 6; // Number of digits in TOTP code
const TOTP_ALGO = 'sha1'; // Algorithm used for HMAC
const TOTP_PERIOD = 30; // Period in seconds

/**
 * Generate a random TOTP secret
 * @returns Base32 encoded secret
 */
export const generateTOTPSecret = (): string => {
  const buffer = crypto.randomBytes(20);
  const secret = base32.encode(buffer).replace(/=/g, '');
  return secret;
};

/**
 * Generate a TOTP code
 * @param secret TOTP secret (or a string to be used as a key)
 * @param time Optional time to generate code for (defaults to current time)
 * @returns TOTP code
 */
export const generateTOTP = (secret: string, time: number = Date.now()): string => {
  // If secret is not base32 encoded, hash it to create a key
  let key;
  try {
    key = base32.decode.asBytes(secret.toUpperCase());
  } catch (e) {
    // If not valid base32, create a key from the string
    const hash = crypto.createHash('sha256').update(secret).digest();
    key = hash.slice(0, 20); // Use 20 bytes (160 bits) for the key
  }

  // Calculate counter value (number of time steps since epoch)
  const counter = Math.floor(time / 1000 / TOTP_PERIOD);

  // Convert counter to buffer
  const counterBuffer = Buffer.alloc(8);
  for (let i = 0; i < 8; i++) {
    counterBuffer[7 - i] = counter & (0xff << (i * 8)) >>> (i * 8);
  }

  // Calculate HMAC
  const hmac = crypto.createHmac(TOTP_ALGO, Buffer.from(key));
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  // Extract code using dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0xf;
  const code = ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  // Generate code and pad with zeros if needed
  const totp = (code % Math.pow(10, TOTP_DIGITS)).toString();
  return totp.padStart(TOTP_DIGITS, '0');
};

/**
 * Verify a TOTP code
 * @param secret TOTP secret (or a string to be used as a key)
 * @param token Token to verify
 * @param time Optional time to validate against (defaults to current time)
 * @returns boolean indicating if token is valid
 */
export const verifyTOTP = (secret: string, token: string, time: number = Date.now()): boolean => {
  // Check for time drift by testing tokens from previous and next windows
  for (let i = -TOTP_WINDOW; i <= TOTP_WINDOW; i++) {
    const windowTime = time + (i * TOTP_PERIOD * 1000);
    const expectedToken = generateTOTP(secret, windowTime);
    if (expectedToken === token) {
      return true;
    }
  }
  return false;
};

/**
 * Generate a QR code for TOTP setup
 * @param email User email
 * @param secret TOTP secret
 * @returns QR code as data URL
 */
export const generateTOTPQRCode = async (email: string, secret: string): Promise<string> => {
  const issuer = encodeURIComponent(APP_NAME);
  const account = encodeURIComponent(email);
  const secretParam = encodeURIComponent(secret);

  const otpauth = `otpauth://totp/${issuer}:${account}?secret=${secretParam}&issuer=${issuer}&algorithm=${TOTP_ALGO}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

  try {
    const dataUrl = await QRCode.toDataURL(otpauth);
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate TOTP setup information
 * @param email User email
 * @returns Object containing secret, URL, and QR code
 */
export const generateTOTPSetup = async (email: string): Promise<{
  secret: string;
  url: string;
  qrCode: string;
}> => {
  const secret = generateTOTPSecret();
  const issuer = encodeURIComponent(APP_NAME);
  const account = encodeURIComponent(email);

  const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${issuer}&algorithm=${TOTP_ALGO}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
  const qrCode = await generateTOTPQRCode(email, secret);

  return {
    secret,
    url: otpauthUrl,
    qrCode
  };
};