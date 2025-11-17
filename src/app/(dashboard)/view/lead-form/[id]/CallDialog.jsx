'use client'
import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography,
  TextField,
  Stack,
  Grid,
  Card
} from '@mui/material'
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled'
import CloseIcon from '@mui/icons-material/Close'
/**
 * Waveform component: animated equalizer bars.
 * - isPlaying: boolean to run/pause animation
 * - barCount: number of bars
 * - size: overall size in px (used to scale bars)
 */
function Waveform({ isPlaying = false, barCount = 9, size = 140 }) {
  const bars = Array.from({ length: barCount })

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: Math.round(size * 0.45),
        mx: 'auto',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 1.25,
        mb: 2
      }}
    >
      {/* Inline styles for animation (scoped) */}
      <style>{`
        .wf-bar {
          width: 8px;
          background: linear-gradient(180deg, rgba(79,156,255,1), rgba(40,116,240,1));
          border-radius: 4px;
          transform-origin: bottom center;
          animation-iteration-count: infinite;
          animation-timing-function: cubic-bezier(.2,.9,.3,.99);
        }

        /* keyframes bounce */
        @keyframes wf-bounce-1 { 0%{transform:scaleY(.15)} 50%{transform:scaleY(.95)} 100%{transform:scaleY(.25)}}
        @keyframes wf-bounce-2 { 0%{transform:scaleY(.25)} 50%{transform:scaleY(.75)} 100%{transform:scaleY(.35)}}
        @keyframes wf-bounce-3 { 0%{transform:scaleY(.20)} 50%{transform:scaleY(1)} 100%{transform:scaleY(.2)}}
        @keyframes wf-bounce-4 { 0%{transform:scaleY(.30)} 50%{transform:scaleY(.85)} 100%{transform:scaleY(.28)}}
      `}</style>

      {bars.map((_, i) => {
        // pick a keyframe & duration/delay pattern to make it organic
        const keyframes = ['wf-bounce-1', 'wf-bounce-2', 'wf-bounce-3', 'wf-bounce-4']
        const k = keyframes[i % keyframes.length]
        // randomized-ish durations & delays but deterministic by index for consistency
        const duration = 800 + (i % 4) * 140 // 800, 940, 1080, 1220
        const delay = (i % 5) * 90 // staggered delay
        const baseHeight = 0.4 + (i % 5) * 0.1 // vary initial height (not required)
        return (
          <Box
            key={i}
            className='wf-bar'
            sx={{
              height: `${Math.round(size * baseHeight * 0.6)}px`,
              animationName: k,
              animationDuration: `${duration}ms`,
              animationDelay: `${delay}ms`,
              animationPlayState: isPlaying ? 'running' : 'paused',
              opacity: isPlaying ? 1 : 0.7
            }}
          />
        )
      })}
    </Box>
  )
}

