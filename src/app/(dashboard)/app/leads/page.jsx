'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
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
import { formatDateShort } from '@/helper/frontendHelper'
import Link from 'next/link'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import GridOnIcon from '@mui/icons-material/GridOn'


const LeadTable = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
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
    const organization_id = Cookies.get('organization_id')
    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      page: page + 1,
      limit,
      ...filters.search && { search: filters.search },
      ...filters.status && { status: filters.status },
      ...filters.source && { source: filters.source },
      ...filters.region && { region: filters.region },
      ...filters.rep && { rep: filters.rep },
      ...filters.value && { value: filters.value },
      ...filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') },
      ...filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') }
    })

    const res = await fetch(`/api/v1/admin/lead-form/list?${query}`)
    const json = await res.json()
    if (json.success) {
      setData(json.data)
      setTotal(json.total)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, limit])

  const exportToExcel = () => {
    const rows = data.map(d => ({
      'Lead ID': d.lead_id,
      'Name': d.values['Full Name'],
      'Company': d.values['Company Name'],
      'Location': d.values['City / Location'],
      'Status': d.values['Status'],
      'Assigned To': d.values['Lead Owner'],
      'Source': d.values['Lead Source'],
      'Score': d.values['Lead Score'],
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
    const columns = ['Lead ID', 'Name', 'Company', 'Location', 'Status', 'Assigned To', 'Source', 'Score', 'Last Activity', 'Next Follow-up']
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

  return (
    <Box px={4} py={4}>
      <Grid container justifyContent='space-between' mb={2} alignItems='center'>
        <Typography variant='h5' fontWeight='bold'>Leads</Typography>
        <Button variant='contained' href='/app/lead-form'>+ New Lead</Button>
      </Grid>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2}>
              <TextField size='small' fullWidth label='Search' value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && fetchData()} />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField select size='small' fullWidth label='Status' value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='New'>New</MenuItem>
                <MenuItem value='Contacted'>Contacted</MenuItem>
                <MenuItem value='Qualified'>Qualified</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField select size='small' fullWidth label='Source' value={filters.source} onChange={e => setFilters({ ...filters, source: e.target.value })}>
                <MenuItem value=''>All</MenuItem>
                <MenuItem value='Website'>Website</MenuItem>
                <MenuItem value='Referral'>Referral</MenuItem>
                <MenuItem value='LinkedIn'>LinkedIn</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label='From Date' value={filters.fromDate} onChange={val => setFilters({ ...filters, fromDate: val })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label='To Date' value={filters.toDate} onChange={val => setFilters({ ...filters, toDate: val })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant='contained' fullWidth onClick={fetchData}>Apply</Button>
            </Grid>
          </Grid>

          <Box mt={2} display='flex' justifyContent={"flex-end"} gap={1}>
            <Button variant='outlined' onClick={exportToExcel} startIcon={<GridOnIcon />}>Export Excel</Button>
            <Button variant='outlined' onClick={exportToPDF} startIcon={<PictureAsPdfIcon />}>Export PDF</Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ overflowX: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Lead ID</TableCell>
                  <TableCell>Lead Name</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell>Next Follow-up</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell><Link underline='hover' color='inherit' href= {`/app/lead-form/${row.lead_id}`} ><strong>{row.lead_id}</strong></Link> </TableCell>
                    <TableCell>{row.lead_name}</TableCell>
                    <TableCell>{row.values['Full Name']}</TableCell>
                    <TableCell>{row.values['Company Name']}</TableCell>
                    <TableCell>{row.values['City / Location']}</TableCell>
                    <TableCell>{row.values['Status']}</TableCell>
                    <TableCell>{row.values['Lead Owner']}</TableCell>
                    <TableCell>{row.values['Lead Source']}</TableCell>
                    <TableCell>{row.values['Lead Score']}</TableCell>
                    <TableCell>{row.values['Last Activity Date']}</TableCell>
                    <TableCell>{formatDateShort(row.values['Next Follow-up Date'])}</TableCell>
                  </TableRow>
                ))}
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
            rowsPerPageOptions={[5, 10, 20, 50]}
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default LeadTable