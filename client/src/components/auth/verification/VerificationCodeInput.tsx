'use client'
import React, { useRef, useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmailMutation, useResetPasswordMutation, useRequestEmailVerificationMutation } from '@/redux/features/auth/userAuthApi';
import { ErrorResponse } from '@/types/unified';
import toast from 'react-hot-toast';
import { RootState, useSelector } from '@/redux/store';

// Validation Schema
const VerificationCodeSchema = Yup.object().shape({
  code: Yup.array()
    .of(Yup.string().required().length(1).matches(/^[0-9]$/, 'Must be a number'))
    .length(6, 'Please enter all 6 digits')
});

const VerificationCodeInput: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string[]>(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer states
  const [countdown, setCountdown] = useState<number>(0);
  const [canResend, setCanResend] = useState<boolean>(true);

  // Extract query parameters
  const userId = searchParams.get('userId');
  const verificationType = searchParams.get('type') || 'email'; // default to 'email'

  // API mutations
  const [verifyEmail, { isLoading: isVerifyingEmail, isSuccess: isEmailVerified }] = useVerifyEmailMutation();
  const [resetPassword, { isLoading: isResettingPassword, isSuccess: isPasswordReset }] = useResetPasswordMutation();
  const [resendCode, { isLoading: isResendingCode }] = useRequestEmailVerificationMutation();

  useEffect(() => {
    if (user) {
      router.push('/pricing');
    }
  }, [user, router]);

  useEffect(() => {
    if (isEmailVerified) {
      router.push('/pricing');
    }

    if (isPasswordReset) {
      router.push('/login');
    }
  }, [isEmailVerified, isPasswordReset, router]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            setCanResend(true);
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Dynamic content based on verification type
  const getPageTitle = () => {
    return verificationType === 'email'
      ? 'Email Verification'
      : 'Password Reset Verification';
  };

  const getPageDescription = () => {
    return verificationType === 'email'
      ? 'Please enter the 6-digit verification code that was sent to your email address to activate your account'
      : 'Please enter the 6-digit verification code that was sent to your email address to reset your password';
  };

  // Handle token submission
  const handleSubmit = async (values: { code: string[] }) => {
    const verificationCode = values.code.join('');
    try {
      if (verificationType === 'email') {
        // Handle email verification
        if (userId) {
          const result = await verifyEmail({ userId, verificationCode }).unwrap();
          if (result.success) {
            toast.success("Email verified successfully!");
          }
        } else {
          toast.error("User ID is missing. Cannot verify email.");
        }
      } else {
        // Handle password reset verification
        if (userId) {
          const result = await resetPassword({
            token: userId,
            verification_code: verificationCode
          }).unwrap();

          if (result.success) {
            router.push(`/reset-password?token=${userId}`);
          }
        } else {
          toast.error("Reset token is missing. Cannot verify reset code.");
        }
      }
    } catch (err: ErrorResponse | string | unknown) {
      const errorMessage = (err as ErrorResponse)?.data?.message || "Verification failed";
      toast.error(errorMessage);
    }
  };

  // Handle input change
  const handleChange = (index: number, value: string, setFieldValue: (field: string, value: string[]) => void) => {
    // Only allow numbers
    if (!/^[0-9]$/.test(value) && value !== '') {
      return;
    }

    // Update the token array
    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);

    // Update Formik field value
    setFieldValue('code', newToken);

    // Move to next input if current input is filled
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && token[index] === '' && index > 0) {
      // Move to previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, setFieldValue: (field: string, value: string[]) => void) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');

    // Check if pasted content has 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setToken(digits);
      setFieldValue('code', digits);

      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  // Handle resend code with countdown
  const handleResendCode = async () => {
    try {
      if (!canResend || isResendingCode) {
        return;
      }

      // Implement resend code logic based on verificationType
      if (verificationType === 'email' && userId) {
        // Disable resend button immediately
        setCanResend(false);

        // Call API to resend code
        await resendCode({ userId }).unwrap();

        // Set countdown timer (60 seconds)
        setCountdown(60);

        toast.success("A new verification code has been sent to your email address.");
      } else {
        toast.error("Resend code is not available for this verification type.");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      toast.error("Failed to resend verification code. Please try again.");
      // Re-enable button if there was an error
      setCanResend(true);
    }
  };

  // Check if user ID is missing
  useEffect(() => {
    if (!userId) {
      toast.error("Required information is missing. Please try again.");
      router.push('/login');
    }
  }, [userId, router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg shadow-md p-8">
          <h1 className="!text-2xl font-bold text-center mb-2">{getPageTitle()}</h1>
          <p className="text-center text-gray-600 mb-8">
            {getPageDescription()}
          </p>

          <Formik
            initialValues={{ code: Array(6).fill('') }}
            validationSchema={VerificationCodeSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, errors, touched, isValid, dirty }) => (
              <Form>
                <div className="flex justify-center space-x-3 mb-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="w-12">
                      <Field name={`code[${index}]`}>
                        {({ field }: { field: { value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void } }) => (
                          <input
                            {...field}
                            type="text"
                            maxLength={1}
                            className={`w-full h-14 text-center text-xl font-bold border-2 rounded-md focus:outline-none focus:ring-2 ${errors.code && touched.code
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                              }`}
                            value={token[index]}
                            onChange={(e) => handleChange(index, e.target.value, setFieldValue)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={(e) => handlePaste(e, setFieldValue)}
                            ref={(el) => {
                              if (el) {
                                inputRefs.current[index] = el;
                              }
                            }}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                          />
                        )}
                      </Field>
                    </div>
                  ))}
                </div>

                {errors.code && touched.code && (
                  <div className="text-red-500 text-sm text-center mb-4">
                    {typeof errors.code === 'string' ? errors.code : 'Please enter a valid verification code'}
                  </div>
                )}

                <div className="text-center mb-6">
                  <p className="text-gray-600">Didn&apos;t receive code?</p>
                  {countdown > 0 ? (
                    <p className="text-gray-500 mt-1">
                      Resend Code in <span className="font-medium">{formatTime(countdown)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      className={`text-blue-600 font-medium hover:text-blue-800 mt-1 ${!canResend ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleResendCode}
                      disabled={!canResend || isResendingCode}
                    >
                      {isResendingCode ? 'Sending...' : 'Resend Code'}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 rounded-md font-medium transition-colors cursor-pointer ${isValid && dirty
                      ? 'bg-secondary text-white hover:bg-secondary/80'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  disabled={!(isValid && dirty) || isVerifyingEmail || isResettingPassword}
                >
                  {isVerifyingEmail || isResettingPassword ? 'PROCESSING...' : 'VERIFY'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodeInput;