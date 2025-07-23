'use client'
import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useLoginMutation } from '@/redux/features/auth/userAuthApi';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useAdminLoginMutation } from '@/redux/features/auth/adminAuthApi';
import toast from 'react-hot-toast';

// Login Validation Schema
const LoginValidationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
});

const LoginPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const [adminLogin] = useAdminLoginMutation();
  const router = useRouter();
  const isAdmin = usePathname().startsWith("/admin");


  useEffect(() => {
    if (user?.role === 'user' && !user.phoneNumber) {
      router.push('/pricing');
    }

    if (user?.role === 'admin') {
      router.push('/admin/dashboard');
    }

    if (user?.role === 'user' && user.phoneNumber) {
      router.push('/dashboard');
    }

  }, [user, router]);



  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      const loginFn = isAdmin ? adminLogin : login;
      await loginFn({ email: values.username, password: values.password }).unwrap();

      toast.success('Login successful, redirecting...');


      // Redirect based on role
      const redirectPath = isAdmin ? '/admin/dashboard' : '/dashboard';
      router.push(redirectPath);
    } catch (err) {
      const error = err as { data?: { message?: string } };
      toast.error(error?.data?.message || 'Login failed please try again');
    }
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <div className="flex  overflow-hidden">
          {/* Illustration Side */}
          <div className="hidden md:block w-1/2 bg-primary/10 p-8 relative">
            <div className="absolute inset-0 flex items-center justify-center h-full w-full">
              <Image
                src="/assets/images/login-illustration.svg"
                alt="Login Illustration"
                layout="fill"
                objectFit="contain"
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Form Side */}
          <div className="w-full md:w-1/2 bg-white shadow-lg border border-[#F2F4F8] items-center justify-center flex flex-col rounded h-[500px] p-8">
            <h2 className="text-2xl font-bold text-center mb-8 text-text-primary">Welcome Back</h2>
            <p className='text-text-secondary text-center mb-8'>Please log in to continue or <Link href="/signup" className='text-primary font-bold underline'>get number</Link></p>
            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={LoginValidationSchema}
              onSubmit={handleLogin}
            >
              {({ errors, touched }) => (
                <Form className="space-y-4 w-full">
                  <div>
                    <label htmlFor="username" className="text-md text-text-secondary">
                      Email
                    </label>
                    <Field
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      className={`w-full py-2 px-3 border rounded mt-2 focus:outline-none focus:ring-2 ${errors.username && touched.username
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-border focus:ring-primary/25 focus:border-primary'
                        }`}
                    />
                    <ErrorMessage
                      name="username"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="password" className="text-md text-text-secondary">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        className={`w-full py-2 px-3 border rounded mt-2 pr-10 focus:outline-none focus:ring-2 ${errors.password && touched.password
                          ? 'border-red-500 focus:ring-red-200'
                          : 'border-border focus:ring-primary/25 focus:border-primary'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    <p className='text-gray-500 text-[12px] mt-2'>It must be a combination of minimum 8 letters, numbers, and symbols.</p>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center w-1/2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        className="mr-2"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-text-secondary ">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-secondary font-bold hover:underline ">
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn btn-secondary cursor-pointer py-2.5 rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="text-center mt-4">
              <span className="text-sm text-text-secondary">
                No account yet? {' '}
                <Link href="/signup" className="text-secondary font-bold hover:underline">
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;