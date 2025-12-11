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
  Drawer,
  Grid,
  IconButton,
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
  Typography,
  useMediaQuery,
  useTheme
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
import { getHierarchyUserListApi, getUserAllListApi } from '@/apiFunctions/ApiAction'
import FlagIcon from '@mui/icons-material/Flag' // ✅ MUI icon
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CloudDownloadIcon from '@mui/icons-material/CloudDownload'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
// import { DateRangePicker, MultiInputDateRangeField } from '@mui/x-date-pickers-pro/DateRangePicker'

import { DemoContainer } from '@mui/x-date-pickers/internals/demo'
import { LocalizationProvider } from '@mui/x-date-pickers-pro/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs'
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const LeadTable = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const loggedInUserId = Cookies.get('user_id')
  const [value, setValue] = React.useState([dayjs().subtract(7, 'day'), dayjs()])
  const loggedInUserName = Cookies.get('user_name')
  const [data, setData] = useState([])
  const [dataFilter, setDataFilter] = useState([])
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [response, setResponse] = useState(null)
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = React.useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [anchorPdfEl, setAnchorPdfEl] = useState(null)
  const [selectedPdfFields, setSelectedPdfFields] = useState([])
  const [fetched, setFetched] = useState(true)

  const [openFilter, setOpenFilter] = useState(false)

  const handleOpenFilter = () => setOpenFilter(true)
  const handleCloseFilter = () => setOpenFilter(false)


  const router = useRouter()
  const { payloadJson } = useSelector(state => state.menu)

 

   const hasAddPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.add_status === true
  }
   const hasEditPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.edit_status === true
  }
   const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.view_status === true
  }
      const hasDeletePermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.delete_status === true
  }
   const hasImportPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.import_status === true
  }
   const hasExportPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false

    const found = payloadJson.find(m => m.menu_privileage_name === 'Leads' && m.sub_menu_privileage_name === '')

    return found?.export_status === true
  }




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
    search: '',
    status: '',
    touch: '',
    source: '',
    region: '',
    assign: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    fromFollowDate: null,
    toFollowDate: null
  })

  const renderFilters = isMobile => (
    <Stack
      direction={isMobile ? 'column' : 'row'} // ← horizontal for desktop
      spacing={1.5}
      flexWrap='wrap'
      alignItems={isMobile ? 'stretch' : 'center'}
    >
      {/* Status */}
      <TextField
        select
        size='small'
        variant='outlined'
        label='Status'
        value={filters.status}
        onChange={e => {
          setFilters({ ...filters, status: e.target.value })
          if (isMobile) handleCloseFilter()
        }}
        sx={{ minWidth: 150 }}
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
        select
        size='small'
        variant='outlined'
        label='Touch'
        value={filters.touch}
        onChange={e => {
          setFilters({ ...filters, touch: e.target.value })
          if (isMobile) handleCloseFilter()
        }}
        sx={{ minWidth: 150 }}
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
        onChange={e => {
          if (isMobile) handleCloseFilter()
          setFilters({ ...filters, assign: e.target.value })
        }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value=''>All</MenuItem>
        {userList.map(u => (
          <MenuItem key={u.user_id} value={u.user_id}>
            {u.user_name}
          </MenuItem>
        ))}
      </TextField>

      {/* Source */}
      <TextField
        select
        size='small'
        variant='outlined'
        label='Source'
        value={filters.source}
        onChange={e => {
          if (isMobile) handleCloseFilter()
          setFilters({ ...filters, source: e.target.value })
        }}
        sx={{ minWidth: 150 }}
      >
        <MenuItem value=''>All</MenuItem>
        {uniqueSources.map(source => (
          <MenuItem key={source} value={source}>
            {source}
          </MenuItem>
        ))}
      </TextField>

      {/* Clear All */}
      <Button
        variant='text'
        sx={{ color: '#009cde', fontWeight: 500, minWidth: 120 }}
        onClick={() => {
          if (isMobile) handleCloseFilter()
          setFilters({
            search: '',
            status: '',
            touch: '',
            assign: '',
            company: '',
            city: '',
            label: '',
            fromDate: null,
            toDate: null,
            fromFollowDate: null,
            toFollowDate: null
          })
          
        }}
      >
        Clear All
      </Button>
    </Stack>
  )

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
      console.log('cal1')
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
        console.log('calling 5555')
        fetchData()
      } else {
        toast.success('Flag Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        console.log('calling 6666')
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

    const payload = {
      page: page + 1,
      limit,
      organization_id,
      form_name,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.touch && { touch: filters.touch }),
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
      ...(filters.assign && { assign: filters.assign }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') }),
      ...(filters.fromFollowDate && { fromFollow: dayjs(filters.fromFollowDate).format('YYYY-MM-DD') }),
      ...(filters.toFollowDate && { toFollow: dayjs(filters.toFollowDate).format('YYYY-MM-DD') })
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      const res = await fetch(`/api/v1/admin/lead-form/list`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (json.success) {
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

  const handleExcelClick = event => {
    setAnchorExcelEl(event.currentTarget)
  }

  const getUserListFn = async () => {
    try {
      const results = await getHierarchyUserListApi()
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
      console.log('cal5')
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
        fetchData()
      } else {
        toast.error('File not uploaded !!!', { autoClose: 1000 })
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
    if (payloadJson.length > 0) {
      if (!hasViewPermission()) {
        router.push('/')
      }
    }
  }, [payloadJson])

  useEffect(() => {
    if (!fetched && sections) {
      fetchData()
    }
  }, [page, limit])

  useEffect(() => {
    console.log("fetchFormTemplate() call 4")
    fetchFormTemplate()
    getUserListFn()
    setFetched(false)
  }, [])

  useEffect(() => {
    const { search, fromDate, toDate, fromFollowDate, toFollowDate, ...otherFilters } = filters

    const hasOtherFilters = Object.values(otherFilters).some(v => v !== '')
    const hasDateRange = Boolean(fromDate && toDate)
    const hasDateFollowRange = Boolean(fromFollowDate && toFollowDate)
    const hasSearch = Boolean(search && search.trim() !== '')

    // ✅ Debounced API call — fires only once after 500ms
    const handler = setTimeout(() => {
      if (hasOtherFilters || hasDateRange || hasSearch || hasDateFollowRange) {
        fetchData()
      } else {
        if (!fromDate && !toDate && !fromFollowDate && !toFollowDate) {
          fetchData()
        }
      }
    }, 500)

    // ✅ Cleanup timeout on dependency change
    return () => clearTimeout(handler)
  }, [filters])

  return (
    <Box px={2} py={2}>
      {/* 🔹 Header */}

      <Grid container alignItems='center' justifyContent='space-between' spacing={2} mb={3}>
        {/* Title */}
        <Grid item xs={12} md='auto' sx={{ mb: isMobile ? 2 : 0 }}>
          <Typography variant='h6' fontWeight='bold'>
            Lead List
          </Typography>
        </Grid>

        {/* Buttons */}
        <Grid item xs={12} md>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            spacing={1.5}
            alignItems={isMobile ? 'stretch' : 'center'}
            justifyContent={isMobile ? 'flex-start' : 'flex-end'}
          >
            {/* Export Button */}
            {
              hasExportPermission() &&
              <>
                <Button
              variant='outlined'
              size='small'
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleClick}
              fullWidth={isMobile}
            >
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
              </>
               
            }
           

           {
            hasImportPermission() && 
            <Button
              variant='outlined'
              size='small'
              startIcon={<CloudUploadIcon />}
              component='label'
              sx={{
                color: '#1976d2',
                borderColor: '#E0E0E0',
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              fullWidth={isMobile}
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
           }

           

            {/* Sample Data */}
            <Button
              variant='outlined'
              size='small'
              startIcon={<CloudDownloadIcon />}
              sx={{
                color: '#388e3c',
                borderColor: '#E0E0E0',
                bgcolor: '#fff',
                '&:hover': { bgcolor: '#f1f8e9' }
              }}
              href='/sample/sample_lead_data.xlsx'
              download
              fullWidth={isMobile}
            >
              Sample Data
            </Button>

            {/* New Lead */}
            {
              hasAddPermission() &&
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
              fullWidth={isMobile}
            >
              + New Lead
            </Button>
            }
           
          </Stack>
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
              onKeyDown={e => e.key === 'Enter' && fetchData()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                )
              }}
              fullWidth={isMobile}
            />

            {/* Mobile Filter Icon */}
            {isMobile && (
              <IconButton onClick={handleOpenFilter} color='primary'>
                <FilterListIcon />
              </IconButton>
            )}

            {/* Desktop Filters */}
            {!isMobile && renderFilters(isMobile)}
          </Box>

          {/* Mobile Drawer */}
          <Drawer anchor='right' open={openFilter} onClose={handleCloseFilter}>
            <Box p={2} width={250}>
              {renderFilters(isMobile)}
            </Box>
          </Drawer>
        </Grid>

        {/* 🔹 Right Column: Table + Actions */}
        <Grid item xs={12} sm={12}>
          <Box sx={{ width: '100%', overflowX: 'auto', maxHeight: 800 }}>
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
                  <TableCell sx={{ minWidth: 50, maxWidth: 150, whiteSpace: 'nowrap' }}>S.No</TableCell>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 9,
                      minWidth: isMobile? 50 : 250
                    }}
                  >
                    Full Name
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Company</TableCell>
                  <TableCell sx={{ minWidth: 50, maxWidth: 80, whiteSpace: 'nowrap' }}>Flag</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Timeline to Buy</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Next Follow-up</TableCell>

                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Assigned To</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Label</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Last Contact Date</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Created By</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? [...Array(limit)].map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 14 }).map((_, j) => (
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
                            backgroundColor: '#fff',
                            minWidth: 50
                          }}
                        >
                          <strong>{page * limit + i + 1}</strong>
                        </TableCell>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            minWidth: isMobile? 50 : 250
                          }}
                        >
                          {
                            hasViewPermission() ? 
                             <Link
                            href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(row.lead_id))}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <strong>
                              <Tooltip
                                title={`${row.values['First Name'] || ''} ${row.values['Last Name'] || ''}`.trim()}
                                arrow
                              >
                                <span>
                                  {`${row.values['First Name'] || ''} ${row.values['Last Name'] || ''}`.trim() || ''}
                                </span>
                              </Tooltip>
                            </strong>
                          </Link> :
                          `${row.values['First Name'] || ''} ${row.values['Last Name'] || ''}`.trim() || ''
                          }
                         


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
                          <Tooltip
                            title={
                              row.values['Lead Status'] === 'Closed Lost'
                                ? Array.isArray(row.values['Loss Reasons']) && row.values['Loss Reasons'].length > 0
                                  ? row.values['Loss Reasons'].join(', ')
                                  : 'No Loss Reasons'
                                : row.values['Lead Status'] === 'Closed Won'
                                  ? Array.isArray(row.values['Win Reasons']) && row.values['Win Reasons'].length > 0
                                    ? row.values['Win Reasons'].join(', ')
                                    : 'No Win Reasons'
                                  : ''
                            }
                            arrow
                            enterDelay={300}
                            leaveDelay={150}
                          >
                            <Chip
                              label={row.values['Lead Status'] || 'Unknown'}
                              color={
                                row.values['Lead Status'] === 'New / Attempted Contact'
                                  ? 'primary'
                                  : row.values['Lead Status'] === 'Contacted / Qualification'
                                    ? 'success'
                                    : row.values['Lead Status'] === 'Demo / Proposal Stage'
                                      ? 'secondary'
                                      : row.values['Lead Status'] === 'Negotiation / Ready to Close'
                                        ? 'default'
                                        : row.values['Lead Status'] === 'Closed Lost'
                                          ? 'warning'
                                          : row.values['Lead Status'] === 'Closed Won'
                                            ? 'success'
                                            : row.values['Lead Status'] === 'Invalid / Junk / Wrong Contact'
                                              ? 'warning'
                                              : row.values['Lead Status'] === 'Call Back'
                                                ? 'error'
                                                : 'default'
                              }
                              size='small'
                            />
                          </Tooltip>
                        </TableCell>

                        <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.values['Next Follow-up Date'] ? formatDateShort(row.values['Next Follow-up Date']) : '-'}
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
                  <TableCell
                    colSpan={10}
                    align='center'
                    sx={{
                      py: 8,
                      background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                      border: 'none'
                    }}
                  >
                    <Box
                      display='flex'
                      flexDirection='column'
                      alignItems='center'
                      justifyContent='center'
                      gap={2}
                      sx={{
                        animation: 'fadeIn 0.6s ease-in-out',
                        '@keyframes fadeIn': {
                          '0%': { opacity: 0, transform: 'translateY(10px)' },
                          '100%': { opacity: 1, transform: 'translateY(0)' }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: '#e9ecef',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
                        }}
                      >
                        <i
                          className='ri-search-line'
                          style={{
                            fontSize: 38,
                            color: '#9ca3af'
                          }}
                        ></i>
                      </Box>

                      <Box>
                        <Typography
                          variant='h6'
                          sx={{
                            fontWeight: 600,
                            color: '#64748b'
                          }}
                        >
                          No Records Found
                        </Typography>
                        <Typography
                          variant='body2'
                          sx={{
                            color: '#94a3b8',
                            mt: 0.5
                          }}
                        >
                          Try adjusting filters or adding new data to get started
                        </Typography>
                      </Box>
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
              setLimit(parseInt(e.target.value))
              setPage(0)
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default LeadTable
