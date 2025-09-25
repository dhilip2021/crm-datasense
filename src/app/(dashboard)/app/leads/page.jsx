'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
// import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Cookies from 'js-cookie'
import { converDayJsDate, encryptCryptoRes, encryptCryptoResponse, formatDateShort } from '@/helper/frontendHelper'
import Link from 'next/link'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import GridOnIcon from '@mui/icons-material/GridOn'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { toast, ToastContainer } from 'react-toastify'
import { getUserAllListApi } from '@/apiFunctions/ApiAction'
import FlagIcon from '@mui/icons-material/Flag' // ✅ MUI icon
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
// import { DateRangePicker, MultiInputDateRangeField } from '@mui/x-date-pickers-pro/DateRangePicker'

import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'

const LeadTable = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const loggedInUserId = Cookies.get('user_id')
  const [value, setValue] = React.useState([dayjs().subtract(7, 'day'), dayjs()])
  const loggedInUserName = Cookies.get('user_name')
  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([])
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [response, setResponse] = useState(null)
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [anchorPdfEl, setAnchorPdfEl] = useState(null)
  const [selectedPdfFields, setSelectedPdfFields] = useState([])
  const [fetched, setFetched] = useState(false)

  // const dynamicPdfFields = data.length > 0 ? Object.keys(data[0].values) : []
  // const fieldsPdf = [...new Set([...dynamicPdfFields])]

  const [anchorExcelEl, setAnchorExcelEl] = useState(null)
  const [selectedExcelFields, setSelectedExcelFields] = useState([])

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [userList, setUserList] = useState([])
  // const dynamicExcelFields = data.length > 0 ? Object.keys(data[0].values) : []
  // const fieldsExcel = [...new Set([...dynamicPdfFields])]

  // const dynamicPdfFields = data.length > 0 && data[0].values ? Object.keys(data[0].values) : []
  const dynamicPdfFields = data.length > 0 && data[0]?.values ? Object.keys(data[0].values) : []

  const fieldsPdf = [...new Set([...dynamicPdfFields])]

  const dynamicExcelFields = data.length > 0 && data[0].values ? Object.keys(data[0].values) : []
  const fieldsExcel = [...new Set([...dynamicExcelFields])]

  const [filters, setFilters] = useState({
    status: '',
    touch: '',
    source: '',
    region: '',
    assign: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    search: ''
  })

  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      const fieldsObj = section.fields || {} // ← safeguard
      Object.values(fieldsObj).forEach(fieldGroup => {
        ;(fieldGroup || []).forEach(field => {
          flat.push({
            sectionName: section.title || section.sectionName || '',
            ...field
          })
        })
      })
    })
    return flat
  }

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
        console.log("cal 6")
        fetchData()
      } else {
        toast.success('Flag Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        console.log("cal 7")
        fetchData()
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error(err)
    }
  }

  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    const lead_form = 'lead-form'
    // setLoader(true)
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

        // const flattened = flattenFields(json.data.sections)
        // const config = {}
        // flattened.forEach(field => {
        //   if (field.type === 'Dropdown' && field.options?.length > 0) {
        //     config[field.label] = field.options
        //   }
        // })

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

  const fetchData = async () => {
    setLoading(true)

    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      page: page + 1,
      limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.touch && { touch: filters.touch }),
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
      ...(filters.assign && { assign: filters.assign }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
    })

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`, {
        method: 'GET',
        headers: header
      })
      const json = await res.json()
      if (json.success) {
        console.log(json.data, '<<< dataaaaaa')
        setData(json.data)
        setDataFilter(json.data)
        setTotal(json.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePDFClick = event => {
    setAnchorPdfEl(event.currentTarget)
  }

  const handlePdfClose = () => {
    setAnchorPdfEl(null)
  }

  const handlePdfToggle = field => {
    if (selectedPdfFields.includes(field)) {
      setSelectedPdfFields(prev => prev.filter(f => f !== field))
    } else {
      setSelectedPdfFields(prev => [...prev, field])
    }
  }

  const handleExcelClick = event => {
    setAnchorExcelEl(event.currentTarget)
  }

  const handleExcelClose = () => {
    setAnchorExcelEl(null)
  }

  const handleExcelToggle = field => {
    if (selectedExcelFields.includes(field)) {
      setSelectedExcelFields(prev => prev.filter(f => f !== field))
    } else {
      setSelectedExcelFields(prev => [...prev, field])
    }
  }

  const fetchFilterData = async () => {
    console.log(selectedUsers, '<<< SELECTED USERSSSS')
    setLoading(true)
    const organization_id = Cookies.get('organization_id')
    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      page: page + 1,
      limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.touch && { touch: filters.touch }),
      ...(filters.source && { source: filters.source }),
      ...(filters.assign && { assign: filters.assign }),
      ...(filters.region && { region: filters.region }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
    })

    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`, {
        method: 'GET',
        headers: header
      })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        setTotal(json.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    if (selectedExcelFields.length === 0) {
      toast.error('Please select at least one field to export', {
        autoClose: 500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      return
    }

    // Columns → selected fields
    const columns = selectedExcelFields

    // Rows → map each lead values to only selected fields
    const rows = data.map(d => {
      const row = {}
      selectedExcelFields.forEach(field => {
        switch (field) {
          case 'Lead ID':
            row[field] = d.lead_id
            break
          case 'Name':
            row[field] = d.values['First Name'] || ''
            break
          case 'Company':
            row[field] = d.values['Company'] || ''
            break
          case 'Status':
            row[field] = d.values['Lead Status'] || ''
            break
          case 'Assigned To':
            row[field] = d.values['Assigned To'] || ''
            break
          case 'Phone':
            row[field] = d.values['Phone'] || ''
            break
          case 'Email':
            row[field] = d.values['Email'] || ''
            break
          case 'City':
            row[field] = d.values['City'] || ''
            break
          case 'Country':
            row[field] = d.values['Country'] || ''
            break
          case 'Next Follow-up Date':
            row[field] = d.values['Next Follow-up Date'] ? formatDateShort(d.values['Next Follow-up Date']) : ''
            break
          case 'Last Contact Date':
            row[field] = converDayJsDate(d.updatedAt)
            break
          case 'Score':
            row[field] = d.values['Score'] || 0
            break
          default:
            row[field] = d.values[field] || '' // fallback for dynamic fields
        }
      })
      return row
    })

    // Convert to sheet
    const sheet = XLSX.utils.json_to_sheet(rows, { header: columns })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Leads')
    XLSX.writeFile(wb, 'leads_export.xlsx')

    handleExcelClose()
  }

  // Replace your existing exportToPDF function with this:
  const exportToPDF = () => {
    if (selectedPdfFields.length === 0) {
      toast.error('Please select at least one field to export', {
        autoClose: 500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      return
    }

    const doc = new jsPDF()

    // PDF columns → selectedPdfFields la irukkara names
    const columns = selectedPdfFields

    // PDF rows → dynamic mapping from data
    const rows = data.map(d =>
      selectedPdfFields.map(field => {
        switch (field) {
          case 'Lead ID':
            return d.lead_id
          case 'Name':
            return d.values['First Name'] || ''
          case 'Company':
            return d.values['Company'] || ''
          case 'Status':
            return d.values['Lead Status'] || ''
          case 'Assigned To':
            return d.values['Assigned To'] || ''
          case 'Phone':
            return d.values['Phone'] || ''
          case 'Email':
            return d.values['Email'] || ''
          case 'City':
            return d.values['City'] || ''
          case 'Country':
            return d.values['Country'] || ''
          case 'Next Follow-up Date':
            return d.values['Next Follow-up Date'] ? formatDateShort(d.values['Next Follow-up Date']) : ''
          case 'Last Contact Date':
            return converDayJsDate(d.updatedAt)
          case 'Score':
            return d.values['Score'] || 0
          default:
            return d.values[field] || '' // fallback
        }
      })
    )

    autoTable(doc, { head: [columns], body: rows })
    doc.save('leads_export.pdf')

    handlePdfClose()
  }

  const getUserListFn = async () => {
    try {
      const results = await getUserAllListApi()
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setUserList(results.payloadJson)
      } else {
        setUserList([])
      }
    } catch {
      setUserList([])
    }
  }

  const uniqueSources = useMemo(() => {
    console.log(fieldConfig, '<<< Field Config')
    if (fieldConfig && Array.isArray(fieldConfig['Lead Source'])) {
      return [...fieldConfig['Lead Source']]
    }
    return [] // fallback empty array
  }, [fieldConfig])

  const uniqueStatus = useMemo(() => {
    if (fieldConfig && Array.isArray(fieldConfig['Lead Status'])) {
      return [...fieldConfig['Lead Status']]
    }
    return [] // fallback empty array
  }, [fieldConfig])

  async function handleUpload(file) {
    if (!file) {
      toast.error('Please select a file', { autoClose: 500 })
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('organization_id', organization_id)

    setLoader(true)

    try {
      const res = await fetch('/api/v1/admin/lead-form/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken}` // ✅ only auth header
        },
        body: formData
      })

      const data = await res.json()
      if (data?.success) {
        toast.success(data.message, { autoClose: 1000 })
        console.log("cal 3")
        fetchData()
      } else {
        toast.error('File not uploaded !!!', { autoClose: 1000 })
        console.log("cal 4")
        fetchData()
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong', { autoClose: 1000 })
    } finally {
      setFileName('')
      setSelectedFile(null)
      document.querySelector('input[name="file"]').value = ''
      setLoader(false)
    }
  }

 useEffect(() => {
  if (!fetched) {
    console.log("cal 5")
    fetchData()
    setFetched(true)
  }
}, [sections, fetched])


  useEffect(() => {
    fetchFormTemplate()
    getUserListFn()
  }, [page, limit])

  // useEffect(() => {
  //   if ((!filters.search && !filters.fromDate  && !filters.toDate) ) {
  //     console.log("cal 1")
  //     fetchFilterData()
  //   }else if(filters.fromDate && filters.toDate){
  //     console.log("cal 2")
  //      fetchFilterData()
  //   }
  // }, [filters])

  useEffect(() => {
  const { search, fromDate, toDate, ...otherFilters } = filters

  const hasOtherFilters = Object.values(otherFilters).some(v => v !== '')
  const hasDateRange = fromDate && toDate
  const hasSearch = search && search.trim() !== ''

  if (hasOtherFilters || hasDateRange || hasSearch) {
    console.log("fetching filters...")
    fetchFilterData()
  } else {
    console.log("❌ skipped fetch (all filters empty)")
  }
}, [filters])

  return (
    <Box px={2} py={2}>
      {/* 🔹 Header */}
      {/* <Grid container justifyContent='space-between' alignItems='center' mb={3}>
       
        <Grid item xs={12} sm={6}>
          <form onSubmit={handleUpload}>
            <Box display='flex' gap={2}>
              
              {fileName && <Typography sx={{ lineHeight: 2 }}>{fileName}</Typography>}
            </Box>
            <Box>
              <Typography
                component='a'
                href='/sample/sample_lead_data.xlsx'
                download
                variant='body2'
                sx={{
                  cursor: 'pointer',
                  color: '#1976d2',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  '&:hover': { color: 'primary.dark' }
                }}
              >
                Download sample excel
              </Typography>
            </Box>
          </form>
        </Grid>

        <Grid item xs={12} sm={3} textAlign='right'>
          <Box mb={2} display='flex' justifyContent='flex-end' gap={1}>
            <Button variant='outlined' onClick={handleExcelClick} startIcon={<GridOnIcon />}>
              Export Excel
            </Button>
            <Button variant='outlined' onClick={handlePDFClick} startIcon={<PictureAsPdfIcon />}>
              Export PDF
            </Button>
          </Box>
        </Grid>

     
         <Grid item xs={12} sm={3} textAlign='right'>
                 <Button type='submit' component='label' variant='outlined' color='info' startIcon={<CloudUploadIcon />}>
                {loader ? 'Uploading...' : 'Import'}
                <input
                  type='file'
                  name='file'
                  accept='.csv, .xlsx'
                  hidden
                  onChange={e => {
                    const file = e.target.files[0]
                    if (file) handleUpload(file)
                  }}
                />
              </Button>  
         </Grid>
        <Grid item xs={12} sm={3} textAlign='right'>
             

          <Button
            href='/app/lead-form'
            variant='contained'
            sx={{
              color: '#ffffff',
              bgcolor: '#009CDE',
              '&:hover': {
                bgcolor: '#007bb5' // hover color
              }
            }}
            disabled={loader}
          >
            + New Lead
          </Button>
        </Grid>
      </Grid> */}

      <Grid container alignItems='center' justifyContent='space-between' mb={3}>
        {/* Left Side: Title */}
        <Grid item>
          <Typography variant='h6' fontWeight='bold'>
            Leads
          </Typography>
        </Grid>

        {/* Right Side: Actions */}
        <Grid item>
          <Box display='flex' alignItems='center' gap={1.5}>
            {/* Export Dropdown */}
            <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleClick}>
              Export
            </Button>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem
                onClick={() => {
                  handleExcelClick()
                  handleClose()
                }}
              >
                Export Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handlePDFClick()
                  handleClose()
                }}
              >
                Export PDF
              </MenuItem>
            </Menu>

            {/* Import */}
            <Button
              variant='outlined'
              size='small'
              startIcon={<CloudUploadIcon />}
              component='label'
              sx={{ color: '#1976d2', borderColor: '#E0E0E0', bgcolor: '#fff' }}
            >
              Import
              <input
                type='file'
                hidden
                accept='.csv,.xlsx'
                onChange={e => {
                  const file = e.target.files[0]
                  if (file) handleUpload(file)
                }}
              />
            </Button>

            {/* New Lead */}
            <Button
              href='/app/lead-form'
              variant='contained'
              size='small'
              sx={{
                bgcolor: '#009cde',
                color: '#fff',
                fontWeight: 500,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#007bb5' }
              }}
              disabled={loader}
            >
              + New Lead
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* 🔹 Left Column: Filters */}

        <Grid item xs={12}>
          <Box display='flex' alignItems='center' gap={1.5} flexWrap='wrap' sx={{ mb: 2 }}>
            {/* Search */}
            <TextField
              autoComplete='off'
              size='small'
              placeholder='Search'
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && fetchFilterData()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
            />
            {/* Status */}
            <TextField
              select
              size='small'
              variant='outlined'
              label='Status'
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              sx={{ minWidth: 120, maxWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value=''>All</MenuItem>
              {uniqueStatus.map(status => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>

            {/* Touch */}
            <TextField
              autoComplete='off'
              size='small'
              variant='outlined'
              select
              label='Touch'
              value={filters.touch}
              onChange={e => setFilters({ ...filters, touch: e.target.value })}
              sx={{ minWidth: 120, maxWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value=''>All</MenuItem>
              {['touch', 'untouch'].map(touch => (
                <MenuItem key={touch} value={touch}>
                  {touch}
                </MenuItem>
              ))}
            </TextField>

            {/* Assigned To */}
            <TextField
              select
              size='small'
              variant='outlined'
              label='Assigned to'
              value={filters.assign}
              onChange={e => setFilters({ ...filters, assign: e.target.value })}
              sx={{ minWidth: 140, maxWidth: 160, bgcolor: 'white' }}
            >
              <MenuItem value=''>All</MenuItem>
              {userList.map(u => (
                <MenuItem key={u.user_id} value={u.user_id}>
                  {u.user_name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              autoComplete='off'
              size='small'
              select
              label='Source'
              value={filters.source}
              onChange={e => setFilters({ ...filters, source: e.target.value })}
              sx={{ minWidth: 120, maxWidth: 150, bgcolor: 'white' }}
            >
              <MenuItem value=''>All</MenuItem>
              {uniqueSources.map(source => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </TextField>

            {/* Date Range Picker */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                value={[filters.fromDate, filters.toDate]} // 🔹 filters la connect pannirukken
                label='Date Range'
                onChange={newValue => {
                  setFilters({
                    ...filters,
                    fromDate: newValue[0],
                    toDate: newValue[1]
                  })
                }}
                slotProps={{
                  textField: ({ position }) => ({
                    size: 'small',
                    sx: {
                      minWidth: 250,
                      maxWidth: 280,
                      bgcolor: 'white',
                      mr: position === 'start' ? 1 : 0
                    }
                  })
                }}
              />
            </LocalizationProvider>

            {/* Date Range */}
            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Date Range'
                  value={filters.toDate}
                  onChange={val => setFilters({ ...filters, toDate: val })}
                  slotProps={{
                    textField: { size: 'small', sx: { minWidth: 100, maxWidth: 150, bgcolor: 'white' } }
                  }}
                />
              </LocalizationProvider> */}

            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                value={value}
                onChange={newValue => setValue(newValue)}
                slots={{ field: MultiInputDateRangeField }}
                slotProps={{
                  textField: ({ position }) => ({
                    size: 'small',
                    sx: { minWidth: 180, bgcolor: 'white', mr: position === 'start' ? 1 : 0 }
                  })
                }}
              />
            </LocalizationProvider> */}

            {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
  <Box display="flex" gap={1}>
    <DatePicker
      label="Start Date"
      value={value[0]}
      onChange={(newValue) => setValue([newValue, value[1]])}
      slotProps={{
        textField: {
          size: 'small',
          sx: { minWidth: 180, bgcolor: 'white' },
        },
      }}
    />
    <DatePicker
      label="End Date"
      value={value[1]}
      onChange={(newValue) => setValue([value[0], newValue])}
      slotProps={{
        textField: {
          size: 'small',
          sx: { minWidth: 180, bgcolor: 'white' },
        },
      }}
    />
  </Box>
</LocalizationProvider> */}

            {/* Clear All */}
            <Button
              variant='text'
              sx={{ color: '#009cde', fontWeight: 500, ml: 'auto' }}
              onClick={() =>
                setFilters({
                  search: '',
                  status: '',
                  touch: '',
                  assign: '',
                  company: '',
                  city: '',
                  label: '',
                  toDate: null
                })
              }
            >
              Clear All
            </Button>
          </Box>
        </Grid>

        {/* 🔹 Right Column: Table + Actions */}
        <Grid item xs={12} sm={12}>
          <Box sx={{ width: '100%', overflowX: 'auto', maxHeight: 500 }}>
            <Table
              stickyHeader
              size='small'
              sx={{
                minWidth: 1200,
                borderRadius: 2,
                boxShadow: '0px 3px 8px rgba(0,0,0,0.05)',
                '& .MuiTableRow-root:hover': {
                  backgroundColor: '#f1f5f9',
                  cursor: 'pointer'
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid #e0e0e0',
                  py: 1.5
                },
                '& .MuiTableCell-stickyHeader': {
                  backgroundColor: '#fff',
                  color: '#333',
                  fontWeight: 'bold',
                  letterSpacing: 0.5
                }
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 9,
                      minWidth: 120
                    }}
                  >
                    Lead ID
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>First Name</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Company</TableCell>
                  <TableCell sx={{ minWidth: 50, maxWidth: 80, whiteSpace: 'nowrap' }}>Flag</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Timeline to Buy</TableCell>
                  <TableCell>Status</TableCell>

                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Assigned To</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Label</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Last Contact Date1</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Next Follow-up</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Created By</TableCell>
                  {/* <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Action</TableCell> */}
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? [...Array(limit)].map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 13 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton variant='text' width='100%' />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : data.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            minWidth: 120
                          }}
                        >
                          <Link
                            href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(row.lead_id))}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <strong>{row.lead_id}</strong>
                          </Link>
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <Tooltip title={row.values['First Name'] || ''} arrow>
                            {row.values['First Name'] || ''}
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <Tooltip title={row.values['Company'] || ''} arrow enterDelay={300} leaveDelay={150}>
                            <span
                              style={{
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {row.values['Company']}
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          onClick={() => onToggleFlag(row)}
                          sx={{ minWidth: 50, maxWidth: 80, whiteSpace: 'nowrap' }}
                        >
                          {row.lead_flag === 0 ? (
                            <FlagIcon sx={{ color: 'grey' }} /> // 0 -> orange flag
                          ) : (
                            <FlagIcon sx={{ color: 'orange' }} /> // 1 -> green flag
                          )}
                        </TableCell>

                        <TableCell>{row.values['City']}</TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <Chip
                            label={row.values['Timeline to Buy'] ? row.values['Timeline to Buy'] : '-'}
                            sx={{
                              color: '#ffffff',
                              backgroundColor:
                                row.values['Timeline to Buy'] == '3–6 Months'
                                  ? '#00FF48'
                                  : row.values['Timeline to Buy'] == '6+ Months'
                                    ? '#FF8800'
                                    : row.values['Timeline to Buy'] == 'Immediately'
                                      ? '#FF0000'
                                      : '#ffffff',
                              fontWeight: 'bold'
                            }}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.values['Lead Status'] || 'Unknown'}
                            color={
                              row.values['Lead Status'] === 'New'
                                ? 'primary'
                                : row.values['Lead Status'] === 'Contacted'
                                  ? 'info'
                                  : row.values['Lead Status'] === 'Qualified'
                                    ? 'success'
                                    : row.values['Lead Status'] === 'Proposal Sent'
                                      ? 'secondary'
                                      : row.values['Lead Status'] === 'Negotiation'
                                        ? 'default'
                                        : row.values['Lead Status'] === 'Closed Lost'
                                          ? 'warning'
                                          : row.values['Lead Status'] === 'Closed Won'
                                            ? 'success'
                                            : row.values['Lead Status'] === 'Attempted to Contact'
                                              ? 'warning'
                                              : row.values['Lead Status'] === 'Lost Lead - No Requirements'
                                                ? 'error'
                                                : row.values['Lead Status'] === 'No Response/Busy'
                                                  ? 'warning'
                                                  : row.values['Lead Status'] === 'Lost Lead - Already Using'
                                                    ? 'error'
                                                    : row.values['Lead Status'] === 'Interested'
                                                      ? 'warning'
                                                      : row.values['Lead Status'] === 'Demo Scheduled'
                                                        ? 'warning'
                                                        : row.values['Lead Status'] === 'Need to Schedule Demo'
                                                          ? 'warning'
                                                          : row.values['Lead Status'] === 'Demo Completed'
                                                            ? 'warning'
                                                            : row.values['Lead Status'] === 'Call Back'
                                                              ? 'warning'
                                                              : 'default'
                            }
                            size='small'
                          />
                        </TableCell>

                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.assignedTo}
                        </TableCell>
                        <TableCell>{row.values['Lead Source']}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor:
                                (row.values['Score'] || 0) >= 75
                                  ? '#f44336'
                                  : (row.values['Score'] || 0) >= 40
                                    ? '#ff9800'
                                    : '#2196f3',
                              color: '#fff',
                              px: 1.5,
                              py: 1,
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                            title={`Lead Score: ${row.values['Score'] || 0}`}
                          >
                            {row.values['Score'] || 0}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <Chip
                            label={
                              (row.values['Score'] || 0) >= 75
                                ? '🔥 Hot Lead'
                                : (row.values['Score'] || 0) >= 40
                                  ? '🟡 Warm Lead'
                                  : '❄️ Cold Lead'
                            }
                            sx={{
                              backgroundColor:
                                (row.values['Score'] || 0) >= 75
                                  ? '#ffcdd2'
                                  : (row.values['Score'] || 0) >= 40
                                    ? '#fff3cd'
                                    : '#bbdefb',
                              fontWeight: 'bold'
                            }}
                            size='small'
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {converDayJsDate(row.updatedAt)}
                        </TableCell>
                        <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {formatDateShort(row.values['Next Follow-up Date'])}
                        </TableCell>
                        <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.createdByName}
                        </TableCell>

                        {/* <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <Box display={'flex'}>
                            <Tooltip title={`Edit ${row.values['First Name']} Lead`} arrow>
                              <Link
                                href={`/app/lead-form/${encodeURIComponent(encryptCryptoRes(row.lead_id))}`}
                                style={{ textDecoration: 'none' }}
                              >
                                <i className='ri-edit-box-line' style={{ color: '#4caf50', cursor: 'pointer' }}></i>
                              </Link>
                            </Tooltip>
                          </Box>
                        </TableCell> */}
                      </TableRow>
                    ))}
                {!loading && data?.length === 0 && (
                  <TableCell colSpan={13} align='center' sx={{ py: 6, backgroundColor: '#f8f9fa' }}>
                    <Box display='flex' flexDirection='column' alignItems='center' gap={1}>
                      <i className='ri-search-line' style={{ fontSize: 36, color: '#ced4da' }}></i>
                      <Typography variant='h6' color='#adb5bd'>
                        No records found
                      </Typography>
                    </Box>
                  </TableCell>
                )}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component='div'
            count={total}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={limit}
            onRowsPerPageChange={e => {
              setLimit(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[5, 10, 20, 50, 100]}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default LeadTable
