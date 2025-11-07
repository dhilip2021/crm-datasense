'use client'

import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, IconButton, MenuItem } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

// 🔥 MUI Date Picker
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { getUserAllListApi } from '@/apiFunctions/ApiAction'

const EditableField = ({ label, field = {}, value: initialValue, type = 'text', options = [], onSave, userList }) => {

 



  const [value, setValue] = useState(initialValue)
  const [editing, setEditing] = useState(false)
  const [hover, setHover] = useState(false)
  const [error, setError] = useState(false)
  const [helperText, setHelperText] = useState('')

  const validateValue = val => {
    if (!field || !field.type) return ''
    let v = val
    if (typeof v === 'string') {
      if (/^\s/.test(v)) return `${field.label || label} cannot start with space`
      v = v.trim()
    }

    switch (field.type) {
      case 'Phone':
        if (field.required && !v) return `${field.label || label} is required`
        // ✅ Allow +countrycode + digits OR 0-prefixed STD numbers OR plain 6–15 digits
        const phoneRegex = /^(\+?\d{1,3})?\d{6,15}$/
        if (v && !phoneRegex.test(v)) return 'Invalid phone number format'
        break
      case 'Email':
        if (field.required && !v) return `${field.label || label} is required`
        if (v && !/\S+@\S+\.\S+/.test(v)) return 'Invalid email address'
        break
      case 'Currency':
        if (field.required && !v) return `${field.label || label} is required`
        // ✅ Allow only numbers with optional decimals (e.g., 100, 100.50)
        const currencyRegex = /^\d+(\.\d{1,2})?$/
        if (v && !currencyRegex.test(v)) {
          return `${field.label || label} must be a valid number (max 2 decimal places)`
        }
        break

      case 'Single Line':
        const min = parseInt(field.minChars || 0, 10)
        const max = parseInt(field.maxChars || 0, 10)
        if (min && v.length < min) return `Minimum ${min} characters required`
        if (max && v.length > max) return `Maximum ${max} characters allowed`
        break
      // case 'URL':
      //   if (v && !/^(http|https):\/\/.+/.test(v)) return 'Invalid URL'
      //   break
      // case 'URL':
      //   if (v && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/[^\s]*)?$/.test(v)) {
      //     return 'Invalid URL'
      //   }
      //   break
      case 'URL':
        if (v && !/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(v)) {
          return 'Invalid URL'
        }
        break

      case 'Date':
        if (v && new Date(v) < new Date().setHours(0, 0, 0, 0)) return 'Date cannot be in the past'
        break
    }

    if (field.required && (!v || v === '')) return `${field.label || label} is required`
    return ''
  }

  const handleSave = () => {
    const validationMessage = validateValue(value)
    if (validationMessage) {
      setError(true)
      setHelperText(validationMessage)
      return
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

  const handleDateChange = newValue => {
    const formatted = newValue ? newValue.format('YYYY-MM-DD') : ''
    setValue(formatted)
    const validationMessage = validateValue(formatted)
    if (validationMessage) {
      setError(true)
      setHelperText(validationMessage)
    } else {
      setError(false)
      setHelperText('')
    }
  }

  // useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    setValue(initialValue)
    
  }, [initialValue])


  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        display='flex'
        flexDirection='column'
        gap={0.5}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        sx={{ mb: 2 }}
      >
        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>

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
                  {label === 'Assigned To'
                    ? userList
                        .filter(u => u.user_id !== '41ea614a8ccc')
                        .map(u => (
                          <MenuItem key={u.user_id} value={u.user_id}>
                            {u.user_name}
                          </MenuItem>
                        ))
                    : options.map(opt => (
                        <MenuItem key={opt} value={opt}>
                          {opt}
                        </MenuItem>
                      ))}
                </TextField>
              ) : type === 'date' ? (
                <DatePicker
                  value={value ? dayjs(value) : null}
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  minDate={dayjs()}
                  slotProps={{
                    textField: {
                      size: 'small',
                      error: Boolean(error),
                      helperText,
                      sx: { flex: 1, backgroundColor: '#f9fafb' }
                    }
                  }}
                />
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
              {label === 'Assigned To' ? userList.find(u => u.user_id === value)?.user_name || '—' : value || '—'}
            </Typography>

            <IconButton
              size='small'
              onClick={() => setEditing(true)}
              sx={{ opacity: hover ? 1 : 0, transition: 'opacity 0.2s ease-in-out' }}
            >
              <EditIcon fontSize='small' />
            </IconButton>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default EditableField
