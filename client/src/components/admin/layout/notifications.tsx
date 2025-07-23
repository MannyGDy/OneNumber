import React, { useState } from 'react';
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
  MarkChatRead as MarkReadIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation
} from '@/redux/features/notification/notificationApi';
import { Notification } from '@/types/notification';

const NotificationPanel = () => {
  const theme = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const {
    data: notificationsData,
    isLoading,
    refetch
  } = useGetNotificationsQuery();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      refetch();
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setSelectedNotification(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  const NotificationDetailDialog = () => {
    if (!selectedNotification) return null;

    return (
      <Dialog
        open={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: theme.shadows[24],
            background: 'linear-gradient(135deg, #f5f7fa 0%, #f5f7fa 100%)',
          }
        }}
      >
        {/* Close button at top-right */}
        <IconButton
          onClick={() => setSelectedNotification(null)}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: theme.palette.grey[600],
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'rotate(90deg)',
              color: theme.palette.error.main
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pb: 1,
            color: theme.palette.text.primary
          }}
        >
          <InfoOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            {selectedNotification.title}
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            background: 'rgba(255,255,255,0.7)',
            borderColor: theme.palette.divider
          }}
        >
          <Typography
            variant="body1"
            gutterBottom
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6
            }}
          >
            {selectedNotification.message}
          </Typography>

          <Box sx={{
            mt: 3,
            display: 'flex',
            gap: 1,
            flexWrap: 'wrap'
          }}>
            <Chip
              label={`Sent: ${new Date(selectedNotification.createdAt).toLocaleString()}`}
              size="small"
              variant="outlined"
              color="secondary"
            />

          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
          {!selectedNotification.isRead && (
            <Button
              startIcon={<MarkReadIcon />}
              variant="outlined"
              color="primary"
              onClick={() => handleMarkAsRead(selectedNotification._id)}
            >
              Mark as Read
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteNotification(selectedNotification._id)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <Badge
        badgeContent={notificationsData?.unreadCount || 0}
        color="error"
        sx={{ cursor: 'pointer' }}
        onClick={() => setIsDrawerOpen(true)}
      >
        <NotificationsIcon />
      </Badge>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            borderRadius: '16px 0 0 16px',
            boxShadow: '-4px 0 15px rgba(0,0,0,0.1)'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            {notificationsData && notificationsData.unreadCount > 0 && (
              <Button
                size="small"
                color="primary"
                onClick={handleMarkAllAsRead}
              >
                Mark All Read
              </Button>
            )}
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              sx={{
                // position: 'ab',
                // right: 16,
                // top: 16,
                color: theme.palette.grey[600],
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(90deg)',
                  color: theme.palette.error.main
                }
              }}
            >
              <CloseIcon />
            </IconButton>

          </Box>



          <Divider sx={{ mb: 2 }} />

          {isLoading ? (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1
            }}>
              <CircularProgress />
            </Box>
          ) : notificationsData?.notifications.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
            >
              No notifications
            </Typography>
          ) : (
            <List sx={{ overflowY: 'auto', flex: 1 }}>
              {notificationsData?.notifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  onClick={() => setSelectedNotification(notification)}
                  sx={{
                    backgroundColor: !notification.isRead ? 'rgba(33, 150, 243, 0.08)' : 'transparent',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {notification.title}
                        </Typography>
                        {!notification.isRead && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main'
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          {new Date(notification.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>

      <NotificationDetailDialog />
    </>
  );
};

export default NotificationPanel;