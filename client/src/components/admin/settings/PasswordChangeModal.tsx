import { useUpdatePasswordMutation } from '@/redux/features/auth/userAuthApi';
import { useAdminUpdatePasswordMutation } from '@/redux/features/auth/adminAuthApi';

import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
}

// Define interfaces for error handling
interface ApiErrorResponse {
  data?: {
    message?: string;
  };
  error?: string;
  status?: number;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ open, onClose }) => {
  const location = usePathname();
  const isAdminPath = location.startsWith('/admin/dashboard');

  const [updatePassword] = useUpdatePasswordMutation();
  const [adminUpdatePassword] = useAdminUpdatePasswordMutation();

  // State for password data
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for password errors
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State for API response handling
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showErrorSnackbar, setShowErrorSnackbar] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for password visibility
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Close snackbars
  const handleCloseErrorSnackbar = () => {
    setShowErrorSnackbar(false);
  };

  const handleCloseSuccessSnackbar = () => {
    setShowSuccessSnackbar(false);
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    const errors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Old password is required';
      isValid = false;
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    return isValid;
  };

  // Extract error message from API error response
  const extractErrorMessage = (error: unknown): string => {
    // Check if error is ApiErrorResponse
    if (error && typeof error === 'object') {
      const apiError = error as ApiErrorResponse;

      if (apiError.data?.message) {
        return apiError.data.message;
      } else if (apiError.error) {
        return apiError.error;
      }
    }
    // Check if error is a string
    else if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred. Please try again.';
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (validatePasswordForm()) {
      setIsSubmitting(true);
      try {
        // Call the appropriate API based on the path
        if (isAdminPath) {
          await adminUpdatePassword({
            currentPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
          }).unwrap();
        } else {
          await updatePassword({
            currentPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword
          }).unwrap();
        }

        // Set success message and show success toast
        setSuccessMessage('Password updated successfully');
        setShowSuccessSnackbar(true);

        // Reset form data and close modal on success
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        // Close modal after a short delay so user can see success state
        setTimeout(() => {
          onClose();
        }, 1500);

      } catch (error: unknown) {
        console.error('Failed to update password:', error);
        const errorMessage = extractErrorMessage(error);
        setApiError(errorMessage);
        setShowErrorSnackbar(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Password Change</Typography>
            <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            {apiError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {apiError}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {successMessage}
              </Alert>
            )}

            <TextField
              margin="normal"
              fullWidth
              id="oldPassword"
              name="oldPassword"
              label="Old Password"
              type={showOldPassword ? "text" : "password"}
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.oldPassword}
              helperText={passwordErrors.oldPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      edge="end"
                    >
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="newPassword"
              name="newPassword"
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={showErrorSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseErrorSnackbar} severity="error" sx={{ width: '100%' }}>
          {apiError}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccessSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PasswordChangeModal;