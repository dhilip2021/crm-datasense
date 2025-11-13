import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'

const validateReminderTime = () => {
  if (!taskData.reminderEnabled || !taskData.reminderTime || !taskData.reminderDate) return true

  const reminderDateTime = dayjs(
    `${dayjs(taskData.reminderDate).format('YYYY-MM-DD')} ${taskData.reminderTime}`,
    'YYYY-MM-DD HH:mm'
  )
  const now = dayjs()

  // If reminder is set for today, time must be >= current time
  if (dayjs(taskData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now)) {
    return false
  }
  return true
}

function CallDialog({ openCallDialog, handleCallClose }) {

    const phoneNumber = '+918012005747';

  return (
    <div>
      {/* Task Dialog */}
      <Dialog
        open={openCallDialog}
        onClose={handleCallClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 'bold',
            fontSize: '1.3rem',
            textAlign: 'center',
            borderBottom: '1px solid #f0f0f0',
            pb: 2
          }}
        >
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            Create Call
            <Tooltip title='Close' arrow>
              <IconButton onClick={handleCallClose}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Button variant='contained' color='primary' href={`tel:${phoneNumber}`}>
            Call to this Number:  {phoneNumber}
          </Button>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0', mt: 2 }}></DialogActions>
      </Dialog>
    </div>
  )
}

export default CallDialog
