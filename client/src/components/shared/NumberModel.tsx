import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NumberModalProps {
  open: boolean;
  number: string;
  isAvailable: boolean;
  onClose: () => void;
  onAction: () => void;
}

export const NumberModal: React.FC<NumberModalProps> = ({
  open,
  number,
  isAvailable,
  onClose,
  onAction
}) => {


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          textAlign: 'center',
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography
          variant="h6"
          color={isAvailable ? 'success.main' : 'error.main'}
          sx={{ mb: 2 }}
        >
          {isAvailable ? 'Congrats' : 'Oops!!'}
        </Typography>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          {number}
        </Typography>

        <Typography
          variant="body1"
          color={isAvailable ? 'success.main' : 'error.main'}
          sx={{ mb: 3, textAlign: 'center' }}
        >
          {isAvailable
            ? 'has been reserved for you!'
            : 'Sorry, that number is not available. You can search for another or choose from the available ones.'}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: '#fd8500',
            '&:hover': {
              backgroundColor: '#e47700'
            }
          }}

          href={isAvailable ? '/pricing' : ''}
          onClick={onAction}
        >
          {isAvailable ? 'Subscribe Now' : 'Try Again'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

;