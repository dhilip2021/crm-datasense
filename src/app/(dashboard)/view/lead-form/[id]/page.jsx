'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, Box, Button, Card, Chip, CircularProgress, Grid, Typography } from '@mui/material'
import EditableField from './EditableField'
import NotesSection from './NotesSection'
import Cookies from 'js-cookie'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { decrypCryptoReq } from '@/helper/frontendHelper'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LeadCard from './LeadCard'
import EventIcon from '@mui/icons-material/Event'
import StatusFiled from './StatusFiled'
import Image from 'next/image'
import LoaderGif from '@assets/gif/loader.gif'
import Link from 'next/link'
import OpenActivities from './OpenActivities'

// Validation rules
const fieldValidators = {
  Email: val => {
    if (!val) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format'
    return null
  },
  Phone: val => {
    if (!val) return 'Phone is required'
    if (!/^\d{10}$/.test(val)) return 'Phone must be 10 digits'
    return null
  },
  'First Name': val => (!val ? 'First Name is required' : null),
  'Last Name': val => (!val ? 'Last Name is required' : null),
  Pincode: val => {
    if (!val) return 'Pincode is required'
    if (!/^\d{6}$/.test(val)) return 'Pincode must be 6 digits'
    return null
  },
  Company: val => (!val ? 'Company name is required' : null),

  'Company Size': val => {
    if (!val) return 'Company Size is required'
    if (isNaN(val)) return 'Company Size must be a number'
    if (val <= 0) return 'Company Size must be greater than 0'
    return null
  },

  'Potential Deal Size': val => {
    if (!val) return 'Potential Deal Size is required'
    if (isNaN(val)) return 'Deal Size must be a number'
    if (Number(val) < 1000) return 'Deal Size must be at least 1000'
    return null
  },

  'Job Title': val => (!val ? 'Job Title is required' : null),

  Industry: val => (!val ? 'Industry is required' : null),

  'Lead Source': val => (!val ? 'Lead Source is required' : null),
  Country: value => {
    if (!value || value.trim() === '') return 'Country is required'
    if (!/^[A-Za-z\s]+$/.test(value)) return 'Country must contain only letters'
    return ''
  },
  State: value => {
    if (!value || value.trim() === '') return 'State is required'
    if (!/^[A-Za-z\s]+$/.test(value)) return 'State must contain only letters'
    return ''
  },
  City: value => {
    if (!value || value.trim() === '') return 'City is required'
    if (!/^[A-Za-z\s]+$/.test(value)) return 'City must contain only letters'
    return ''
  },
  Street: value => {
    if (!value || value.trim() === '') return 'Street is required'
    if (value.length < 3) return 'Street name is too short'
    return ''
  },
  Pincode: value => {
    if (!value || value.trim() === '') return 'Pincode is required'
    if (!/^\d{5,6}$/.test(value)) return 'Pincode must be 5 or 6 digits'
    return ''
  }
}

const LeadDetailView = () => {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id) // 👈 must decode
  const leadId = decrypCryptoReq(encryptedId)

  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
  const deal_form = 'deal-form'
  const organization_name = Cookies.get('organization_name')
  const getToken = Cookies.get('_token')

  const router = useRouter()

  const [loader, setLoader] = useState(true)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({}) // dynamic config
  const [fieldFlatend, setFieldFlatend] = useState([]) // dynamic config


  // 🔹 Helper: Flatten sections into simple fields array
const flattenFields = sections => {
  const flat = []
  sections.forEach(section => {
    Object.values(section.fields).forEach(fieldGroup => {
      fieldGroup.forEach(field => {
        flat.push({
          sectionName: section.sectionName || '', // keep section reference
          ...field
        })
      })
    })
  })
  return flat
}

