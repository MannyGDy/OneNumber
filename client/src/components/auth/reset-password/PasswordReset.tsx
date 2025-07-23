'use client'
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAdminResetPasswordMutation } from '@/redux/features/auth/adminAuthApi';
import { useResetPasswordMutation } from '@/redux/features/auth/userAuthApi';


// Validation Schema
const PasswordResetSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain lowercase, uppercase, number, and special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm password is required')
});

const PasswordReset: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Extract token from URL
  const token = pathname.split('/').pop() || '';

  // Select appropriate mutation based on route
  const [adminResetPassword] = useAdminResetPasswordMutation();
  const [resetPassword] = useResetPasswordMutation();

  const handleSubmit = async (
    values: { newPassword: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      // Determine if it's an admin reset
      const isAdminRoute = pathname.includes('/admin/reset-password');

      // Select the appropriate mutation
      const mutationFn = isAdminRoute ? adminResetPassword : resetPassword;

      // Perform password reset
      await mutationFn({
        token,
        password: values.newPassword,
        confirmPassword: values.confirmPassword
      }).unwrap();

      // Show success toast
      toast.success('Password reset successful');

      // Set success state
      setIsSuccess(true);
    } catch (error: unknown) {
      // Error handling
      let errorMessage = 'Failed to reset password';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const typedError = error as { data?: { message?: string } };
        errorMessage = typedError.data?.message || errorMessage;
      }

      // Show error toast
      toast.error(errorMessage);
      console.error('Password Reset Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Check individual password criteria
  const checkPasswordCriteria = (password: string) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
  };

  // Redirect to login after successful reset
  const handleBackToLogin = () => {
    router.push(pathname.includes('/admin') ? '/admin/login' : '/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle size={56} className="text-green-500" />
              </div>
              <h1 className="!text-2xl font-bold mb-4">Password Reset Successful</h1>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now use your new password to log in.
              </p>
              <button
                className="w-full bg-secondary cursor-pointer text-white py-3 rounded-md hover:bg-secondary/80 transition-colors font-medium"
                onClick={handleBackToLogin}
              >
                BACK TO LOGIN
              </button>
            </div>
          ) : (
            <>
              <h1 className="!text-2xl font-bold text-center mb-2">Reset Password</h1>
              <p className="text-center text-gray-600 mb-6">
                Enter a new password for your account
              </p>

              <Formik
                initialValues={{ newPassword: '', confirmPassword: '' }}
                validationSchema={PasswordResetSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, isValid, dirty }) => {
                  const criteria = checkPasswordCriteria(values.newPassword);

                  return (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="newPassword" className="block text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Field
                            id="newPassword"
                            name="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${errors.newPassword && touched.newPassword
                              ? 'border-red-500 focus:ring-red-200'
                              : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                              }`}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="newPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />

                        {/* Password strength indicator */}
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Password must contain:</p>
                          <ul className="text-sm space-y-1">
                            <li className={`flex items-center ${criteria.length ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className="mr-2">{criteria.length ? '✓' : '○'}</span>
                              At least 8 characters
                            </li>
                            <li className={`flex items-center ${criteria.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className="mr-2">{criteria.lowercase ? '✓' : '○'}</span>
                              One lowercase letter
                            </li>
                            <li className={`flex items-center ${criteria.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className="mr-2">{criteria.uppercase ? '✓' : '○'}</span>
                              One uppercase letter
                            </li>
                            <li className={`flex items-center ${criteria.number ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className="mr-2">{criteria.number ? '✓' : '○'}</span>
                              One number
                            </li>
                            <li className={`flex items-center ${criteria.special ? 'text-green-600' : 'text-gray-500'}`}>
                              <span className="mr-2">{criteria.special ? '✓' : '○'}</span>
                              One special character
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Field
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm new password"
                            className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword && touched.confirmPassword
                              ? 'border-red-500 focus:ring-red-200'
                              : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                              }`}
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        <ErrorMessage
                          name="confirmPassword"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />
                      </div>

                      <button
                        type="submit"
                        className={`w-full py-3 rounded-md cursor-pointer font-medium transition-colors ${isValid && dirty
                          ? 'bg-secondary text-white hover:bg-secondary/80'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        disabled={!(isValid && dirty)}
                      >
                        RESET PASSWORD
                      </button>
                    </Form>
                  );
                }}
              </Formik>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;