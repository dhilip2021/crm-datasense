'use client'
import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'


function CallDialog({ openCallDialog, handleCallClose, progress, seconds, isCalling, handleStopCall, handleStartCall, }) {


 const formatTime = sec => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }
  

  return (
    <Dialog
      open={openCallDialog}
      onClose={handleCallClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 5
        }
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          bgcolor: '#fafafa'
        }}
      >
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          Call
          <Tooltip title='Close' arrow>
            <IconButton onClick={handleCallClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* Progress Bar */}
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: 'grey.300',
          '& .MuiLinearProgress-bar': {
            bgcolor: isCalling ? '#43a047' : '#1976d2'
          }
        }}
      />

      <DialogContent sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600 }}>
          {isCalling ? `⏱ ${formatTime(seconds)}` : 'Ready to call'}
        </Typography>

        {/* Floating Call Controls */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            position: 'relative'
          }}
        >
          {!isCalling ? (
            <Button
              variant='contained'
              color='success'
              onClick={handleStartCall}
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none',
                boxShadow: '0 3px 10px rgba(76,175,80,0.3)'
              }}
            >
              📞 Start Call
            </Button>
          ) : (
            <Button
              variant='contained'
              color='error'
              onClick={handleStopCall}
              sx={{
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 16,
                textTransform: 'none',
                boxShadow: '0 3px 10px rgba(244,67,54,0.3)'
              }}
            >
              🛑 Stop Call
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default CallDialog
