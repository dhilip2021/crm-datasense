'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Divider
} from '@mui/material'
import PhoneDisabledIcon from '@mui/icons-material/PhoneDisabled'
import DialpadIcon from '@mui/icons-material/Dialpad'
import CloseIcon from '@mui/icons-material/Close'
import PhoneEnabledIcon from '@mui/icons-material/PhoneEnabled'
import CallIcon from '@mui/icons-material/Call'

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

/** Call Popup with waveform integration */
export default function CallUIPopup({ open = true, onClose = () => {}, toPhoneNumber,
  setToPhoneNumber, }) {
  const [screen, setScreen] = useState('dialpad') // 'calling' | 'dialpad' | 'summary'
  // control call state (playing waveform)
  const isCalling = screen === 'calling' && true // you can wire this to real state

  const handleDial = digit => setToPhoneNumber(prev => prev + digit)
  const handleBackspace = () => setToPhoneNumber(prev => prev.slice(0, -1))

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #eee',
          fontWeight: 700
        }}
      >
        Call
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Calling screen */}
        {screen === 'calling' && (
          <Card sx={{ p: 3, textAlign: 'center', position: 'relative' }}>
            {/* Waveform animation */}
            <Waveform isPlaying={isCalling} barCount={9} size={160} />

            <Typography variant='h6' sx={{ mb: 1 }}>
              Calling…
            </Typography>

            <Typography variant='h5' sx={{ fontWeight: 700, mb: 2 }}>
              {toPhoneNumber}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant='contained'
                color='error'
                startIcon={<PhoneDisabledIcon />}
                onClick={() => setScreen('summary')}
                sx={{ px: 3 }}
              >
                End
              </Button>

              <IconButton
                sx={{ alignSelf: 'center' }}
                onClick={() => setScreen('dialpad')}
                aria-label='open dialpad'
                size='large'
              >
                <DialpadIcon />
              </IconButton>
            </Box>
          </Card>
        )}

        {/* Dialpad screen */}
        {screen === 'dialpad' && (
          <Card sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ textAlign: 'center', mb: 2 }}>
              Dial Pad
            </Typography>

            <Box sx={{ textAlign: 'center', fontSize: 28, mb: 2, fontWeight: 700 }}>
              {toPhoneNumber || '—'}
            </Box>

            <Grid container spacing={1}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                (d, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Button
                      fullWidth
                      variant='outlined'
                      sx={{ py: 1.8, fontSize: 18 }}
                      onClick={() => handleDial(d)}
                    >
                      {d}
                    </Button>
                  </Grid>
                )
              )}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button onClick={handleBackspace} variant='text'>
                Back
              </Button>
              <Box>
                <Button variant='contained' color='success' onClick={() => setScreen('calling')}>
                  <PhoneEnabledIcon sx={{ mr: 1 }} /> Call
                </Button>
              </Box>
            </Box>
          </Card>
        )}

        {/* Summary screen */}
        {screen === 'summary' && (
          <Card sx={{ p: 2 }}>
            <Typography variant='h6'>Call Summary</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography sx={{ mt: 1 }}>
              <strong>Number:</strong> {toPhoneNumber}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Duration:</strong> 02:14
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Type:</strong> Outgoing
            </Typography>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button variant='contained' startIcon={<CallIcon />} onClick={() => setScreen('calling')}>
                Call Again
              </Button>

               <IconButton
                sx={{ alignSelf: 'center' }}
                onClick={() => setScreen('dialpad')}
                aria-label='open dialpad'
                size='large'
              >
                <DialpadIcon />
              </IconButton>
            </Box>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  )
}
