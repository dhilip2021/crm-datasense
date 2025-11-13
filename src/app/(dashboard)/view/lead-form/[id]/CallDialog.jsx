import React, { useState, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function CallDialog({ openCallDialog, handleCallClose }) {
  const phoneNumber = '+918012005747'
  const [isCalling, setIsCalling] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const timerRef = useRef(null)

  const formatTime = sec => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleStartCall = () => {
    // Start the timer
    setIsCalling(true)
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // Open mobile dialer
    window.location.href = `tel:${phoneNumber}`
  }

  const handleStopCall = () => {
    setIsCalling(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    console.log('Call format (seconds):', formatTime(seconds))
    setSeconds(0) // Reset timer for next call
    handleCallClose()


  }

  useEffect(() => {
    return () => {
      // Clean up timer on unmount
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <Dialog
      open={openCallDialog}
      onClose={handleCallClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
          Call
          <Tooltip title='Close' arrow>
            <IconButton onClick={handleCallClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ mb: 2, fontSize: '1.5rem', fontWeight: 500 }}>
          {isCalling ? `Call Timer: ${formatTime(seconds)}` : 'Ready to call'}
        </Box>
        {!isCalling ? (
          <Button
            variant='contained'
            color='primary'
            onClick={handleStartCall}
            sx={{ mr: 2 }}
          >
            Start Call
          </Button>
        ) : (
          <Button
            variant='contained'
            color='error'
            onClick={handleStopCall}
          >
            Stop Call
          </Button>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0' }}></DialogActions>
    </Dialog>
  )
}

export default CallDialog
