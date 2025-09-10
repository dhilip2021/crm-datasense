'use client'

import React, { useState } from 'react'
import { Box, Typography, TextField, IconButton, MenuItem } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

const EditableField = ({
  label,
  value: initialValue,
  type = 'text',
  options = [],
  onSave,
  validate // 👈 optional validation function (value) => string | null
}) => {
  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [hover, setHover] = useState(false)
  const [error, setError] = useState('')
  const [helperText, setHelperText] = useState('')

  const handleSave = () => {
    if (validate) {
      const validationMessage = validate(value)
      if (validationMessage) {
        setError(true)
        setHelperText(validationMessage)
        return
      }
    }
    setError(false)
    setHelperText('')
    setEditing(false)
    if (onSave) onSave(value)
  }

  const handleCancel = () => {
    setEditing(false)
    setValue(initialValue)
    setError(false)
    setHelperText('')
  }

  return (
    <Box
      display='flex'
      flexDirection='column'
      gap={0.5}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{ mb: 2 }}
    >
      {/* Label */}
      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>

      {/* Value / Editor */}
      {editing ? (
        <Box display='flex' flexDirection='column' gap={0.5}>
          <Box display='flex' alignItems='center' gap={1}>
            {type === 'select' ? (
              <TextField
                select
                size='small'
                value={value}
                onChange={e => setValue(e.target.value)}
                error={Boolean(error)}
                helperText={helperText}
                sx={{ flex: 1, backgroundColor: '#f9fafb' }}
              >
                {options.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                size='small'
                value={value}
                onChange={e => setValue(e.target.value)}
                error={Boolean(error)}
                helperText={helperText}
                sx={{ flex: 1, backgroundColor: '#f9fafb' }}
              />
            )}
            <IconButton color='success' size='small' onClick={handleSave}>
              <CheckIcon fontSize='small' />
            </IconButton>
            <IconButton color='error' size='small' onClick={handleCancel}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          sx={{
            px: 1.5,
            py: 1,
            borderRadius: 1,
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb'
          }}
        >
          <Typography variant='body2' color={value ? 'text.primary' : 'text.disabled'} sx={{ flex: 1 }}>
            {value || '—'}
          </Typography>

          <IconButton
            size='small'
            onClick={() => setEditing(true)}
            sx={{
              opacity: hover ? 1 : 0,
              transition: 'opacity 0.2s ease-in-out'
            }}
          >
            <EditIcon fontSize='small' />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default EditableField
