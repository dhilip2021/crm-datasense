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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
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

const LeadTable = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')

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

  const [anchorPdfEl, setAnchorPdfEl] = useState(null)
  const [selectedPdfFields, setSelectedPdfFields] = useState([])
  const dynamicPdfFields = data.length > 0 ? Object.keys(data[0].values) : []
  const fieldsPdf = [...new Set([...dynamicPdfFields])]

  const [anchorExcelEl, setAnchorExcelEl] = useState(null)
  const [selectedExcelFields, setSelectedExcelFields] = useState([])
  const dynamicExcelFields = data.length > 0 ? Object.keys(data[0].values) : []
  const fieldsExcel = [...new Set([...dynamicPdfFields])]

  const [filters, setFilters] = useState({
    status: '',
    source: '',
    region: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    search: ''
  })

  const handleDownloadSample = () => {}

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
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
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
      ...(filters.source && { source: filters.source }),
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

  useEffect(() => {
    fetchData()
  }, [page, limit])

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

  const uniqueSources = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Source']))].filter(Boolean)
  }, [dataFilter])

  const uniqueStatus = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Status']))].filter(Boolean)
  }, [dataFilter])

  async function handleUpload(e) {
    e.preventDefault()

    if (!selectedFile) {
      toast.error('Please select a file', {
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

    const formData = new FormData()
    formData.append('file', selectedFile)
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
        toast.success(data.message, {
          autoClose: 1000, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        fetchData()
        setFileName('')
        setSelectedFile(null)
        document.querySelector('input[name="file"]').value = ''
      } else {
        toast.error('File not uploaded !!!', {
          autoClose: 1000, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        fetchData()
        setFileName('')
        setSelectedFile(null)
      }
    } catch (err) {
      console.error(err)
      setFileName('')
      setSelectedFile(null)
      document.querySelector('input[name="file"]').value = ''
    } finally {
      setLoader(false)
    }
  }

  return (
    <Box px={1} py={1}>
      <Box sx={{ p: 4, backgroundColor: '#f9fafb' }}>
        <Grid container direction='column' spacing={4}>
          {/* Header Section */}
          <Grid item>
            <Grid container justifyContent='space-between' alignItems='center'>
              <Typography variant='h5' fontWeight='bold'>
                Leads
              </Typography>

              <form onSubmit={handleUpload}>
                <Box display='flex' flexDirection='row' gap={2}>
                  {/* File Upload */}
                  <Box>
                    {/* Upload Button */}
                    <Button
                      component='label'
                      variant='outlined'
                      color='info'
                      fullWidth
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        mb: 2,
                        py: 1.5,
                        borderColor: 'grey.300',
                        fontWeight: '500',
                        '&:hover': { borderColor: 'primary.main' }
                      }}
                    >
                      Select Excel/CSV File
                      <input
                        type='file'
                        name='file'
                        accept='.csv, .xlsx'
                        hidden
                        onChange={e => {
                          const file = e.target.files[0]
                          if (file) {
                            setSelectedFile(file)
                            setFileName(file.name)
                          }
                        }}
                      />
                    </Button>

                    {/* Loader */}
                    {loader && <LinearProgress sx={{ mb: 2 }} color='info' />}

                    {/* File name + Remove button */}
                    {fileName && (
                      <Stack
                        direction='row'
                        alignItems='center'
                        justifyContent='space-between'
                        sx={{
                          p: 1,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 1,
                          mb: 1,
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <Typography variant='body2' sx={{ color: '#4CAF50', fontWeight: 500 }} noWrap>
                          {fileName}
                        </Typography>
                        <Button
                          variant='outlined'
                          color='error'
                          size='small'
                          onClick={() => {
                            setFileName('')
                            setSelectedFile(null)
                            document.querySelector('input[name="file"]').value = ''
                          }}
                          sx={{ textTransform: 'none', fontSize: '12px', py: 0.3, px: 1.2 }}
                        >
                          Remove
                        </Button>
                      </Stack>
                    )}

                    {/* Download link */}
                    <Box display='flex' justifyContent='flex-end'>
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
                  </Box>

                  <Box>
                    <Button
                      type='submit'
                      variant='contained'
                      color='info'
                      fullWidth
                      disabled={loader}
                      sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                      {loader ? 'Uploading...' : 'Upload & Import'}
                    </Button>
                  </Box>

                  {/* New Lead Button */}
                  <Box>
                    <Button
                      href='/app/lead-form'
                      variant='contained'
                      color='primary'
                      fullWidth
                      disabled={loader}
                      sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                      + New Lead
                    </Button>
                  </Box>
                </Box>
              </form>
            </Grid>
          </Grid>

          {/* Upload Section */}
        </Grid>
      </Box>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2}>
              <TextField
                size='small'
                fullWidth
                label='Search'
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && fetchFilterData()}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                size='small'
                fullWidth
                label='Status'
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value=''>All</MenuItem>
                {uniqueStatus.map(status => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                select
                size='small'
                fullWidth
                label='Source'
                value={filters.source}
                onChange={e => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value=''>All</MenuItem>
                {uniqueSources.map(source => (
                  <MenuItem key={source} value={source}>
                    {source}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='From Date'
                  value={filters.fromDate}
                  onChange={val => setFilters({ ...filters, fromDate: val })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='To Date'
                  value={filters.toDate}
                  onChange={val => setFilters({ ...filters, toDate: val })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant='contained' color='success' fullWidth onClick={fetchFilterData}>
                Apply
              </Button>
            </Grid>
          </Grid>

          <Box mt={2} display='flex' justifyContent={'flex-end'} gap={1}>
            <Button variant='outlined' onClick={handleExcelClick} startIcon={<GridOnIcon />}>
              Export Excel
            </Button>

            {/* Excel Menu */}
            <Menu
              anchorEl={anchorExcelEl}
              open={Boolean(anchorExcelEl)}
              onClose={handleExcelClose}
              PaperProps={{
                style: { maxHeight: 300, width: 250 }
              }}
            >
              {/* Select All */}
              <MenuItem
                onClick={() => {
                  if (selectedExcelFields.length === fieldsExcel.length) {
                    setSelectedExcelFields([]) // unselect all
                  } else {
                    setSelectedExcelFields(fieldsExcel) // select all
                  }
                }}
              >
                <Checkbox
                  checked={selectedExcelFields.length === fieldsExcel.length}
                  indeterminate={selectedExcelFields.length > 0 && selectedExcelFields.length < fieldsExcel.length}
                />
                <ListItemText primary='Select All' primaryTypographyProps={{ fontWeight: 'bold' }} />
              </MenuItem>

              <Divider />

              {/* Individual fields */}
              {fieldsExcel.map(field => (
                <MenuItem key={field} onClick={() => handleExcelToggle(field)}>
                  <Checkbox checked={selectedExcelFields.includes(field)} />
                  <ListItemText primary={field} />
                </MenuItem>
              ))}

              <Divider />
              <MenuItem onClick={exportToExcel} sx={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                Confirm Export
              </MenuItem>
            </Menu>

            {/* 🔥 FIX HERE - use handlePDFClick instead of handleDrop */}
            <Button variant='outlined' onClick={handlePDFClick} startIcon={<PictureAsPdfIcon />}>
              Export PDF
            </Button>

            {/* PDF Menu */}
            <Menu
              anchorEl={anchorPdfEl}
              open={Boolean(anchorPdfEl)}
              onClose={handlePdfClose}
              PaperProps={{
                style: { maxHeight: 300, width: 250 }
              }}
            >
              {/* Select All */}
              <MenuItem
                onClick={() => {
                  if (selectedPdfFields.length === fieldsPdf.length) {
                    setSelectedPdfFields([]) // unselect all
                  } else {
                    setSelectedPdfFields(fieldsPdf) // select all
                  }
                }}
              >
                <Checkbox
                  checked={selectedPdfFields.length === fieldsPdf.length}
                  indeterminate={selectedPdfFields.length > 0 && selectedPdfFields.length < fieldsPdf.length}
                />
                <ListItemText primary='Select All' primaryTypographyProps={{ fontWeight: 'bold' }} />
              </MenuItem>

              <Divider />

              {/* Individual fields */}
              {fieldsPdf.map(field => (
                <MenuItem key={field} onClick={() => handlePdfToggle(field)}>
                  <Checkbox checked={selectedPdfFields.includes(field)} />
                  <ListItemText primary={field} />
                </MenuItem>
              ))}

              <Divider />
              <MenuItem onClick={exportToPDF} sx={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                Confirm Export
              </MenuItem>
            </Menu>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* 🔥 Scrollable and Skeleton Table */}

          <Box sx={{ width: '100%', overflowX: 'auto', maxHeight: 500 }}>
            <Table stickyHeader size='small' sx={{ minWidth: 1200 }}>
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
                  <TableCell>City</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Timeline to Buy</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Assigned To</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Label</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Last Contact Date</TableCell>
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
                          <Tooltip title={row.values['Company'] || ''} arrow>
                            {row.values['First Name']}
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
                          <Tooltip title={row.values['Company'] || ''} arrow>
                            <span>{row.values['Company']}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{row.values['City']}</TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <Chip
                            label={row.values['Timeline to Buy']}
                            sx={{
                              backgroundColor:
                                row.values['Timeline to Buy'] == '3–6 Months'
                                  ? '#00FF48'
                                  : row.values['Timeline to Buy'] == '6+ Months'
                                    ? '#FF8800'
                                    : '#FF0000',
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
                                (row.values['lead_score'] || 0) >= 75
                                  ? '#d32f2f'
                                  : (row.values['lead_score'] || 0) >= 50
                                    ? '#ff9800'
                                    : '#1976d2',
                              color: '#fff',
                              px: 1.5,
                              py: 0.5,
                              borderRadius: '50%',
                              fontSize: '0.8rem',
                              fontWeight: 'bold',
                              display: 'inline-block',
                              textAlign: 'center'
                            }}
                          >
                            {row.values['lead_score'] || 0}
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
                  <TableCell
                    colSpan={10}
                    align='center'
                    sx={{
                      py: 0,
                      border: 'none',
                      backgroundColor: '#f9fafb',
                      height: 300
                    }}
                  >
                    <Typography
                      variant='h5'
                      sx={{
                        fontWeight: 'bold',
                        color: '#9e9e9e',
                        letterSpacing: 0.5
                      }}
                    >
                      🚫 No record found!
                    </Typography>
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
            rowsPerPageOptions={[5, 10, 20, 50, 100, 500]}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default LeadTable
