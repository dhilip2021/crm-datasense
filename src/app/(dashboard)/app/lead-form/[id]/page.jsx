'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
  InputAdornment,
  Select
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter, useParams } from 'next/navigation'
import { decrypCryptoReq } from '@/helper/frontendHelper'
import { getAllUserListApi } from '@/apiFunctions/ApiAction'
import LoaderGif from '@assets/gif/loader.gif'
import Image from 'next/image'
// import { getAllUserListApi } from '@/api/user' // ✅ make sure this exists

// ✅ Short name generator for org name
const shortName = fullName =>
  fullName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

// ✅ Email validator
function isValidEmail(email) {
  if (typeof email !== 'string') return false
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/
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

function LeadFormAppIdPage() {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id)
  const leadId = decrypCryptoReq(encryptedId)

  const organization_id = Cookies.get('organization_id')
  const organization_name = Cookies.get('organization_name')
  const getToken = Cookies.get('_token')
  const lead_form = 'lead-form'

  const router = useRouter()

  const [sections, setSections] = useState([])
  const [values, setValues] = useState({})
  const [loader, setLoader] = useState(false)
  const [errors, setErrors] = useState({})
  const [countryCodes, setCountryCodes] = useState([])
  const [userList, setUserList] = useState([])

  // ✅ Fetch user list
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

  // ✅ Submit Form
  const handleSubmit = async () => {
    const newErrors = {}
    const payload = {
      organization_id,
      organization_name: shortName(organization_name),
      form_name: lead_form,
      values: {},
      submittedAt: new Date().toISOString()
    }

    console.log(payload,"PALOADDD")

    sections.forEach(section => {
      const allFields = [
        ...(section.fields.left || []),
        ...(section.fields.center || []),
        ...(section.fields.right || [])
      ]
      allFields.forEach(field => {
        let value = values[field.id]

        if (field.type === 'Phone') {
          const number = values[`${field.id}_number`]
          const code = values[`${field.id}_countryCode`] || '+91'
          value = number ? `${code}${number}` : ''
        }

        const error = validateField(field, value)
        if (error) newErrors[field.id] = error
        if (value) payload.values[field.label] = value
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoader(true)
    const res = await fetch(leadId ? `/api/v1/admin/lead-form/${leadId}` : '/api/v1/admin/lead-form/form-submit', {
      method: leadId ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    setLoader(false)

    if (data.success) {
      toast.success(leadId ? 'Lead updated successfully' : 'Form submitted successfully', { autoClose: 1000 })
      setTimeout(() => router.push('/app/leads'), 1200)
    } else {
      toast.error(data.error || 'Submission failed', { autoClose: 1000 })
    }
  }

  // ✅ Fetch Form Template
  const fetchFormTemplate = async () => {
    setLoader(true)
    const res = await fetch(
      `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
    )
    const json = await res.json()

    if (json?.success && json.data?.sections?.length > 0) {
      setSections(json.data.sections)
    } else {
      toast.error('Form template not found')
    }
    setLoader(false)
  }

  // ✅ Fetch Lead (edit mode)
  const fetchLeadFromId = async () => {
    if (!leadId) return
    setLoader(true)
    const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
      headers: {
        Authorization: `Bearer ${getToken}`
      }
    })
    const data = await res.json()

    if (data.success && data.data?.values) {
      const fetchedValues = data.data.values
      const mappedValues = {}

      sections.forEach(section => {
        const allFields = [
          ...(section.fields.left || []),
          ...(section.fields.center || []),
          ...(section.fields.right || [])
        ]
        allFields.forEach(field => {
          if (fetchedValues[field.label]) {
            if (field.type === 'Phone') {
              const phoneVal = fetchedValues[field.label]
              const match = phoneVal.match(/^(\+\d{1,3})(\d{6,15})$/)
              if (match) {
                mappedValues[`${field.id}_countryCode`] = match[1]
                mappedValues[`${field.id}_number`] = match[2]
              }
            } else if (field.type === 'Date') {
              mappedValues[field.id] = new Date(fetchedValues[field.label]).toISOString().split('T')[0]
            } else {
              mappedValues[field.id] = fetchedValues[field.label]
            }
          }
        })
      })
      setValues(mappedValues)
    } else {
      toast.error(data.error || 'Lead not found')
    }
    setLoader(false)
  }

  // ✅ Render Form Field
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
          <TextField select {...commonProps}>
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
        return <TextField {...commonProps} multiline minRows={field.rows || 3} />
      case 'Phone':
        return (
          <TextField
            fullWidth
            size='small'
            placeholder='Enter phone number'
            value={values[`${field.id}_number`] || ''}
            onChange={e => handleChange(`${field.id}_number`, e.target.value, field.type)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Select
                    value={values[`${field.id}_countryCode`] || '+91'}
                    displayEmpty
                    onChange={e => handleChange(`${field.id}_countryCode`, e.target.value, field.type)}
                    size='small'
                    sx={{ '.MuiOutlinedInput-notchedOutline': { border: 'none' } }}
                  >
                    {countryCodes.map(c => (
                      <MenuItem key={c.code} value={c.dial_code.startsWith('+') ? c.dial_code : `+${c.dial_code}`}>
                        {c.code} {c.dial_code.startsWith('+') ? c.dial_code : `+${c.dial_code}`}
                      </MenuItem>
                    ))}
                  </Select>
                </InputAdornment>
              )
            }}
          />
        )
      case 'Email':
        return <TextField {...commonProps} type='email' />
      case 'URL':
        return <TextField {...commonProps} type='url' />
      case 'Date':
        return <TextField {...commonProps} type='date' InputLabelProps={{ shrink: true }} />
      default:
        return <TextField {...commonProps} />
    }
  }

  // ✅ Section Layout Renderer
  const renderLayoutGrid = section => {
    const layout = section.layout || 'double'
    const cols = layout === 'single' ? 12 : layout === 'double' ? 6 : 4

    return (
      <Grid container spacing={2}>
        {section.fields.left?.length > 0 && (
          <Grid item xs={12} sm={cols}>
            {section.fields.left.map(f => (
              <Box key={f.id} py={2}>
                {renderField(f)}
              </Box>
            ))}
          </Grid>
        )}
        {layout === 'triple' && section.fields.center?.length > 0 && (
          <Grid item xs={12} sm={4}>
            {section.fields.center.map(f => (
              <Box key={f.id} py={2}>
                {renderField(f)}
              </Box>
            ))}
          </Grid>
        )}
        {layout !== 'single' && section.fields.right?.length > 0 && (
          <Grid item xs={12} sm={layout === 'double' ? 6 : 4}>
            {section.fields.right.map(f => (
              <Box key={f.id} py={2}>
                {renderField(f)}
              </Box>
            ))}
          </Grid>
        )}
      </Grid>
    )
  }

  // ✅ Fetch country list for phone fields
  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
    getUserListFn()
  }, [])

  useEffect(() => {
    if (sections.length > 0 && leadId && countryCodes.length > 0) {
      fetchLeadFromId()
    }
  }, [sections, leadId, countryCodes])

  // ✅ Init load
  useEffect(() => {
    fetchFormTemplate()
  }, [])

  useEffect(() => {
    console.log(countryCodes, '<<< COUNTY CODES')
  }, [countryCodes])

  return (
    <Box px={4} py={4} sx={{ background: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant='h4' fontWeight='bold' color='primary' mb={4}>
        {leadId ? 'Edit Lead Form' : 'New Lead Form'}
      </Typography>

      {loader && (
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
      )}

      {/* {!loader && sections.length === 0 && (
        <Card>
          <CardContent>
            <Typography textAlign='center'>No Lead Form Found</Typography>
          </CardContent>
        </Card>
      )} */}

      {!loader &&
        sections.map((section, i) => (
          <Card key={i} sx={{ mb: 4, borderLeft: '8px solid #8c57ff' }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={2}>
                {section.title || `Section ${i + 1}`}
              </Typography>
              {renderLayoutGrid(section)}
            </CardContent>
          </Card>
        ))}

      {!loader && (
        <Box display='flex' justifyContent='space-between' mt={3}>
          <Button variant='outlined' color='error' onClick={() => router.push('/app/leads')}>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSubmit}>
            {leadId ? 'Update Lead' : 'Submit Lead'}
          </Button>
        </Box>
      )}

      <ToastContainer position='bottom-center' hideProgressBar />
    </Box>
  )
}

export default LeadFormAppIdPage
