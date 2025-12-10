"use client";

import { Drawer, Box, Typography, IconButton } from "@mui/material";

const NotificationDrawer = ({ open, onClose }) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 350, p: 2 }
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" fontWeight="bold">
          Notifications
        </Typography>
        <IconButton onClick={onClose}>
          <i className="ri-close-line" />
        </IconButton>
      </Box>

      <Box mt={2}>
        {/* STATIC / LIVE Notifications */}
        <Typography variant="body2" color="text.secondary">
          No new notifications.
        </Typography>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
