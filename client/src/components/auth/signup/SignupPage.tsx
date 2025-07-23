'use client'
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useRegisterMutation } from '@/redux/features/auth/userAuthApi';
import { useRouter } from 'next/navigation';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import toast from 'react-hot-toast';

// Validation Schema
const RegistrationSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First Name is required')
    .min(2, 'First Name must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required')
});

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [register, { isLoading, }] = useRegisterMutation();
  const router = useRouter();

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      // Handle form submission
      const result = await register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      }).unwrap();


      // Check if registration was successful and redirect
      if (result.status === "success" && result.userId) {
        router.push(`/verification?userId=${result.userId}&type=email`);
      } else if (result.data) {
        router.push('/pricing');
      }
    } catch (err) {
      if ("data" in (err as FetchBaseQueryError)) {
        const errorData = (err as FetchBaseQueryError).data as { message?: string };
        toast.error(errorData?.message || "An error occurred during registration");
      } else {
        console.error("Registration error:", err);
        toast.error("An error occurred during registration");
      }
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <div className="flex overflow-hidden gap-[2rem]">
          {/* Illustration Side */}
          <div className="hidden md:block w-1/2 bg-primary/10 rounded-l-lg p-8 relative">
            <div className="absolute inset-0 flex items-center justify-center h-full w-full">
              <Image
                src="/assets/images/signup-illustration.svg"
                alt="Registration Illustration"
                layout="fill"
                objectFit="contain"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 bg-white border border-[#F2F4F8] p-8 rounded-lg min-h-[700px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">Create Your Account</h2>
            <p className="text-center text-gray-600 mb-8">Fill in your details to get started</p>

            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: ''
              }}
              validationSchema={RegistrationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1/2">
                      <label htmlFor="firstName" className="block text-gray-700 mb-2">
                        First Name
                      </label>
                      <Field
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Enter first name"
                        className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 ${errors.firstName && touched.firstName
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                          }`}
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    <div className="w-1/2">
                      <label htmlFor="lastName" className="block text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Field
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Enter last name"
                        className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 ${errors.lastName && touched.lastName
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                          }`}
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Field
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
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

                  <div>
                    <label htmlFor="password" className="block text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 ${errors.password && touched.password
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                          }`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 8 characters with uppercase, lowercase, number, and special character.
                    </p>
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
                        placeholder="Confirm your password"
                        className={`w-full px-4 py-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 ${errors.confirmPassword && touched.confirmPassword
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-200 focus:border-blue-400'
                          }`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        onClick={() => togglePasswordVisibility('confirmPassword')}
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
                    className="w-full bg-secondary text-white py-3 rounded-md hover:bg-secondary/80 transition-colors font-medium mt-6"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <p className="text-center text-gray-500 text-sm mt-4">
                    Already have an account? <Link href="/login" className="text-secondary font-bold hover:underline">Log in</Link>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;