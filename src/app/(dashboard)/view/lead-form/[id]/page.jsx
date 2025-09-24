'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EventIcon from '@mui/icons-material/Event'
import Cookies from 'js-cookie'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { decrypCryptoReq } from '@/helper/frontendHelper'
import EditableField from './EditableField'
import NotesSection from './NotesSection'
import LeadCard from './LeadCard'
import StatusFiled from './StatusFiled'
import Image from 'next/image'
import LoaderGif from '@assets/gif/loader.gif'
import Link from 'next/link'
import OpenActivities from './OpenActivities'
import ProductSelectorDialog from './ProductSelectorDialog'
import ProductPage from './ProductPage'
import TaskTabs from './TaskTabs'
import { getUserAllListApi } from '@/apiFunctions/ApiAction'
// import CloseActivities from './closeActivities'

// ✅ Validation rules
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
  Company: val => (!val ? 'Company name is required' : null),
  Pincode: val => {
    if (!val) return 'Pincode is required'
    if (!/^\d{5,6}$/.test(val)) return 'Pincode must be 5 or 6 digits'
    return null
  }
}

const LeadDetailView = () => {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id)
  const leadId = decrypCryptoReq(encryptedId)
  const [expanded, setExpanded] = useState(0) // 0 = first open by default
  const [tabIndex, setTabIndex] = useState(0)

  const [userList, setUserList] = useState([])
  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
  const deal_form = 'deal-form'
  const getToken = Cookies.get('_token')
  const router = useRouter()

  const [loader, setLoader] = useState(true)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})

  // 🔹 Flatten helper
  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      Object.values(section.fields).forEach(fieldGroup => {
        fieldGroup.forEach(field => {
          flat.push({
            sectionName: section.title || section.sectionName || '',
            ...field
          })
        })
      })
    })
    return flat
  }

  const handleTabChange = (e, newValue) => setTabIndex(newValue)
  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
      )
      const json = await res.json()
      if (json?.success && json.data?.sections?.length > 0) {
        setSections(json.data.sections)

        const flattened = flattenFields(json.data.sections)
        const config = {}
        flattened.forEach(field => {
          if (field.type === 'Dropdown' && field.options?.length > 0) {
            config[field.label] = field.options
          }
        })
        setFieldConfig(config)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  // Fetch user list
  const getUserListFn = async () => {
    try {
      const results = await getUserAllListApi()
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

  // 🔹 Fetch lead data
  const fetchLeadFromId = async () => {
    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        }
      })
      const data = await res.json()
      if (data.success) setLeadData(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadFromId()
      getUserListFn()
    }
  }, [sections, leadId])

  useEffect(() => {
    fetchFormTemplate()
  }, [])



