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
import slugify from 'slugify'
import ProposalDialogPage from './ProposalDialogPage'

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


const generateQuotationNumber = (leadData) => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-4) // last 4 digits
  const leadInc = leadData?.auto_inc_id || '0000'

  return `QTN-${yyyy}${mm}${dd}-${leadInc}-${timestamp}`
}

const LeadDetailView = () => {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id)

  const leadId = decrypCryptoReq(encryptedId)
  const [expanded, setExpanded] = useState(0) // 0 = first open by default
  const [tabIndex, setTabIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [userList, setUserList] = useState([])
  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
  const opportunity_form = 'opportunities-form'
  const getToken = Cookies.get('_token')
  const router = useRouter()
  const [loader, setLoader] = useState(false)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [sectionsOpportunity, setSectionsOpportunity] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [fieldOpportunityConfig, setFieldOpportunityConfig] = useState({})
  const [itemsData, setItemsData] = useState([])
  const [confirm, setConfirm] = useState(false)
  const [orderId, setOrderId] = useState('')

  // 🧠 leadData = API response object you shared above
  const [accountName, setAccountName] = useState('')
  const [contactName, setContactName] = useState('')
  const [createDeal, setCreateDeal] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  // ✅ Filter items by selected orderId
  const [dataItems, setDataItems] = useState([])

  // 🧩 Prefill default values from leadData
  const [dealData, setDealData] = useState({
    amount: '',
    dealName: leadData?.values?.Company || accountName || '',
    closingDate: null,
    stage: leadData?.values?.['Lead Status'] || 'Qualification'
  })

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

  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue)
    if (newValue === 2) {
      setOpen(true)
    }
  }
  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${opportunity_form}`,
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

  // 🔹 Fetch template
  const fetchOpportunityFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${opportunity_form}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
      )
      const json = await res.json()
      if (json?.success && json.data?.sections?.length > 0) {
        setSectionsOpportunity(json.data.sections)

        const flattened = flattenFields(json.data.sections)
        const config = {}
        flattened.forEach(field => {
          if (field.type === 'Dropdown' && field.options?.length > 0) {
            config[field.label] = field.options
          }
        })
        setFieldOpportunityConfig(config)
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
    console.log("fetchFormTemplate() call 8")
    fetchFormTemplate()
    fetchOpportunityFormTemplate()
  }, [])

  // Fetch products from API
  useEffect(() => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    if (open) {
      setLoader(true)
      fetch('/api/v1/admin/item-master/list', { headers: header })
        .then(res => res.json())
        .then(data => {
          setLoader(false)

          if (data.appStatusCode === 0) setItemsData(data.payloadJson)
        })
    }
  }, [open])

  const onToggleFlag = async row => {
    const leadId = row?.lead_id

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


  const dealFnCall = order_ID => {
  if (!leadData?.items || leadData.items.length === 0 || !order_ID) {
    setDataItems([])
    return
  }

  // Find the matching item group by orderId
  const selectedOrder = leadData.items.find(item => item.item_id === order_ID)
  const items = selectedOrder?.item_ref || []

  // ✅ Generate Quotation Number
  const quotationNumber = generateQuotationNumber(leadData)

  // ✅ Attach quotation number to each item or store globally
  const itemsWithQTN = items.map(item => ({ ...item, quotationNumber }))

  console.log('Generated Quotation Number:', quotationNumber)
  setDataItems(itemsWithQTN)
  setOrderId(order_ID)
  setConfirm(true)
}

  const handleQtyChange = (index, value) => {
    const newItems = [...items]
    newItems[index].quantity = Number(value)
    newItems[index].finalPrice = newItems[index].quantity * newItems[index].unitPrice
    setDataItems(newItems)
  }

  const handleClose = () => {
    setConfirm(false)
  }

  const handleConvert = () => {
    console.log(leadData, '<<< deal Data')

    // convertLeadFn(leadData, createDeal, dealData)
    // handleClose()
  }

  const convertLeadFn = async (leadData, createDeal, dealData) => {
    try {
      const id = leadData?._id
      const organization_id = leadData?.organization_id
      const auto_inc_id = leadData?.auto_inc_id
      const lead_id = leadData?.lead_id
      const form_name = createDeal ? 'opportunity-form' : 'lead-form'
      const c_role_id = leadData?.c_role_id
      const c_createdBy = leadData?.c_createdBy
      const c_createdByName = leadData?.c_createdByName
      const submittedAt = leadData?.submittedAt
      const createdAt = leadData?.createdAt
      const updatedAt = new Date().toISOString()

      // 💡 Build new lead_name based on createDeal flag
      const originalName = leadData?.lead_name || ''
      const nextLeadName = createDeal ? originalName.replace(/lead/i, 'OPPORTUNITY') : originalName

      // 💡 Slugify for URL safe name
      const slugLeadString = nextLeadName.replace(/[^\w\s]|_/g, '')
      const slug_lead_name = slugify(slugLeadString, {
        replacement: '-',
        lower: true,
        locale: 'en'
      })

      // 💡 Lead Status update logic
      const values = {
        'Lead Status': createDeal ? dealData?.stage : 'Contacted / Qualification',
        'Deal Name': dealData?.dealName,
        'Expected Revenue': dealData?.amount,
        'Closing Date': new Date(dealData?.closingDate).toISOString().split('T')[0]
      }

      // 🧠 Final payload
      const payload = {
        _id: id,
        form_name,
        lead_name: nextLeadName,
        lead_slug_name: slug_lead_name,
        values,
        lead_touch: 'touch',
        updatedAt: new Date().toISOString()
      }

      // 🔹 If you want to update to API, uncomment below:

      const res = await fetch(`/api/v1/admin/lead-form/${lead_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (result.success) {
        toast.success(createDeal ? 'Lead successfully converted to Opportunity' : 'Lead updated successfully', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
        router.push(createDeal ? '/app/opportunity' : '/app/leads')
      } else {
        toast.error('Update failed, please try again!')
      }
    } catch (err) {
      console.error('❌ Error converting lead:', err)
    }
  }

  useEffect(() => {
    if (leadData) {
      const values = leadData.values || {}
      const firstName = values['First Name']?.trim() || ''
      const lastName = values['Last Name']?.trim() || ''
      const fullContactName = `${firstName} ${lastName}`.trim()
      setAccountName(values['Company'] || '—')
      setContactName(fullContactName || '—')
      setOwnerName(leadData.c_createdByName || '—')
    }
  }, [leadData])

  // 🔹 Save handler
  const handleFieldSave = async (label, newValue, reasonKey, selectedReasons) => {
    try {
      // Base values
      const updatedValues = {
        [label]: newValue
      }

      // 🔹 Add reason fields dynamically
      if (reasonKey && selectedReasons?.length) {
        updatedValues[reasonKey] = selectedReasons
      }

      const updatedLeadValues = {
        _id: leadData?._id,
        organization_id: leadData?.organization_id,
        auto_inc_id: leadData?.auto_inc_id,
        lead_name: leadData?.lead_name,
        lead_id: leadData?.lead_id,
        lead_slug_name: leadData?.lead_slug_name,
        form_name: leadData?.form_name,
        lead_touch: 'touch',
        values: updatedValues, // ✅ both Lead Status + Reasons
        submittedAt: new Date().toISOString(),
        c_role_id: leadData?.c_role_id,
        c_createdBy: leadData?.c_createdBy,
        updatedAt: leadData?.updatedAt,
        createdAt: leadData?.createdAt
      }

      // 🔹 API call
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
        fetchLeadFromId()
      } else {
        toast.success(result?.message || 'Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        fetchLeadFromId()
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
        <Image src={LoaderGif} alt='loading' width={100} height={100} />
      </Box>
    )
  }

  if (!leadData && !loader) {
    return (
      <></>
      // <Card sx={{ p: 4, textAlign: 'center', mt: 3 }}>
      //   <Typography variant='h6'>📝 No lead found</Typography>
      //   <Link href='/app/lead-form'>
      //     <Button variant='contained' size='small'>
      //       + Create New Lead
      //     </Button>
      //   </Link>
      // </Card>
    )
  }

  const fields = leadData?.values || {}

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box
          sx={{
            width: '100%'
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant='fullWidth'
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              minHeight: '44px',
              p: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              '& .MuiTab-root': {
                flex: 1,
                minHeight: '36px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                color: '#444',
                // transition: "all 0.25s ease",
                '&:hover': {
                  bgcolor: '#f0f7ff',
                  color: '#009cde',
                  border: '1px solid #009cde33'
                },
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#009cde',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }
              }
            }}
          >
            <Tab label='Notes' />
            <Tab label='Activities' />
            <Tab label='Items' />
          </Tabs>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* Tabs */}

        {/* Tab Panels */}
        {tabIndex === 0 && (
          <Box>
            <NotesSection leadId={leadId} leadData={leadData} />
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            {/* <OpenActivities leadId={leadId} leadData={leadData} /> */}

            <TaskTabs leadId={leadId} leadData={leadData} fetchLeadFromId={fetchLeadFromId} />
          </Box>
        )}

        {tabIndex === 2 && (
          <Box>
            <ProductPage
              leadId={leadId}
              leadData={leadData}
              fetchLeadFromId={fetchLeadFromId}
              itemsData={itemsData}
              dealFnCall={dealFnCall}
              items={dataItems}
            />
          </Box>
        )}
      </Grid>

      {/* Right side */}
      <Grid item xs={12} md={4}>
        {/* <Box>
          <Button
            disabled={loading}
            fullWidth
            variant='contained'
            color='primary'
            onClick={() => dealFnCall(leadData?._id, leadData?.lead_name)}
          >
            {' '}
            {loading ? <CircularProgress size={18} /> : 'Send Quotation'}
          </Button>
        </Box> */}
        <Box
          sx={{
            position: 'sticky',
            top: 10, // navbar height adjust panni set pannu
            maxHeight: 'calc(100vh - 100px)', // viewport ku match panna
            overflowY: 'auto',
            pr: 1 // scrollbar overlap avoid
          }}
        >
          <LeadCard
            fields={fields}
            leadId={leadId}
            leadData={leadData}
            onToggleFlag={onToggleFlag}
            sections={sections}
            handleFieldSave={handleFieldSave}
          />

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
        <ProposalDialogPage
          open={confirm}
          onClose={handleClose}
          leadData={leadData}
          orderId={orderId}
          dataItems={dataItems}
          handleQtyChange={handleQtyChange}
        />
      </Grid>
    </Grid>
  )
}

export default LeadDetailView
