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
  Typography
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import LoaderGif from '@assets/gif/loader.gif'

const shortName=(fullName)=>{
const shortForm = fullName
  .split(' ')
  .map(word => word[0])
  .join('')
  .toUpperCase();

  return shortForm;
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

  const validateField = (field, value) => {
    if (field.required && !value) return `${field.label} is required`
    if (value) {
      if (field.type === 'Single Line') {
        if (value.length < field.minChars) return `Minimum ${field.minChars} characters required`
        if (value.length > field.maxChars) return `Maximum ${field.maxChars} characters allowed`
      }
      if (field.type === 'Phone') {
        if (!/^[6-9]\d{9}$/.test(value)) return 'Invalid phone number'
      }
      if (field.type === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address'
      if (field.type === 'URL' && !/^(http|https):\/\/.+/.test(value)) return 'Invalid URL'
      if (field.type === 'Date' && new Date(value) < new Date().setHours(0, 0, 0, 0)) return 'Date cannot be in the past'
    }
    return ''
  }

  const handleChange = (id, value) => {
    setValues(prev => ({ ...prev, [id]: value }))
    setErrors(prev => ({ ...prev, [id]: '' }))
  }

  const handleBlur = field => {
    const error = validateField(field, values[field.id])
    if (error) setErrors(prev => ({ ...prev, [field.id]: error }))
  }

  const handleSubmit = async () => {
    const payload = {
      organization_id,
      organization_name : shortName(organization_name),
      form_name: lead_form,
      values: {},
      submittedAt: new Date().toISOString()
    }

    const newErrors = {}
    sections.forEach(section => {
      const fields = [
        ...(section.fields.left || []),
        ...(section.fields.center || []),
        ...(section.fields.right || [])
      ]
      fields.forEach(field => {
        const value = values[field.id]
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


    const res = await fetch('/api/v1/admin/lead-form/form-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    setLoader(false)
    if (data.success) {
      toast.success('Form submitted successfully')
      router.push('/app/leads')
    } else {
      toast.error('Submission failed')
    }



  }

  const fetchForm = async () => {
    setLoader(true)
    const res = await fetch(`/api/v1/admin/form-template/single?organization_id=${organization_id}&form_name=${lead_form}`)
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
            {field.options?.map((opt, i) => (
              <MenuItem key={i} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        )
      case 'RadioButton':
        return (
          <Box>
            <Typography variant='body2' fontWeight='bold'>{field.label}</Typography>
            <RadioGroup
              row
              value={values[field.id] || ''}
              onChange={e => handleChange(field.id, e.target.value)}
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
        return <TextField {...commonProps} type='tel' inputProps={{ maxLength: 10 }} />
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

  // 🆕 Dynamic layout rendering
  const renderLayoutGrid = section => {
    const layout = section.layout || 'double'
    const cols = layout === 'single' ? 12 : layout === 'double' ? 6 : 4

    return (
      <Grid container spacing={2}>
        {section.fields.left?.length > 0 && (
          <Grid item xs={12} sm={cols}>
            {section.fields.left.map(field => (
              <Box key={field.id} mb={2}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}
        {layout === 'triple' && section.fields.center?.length > 0 && (
          <Grid item xs={12} sm={4}>
            {section.fields.center.map(field => (
              <Box key={field.id} mb={2}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}
        {(layout === 'double' || layout === 'triple') && section.fields.right?.length > 0 && (
          <Grid item xs={12} sm={layout === 'double' ? 6 : 4}>
            {section.fields.right.map(field => (
              <Box key={field.id} mb={2}>
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
        Lead Submission
      </Typography>

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
                <Typography variant='h6' fontWeight='bold' mb={2}>{section.title || `Section ${sIndex + 1}`}</Typography>
                {renderLayoutGrid(section)}
              </CardContent>
            </Card>
          ))}
          <Box display='flex' justifyContent='flex-end' gap={2}>
            <Button variant='outlined' color='secondary' onClick={() => router.push('/app/leads')}>Cancel</Button>
            <Button variant='contained' color='primary' onClick={handleSubmit}>Submit</Button>
          </Box>
        </>
      )}

      <ToastContainer />
    </Box>
  )
}

export default LeadFormAppPage
