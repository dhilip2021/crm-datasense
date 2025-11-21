import React from 'react'
import { Box, Stack, Typography, Button, SvgIcon } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

// Reusable Empty State Component
const EmptyItems = ({ onAdd, primaryText = "No items added yet", secondaryText = "Create your first item to get started", buttonText = "Add Item" }) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        boxSizing: 'border-box',
      }}
      aria-live="polite"
    >
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        {/* Icon / Illustration */}
        <SvgIcon
          component="svg"
          viewBox="0 0 24 24"
          sx={{
            fontSize: 56,
            color: 'text.disabled',
            opacity: 0.9,
          }}
          role="img"
          aria-hidden="true"
        >
          {/* simple clipboard / empty box icon svg path */}
          <path d="M19 3H14.82C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
        </SvgIcon>

        {/* Primary message */}
        <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
          {primaryText}
        </Typography>

        {/* Secondary helper text */}
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {secondaryText}
        </Typography>

        {/* Action button (optional) */}
        {onAdd && (
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={onAdd}
            sx={{ mt: 0.5 }}
          >
            {buttonText}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default EmptyItems