function CallDialog({
  openCallDialog,
  handleCallClose,
  progress,
  seconds,
  isCalling,
  handleStartCall,
  toPhoneNumber,
  setToPhoneNumber,
  callResponse,
  setCallResponse,
  onStopCall,
  openResponseDialog,
  setOpenResponseDialog,
  handleStopCall
}) {
  const formatTime = sec => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const [responseError, setResponseError] = useState("");


  //  isCalling = screen === 'calling' && true
  const handleDial = digit => setToPhoneNumber(prev => prev + digit)
  const handleBackspace = () => setToPhoneNumber(prev => prev.slice(0, -1))

  return (
    <>
      <Dialog
        open={openCallDialog}
        onClose={handleCallClose}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
          }
        }}
      >
        {/* ------------ HEADER ------------- */}
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 18,
            p: 2.4,
            px: 3,
            bgcolor: '#f5f7fa',
            borderBottom: '1px solid #e5e5e5'
          }}
        >
          <Box display='flex' alignItems='center' justifyContent='space-between'>
            <Typography
              variant='h5'
              sx={{
                mb: 3,
                fontWeight: 700,
                textAlign: 'center',
                color: isCalling ? '#2e7d32' : '#1e88e5'
              }}
            >
              {isCalling ? `⏱ ${formatTime(seconds)}` : '📞 Ready to call'}
            </Typography>
            {/* ------------ PROGRESS ------------- */}
            <LinearProgress
              variant='determinate'
              value={progress}
              sx={{
                height: 6,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: isCalling ? '#4CAF50' : '#1976d2'
                }
              }}
            />

            <Tooltip title='Close' arrow>
              <IconButton size='small' onClick={handleCallClose}>
                <CloseIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </Box>
        </DialogTitle>

        {/* ------------ BODY ------------- */}
        <DialogContent sx={{ p: 3, pt: 4 }}>
          {/* ------------ DIAL PAD ------------- */}
          {!isCalling ? (
            <Card
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: '0 6px 20px rgba(0,0,0,0.07)'
              }}
            >
              <Typography
                variant='h6'
                sx={{
                  textAlign: 'center',
                  mb: 2,
                  fontWeight: 600,
                  color: '#444'
                }}
              >
                Dial Pad
              </Typography>

              <TextField
                size='medium'
                fullWidth
                value={toPhoneNumber}
                onChange={e => setToPhoneNumber(e.target.value)}
                 inputProps={{
    style: { textAlign: 'center' }  // RIGHT ALIGN
  }}
                sx={{
                  mb: 3,
                  '& .MuiInputBase-root': {
                    borderRadius: 2,
                    fontSize: 18,
                    fontWeight: 600
                  }
                }}
              />

              <Grid container spacing={2}>
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => handleDial(d)}
                      sx={{
                        py: 2,
                        fontSize: 20,
                        fontWeight: 700,
                        borderRadius: 2,
                        borderWidth: 2,
                        color: '#333',
                        borderColor: '#bdbdbd',
                        '&:hover': {
                          borderColor: '#1976d2',
                          bgcolor: '#e3f2fd'
                        }
                      }}
                    >
                      {d}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBackspace} variant='text' sx={{ fontWeight: 600, textTransform: 'none' }}>
                  ⬅ Back
                </Button>

                <Button
                  variant='contained'
                  color='success'
                  disabled={toPhoneNumber === ''}
                  onClick={handleStartCall}
                  sx={{
                    px: 4,
                    py: 1.3,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: 16,
                    textTransform: 'none',
                    boxShadow: '0 6px 16px rgba(76,175,80,0.35)'
                  }}
                >
                  <PhoneEnabledIcon sx={{ mr: 1 }} /> Call
                </Button>
              </Box>
            </Card>
          ) : (
            /* ------------ CALL RESPONSE + STOP BUTTON ------------- */
            <Card sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
              {/* <Stack spacing={3}> */}
              {/* Waveform animation */}
              <Waveform isPlaying={isCalling} barCount={9} size={160} />

              <Button
                variant='contained'
                color='error'
                onClick={onStopCall}
                fullWidth
                sx={{
                  borderRadius: 3,
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: 16,
                  textTransform: 'none',
                  boxShadow: '0 6px 16px rgba(244,67,54,0.35)'
                }}
              >
                🛑 Stop Call
              </Button>
              {/* </Stack> */}
            </Card>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={openResponseDialog} onClose={() => setOpenResponseDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Call Response</DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <TextField
            required
            fullWidth
            multiline
            rows={5}
            label='Call Response'
            value={callResponse}
            onChange={e => {
              setCallResponse(e.target.value)
              if (e.target.value.trim()) setResponseError('') // remove error while typing
            }}
            error={Boolean(responseError)}
            helperText={responseError}
          />

          <Button
            variant='contained'
            fullWidth
            sx={{ mt: 3, py: 1.5, fontWeight: 700 }}
            
            onClick={() => {
  if (!callResponse.trim()) {
    setResponseError("👉 Call response is required");
    return;
  }

  setResponseError(""); // clear error
  handleStopCall();
  setOpenResponseDialog(false);
}}
          >
            Submit
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CallDialog
