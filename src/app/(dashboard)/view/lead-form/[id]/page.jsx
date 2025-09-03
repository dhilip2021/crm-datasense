'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, Box, Button, Card, Chip, CircularProgress, Grid, Typography } from '@mui/material'
import EditableField from './EditableField'
import NotesSection from './NotesSection'
import Cookies from 'js-cookie'
import { useParams, useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import { decrypCryptoReq } from '@/helper/frontendHelper'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import TaskSection from './TaskSection'
import LeadCard from './LeadCard'
import EventIcon from '@mui/icons-material/Event'
import StatusFiled from './StatusFiled'
import OpenActivities from './OpenActivities'

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

  const [loader, setLoader] = useState(false)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({}) // dynamic config

  // 🔹 fetch template (form structure)
  const fetchFormTemplate = async () => {
    setLoader(true)

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const res = await fetch(
      `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
      {
        headers: header
      }
    )
    const json = await res.json()
    if (json?.success && json.data?.sections?.length > 0) {
      setSections(json.data.sections)

      // 🔹 build dynamic fieldConfig from template
      const config = {}
      json.data.sections.forEach(section => {
        Object.values(section.fields).forEach(fieldGroup => {
          fieldGroup.forEach(field => {
            if (field.type === 'Dropdown' && field.options?.length > 0) {
              config[field.label] = field.options
            }
          })
        })
      })
      console.log(config,"<<< Config")
      setFieldConfig(config)
    }
    setLoader(false)
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

      if (data.success) {
        setLeadData(data.data) // full response with .values
      } else {
        console.log('error loading lead')
      }
    } catch (err) {
      console.error(err)
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
            ...leadData.values,
            [label]: newValue
          }
        })
      })

      const result = await res.json()
      console.log('PUT response:', result)

      if (!result.success) {
        toast.error('Failed to update field')
        fetchLeadFromId() // rollback if failed
      } else {
        toast.success(result?.message, {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error('Error saving field', err)
    }
  }

  if (loader) {
    return <Typography>Loading...</Typography>
  }

  if (!leadData) {
    return <Typography>No lead found</Typography>
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
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* Section: Details */}
          {/* <Box mb={4}>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mb: 2 }}>
              testing Details
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(fields).map(([label, value]) =>
                Array.isArray(value) ? null : (
                  <Grid item xs={12} sm={6} key={label}>
                    <EditableField
                      label={label}
                      value={value}
                      type={fieldConfig[label] ? 'select' : 'text'}
                      options={fieldConfig[label] || []}
                      onSave={newValue => handleFieldSave(label, newValue)}
                    />
                  </Grid>
                )
              )}
            </Grid>
          </Box> */}

          <Box mb={4}>
            <NotesSection leadId={leadId} leadData={leadData} />
          </Box>

          {/* <Box>
            <TaskSection leadId={leadId} leadData={leadData} />
          </Box> */}

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
                        onSave={newValue => handleFieldSave(label, newValue)}
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

      <ToastContainer position='top-right' />
    </>
  )
}

export default LeadDetailView
