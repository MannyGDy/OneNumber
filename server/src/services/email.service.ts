import nodemailer from 'nodemailer';
import { IUser } from '../models/user.model';
import { IAdmin } from '../models/admin.model';
import { ISubscription } from '../models/subscription.model';
import { SMTP_HOST, SMTP_PORT, SMTP_PASSWORD, SMTP_USERNAME, APP_NAME, SUPPORT_EMAIL, ADMIN_EMAIL, ADMIN_PORTAL_URL, LOGO_URL, FRONTEND_URL } from '../config/env';
import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import logger from '../utils/logger';

// Email templates directory
const TEMPLATE_DIR = path.join(__dirname, '../mails');

// Email templates cache
const emailTemplates: { [key: string]: (data: any) => string } = {};

// Load and compile template
const getTemplate = (templateName: string): (data: any) => string => {
  if (emailTemplates[templateName]) {
    return emailTemplates[templateName];
  }

  const templatePath = path.join(TEMPLATE_DIR, `${templateName}.ejs`);
  const templateSource = fs.readFileSync(templatePath, 'utf8');

  // Create a function that renders the template with data
  const renderTemplate = (data: any) => {
    return ejs.render(templateSource, data);
  };

  emailTemplates[templateName] = renderTemplate;
  return renderTemplate;
};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USERNAME,
    pass: SMTP_PASSWORD
  }
});

// Email types
export type EmailType =
  | 'welcome'
  | 'password-reset'
  | 'email-verification'
  | 'subscription-created'
  | 'subscription-renewed'
  | 'subscription-cancelled'
  | 'subscription-expiring'
  | 'subscription-expired'
  | 'account-status-change'
  | 'account-deleted';

