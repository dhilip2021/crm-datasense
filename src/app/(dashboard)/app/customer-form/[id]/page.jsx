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
  CircularProgress
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter, useParams } from 'next/navigation'

function CustomerFormAppIdPage() {
  const params = useParams()
  const leadId = params.id
  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'

  const router = useRouter()

  const [callFlag, setCallFlag] = useState(false)
  const [sections, setSections] = useState([])
  const [formId, setFormId] = useState(null)
  const [values, setValues] = useState({})
  const [loader, setLoader] = useState(false)
  const [errors, setErrors] = useState({})

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

  const handleBlur = (field) => {
    const value = values[field.id]
    if (field.required && !value) {
      setErrors(prev => ({
        ...prev,
        [field.id]: `${field.label} is required`
      }))
    }
  }

  const handleSubmit = async () => {
    const newErrors = {}
    const labelBasedValues = {}

    sections.forEach(section => {
      const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]
      allFields.forEach(field => {
        const value = values[field.id]
        if (field.required && !value) {
          newErrors[field.id] = `${field.label} is required`
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
    setLoader(false)

    if (data.success) {
   

       toast.success(leadId ? 'Lead updated successfully' : 'Form submitted successfully', {
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
  }

  const fetchFormTemplate = async () => {
    setLoader(true)
    const res = await fetch(`/api/v1/admin/customer-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`)
    const json = await res.json()
    if (json?.success && json.data?.sections?.length > 0) {
      setSections(json.data.sections)
      setFormId(json.data._id)
    } else {
      toast.error('Form not found')
    }
    setLoader(false)
  }

  const fetchLeadFromId = async () => {
    setLoader(true)
    const res = await fetch(`/api/v1/admin/lead-form/${leadId}`)
    const data = await res.json()

    if (data.success && data.data?.values) {
      const fetchedValues = data.data.values
      const mappedValues = {}
      sections.forEach(section => {
        const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]
        allFields.forEach(field => {
          if (fetchedValues[field.label]) {
            mappedValues[field.id] = field.type === 'Date'
              ? new Date(fetchedValues[field.label]).toISOString().split('T')[0]
              : fetchedValues[field.label]
          }
        })
      })
      setValues(mappedValues)
    } else {
      toast.error(data.error || 'Lead not found')
    }
    setLoader(false)
  }

  useEffect(() => {
    setCallFlag(true)
    console.log("fetchFormTemplate() call 2")
    fetchFormTemplate()
  }, [])

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadFromId()
    }
  }, [sections, leadId])

  const renderField = field => {
    const label = (
      <>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </>
    )

    const commonProps = {
      fullWidth: true,
      size: 'small',
      label,
      value: values[field.id] || '',
      onChange: e => handleChange(field.id, e.target.value),
      onBlur: () => handleBlur(field),
      error: !!errors[field.id],
      helperText: errors[field.id],
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
              {label}
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
            type='tel'
            inputProps={{ maxLength: 10 }}
            onChange={e => {
              const val = e.target.value
              if (/^\d*$/.test(val)) handleChange(field.id, val)
            }}
          />
        )
      case 'Date':
        return (
          <TextField
            {...commonProps}
            type='date'
            InputLabelProps={{ shrink: true }}
          />
        )
      default:
        return <TextField {...commonProps} />
    }
  }

  return (
    <Box px={4} py={4} sx={{ background: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant='h4' fontWeight='bold' color='primary' mb={4}>
        {leadId ? 'Edit Lead Form' : 'New Lead Form'}
      </Typography>

      {loader && (
        <Box textAlign="center" py={8}>
          <CircularProgress color="warning" />
        </Box>
      )}

      {!loader && sections.length === 0 && callFlag && (
        <Card>
          <CardContent>
            <Typography textAlign="center">No Lead Form Found</Typography>
          </CardContent>
        </Card>
      )}

      {!loader && sections.map((section, sIndex) => (
  <Card key={section.id} sx={{ mb: 3, borderLeft: '8px solid #009CDE' }}>
    <CardContent>
      <Typography variant='h6' fontWeight='bold' mb={2}>
        {section.title || `Section ${sIndex + 1}`}
      </Typography>

      <Grid container spacing={2}>
        {/* Left */}
        {(section.fields.left || []).length > 0 && (
          <Grid
            item
            xs={12}
            sm={section.layout === 'single' ? 12 : section.layout === 'double' ? 6 : 4}
          >
            {section.fields.left.map(field => (
              <Box mb={3} key={field.id}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}

        {/* Center */}
        {section.layout === 'triple' && (section.fields.center || []).length > 0 && (
          <Grid item xs={12} sm={4}>
            {section.fields.center.map(field => (
              <Box mb={3} key={field.id}>
                {renderField(field)}
              </Box>
            ))}
          </Grid>
        )}

        {/* Right */}
        {(section.layout === 'double' || section.layout === 'triple') &&
          (section.fields.right || []).length > 0 && (
            <Grid
              item
              xs={12}
              sm={section.layout === 'double' ? 6 : 4}
            >
              {section.fields.right.map(field => (
                <Box mb={3} key={field.id}>
                  {renderField(field)}
                </Box>
              ))}
            </Grid>
          )}
      </Grid>
    </CardContent>
  </Card>
))}


      {!loader && (
        <Box display='flex' justifyContent='space-between' mt={3}>
          <Button variant='outlined' color='error' onClick={() => router.push('/app/leads')}>
            Cancel
          </Button>
          <Button variant='contained'  onClick={handleSubmit}>
            {leadId ? 'Update Lead' : 'Submit Lead'}
          </Button>
        </Box>
      )}

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

export default CustomerFormAppIdPage
