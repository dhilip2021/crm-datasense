'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import LoaderGif from '@assets/gif/loader.gif'

const shortName = fullName => {
  const shortForm = fullName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

  return shortForm
}

function isValidEmailPragmatic(email) {
  if (typeof email !== 'string') return false
  // Accepts most valid addresses, avoids pathological corner-cases
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
  return re.test(email)
}

function LeadFormAppPage() {
  const organization_id = Cookies.get('organization_id')
  const organization_name = Cookies.get('organization_name')
  const lead_form = 'lead-form'
  const router = useRouter()

  const [sections, setSections] = useState([])
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loader, setLoader] = useState(false)

  const [countryCodes, setCountryCodes] = useState([])

  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
  }, [])

  // ---- validation function ----
  const validateField = (field, value) => {
    // Special handling for Phone because value for phone is stored in values[`${field.id}_number`]
    if (field.type === 'Phone') {
      const countryCode = values[`${field.id}_countryCode`] || field.countryCode || '+91'
      const phoneNumber = values[`${field.id}_number`] || ''

      // Basic regex: digits only, length between 6 and 15 (adjust as needed)
      const phoneRegex = /^[0-9]{6,15}$/

      if (field.required && phoneNumber.trim() === '') {
        return `${field.label} is required`
      }

      if (phoneNumber && !phoneRegex.test(phoneNumber)) {
        return 'Invalid phone number format'
      }

      return ''
    }

    if (field.type === 'Email') {
      const response = isValidEmailPragmatic(value)
      if (!response) {
        return 'Invalid email address'
      } else {
        return ''
      }
    }

    // Generic required check (for other field types)
    if (field.required && (value === undefined || value === '' || value === null)) return `${field.label} is required`

    if (value) {
      if (field.type === 'Single Line') {
        const min = parseInt(field.minChars || 0, 10)
        const max = parseInt(field.maxChars || 0, 10)
        if (min && value.length < min) return `Minimum ${min} characters required`
        if (max && value.length > max) return `Maximum ${max} characters allowed`
      }

      if (field.type === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
      if (field.type === 'URL' && !/^(http|https):\/\/.+/.test(value)) return 'Invalid URL'
      if (field.type === 'Date' && new Date(value) < new Date().setHours(0, 0, 0, 0))
        return 'Date cannot be in the past'
    }

    return ''
  }

  const handleChange = (id, value) => {
    setValues(prev => ({ ...prev, [id]: value }))
    setErrors(prev => ({ ...prev, [id]: '' }))
  }
  // ---- handleBlur ----
  const handleBlur = field => {
    const error = validateField(field, values[field.id])
    if (error) setErrors(prev => ({ ...prev, [field.id]: error }))
    else setErrors(prev => ({ ...prev, [field.id]: '' }))
  }

  // ---- handleSubmit ----
  const handleSubmit = async () => {
    const payload = {
      organization_id,
      organization_name: shortName(organization_name),
      form_name: lead_form,
      values: {},
      submittedAt: new Date().toISOString()
    }

    const newErrors = {}

    sections.forEach(section => {
      const fields = [...(section.fields.left || []), ...(section.fields.center || []), ...(section.fields.right || [])]
      fields.forEach(field => {
        // determine the "value to validate" depending on the field type
        const valueForValidation = field.type === 'Phone' ? values[`${field.id}_number`] : values[field.id]
        const error = validateField(field, valueForValidation)
        if (error) {
          newErrors[field.id] = error
          return
        }

        // Build payload.values properly
        if (field.type === 'Phone') {
          const country = values[`${field.id}_countryCode`] || field.countryCode || '+91'
          const number = values[`${field.id}_number`] || ''
          if (number) {
            // store combined string in payload; change if you want split storage
            payload.values[field.label] = `${country}${number.replace(/\s+/g, '')}` // e.g. +919876543210
          }
        } else {
          const v = values[field.id]
          if (v !== undefined && v !== '') payload.values[field.label] = v
        }
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoader(true)

    try {
      const res = await fetch('/api/v1/admin/lead-form/form-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      setLoader(false)
      if (data.success) {
         toast.success('Form submitted successfully', {
                      autoClose: 500, // 1 second la close
                      position: 'bottom-center',
                      hideProgressBar: true, // progress bar venam na
                      closeOnClick: true,
                      pauseOnHover: false,
                      draggable: false,
                      progress: undefined
                    })
        router.push('/app/leads')
      } else {
        toast.error('Submission failed')
      }
    } catch (err) {
      setLoader(false)
      console.error(err)
      toast.error('Submission failed')
    }
  }

  const fetchForm = async () => {
    setLoader(true)
    const res = await fetch(
      `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
    )
    const data = await res.json()
    console.log(data, '<<< FETCH FORMSSSSS')

    setLoader(false)
    if (data?.success && data.data?.sections?.length > 0) {
      setSections(data.data.sections)
      const defaultValues = {}
      data.data.sections.forEach(section => {
        const fields = [
          ...(section.fields.left || []),
          ...(section.fields.center || []),
          ...(section.fields.right || [])
        ]
        fields.forEach(field => {
          if (field.defaultValue) defaultValues[field.id] = field.defaultValue
        })
      })
      setValues(defaultValues)
    } else {
      toast.error('Form not found')
    }
  }

  useEffect(() => {
    fetchForm()
  }, [])

  const renderField = field => {
    const commonProps = {
      fullWidth: true,
      size: 'small',
      label: (
        <>
          {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
        </>
      ),
      value: values[field.id] || '',
      onChange: e => handleChange(field.id, e.target.value),
      onBlur: () => handleBlur(field),
      error: !!errors[field.id],
      helperText: errors[field.id],
      placeholder: field.placeholder || ''
    }

    switch (field.type) {
      case 'Dropdown':
        return (
          <TextField select {...commonProps}>
            {(field.label === 'Lead Status'
              ? field.options.slice(0, 6) // 👈 only first 6
              : field.options
            )?.map((opt, i) => (
              <MenuItem key={i} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        )
      case 'RadioButton':
        return (
          <Box>
            <Typography variant='body2' fontWeight='bold'>
              {field.label}
            </Typography>
            <RadioGroup row value={values[field.id] || ''} onChange={e => handleChange(field.id, e.target.value)}>
              {field.options?.map((opt, i) => (
                <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </Box>
        )
      case 'Multi-Line':
        return <TextField {...commonProps} multiline minRows={field.rows || 3} />
      case 'Phone':
        return (
          <TextField
            {...commonProps}
            value={values[`${field.id}_number`] || ''}
            onChange={e => handleChange(`${field.id}_number`, e.target.value)}
            type='tel'
            inputProps={{ maxLength: field.maxLength }}
            fullWidth
            size='small'
            label={field.label}
            required={field.required}
            placeholder='Enter a phone number'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Select
                    value={values[`${field.id}_countryCode`] || field.countryCode || '+91'}
                    onChange={e => handleChange(`${field.id}_countryCode`, e.target.value)}
                    size='small'
                    variant='outlined'
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 250 // 👈 fix height here
                        }
                      }
                    }}
                    sx={{
                      '.MuiOutlinedInput-notchedOutline': { border: 'none' }, // remove border
                      '.MuiSelect-select': {
                        padding: '4px 8px',
                        minWidth: '60px'
                      }
                    }}
                  >
                    {countryCodes.map(country => (
                      <MenuItem key={country.code} value={country.dial_code}>
                        {country.code} {country.dial_code}
                      </MenuItem>
                    ))}
                  </Select>
                </InputAdornment>
              )
            }}
            InputLabelProps={{
              required: field.required,
              sx: {
                '& .MuiFormLabel-asterisk': {
                  color: 'red', // 👈 make star red
                  marginLeft: '2px' // 👈 spacing for nice look
                }
              }
            }}
          />
        )
      case 'Email':
        return <TextField {...commonProps} type='email' />
      case 'URL':
        return <TextField {...commonProps} type='url' />
      case 'Date':
        return <TextField {...commonProps} type='date' InputLabelProps={{ shrink: true }} />
      case 'Switch':
        return (
          <FormControlLabel
            control={
              <Switch checked={values[field.id] || false} onChange={e => handleChange(field.id, e.target.checked)} />
            }
            label={field.label || 'Toggle'}
          />
        )
      default:
        return <TextField {...commonProps} />
    }
  }

  // 🆕 Dynamic layout rendering
  const renderLayoutGrid = section => {
    const layout = section.layout || 'double'
    const cols = layout === 'single' ? 12 : layout === 'double' ? 6 : 4

    return (
      <Grid container spacing={2}>
        {section.fields.left?.length > 0 && (
          <Grid item xs={12} sm={cols}>
            {section.fields.left.map(field => (
              <Box key={field.id} pb={3} pt={3}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}
        {layout === 'triple' && section.fields.center?.length > 0 && (
          <Grid item xs={12} sm={4}>
            {section.fields.center.map(field => (
              <Box key={field.id} pb={3} pt={3}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}
        {(layout === 'double' || layout === 'triple') && section.fields.right?.length > 0 && (
          <Grid item xs={12} sm={layout === 'double' ? 6 : 4}>
            {section.fields.right.map(field => (
              <Box key={field.id} pb={3} pt={3}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}
      </Grid>
    )
  }

  return (
    <Box px={4} py={4} sx={{ background: '#f9f9f9', minHeight: '100vh' }}>
      {loader ? (
        <Box textAlign='center' py={6}>
          <Image src={LoaderGif} alt='loading' width={100} height={100} />
        </Box>
      ) : !loader && sections.length === 0 ? (
        <></>
      ) : (
        <>
          {sections.map((section, sIndex) => (
            <Card key={sIndex} sx={{ mb: 4, borderLeft: '8px solid #8c57ff' }}>
              <CardContent>
                <Typography variant='h6' fontWeight='bold' mb={2}>
                  {section.title || `Section ${sIndex + 1}`}
                </Typography>
                {renderLayoutGrid(section)}
              </CardContent>
            </Card>
          ))}
          <Box display='flex' justifyContent='flex-end' gap={2}>
            <Button variant='outlined' color='secondary' onClick={() => router.push('/app/leads')}>
              Cancel
            </Button>
            <Button variant='contained' color='primary' onClick={handleSubmit}>
              Submit
            </Button>
          </Box>
        </>
      )}

      <ToastContainer />
    </Box>
  )
}

export default LeadFormAppPage