// Base email sending function
const sendEmail = async (
  to: string,
  subject: string,
  template: string,
  data: any
): Promise<boolean> => {
  try {
    const renderTemplate = getTemplate(template);
    const html = renderTemplate({
      ...data,
      appName: APP_NAME,
      logoUrl: LOGO_URL,
      supportEmail: SUPPORT_EMAIL,
      frontendUrl: FRONTEND_URL
    });

    const mailOptions = {
      from: `"${APP_NAME}" <${SUPPORT_EMAIL}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to} with template: ${template}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
};

// Send email to admin
const sendAdminEmail = async (
  adminEmailOrObject: string | IAdmin,
  template: string,
  subject: string,
  data: any,
): Promise<boolean> => {
  try {
    // Handle both string email and admin object
    const adminEmail = typeof adminEmailOrObject === 'string'
      ? adminEmailOrObject
      : adminEmailOrObject.email || ADMIN_EMAIL;

    return sendEmail(adminEmail, subject, template, {
      ...data,
      adminPortalUrl: ADMIN_PORTAL_URL,
      supportEmail: SUPPORT_EMAIL,
      appName: APP_NAME,
      logoUrl: LOGO_URL
    });
  } catch (error) {
    logger.error('Failed to send admin email:', error);
    return false;
  }
};

// Helper function to get phone number from subscription
const getPhoneNumberFromSubscription = (subscription: ISubscription): string => {
  // If the subscription is already populated, access the phoneNumber directly
  if (typeof subscription.number === 'object' && subscription.number !== null && 'phoneNumber' in subscription.number) {
    return (subscription.number as any).phoneNumber;
  }
  // Otherwise, return a placeholder or the ID as a string
  return `Subscription ID: ${subscription._id}`;
};

// Specialized email functions
export const sendWelcomeEmail = async (admin: IAdmin, user: IUser): Promise<boolean> => {

  const subject = `New User Registration: ${user.email}`;
  const data = {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt || new Date()
    },
    appName: APP_NAME,
    adminPortalUrl: ADMIN_PORTAL_URL,
    logoUrl: LOGO_URL
  };

  // Send notification to admin about new user
  return sendAdminEmail(admin, 'admin-new-user', subject, data);
};

export const sendPasswordResetEmail = async (
  user: IUser | IAdmin,
  resetToken: string,
  resetUrl: string
): Promise<boolean> => {
  const subject = 'Password Reset Request';
  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    resetUrl,
    tokenExpiry: '10 minutes',
    appName: APP_NAME,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  return sendEmail(user.email, subject, 'password-reset', data);
};

export const sendEmailVerification = async (
  user: IUser,
  verificationCode: string
): Promise<boolean> => {
  const subject = 'Verify Your Email Address';
  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    verificationCode,
    verificationUrl: `${FRONTEND_URL}/verification?userId=${user._id}`, // Include verification URL
    appName: APP_NAME,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  return sendEmail(user.email, subject, 'email-verification', data);
};

export const sendSubscriptionCreatedEmail = async (
  user: IUser,
  subscription: ISubscription,
  admin: IAdmin
): Promise<boolean> => {
  const subject = 'Subscription Confirmation';
  const phoneNumber = getPhoneNumberFromSubscription(subscription);

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      price: subscription.price.toFixed(2),
      startDate: new Date(subscription.startDate).toLocaleDateString(),
      endDate: new Date(subscription.endDate).toLocaleDateString(),
      autoRenew: subscription.autoRenew
    },
    appName: APP_NAME,
    dashboardUrl: `${FRONTEND_URL}/dashboard/subscriptions`,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  // Also notify admin about new subscription
  await sendAdminEmail(admin, 'admin-new-subscription', `New Subscription: ${phoneNumber}`, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      price: subscription.price.toFixed(2),
      startDate: subscription.startDate,
      endDate: subscription.endDate
    }
  });

  return sendEmail(user.email, subject, 'subscription-created', data);
};

export const sendSubscriptionExpiringEmail = async (
  user: IUser,
  subscription: ISubscription,
  daysRemaining: number
): Promise<boolean> => {
  const subject = `Your Subscription Expires in ${daysRemaining} Days`;
  const phoneNumber = getPhoneNumberFromSubscription(subscription);

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      endDate: new Date(subscription.endDate).toLocaleDateString(),
      daysRemaining
    },
    renewUrl: `${FRONTEND_URL}/dashboard/subscriptions/${subscription._id}/renew`,
    appName: APP_NAME,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  return sendEmail(user.email, subject, 'subscription-expiring', data);
};

export const sendSubscriptionExpiredEmail = async (
  user: IUser,
  subscription: ISubscription,
  admin: IAdmin
): Promise<boolean> => {
  const subject = 'Your Subscription Has Expired';
  const phoneNumber = getPhoneNumberFromSubscription(subscription);

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      endDate: new Date(subscription.endDate).toLocaleDateString()
    },
    renewUrl: `${FRONTEND_URL}/dashboard/subscriptions/${subscription._id}/renew`,
    appName: APP_NAME,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  // Also notify admin about expired subscription
  await sendAdminEmail(admin, 'admin-subscription-expired', `Subscription Expired: ${phoneNumber}`, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      endDate: subscription.endDate
    }
  });

  return sendEmail(user.email, subject, 'subscription-expired', data);
};

export const sendSubscriptionRenewedEmail = async (
  user: IUser,
  subscription: ISubscription,
  admin: IAdmin
): Promise<boolean> => {
  const subject = 'Subscription Renewed Successfully';
  const phoneNumber = getPhoneNumberFromSubscription(subscription);

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      price: subscription.price.toFixed(2),
      startDate: new Date(subscription.startDate).toLocaleDateString(),
      endDate: new Date(subscription.endDate).toLocaleDateString(),
      autoRenew: subscription.autoRenew
    },
    appName: APP_NAME,
    dashboardUrl: `${FRONTEND_URL}/dashboard/subscriptions`,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  // Also notify admin about renewed subscription
  await sendAdminEmail(admin, 'admin-subscription-renewed', `Subscription Renewed: ${phoneNumber}`, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      price: subscription.price.toFixed(2),
      endDate: subscription.endDate
    }
  });

  return sendEmail(user.email, subject, 'subscription-renewed', data);
};

export const sendSubscriptionCancelledEmail = async (
  user: IUser,
  subscription: ISubscription,
  admin: IAdmin
): Promise<boolean> => {
  const subject = 'Subscription Cancelled';
  const phoneNumber = getPhoneNumberFromSubscription(subscription);

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      endDate: new Date(subscription.endDate).toLocaleDateString()
    },
    appName: APP_NAME,
    dashboardUrl: `${FRONTEND_URL}/dashboard/subscriptions`,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  // Also notify admin about cancelled subscription
  await sendAdminEmail(admin, 'admin-subscription-cancelled', `Subscription Cancelled: ${phoneNumber}`, {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    },
    subscription: {
      id: subscription._id,
      phoneNumber,
      plan: subscription.plan,
      endDate: subscription.endDate
    }
  });

  return sendEmail(user.email, subject, 'subscription-cancelled', data);
};
export const sendAccountActivationEmail = async (
  user: IUser,
  startDate: Date
): Promise<boolean> => {
  const subject = 'Your Account Has Been Activated';
  const formattedStartDate = new Date(startDate).toLocaleDateString();

  const data = {
    user: {
      firstName: user.firstName,
      lastName: user.lastName
    },
    accountDetails: {
      startDate: formattedStartDate
    },
    dashboardUrl: `${FRONTEND_URL}/dashboard`,
    appName: APP_NAME,
    logoUrl: LOGO_URL,
    supportEmail: SUPPORT_EMAIL
  };

  return sendEmail(user.email, subject, 'account-activation', data);
};


export default {
  sendEmail,
  sendAdminEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendSubscriptionCreatedEmail,
  sendSubscriptionExpiringEmail,
  sendSubscriptionExpiredEmail,
  sendSubscriptionRenewedEmail,
  sendSubscriptionCancelledEmail,
  sendAccountActivationEmail
};