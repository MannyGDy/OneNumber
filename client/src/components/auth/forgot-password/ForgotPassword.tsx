'use client'
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { usePathname } from 'next/navigation';
import { useForgotPasswordMutation } from '@/redux/features/auth/userAuthApi'; // Adjust import path as needed
import { useAdminForgotPasswordMutation } from '@/redux/features/auth/adminAuthApi';
import { ErrorResponse } from '@/types/unified';
import toast from 'react-hot-toast';

// Validation Schema
const ForgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email is required')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'),
});

const ForgotPassword: React.FC = () => {
  // const router = useRouter();
  const pathname = usePathname();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [adminForgotPassword, { isLoading: adminLoading }] = useAdminForgotPasswordMutation();


  const handleSubmit = async (
    values: { email: string },
    { setSubmitting, resetForm }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: () => void;
    }
  ) => {
    try {
      // Determine the correct endpoint based on the path
      const isAdminRoute = pathname === '/admin/forget-password';

      // Use the appropriate mutation based on the route
      const mutationFn = isAdminRoute
        ? adminForgotPassword
        : forgotPassword;

      await mutationFn(
        { email: values.email }, // Pass the email
      ).unwrap();

      // Success toast
      toast.success(`Password reset link sent to ${values.email} successfully!`);

      // Redirect to verification page
      // router.push(isAdminRoute ? '/admin/reset-password' : '/reset-password');

      // Reset the form
      resetForm();
    } catch (error: unknown) {
      // Type-safe error handling
      let errorMessage = 'Failed to send reset link';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        const typedError = error as ErrorResponse;
        errorMessage = typedError.data?.message ||
          typedError.message ||
          errorMessage;
      }

      toast.error(errorMessage);
      console.error('Forgot Password Error:', error);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="min-h-[80vh] flex items-center relative justify-center p-4">
      {/* Add Toaster for toast notifications */}

      <div className="w-full max-w-[500px] border-[#F2F4F8] border rounded-lg">
        <div className="rounded-lg shadow-md p-8">
          <h1 className="!text-3xl font-bold text-center mb-6">
            {pathname === '/admin/forget-password' ? 'Admin ' : ''}Forgotten Your Password
          </h1>
          <h2 className="!text-sm text-center text-gray-700 !mb-[60px]">
            There is nothing to worry about, we&apos;ll send you a message to help you reset your password.
          </h2>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordValidationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">
                    Email
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="text"
                    placeholder="Enter your email here"
                    className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 ${errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                      }`}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading || adminLoading}
                  className="w-full bg-secondary cursor-pointer text-white py-3 rounded-md hover:bg-secondary/80 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading || adminLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;