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

const shortName = fullName =>
  fullName
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()

function LeadFormAppIdPage() {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id)
  const leadId = decrypCryptoReq(encryptedId)

  const organization_id = Cookies.get('organization_id')
  const organization_name = Cookies.get('organization_name')
  const lead_form = 'lead-form'

  const router = useRouter()

  const [callFlag, setCallFlag] = useState(false)
  const [sections, setSections] = useState([])
  const [formId, setFormId] = useState(null)
  const [values, setValues] = useState({})
  const [loader, setLoader] = useState(false)
  const [errors, setErrors] = useState({})

  const [countryCodes, setCountryCodes] = useState([])

  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
  }, [])

  // ✅ Validation
  const validateField = (field, value) => {
    if (field.type === 'Phone') {
      const number = values[`${field.id}_number`]
      if (field.required && !number) return `${field.label} is required`
      if (number && !/^[6-9]\d{9}$/.test(number)) return 'Invalid phone number'
      return ''
    }

    if (field.required && !value) return `${field.label} is required`
    if (value) {
      if (field.type === 'Single Line') {
        if (value.length < field.minChars) return `Minimum ${field.minChars} characters required`
        if (value.length > field.maxChars) return `Maximum ${field.maxChars} characters allowed`
      }
      if (field.type === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
      if (field.type === 'URL' && !/^(http|https):\/\/.+/.test(value)) return 'Invalid URL'
      if (field.type === 'Date' && new Date(value) < new Date().setHours(0, 0, 0, 0))
        return 'Date cannot be in the past'
    }
    return ''
  }

  const handleChange = (fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
    setErrors(prev => ({
      ...prev,
      [fieldId]: ''
    }))
  }

  const handleBlur = field => {
    const error = validateField(field, values[field.id])
    if (error) setErrors(prev => ({ ...prev, [field.id]: error }))
  }

  // ✅ Submit
  const handleSubmit = async () => {
    const newErrors = {}
    const payload = {
      organization_id,
      organization_name: shortName(organization_name),
      form_name: lead_form,
      values: {},
      submittedAt: new Date().toISOString()
    }

    sections.forEach(section => {
      const allFields = [
        ...(section.fields.left || []),
        ...(section.fields.center || []),
        ...(section.fields.right || [])
      ]
      allFields.forEach(field => {
        let value = values[field.id]

        // special handling for phone
        if (field.type === 'Phone') {
          const number = values[`${field.id}_number`]
          const code = values[`${field.id}_countryCode`] || '+91'
          value = number ? `${code}${number}` : ''
        }

        const error = validateField(field, value)
        if (error) newErrors[field.id] = error

        if (value !== undefined && value !== '') payload.values[field.label] = value
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoader(true)
    const res = await fetch(leadId ? `/api/v1/admin/lead-form/${leadId}` : '/api/v1/admin/lead-form/form-submit', {
      method: leadId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    setLoader(false)

    if (data.success) {
      toast.success(leadId ? 'Lead updated successfully' : 'Form submitted successfully')
      router.push('/app/leads')
    } else {
      toast.error('Submission failed')
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
      setFormId(json.data._id)
    } else {
      toast.error('Form not found')
    }
    setLoader(false)
  }

  // ✅ Fetch Lead for Edit
  const fetchLeadFromId = async () => {
    setLoader(true)
    const res = await fetch(`/api/v1/admin/lead-form/${leadId}`)
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
              const match = phoneVal.match(/^(\+\d{1,3})(\d{10})$/)
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
      toast.error(data.message || 'Lead not found')
    }
    setLoader(false)
  }

  useEffect(() => {
    setCallFlag(true)
    fetchFormTemplate()
  }, [])

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadFromId()
    }
  }, [sections, leadId])

  // ✅ Render Fields
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
            {field.options?.map((option, i) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )

      case 'RadioButton':
        return (
          <Box>
            <Typography variant='body2' fontWeight='bold' gutterBottom>
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
case "Phone":
  return (
    <TextField
      fullWidth
      size="small"
      placeholder="Enter phone number"
      value={values[`${field.id}_number`] || ""}
      onChange={(e) => handleChange(`${field.id}_number`, e.target.value)}
      error={!!errors[field.id]}
      helperText={errors[field.id]}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Select
              value={values[`${field.id}_countryCode`] || "+91"}
              onChange={(e) =>
                handleChange(`${field.id}_countryCode`, e.target.value)
              }
              size="small"
              variant="outlined"
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 250, // 👈 limit dropdown height
                  },
                },
              }}
              sx={{
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                ".MuiSelect-select": {
                  padding: "4px 8px",
                  minWidth: "60px",
                },
              }}
            >
              {countryCodes.map((country) => (
                <MenuItem key={country.code} value={country.dial_code}>
                  {country.code} {country.dial_code}
                </MenuItem>
              ))}
            </Select>
          </InputAdornment>
        ),
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
      <Typography variant='h4' fontWeight='bold' color='primary' mb={4}>
        {leadId ? 'Edit Lead Form' : 'New Lead Form'}
      </Typography>

      {loader && (
        <Box textAlign='center' py={8}>
          <CircularProgress color='warning' />
        </Box>
      )}

      {!loader && sections.length === 0 && callFlag && (
        <Card>
          <CardContent>
            <Typography textAlign='center'>No Lead Form Found</Typography>
          </CardContent>
        </Card>
      )}

      {!loader &&
        sections.map((section, sIndex) => (
          <Card key={sIndex} sx={{ mb: 4, borderLeft: '8px solid #8c57ff' }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={2}>
                {section.title || `Section ${sIndex + 1}`}
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

      <ToastContainer position='top-right' />
    </Box>
  )
}

export default LeadFormAppIdPage