// 🔹 Inside your fetchFormTemplate
const fetchFormTemplate = async () => {
  setLoader(true)
  try {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const res = await fetch(
      `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
      { headers: header }
    )

    const json = await res.json()
    if (json?.success && json.data?.sections?.length > 0) {
      setSections(json.data.sections)

      // 🔹 Flatten sections
      const flattened = flattenFields(json.data.sections)

      // 🔹 Build config (for Dropdown etc.)
      const config = {}
      flattened.forEach(field => {
        if (field.type === 'Dropdown' && field.options?.length > 0) {
          config[field.label] = field.options
        }
      })

      console.log(flattened, '<<< FLATTENED FIELDS')
      console.log(config, '<<< CONFIG FILE')
      setFieldFlatend(flattened)
      setFieldConfig(config)
    }
  } catch (err) {
    console.error('fetchFormTemplate error:', err)
  } finally {
    setLoader(false)
  }
}

  // 🔹 fetch lead by ID
  const fetchLeadFromId = async () => {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        headers: header
      })
      const data = await res.json()
       setLoader(false)

      if (data.success) {
        setLeadData(data.data) // full response with .values
      } else {
        console.log('error loading lead')
      }
    } catch (err) {
      console.error(err)
      setLoader(false)
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadFromId()
    }
  }, [sections, leadId])

  useEffect(() => {
    setLoader(true)
    fetchFormTemplate()
  }, [])

  function updateLeadName(oldName, type = 'DEAL') {
    // Example: "CRM LEAD 2025 00999"
    const parts = oldName.split(' ')

    if (parts.length < 4) {
      throw new Error('Invalid lead_name format')
    }

    // Replace "LEAD" with given type (default: DEAL)
    parts[1] = type.toUpperCase()

    const newName = parts.join(' ')

    // Generate slug: crm-deal-2025-00999
    const slug = newName
      .toLowerCase()
      .replace(/\s+/g, '-') // spaces → dashes
      .replace(/[^a-z0-9\-]/g, '') // clean unwanted chars

    return {
      lead_name: newName,
      lead_slug_name: slug,
      form_name: deal_form
    }
  }

  const handleConvertDeal = async () => {
    setLoader(true)

    const bodyData = updateLeadName(leadData?.lead_name, 'DEAL')

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
      method: 'PUT',
      headers: header,
      body: JSON.stringify(bodyData)
    })

    const result = await res.json()

    if (!result.success) {
      setLoader(false)
      toast.error('Failed to update field')
      fetchLeadFromId() // rollback if failed
    } else {
      setLoader(false)
      toast.success('Lead Converted Successfully', {
        autoClose: 1000, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      router.push('/app/leads')
    }
  }

  // 🔹 handle PUT save
  const handleFieldSave = async (label, newValue) => {
    try {
      // Optimistic update
      setLeadData(prev => ({
        ...prev,
        values: {
          ...prev.values,
          [label]: newValue
        }
      }))

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify({
          values: {
            ...leadData?.values, // fallback
            [label]: newValue
          }
        })
      })

      const result = await res.json()
      if (!result.success) {
        toast.error('Failed to update field')
        fetchLeadFromId() // rollback
      } else {
        toast.success(result?.message || 'Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error('Error saving field', err)
    }
  }

  if (loader) {
    return (
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
    )
  }

  if (!leadData && !loader) {
    return (
      <Card
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: '#fafafa',
          border: '1px dashed #ccc',
          borderRadius: 3,
          mt: 3
        }}
      >
        <Typography variant='h6' color='text.secondary' gutterBottom>
          📝 No lead found
        </Typography>
        <Typography variant='body2' color='text.disabled' mb={2}>
          Start by adding your lead
        </Typography>
        <Link underline='hover' color='inherit' href='/app/lead-form'>
          <Button variant='contained' size='small'>
            + Create New Lead
          </Button>
        </Link>
      </Card>
    )
  }

  const fields = leadData.values

  return (
    <>
      <Grid container spacing={4}>
        {/* Left side */}
        <Grid item xs={12} md={8}>
          <Box display={'flex'} justifyContent={'space-between'}>
            <Box display='flex' alignItems='center' gap={2} mb={2}>
              <Typography
                variant='h4'
                fontWeight='bold'
                sx={{
                  color: '#0f172a',
                  letterSpacing: '0.5px'
                }}
              >
                {leadData?.lead_name || 'Unnamed Lead'}
              </Typography>
            </Box>
            <Typography variant='h6' fontWeight='600' gutterBottom>
              Next Follow-up :
              <Chip
                icon={<EventIcon />}
                label={fields['Next Follow-up Date'] || 'Not Scheduled'}
                sx={{
                  ml: 1,
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: '8px',
                  px: 1.5,
                  py: 0.5
                }}
              />
            </Typography>
          </Box>

          {/* Section: Person */}
          <Box mb={4}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Person Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {['First Name', 'Last Name', 'Phone', 'Email'].map(label => (
                    <Grid item xs={12} sm={6} key={label}>
                      <EditableField
                        label={label}
                        value={fields[label]}
                        type={fieldConfig[label] ? 'select' : 'text'}
                        options={fieldConfig[label] || []}
                        onSave={newValue => handleFieldSave(label, newValue)}
                        validate={fieldValidators[label]} // ✅ field-wise validation
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
          <Box mb={4}>
            <NotesSection leadId={leadId} leadData={leadData} />
          </Box>
          <Box>
            <OpenActivities leadId={leadId} leadData={leadData} />
          </Box>
        </Grid>

        {/* Right side (summary card) */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={2}>
            {/* Left Side - Editable Field */}
            <Grid item xs={12} md={6} sm={6}>
              {['Lead Status'].map(label => (
                <StatusFiled
                  key={label}
                  label={label}
                  value={fields[label]}
                  type={fieldConfig[label] ? 'select' : 'text'}
                  options={fieldConfig[label] || []}
                  onSave={newValue => handleFieldSave(label, newValue)}
                />
              ))}
            </Grid>

            {/* Right Side - Button */}
            <Grid item xs={12} md={6} sm={6}>
              <Button
                disabled={loader}
                startIcon={loader ? <CircularProgress size={18} color='inherit' /> : null}
                fullWidth
                variant='contained'
                onClick={() => handleConvertDeal()}
              >
                {loader ? 'Converting...' : 'Convert to Deal'}
              </Button>
            </Grid>
          </Grid>

          <LeadCard fields={fields} />

          <Box mb={4}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Company Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {['Company', 'Company Size', 'Potential Deal Size', 'Job Title', 'Industry', 'Lead Source'].map(
                    label => (
                      <Grid item xs={12} sm={12} md={12} key={label}>
                        <EditableField
                          label={label}
                          value={fields[label]}
                          type={fieldConfig[label] ? 'select' : 'text'}
                          options={fieldConfig[label] || []}
                          onSave={newValue => handleFieldSave(label, newValue)}
                          validate={fieldValidators[label]} // 👈 add validator
                        />
                      </Grid>
                    )
                  )}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box mb={4}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Address Information
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {['Country', 'State', 'City', 'Street', 'Pincode'].map(label => (
                    <Grid item xs={12} sm={12} md={12} key={label}>
                      <EditableField
                        label={label}
                        value={fields[label]}
                        type={fieldConfig[label] ? 'select' : 'text'}
                        options={fieldConfig[label] || []}
                        onSave={newValue => {
                          const error = fieldValidators[label] ? fieldValidators[label](newValue) : ''
                          if (error) {
                            alert(error) // or toast(error)
                            return
                          }
                          handleFieldSave(label, newValue)
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          <Box mb={4}>
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant='subtitle1' fontWeight='bold'>
                  Next Follow Up
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {['Next Follow-up Date'].map(label => (
                    <Grid item xs={12} sm={12} md={12} key={label}>
                      <EditableField
                        label={label}
                        value={fields[label]}
                        type={fieldConfig[label] ? 'select' : 'text'}
                        options={fieldConfig[label] || []}
                        onSave={newValue => handleFieldSave(label, newValue)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>
      </Grid>
    </>
  )
}

export default LeadDetailView