const onToggleFlag = async (row) => {
    const leadId = row?.lead_id

    console.log(row,"<<< ROWWWW")

    try {
      const flagupdatedValues = {
        _id: row?._id,
        organization_id: row?.organization_id,
        auto_inc_id: row?.auto_inc_id,
        lead_name: row?.lead_name,
        lead_id: row?.lead_id,
        lead_flag: row?.lead_flag === 1 ? 0 : 1,
        lead_touch: row?.lead_touch,
        lead_slug_name: row?.lead_slug_name,
        form_name: row?.form_name,
        submittedAt: new Date().toISOString(),
        c_role_id: row?.c_role_id,
        c_createdBy: row?.c_createdBy,
        updatedAt: row?.updatedAt,
        createdAt: row?.createdAt
      }

      // 🔹 Persist to API
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(flagupdatedValues)
      })

      const result = await res.json()

      if (!result.success) {
        toast.error('Failed to update field')
        // fetchData()
         fetchLeadFromId()
      } else {
        toast.success('Flag Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        // fetchData()
         fetchLeadFromId()
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error(err)
    }
  }





  // 🔹 Save handler
  const handleFieldSave = async (label, newValue) => {

    console.log(leadData,"<<< LEAD DATAAA")


    try {
      const updatedLeadValues = {
        _id: leadData?._id,
        organization_id: leadData?.organization_id,
        auto_inc_id: leadData?.auto_inc_id,
        lead_name: leadData?.lead_name,
        lead_id: leadData?.lead_id,
        lead_slug_name: leadData?.lead_slug_name,
        form_name: leadData?.form_name,
        lead_touch: "touch",
        values: {
          [label]: newValue // update particular field
        },
        submittedAt: new Date().toISOString(),
        c_role_id: leadData?.c_role_id,
        c_createdBy: leadData?.c_createdBy,
        updatedAt: leadData?.updatedAt,
        createdAt: leadData?.createdAt
      }

      // 🔹 Persist to API
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(updatedLeadValues)
      })

      const result = await res.json()

      if (!result.success) {
        toast.error('Failed to update field')
        fetchLeadFromId() // rollback to latest DB values
      } else {
        toast.success(result?.message || 'Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error(err)
    }
  }

  if (loader) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: 'rgba(255,255,255,0.7)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1300
        }}
      >
        <Image src={LoaderGif} alt='loading' width={200} height={200} />
      </Box>
    )
  }

  if (!leadData && !loader) {
    return (
      <Card sx={{ p: 4, textAlign: 'center', mt: 3 }}>
        <Typography variant='h6'>📝 No lead found</Typography>
        <Link href='/app/lead-form'>
          <Button variant='contained' size='small'>
            + Create New Lead
          </Button>
        </Link>
      </Card>
    )
  }

  const fields = leadData?.values || {}

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box
          sx={{
            width: '100%',
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant='fullWidth' // ✅ make tabs full width
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
    bgcolor: "#f7f8fc",
    borderRadius: "20px",
    minHeight: "40px",
    p: "4px",
    "& .MuiTab-root": {
      flex: 1,
      minHeight: "32px",
      borderRadius: "20px",
      textTransform: "none",
      fontWeight: 500,
      color: "#000",
      transition: "all 0.2s ease-in-out",
      "&:hover": {
        bgcolor: "#e5d4ef", // hover background
        color: "#d100f9", // hover text color
      },
      "&.Mui-selected": {
        color: "#fff",
        bgcolor: "#d100f9",
        fontWeight: 600,
      },
    },
  }}
          >
            <Tab label='Notes' />
            <Tab label='Activities' />
            <Tab label='Product' />
          </Tabs>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* Tabs */}

        {/* Tab Panels */}
        {tabIndex === 0 && (
          <Box>
            <NotesSection leadId={leadId} leadData={leadData}/>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            {/* <OpenActivities leadId={leadId} leadData={leadData} /> */}

            <TaskTabs leadId={leadId} leadData={leadData} />
          </Box>
        )}

        {tabIndex === 2 && (
          <Box>
            <ProductPage leadId={leadId} leadData={leadData} fetchLeadFromId={fetchLeadFromId} />
          </Box>
        )}
      </Grid>

      {/* Right side */}
      <Grid item xs={12} md={4}>
        <Box
          sx={{
            position: 'sticky',
            top: 10, // navbar height adjust panni set pannu
            maxHeight: 'calc(100vh - 100px)', // viewport ku match panna
            overflowY: 'auto',
            pr: 1 // scrollbar overlap avoid
          }}
        >
          <LeadCard fields={fields} leadId={leadId} leadData={leadData} onToggleFlag={onToggleFlag}/>

          {/* 🔹 Dynamic Sections */}
          {sections.map((section, index) => (
            <Box mb={2} key={section.id || section.title || index}>
              <Accordion expanded={expanded === index} onChange={() => setExpanded(expanded === index ? false : index)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.values(section.fields)
                      .flat()
                      .filter(Boolean)
                      .map(field => (
                        <Grid item xs={12} sm={12} key={field.id || field.label}>
                          <EditableField
                            label={field.label}
                            field={field}
                            value={fields[field.label]}
                            type={
                              field.label === 'Next Follow-up Date'
                                ? 'date'
                                : field.type === 'Dropdown'
                                  ? 'select'
                                  : 'text'
                            }
                            options={fieldConfig[field.label] || []}
                            onSave={newValue => {
                              if (fieldValidators[field.label]) {
                                const err = fieldValidators[field.label](newValue)
                                if (err) {
                                  toast.error(err)
                                  return
                                }
                              }
                              handleFieldSave(field.label, newValue)
                            }}
                            userList={userList}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}

export default LeadDetailView
