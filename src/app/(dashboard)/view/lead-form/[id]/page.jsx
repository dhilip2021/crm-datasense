'use client'

import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Grid, Typography } from '@mui/material'
import EditableField from './EditableField'
import Cookies from 'js-cookie'
import { useParams, useRouter } from 'next/navigation'
import { toast, ToastContainer } from 'react-toastify'
import NotesSection from './NotesSection'
import { decrypCryptoReq } from '@/helper/frontendHelper'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

const LeadDetailView = () => {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id) // 👈 must decode
  const leadId = decrypCryptoReq(encryptedId)

  // const leadId = params.id

  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
  const organization_name = Cookies.get('organization_name')

  const router = useRouter()

  const [loader, setLoader] = useState(false)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({}) // dynamic config

  // 🔹 fetch template (form structure)
  const fetchFormTemplate = async () => {
    setLoader(true)
    const res = await fetch(
      `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
    )
    const json = await res.json()
    console.log(json, '<<< JSON FORM TEMPLATE')
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
      setFieldConfig(config)
    }
    setLoader(false)
  }

  // 🔹 fetch lead by ID
  const fetchLeadFromId = async () => {
    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`)
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

  // 🔹 handle PATCH save
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

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT', // 🔥 use PUT instead of PATCH
        headers: { 'Content-Type': 'application/json' },
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
        toast.success(result.success)
        fetchLeadFromId() // rollback if failed
      } else {
        toast.success(result?.message)
      }
    } catch (err) {
      toast.success(err)
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
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3-content' id='panel3-header'>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='h6' fontWeight='bold' mb={3}>
                  Lead Information
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {Object.entries(fields).map(([label, value]) => (
                  <Grid item xs={12} sm={6} key={label}>
                    {Array.isArray(value) ? null : ( // ❌ Notes array skip pannidalaam
                      <EditableField
                        label={label}
                        value={value}
                        type={fieldConfig[label] ? 'select' : 'text'}
                        options={fieldConfig[label] || []}
                        onSave={newValue => handleFieldSave(label, newValue)}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>




      {/* <Card sx={{ p: 3, borderRadius: 2, mt: 3 }}>
        <CardContent>
          <NotesSection leadId={leadId} leadData={leadData} />
        </CardContent>
      </Card> */}

      <ToastContainer position='top-right' />
    </>
  )
}

export default LeadDetailView
