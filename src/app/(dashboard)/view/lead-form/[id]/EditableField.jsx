'use client'

import React, { useState } from 'react'
import { Box, Typography, TextField, IconButton, MenuItem } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

const EditableField = ({ label, value: initialValue, type = 'text', options = [], onSave }) => {
  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [hover, setHover] = useState(false)

  const handleSave = () => {
    setEditing(false)
    if (onSave) onSave(value)
  }

  const handleCancel = () => {
    setEditing(false)
    setValue(initialValue)
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
        <Box display='flex' alignItems='center' gap={1}>
          {type === 'select' ? (
            <TextField
              select
              size='small'
              value={value}
              onChange={e => setValue(e.target.value)}
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
          <Typography variant='body2' color={value ? 'text.primary' : 'text.disabled'}>
            {value || '—'}
          </Typography>
          {hover && (
            <IconButton size='small' onClick={() => setEditing(true)}>
              <EditIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      )}
    </Box>
  )
}

export default EditableField
