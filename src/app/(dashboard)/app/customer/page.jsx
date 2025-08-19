'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Cookies from 'js-cookie'
import { converDayJsDate, formatDateShort } from '@/helper/frontendHelper'
import Link from 'next/link'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import GridOnIcon from '@mui/icons-material/GridOn'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { toast, ToastContainer } from 'react-toastify'

const CustomerTable = () => {
  const organization_id = Cookies.get('organization_id')
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

    try {
      const res = await fetch(`/api/v1/admin/customer-form/list?${query}`)
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
      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`)
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
    const rows = data.map(d => ({
      'Lead ID': d.lead_id,
      Name: d.values['Full Name'],
      Company: d.values['Company Name'],
      Location: d.values['City / Location'],
      Status: d.values['Status'],
      'Assigned To': d.values['Lead Owner'],
      Source: d.values['Lead Source'],
      Score: d.values['Lead Score'],
      'Last Activity': d.values['Last Activity Date'],
      'Next Follow-up': d.values['Next Follow-up Date']
    }))
    const sheet = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Leads')
    XLSX.writeFile(wb, 'leads_export.xlsx')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const columns = [
      'Customer ID',
      'First Name',
      'Last Name',
      'Location',
      'Status',
      'Assigned To',
      'Source',
      'Score',
      'Last Activity',
      'Next Follow-up'
    ]
    const rows = data.map(d => [
      d.lead_id,
      d.values['Full Name'],
      d.values['Company Name'],
      d.values['City / Location'],
      d.values['Status'],
      d.values['Lead Owner'],
      d.values['Lead Source'],
      d.values['Lead Score'],
      d.values['Last Activity Date'],
      d.values['Next Follow-up Date']
    ])
    autoTable(doc, { head: [columns], body: rows })
    doc.save('leads_export.pdf')
  }

  const uniqueSources = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Source']))].filter(Boolean)
  }, [dataFilter])

  const uniqueStatus = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Status']))].filter(Boolean)
  }, [dataFilter])


  async function handleUpload(e) {
    e.preventDefault()

    if (!selectedFile) {
      // alert('Please select a file')
      toast.error('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('organization_id', organization_id)
    

    setLoader(true)

    try {
      const res = await fetch('/api/v1/admin/customer-form/import', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()
      console.log(data,"<<< DATAAAA")
      toast.success(data.message)
      fetchData()
      setFileName('')
      setSelectedFile(null)
      document.querySelector('input[name="file"]').value = ''
    } catch (err) {
      // toast.error(err)
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
                Customer
              </Typography>

              <form onSubmit={handleUpload}>
                <Box display='flex' flexDirection='row' gap={2}>
                  {/* File Upload */}
                  <Box>
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
                      Select Excel /CSV File
                      <input
                        type='file'
                        name='file'
                        accept=".csv, .xlsx"
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

                    {loader && <LinearProgress sx={{ mb: 2 }} color='info' />}

                    {/* Show File Name + Remove */}
                    {fileName && (
                      <Box display='flex' alignItems='center' gap={1}>
                        <Typography variant='body2' sx={{ mt: 1, color: '#4CAF50', fontWeight: 500 }}>
                          {fileName}
                        </Typography>
                        <Button
                          variant='text'
                          color='error'
                          size='small'
                          onClick={() => {
                            setFileName('')
                            setSelectedFile(null)
                            document.querySelector('input[name="file"]').value = ''
                          }}
                        >
                          X
                        </Button>
                      </Box>
                    )}
                  </Box>

                  {/* Upload Button */}
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
                      href='/app/customer-form'
                      variant='contained'
                      color='primary'
                      fullWidth
                      disabled={loader}
                      sx={{ py: 1.5, fontWeight: 'bold' }}
                    >
                      + New Customer
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
            <Button variant='outlined' onClick={exportToExcel} startIcon={<GridOnIcon />}>
              Export Excel
            </Button>
            <Button variant='outlined' onClick={exportToPDF} startIcon={<PictureAsPdfIcon />}>
              Export PDF
            </Button>
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
                    Customer ID
                  </TableCell>
                  {/* <TableCell
                    sx={{
                      position: 'sticky',
                      left: 120, // Same as Lead ID width
                      zIndex: 9,
                      minWidth: 180,
                      maxWidth: 200,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Lead Name
                  </TableCell> */}
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>First Name</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Assigned To</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Label</TableCell>
                  <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Last Activity</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 200, whiteSpace: 'nowrap' }}>Next Follow-up</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading
                  ? [...Array(limit)].map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 12 }).map((_, j) => (
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
                          <Link href={`/app/lead-form/${row.lead_id}`} style={{ textDecoration: 'none' }}>
                            <strong>{row.lead_id}</strong>
                          </Link>
                        </TableCell>

                        {/* <TableCell
                          sx={{
                            position: 'sticky',
                            left: 120,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            fontWeight: 500
                          }}
                        >
                          {row.lead_name}
                        </TableCell> */}
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.values['Full Name']}
                        </TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.values['Company Name']}
                        </TableCell>
                        <TableCell>{row.values['City / Location']}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.values['Status'] || 'Unknown'}
                            color={
                              row.values['Status'] === 'New'
                                ? 'primary'
                                : row.values['Status'] === 'Contacted'
                                  ? 'info'
                                  : row.values['Status'] === 'Qualified'
                                    ? 'success'
                                    : row.values['Status'] === 'Proposal Sent'
                                      ? 'secondary'
                                      : row.values['Status'] === 'Closed Lost'
                                        ? 'warning'
                                        : row.values['Status'] === 'Closed Won'
                                          ? 'success'
                                          : 'default'
                            }
                            size='small'
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          {row.values['Lead Owner']}
                        </TableCell>
                        <TableCell>{row.values['Lead Source']}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              backgroundColor:
                                (row.values['Score'] || 0) >= 75
                                  ? '#d32f2f'
                                  : (row.values['Score'] || 0) >= 50
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
                            {row.values['Score'] || 0}
                          </Box>
                        </TableCell>

                        <TableCell sx={{ minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>
                          <Chip
                            label={
                              (row.values['Score'] || 0) >= 75
                                ? '🔥 Hot Lead'
                                : (row.values['Score'] || 0) >= 50
                                  ? '🟡 Warm Lead'
                                  : '❄️ Cold Lead'
                            }
                            sx={{
                              backgroundColor:
                                (row.values['Score'] || 0) >= 75
                                  ? '#ffcdd2'
                                  : (row.values['Score'] || 0) >= 50
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
                      </TableRow>
                    ))}
                {!loading && data?.length === 0 && (
                  <TableCell
                    colSpan={8}
                    align='center'
                    sx={{
                      py: 4,
                      border: 'none',
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 'bold',
                        color: '#9e9e9e',
                        letterSpacing: 0.5
                      }}
                    >
                      🚫 No record found!
                    </Typography>
                    {/* <Typography
                      variant='body2'
                      sx={{
                        color: '#b0bec5',
                        mt: 0.5
                      }}
                    >
                      Try adjusting filters or date range.
                    </Typography> */}
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
       <ToastContainer position='top-right' />
    </Box>
  )
}

export default CustomerTable
