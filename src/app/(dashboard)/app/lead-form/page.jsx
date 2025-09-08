'use client'

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { getAllUserListApi } from '@/apiFunctions/ApiAction'

// Short name (ORG)
const shortName = fullName =>
  fullName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

// Pragmatic email validation
function isValidEmailPragmatic(email) {
  if (typeof email !== 'string') return false
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
  return re.test(email)
}

function isValidCurrency(value, field) {
  if (value === null || value === undefined || value === '') return true // empty ok unless required check

  // Convert to string
  value = value.toString().trim()

  // Build regex based on field config
  let regexStr = '^\\d*' // whole number part
  if (field.decimalPlaces && parseInt(field.decimalPlaces) > 0) {
    regexStr += `(\\.\\d{1,${field.decimalPlaces}})?` // decimal part
  }
  regexStr += '$'

  const regex = new RegExp(regexStr)
  if (!regex.test(value)) return false

  // ✅ min/max digits check
  const [intPart] = value.split('.')
  if (field.minDigits && intPart.length < parseInt(field.minDigits)) return false
  if (field.maxDigits && intPart.length > parseInt(field.maxDigits)) return false

  return true
}

function LeadFormAppPage() {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')
  const organization_name = Cookies.get('organization_name')
  const lead_form = 'lead-form'
  const router = useRouter()

  const [sections, setSections] = useState([])
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loader, setLoader] = useState(false)
  const [countryCodes, setCountryCodes] = useState([])
  const [userList, setUserList] = useState([])

    // 🚨 Duplicate Dialog States
  const [duplicateDialog, setDuplicateDialog] = useState(false)
  const [duplicateLead, setDuplicateLead] = useState(null)
  const [pendingPayload, setPendingPayload] = useState(null)

  // Fetch user list
  const getUserListFn = async () => {
    try {
      const results = await getAllUserListApi()
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setUserList(results.payloadJson)
      } else {
        setUserList([])
      }
    } catch (err) {
      console.error('User list error:', err)
      setUserList([])
    }
  }

  // ---- validation function ----
  const validateField = (field, value) => {
    if (typeof value === 'string') {
      // ❌ leading space block
      if (/^\s/.test(value)) {
        return `${field.label} cannot start with space`
      }
      // 🔥 trim all spaces for validation
      value = value.trim()
    }

    if (field.type === 'Phone') {
      const phoneRegex = /^[0-9]{6,15}$/
      if (field.required && !value) return `${field.label} is required`
      if (value && !phoneRegex.test(value)) return 'Invalid phone number format'
      return ''
    }

    if (field.type === 'Email') {
      if (typeof value === 'string') {
        // ❌ block leading space
        if (/^\s/.test(value)) {
          return `${field.label} cannot start with space`
        }
        // 🔥 remove trailing/extra spaces for validation
        value = value.trim()
      }

      if (field.required && !value) return `${field.label} is required`
      if (value && !isValidEmailPragmatic(value)) return 'Invalid email address'
      return ''
    }

    if (field.type === 'Currency') {
      if (field.required && !value) return `${field.label} is required`
      if (value && !isValidCurrency(value, field)) {
        return `Invalid ${field.label} (max ${field.maxDigits || '∞'} digits, ${field.decimalPlaces || 0} decimals)`
      }
      return ''
    }

    if (field.required && (!value || value === '')) {
      return `${field.label} is required`
    }

    if (value) {
      if (field.type === 'Single Line') {
        const min = parseInt(field.minChars || 0, 10)
        const max = parseInt(field.maxChars || 0, 10)
        if (min && value.length < min) return `Minimum ${min} characters required`
        if (max && value.length > max) return `Maximum ${max} characters allowed`
      }
      if (field.type === 'URL' && !/^(http|https):\/\/.+/.test(value)) return 'Invalid URL'
      if (field.type === 'Date' && new Date(value) < new Date().setHours(0, 0, 0, 0)) {
        return 'Date cannot be in the past'
      }
    }

    return ''
  }

  // Handle change
  const handleChange = (id, value, type) => {
    if (typeof value === 'string') {
      if (/^\s/.test(value)) {
        value = value.replace(/^\s+/, '') // remove only leading spaces
      }
    }
    if (type === 'Email') {
      // ❌ remove all spaces while typing
      value = value.replace(/\s+/g, '')
    }

    if (type === 'Phone') {
      const fieldKey = id.replace('_number', '')
      setValues(prev => ({ ...prev, [id]: value }))
      setErrors(prev => ({ ...prev, [fieldKey]: '' }))
    } else {
      setValues(prev => ({ ...prev, [id]: value }))
      setErrors(prev => ({ ...prev, [id]: '' }))
    }

    //
  }

  // Handle blur
  const handleBlur = (e, field) => {
    if (field.type === 'Email') {
      if (typeof value === 'string') {
        // ❌ block leading space
        if (/^\s/.test(value)) {
          return `${field.label} cannot start with space`
        }
        // ❌ block ANY space in email
        if (/\s/.test(value)) {
          return 'Email cannot contain spaces'
        }

        value = value.trim()
      }

      if (field.required && !value) return `${field.label} is required`
      if (value && !isValidEmailPragmatic(value)) return 'Invalid email address'
      return ''
    } else if (field.type === 'Phone') {
      const valueForValidation = values[`${field.id}_number`]
      const error = validateField(field, valueForValidation)
      if (error) {
        setErrors(prev => ({ ...prev, [field.id]: error }))
      } else {
        setErrors(prev => ({ ...prev, [field.id]: '' }))
      }
    } else if (field.type === 'Currency') {
      const valueForValidation = values[field.id]
      const error = validateField(field, valueForValidation)
      if (error) {
        setErrors(prev => ({ ...prev, [field.id]: error }))
      } else {
        setErrors(prev => ({ ...prev, [field.id]: '' }))
      }
    } else {
      const valueForValidation = values[field.id]
      const error = validateField(field, valueForValidation)
      if (error) {
        setErrors(prev => ({ ...prev, [field.id]: error }))
      } else {
        setErrors(prev => ({ ...prev, [field.id]: '' }))
      }
    }
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
        const valueForValidation = field.type === 'Phone' ? values[`${field.id}_number`] : values[field.id]
        const error = validateField(field, valueForValidation)
        if (error) {
          newErrors[field.id] = error
        } else {
          if (field.type === 'Phone') {
            const country = values[`${field.id}_countryCode`] || field.countryCode || '+91'
            const number = values[`${field.id}_number`] || ''
            if (number) payload.values[field.label] = `${country}${number.replace(/\s+/g, '')}`
          } else {
            const v = values[field.id]
            if (v !== undefined && v !== '') payload.values[field.label] = v
          }
        }
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)

      const firstErrorFieldId = Object.keys(newErrors)[0]
      const el = document.getElementById(firstErrorFieldId)

      if (el) {
        // scroll smooth ah pogum
        el.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })

        // focus kuduthu highlight panna
        setTimeout(() => {
          el.focus()
        }, 300)
      }

      return
    }

    setLoader(true)

    try {
      const res = await fetch('/api/v1/admin/lead-form/form-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      setLoader(false)

        // 🚨 Duplicate Handling
      if (data.duplicate) {
        setDuplicateLead(data.existingLead)
        setPendingPayload(payload)
        setDuplicateDialog(true)
        return
      }

      if (data.success) {
        toast.success('Form submitted successfully', {
          autoClose: 1500,
          position: 'bottom-center',
          hideProgressBar: true
        })
        router.push('/app/leads')
      } else {
        toast.error(data.message, { autoClose: 1500, position: 'bottom-center' })
      }
    } catch (err) {
      setLoader(false)
      toast.error(err, { autoClose: 1500, position: 'bottom-center' })
    }
  }

  // 🚨 Merge Action
  const handleMerge = async () => {
    setDuplicateDialog(false)
    setLoader(true)

    try {
      const res = await fetch('/api/v1/admin/lead-form/form-submit?merge=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(pendingPayload)
      })

      const data = await res.json()
      setLoader(false)

      if (data.success) {
        toast.success('Lead merged successfully', { autoClose: 1500, position: 'bottom-center' })
        router.push('/app/leads')
      } else {
        toast.error(data.message || 'Merge failed', { autoClose: 1500, position: 'bottom-center' })
      }
    } catch (err) {
      setLoader(false)
      toast.error('Error merging lead', { autoClose: 1500, position: 'bottom-center' })
    }
  }

  // Fetch form
  const fetchForm = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
      )
      const data = await res.json()
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
        toast.error('Form not found', { autoClose: 1500, position: 'bottom-center' })
      }
    } catch (err) {
      setLoader(false)
      toast.error('Error fetching form', { autoClose: 1500, position: 'bottom-center' })
    }
  }

  // Render field
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
      onChange: e => handleChange(field.id, e.target.value, field.type),
      onBlur: e => handleBlur(e, field),
      error: !!errors[field.id],
      helperText: errors[field.id],
      placeholder: field.placeholder || ''
    }

    switch (field.type) {
      case 'Dropdown': {
        let options = field.options || []
        if ((field.label === 'Assigned To' || field.label === 'Sales Executive') && userList.length > 0) {
          options = userList.map(user => ({
            value: user.user_id,
            label: user.user_name
          }))
        }
        return (
          <TextField id={field.id} select {...commonProps}>
            {options.map((opt, i) => (
              <MenuItem key={i} value={opt.value || opt}>
                {opt.label || opt}
              </MenuItem>
            ))}
          </TextField>
        )
      }

      case 'RadioButton':
        return (
          <Box>
            <Typography variant='body2' fontWeight='bold'>
              {field.label}
            </Typography>
            <RadioGroup
              row
              value={values[field.id] || ''}
              onChange={e => handleChange(field.id, e.target.value, field.type)}
            >
              {field.options?.map((opt, i) => (
                <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </Box>
        )

      case 'Multi-Line':
        return <TextField id={field.id} {...commonProps} multiline minRows={field.rows || 3} />

     case 'Phone':
  return (
    <TextField
      id={field.id}
      {...commonProps}
      value={values[`${field.id}_number`] || ''}
      onChange={e => handleChange(`${field.id}_number`, e.target.value, field.type)}
      type="tel"
      inputProps={{ maxLength: field.maxLength }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Autocomplete
  options={countryCodes}
  getOptionLabel={(option) =>
    typeof option === 'string'
      ? option
      : `${option.code} ${option.dial_code}`
  }
  freeSolo   // ✅ allows typing custom values
  value={
    countryCodes.find(
      (c) =>
        c.dial_code ===
        (values[`${field.id}_countryCode`] || field.countryCode || '+91')
    ) || values[`${field.id}_countryCode`] || ''
  }
  onChange={(_, newValue) => {
    if (typeof newValue === 'string') {
      handleChange(`${field.id}_countryCode`, newValue, field.type);
    } else if (newValue && 'dial_code' in newValue) {
      handleChange(`${field.id}_countryCode`, newValue.dial_code, field.type);
    } else {
      handleChange(`${field.id}_countryCode`, '', field.type);
    }
  }}
  size="small"
  sx={{ minWidth: 120 }}
  renderInput={(params) => (
    <TextField
      {...params}
      variant="standard"
      placeholder="+91"
      InputProps={{
        ...params.InputProps,
        disableUnderline: true,
      }}
    />
  )}
/>
          </InputAdornment>
        )
      }}
    />
  )

      case 'Email':
        return <TextField id={field.id} {...commonProps} type='email' />
      case 'URL':
        return <TextField id={field.id} {...commonProps} type='url' />
      case 'Date':
        return <TextField id={field.id} {...commonProps} type='date' InputLabelProps={{ shrink: true }} />
      case 'Switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={values[field.id] || false}
                onChange={e => handleChange(field.id, e.target.checked, field.type)}
              />
            }
            label={field.label || 'Toggle'}
          />
        )
      default:
        return <TextField id={field.id} {...commonProps} />
    }
  }

  // Render layout
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

  // Fetch country codes + users
  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
      .catch(() => setCountryCodes([]))

    getUserListFn()
  }, [])
  useEffect(() => {
    fetchForm()
  }, [])

  useEffect(() => {
    console.log(countryCodes,"<<< COUNTY CODES")
  }, [countryCodes])
  

  return (
    <Box px={4} py={4} sx={{ background: '#f9f9f9', minHeight: '100vh' }}>
      {loader ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh', // full screen center
            width: '100vw',
            bgcolor: 'rgba(255, 255, 255, 0.7)', // semi-transparent overlay
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300 // above all dialogs
          }}
        >
          <Image src={LoaderGif} alt='loading' width={200} height={200} />
        </Box>
      ) : sections.length === 0 ? (
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

       {/* 🚨 Duplicate Dialog */}
      <Dialog open={duplicateDialog} onClose={() => setDuplicateDialog(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Duplicate Lead Detected</DialogTitle>
        <DialogContent dividers>
          <Typography>
            A lead with the same email/phone already exists:
          </Typography>
          {duplicateLead && (
            <Box mt={2} p={2} sx={{ bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant='body2'><strong>Lead ID:</strong> {duplicateLead.lead_id}</Typography>
              <Typography variant='body2'><strong>Name:</strong> {duplicateLead.lead_name}</Typography>
              <Typography variant='body2'><strong>Email:</strong> {duplicateLead.values?.Email || '—'}</Typography>
              <Typography variant='body2'><strong>Phone:</strong> {duplicateLead.values?.Phone || '—'}</Typography>
            </Box>
          )}
          <Typography mt={2}>Do you want to merge this lead with your submission?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateDialog(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleMerge} color='primary' variant='contained'>
            Merge & Continue
          </Button>
        </DialogActions>
      </Dialog>
       <ToastContainer
              position='bottom-center'
              autoClose={500} // all toasts auto close
              hideProgressBar
              closeOnClick
              pauseOnHover={false}
              draggable={false}
            />
    </Box>
  )
}

export default LeadFormAppPage
