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
import React, { use, useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LoaderGif from '@assets/gif/loader.gif'
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'

function LeadFormPage() {
  const params = useParams()
  const leadId = params.id // 👉 "566fa1a00b9e"

  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
  const router = useRouter()
  const [callFlag, setCallFlag] = useState(false)
  const [sections, setSections] = useState([])
  const [formId, setFormId] = useState(null)
  const [values, setValues] = useState({})
  const [loader, setLoader] = useState(false)
  const [errors, setErrors] = useState({})

  const validateField = (field, value) => {
    if (field.required && !value) {
      return `${field.label} is required`
    }

    if (value) {
      if (field.type === 'Single Line' && value.length < field.minChars) {
        return `Minimum ${field.minChars} character is required`
      }
      if (field.type === 'Single Line' && value.length > field.maxChars) {
        return `Maximum ${field.maxChars} character is required`
      }
      if (field.type === 'Phone' && !/^\d{10}$/.test(value)) {
        return 'Phone number must be 10 digits'
      }
      if (field.type === 'Phone' && !/^[6-9]\d{9}$/.test(value)) {
        return 'Invalid Phone number'
      }
      if (field.type === 'Phone' && !/^\d{10}$/.test(value)) {
        return 'Phone number must be 10 digits'
      }
      if (field.type === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address'
      }
      if (field.type === 'URL' && !/^(http|https):\/\/[^ "]+$/.test(value)) {
        return 'Invalid URL (must start with http:// or https://)'
      }
      if (field.type === 'Date') {
        // const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(value)
        // if (!isValidDate) {
        //   return 'Invalid date format'
        // }

        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // remove time part
        if (selectedDate < today) {
          return 'Date cannot be in the past'
        }
      }
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
      [fieldId]: '' // clear error on change
    }))
  }

  const handleBlur = field => {
    const errorMsg = validateField(field, values[field.id])
    if (errorMsg) {
      setErrors(prev => ({
        ...prev,
        [field.id]: errorMsg
      }))
    }
  }

  const handleClick = () => {
    router.push('/app/leads')
  }

  //   const handleSubmit = async () => {
  //     const missingFields = []
  //     const labelBasedValues = {}
  //     const newErrors = {}

  //     sections.forEach(section => {
  //       const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]

  //       allFields.forEach(field => {
  //         const value = values[field.id]

  //         // Validation
  //         if (field.required && !value) {
  //           newErrors[field.id] = `${field.label} is required`
  //           missingFields.push(field.label)
  //         }

  //         if (value) {
  //           if (field.type === 'Phone' && !/^\d{10}$/.test(value)) {
  //             newErrors[field.id] = 'Phone number must be 10 digits'
  //             missingFields.push(`${field.label} (must be 10 digits)`)
  //           }

  //           if (field.type === 'Email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  //             newErrors[field.id] = 'Invalid email address'
  //             missingFields.push(`${field.label} (invalid email)`)
  //           }

  //           if (field.type === 'URL' && !/^(http|https):\/\/[^ "]+$/.test(value)) {
  //             newErrors[field.id] = 'Invalid URL (must start with http:// or https://)'
  //             missingFields.push(`${field.label} (invalid URL)`)
  //           }
  //         }

  //         if (value !== undefined && value !== '') {
  //           labelBasedValues[field.label] = value
  //         }
  //       })
  //     })

  //     if (Object.keys(newErrors).length > 0) {
  //       setErrors(newErrors)
  //       //   toast.error(`Please fill: ${missingFields.join(', ')}`)
  //       return
  //     }

  //     setErrors({}) // clear previous errors if any

  //     const payload = {
  //       organization_id,
  //       form_name: lead_form,
  //       values: labelBasedValues,
  //       submittedAt: new Date().toISOString()
  //     }

  //     setLoader(true)

  //     const res = await fetch('/api/v1/admin/lead-form/form-submit', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload)
  //     })

  //     const data = await res.json()
  //     if (data.success) {
  //       setLoader(false)
  //       toast.success('Form submitted successfully')
  //       setValues({})
  //       router.push('/app/leads')
  //     } else {
  //       setLoader(false)
  //       toast.error('Failed to submit form')
  //     }
  //   }
  const handleSubmit = async () => {
    const missingFields = []
    const labelBasedValues = {}
    const newErrors = {}

    sections.forEach(section => {
      const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]

      allFields.forEach(field => {
        const value = values[field.id]

        if (field.required && !value) {
          newErrors[field.id] = `${field.label} is required`
          missingFields.push(field.label)
        }

        if (value !== undefined && value !== '') {
          labelBasedValues[field.label] = value
        }
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload = {
      organization_id,
      form_name: lead_form,
      values: labelBasedValues,
      submittedAt: new Date().toISOString()
    }

    setLoader(true)

    const res = await fetch(leadId ? `/api/v1/admin/lead-form/${leadId}` : '/api/v1/admin/lead-form/form-submit', {
      method: leadId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()

    if (data.success) {
      setLoader(false)
      toast.success(leadId ? 'Lead updated successfully' : 'Form submitted successfully')
      setValues({})
      router.push('/app/leads')
    } else {
      setLoader(false)
      toast.error('Failed to submit form')
    }
  }

  const fetchFormByOrgAndName = async () => {
    setLoader(true)
    const res = await fetch(
      `/api/v1/admin/form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
    )
    const json = await res.json()
    if (json?.success && json?.data?.sections?.length > 0) {
      const defaultValues = {}

      json.data.sections.forEach(section => {
        const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]
        allFields.forEach(field => {
          if (field.defaultValue !== undefined && field.defaultValue !== '') {
            defaultValues[field.id] = field.defaultValue
          }
        })
      })

      setLoader(false)
      setSections(json.data.sections)
      setFormId(json.data._id)
      setValues(defaultValues)
    } else {
      setLoader(false)
      toast.error('Form not found')
    }
  }

  const fetchLeadfromId = async () => {
    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`)
      const data = await res.json()

      if (data.success && data.data?.values) {
        const fetchedValues = data.data.values
        const mappedValues = {}

        // Flatten values based on label
        sections.forEach(section => {
          const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]
          allFields.forEach(field => {
            if (fetchedValues[field.label] !== undefined) {
              mappedValues[field.id] =
                field.type === 'Date'
                  ? new Date(fetchedValues[field.label]).toISOString().split('T')[0] // Format date
                  : fetchedValues[field.label]
            }
          })
        })

        setValues(mappedValues)
        setLoader(false)
      } else {
        setLoader(false)
        toast.error(data.message || 'Lead not found')
      }
    } catch (err) {
      toast.error('Something went wrong while fetching lead')
    }
  }

  useEffect(() => {
    setCallFlag(true)
    fetchFormByOrgAndName()
  }, [])

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadfromId()
    }
  }, [sections, leadId])

  const renderField = field => {
    const label = (
      <>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </>
    )

    switch (field.type) {
      case 'Dropdown':
        return (
          <TextField
            select
            fullWidth
            size='small'
            label={label}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
          >
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
            <Typography variant='body2' gutterBottom>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <RadioGroup row value={values[field.id] || ''} onChange={e => handleChange(field.id, e.target.value)}>
              {field.options?.map((opt, i) => (
                <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
              ))}
            </RadioGroup>
          </Box>
        )

      case 'Multi-Line':
        return (
          <TextField
            fullWidth
            size='small'
            label={label}
            multiline
            minRows={field.rows || 3}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )
      case 'Phone':
        return (
          <TextField
            fullWidth
            size='small'
            autoComplete={field.autoComplte ? 'new-password' : 'off'}
            label={label}
            placeholder={field.placeholder || ''}
            type='tel'
            inputProps={{ maxLength: 10 }}
            value={values[field.id] || ''}
            onChange={e => {
              const val = e.target.value
              if (/^\d*$/.test(val)) {
                handleChange(field.id, val)
              }
            }}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )

      case 'Email':
        return (
          <TextField
            fullWidth
            size='small'
            label={label}
            autoComplete={field.autoComplte ? 'new-password' : 'off'}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )

      case 'URL':
        return (
          <TextField
            fullWidth
            size='small'
            autoComplete={field.autoComplte ? 'new-password' : 'off'}
            label={label}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )
      case 'Single Line':
        return (
          <TextField
            fullWidth
            size='small'
            autoComplete={field.autoComplte ? 'new-password' : 'off'}
            label={label}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )
      case 'Date':
        return (
          <TextField
            fullWidth
            size='small'
            type='date'
            label={label}
            InputLabelProps={{ shrink: true }}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )

      default:
        return (
          <TextField
            fullWidth
            size='small'
            label={label}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
            error={!!errors[field.id]}
            helperText={errors[field.id]}
            onBlur={() => handleBlur(field)}
          />
        )
    }
  }

  return (
    <Box>
      <Box px={3} py={4}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          {loader && (
            <Box textAlign={'center'} width={'100%'}>
              {/* <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  
                </CardContent>
              </Card> */}
              <Box p={40}>
                <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
              </Box>
            </Box>
          )}

          {!loader && sections?.length === 0 && (
            <Box textAlign={'center'} width={'100%'}>
              <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  <Box p={40}>
                    <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Leads Found</p>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {!loader &&
          sections?.length > 0 &&
          sections.map((section, sIndex) => (
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent>
                <Box key={section.id} gap={2} pb={2}>
                  <Typography fontWeight='bold' mb={2}>
                    {section.title || `Section ${sIndex + 1}`}
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6}>
                      {(section.fields.left || []).map(field => (
                        <Box mb={4} key={field.id}>
                          {renderField(field)}
                        </Box>
                      ))}
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6}>
                      {(section.fields.right || []).map(field => (
                        <Box mb={4} key={field.id}>
                          {renderField(field)}
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ))}

        {!loader && (
          <Box display='flex' justifyContent='space-between' mt={2}>
            <Button variant='contained' color='error' onClick={handleClick}>
              cancel
            </Button>
            <Button variant='contained' color='primary' onClick={handleSubmit}>
              {leadId ? 'Update' : 'Submit'}
            </Button>
          </Box>
        )}

        <ToastContainer />
      </Box>
    </Box>
  )
}

export default LeadFormPage
