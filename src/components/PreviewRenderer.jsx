'use client'

import {
  Box,
  Grid,
  Typography,
  TextField,
  Checkbox,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CloseIcon from '@mui/icons-material/Close'

export default function PreviewModal({ open, onClose, sections }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Form Preview
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box className="space-y-6">
          {sections.map((section, index) => (
            <Box key={section.id} mb={4}>
              <Typography fontWeight="bold" mb={2}>
                {section.title || `Section ${index + 1}`}
              </Typography>

              <Grid container spacing={3}>
                {/* Left Column */}
                {section.fields.left.map((field) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    {renderPreviewField(field)}
                  </Grid>
                ))}

                {/* Right Column */}
                {section.fields.right.map((field) => (
                  <Grid item xs={12} sm={6} key={field.id}>
                    {renderPreviewField(field)}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  )
}


function renderPreviewField(field) {
  const renderLabel = (
    <>
      {field.label}
      {field.required && (
        <Typography
          component="span"
          sx={{ color: 'red', ml: 0.5, fontWeight: 'bold' }}
        >
          *
        </Typography>
      )}
    </>
  );

  switch (field.type) {
    case 'Single Line':
    case 'Email':
    case 'Phone':
    case 'URL':
      return (
        <TextField
          fullWidth
          size="small"
          type={field.type === 'Email' ? 'email' : 'text'}
          label={renderLabel}
          placeholder={field.placeholder || ''}
          InputProps={{
            endAdornment:
              field.showTooltip && field.tooltipMessage ? (
                <InputAdornment position="end">
                  <Tooltip title={field.tooltipMessage}>
                    <InfoOutlinedIcon fontSize="small" color="action" />
                  </Tooltip>
                </InputAdornment>
              ) : null
          }}
        />
      );

    case 'Multi-Line':
      return (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={field.rows || 3} // optional rows count
          label={renderLabel}
          placeholder={field.placeholder || ''}
        />
      );

    case 'Checkbox':
      return (
        <Box display="flex" alignItems="center">
          <Checkbox checked={field.defaultChecked || false} disabled />
          <Typography>
            {renderLabel}
          </Typography>
        </Box>
      );

    default:
      return (
        <TextField
          fullWidth
          size="small"
          label={renderLabel}
          placeholder={field.placeholder || ''}
        />
      );
  }
}


