'use client'

import Link from 'next/link';

import {
  Box, TextField,Breadcrumbs, Button,InputAdornment, Grid, Typography, Table, TableHead,
  TableRow, TableCell, TableBody, TablePagination
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import Cookies from 'js-cookie';


// Components Imports

const Leads = () => {
  const organization_id = Cookies.get('organization_id')
  const form_name = 'lead-form'

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState([])
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [fromDate, setFromDate] = useState(null)
  const [toDate, setToDate] = useState(null)


  
  const fetchData = async () => {
    const params = new URLSearchParams({
      organization_id,
      form_name,
      page: page + 1,
      limit,
      search,
      ...(fromDate && { from: dayjs(fromDate).format('YYYY-MM-DD') }),
      ...(toDate && { to: dayjs(toDate).format('YYYY-MM-DD') })
    })

    const res = await fetch(`/api/v1/admin/lead-form/list?${params}`)
    const json = await res.json()

    if (json.success) {
      setData(json.data)
      setTotal(json.total)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, limit])

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(row => ({
      'Lead Name': row.lead_name,
      ...row.values
    })))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, worksheet, 'Leads')
    XLSX.writeFile(wb, `${form_name}_leads.xlsx`)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    const columns = ['Lead Name', ...Object.keys(data[0]?.values || {})]
    const rows = data.map(row => [
      row.lead_name,
      ...Object.values(row.values || {})
    ])
    autoTable(doc, { head: [columns], body: rows })
    doc.save(`${form_name}_leads.pdf`)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Box display={'flex'} justifyContent={'flex-end'} mb={4}>
          <Link href={'/app/lead-form'}>
            <Button startIcon={<i className='ri-add-line'></i>} variant='contained' className='mis-4'>
              New Lead
            </Button>
          </Link>
        </Box>
      </Grid>

       <Box>
      
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Search by Lead Name"
            size="small"
            fullWidth
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData()}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={setFromDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="To Date"
              value={toDate}
              onChange={setToDate}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button variant="contained" onClick={fetchData} fullWidth>
            Apply Filters
          </Button>
        </Grid>
      </Grid>

      <Box mb={2} display="flex" gap={1}>
        <Button onClick={handleExportExcel} variant="outlined">Export Excel</Button>
        <Button onClick={handleExportPDF} variant="outlined">Export PDF</Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Lead Name</TableCell>
            {Object.keys(data[0]?.values || {}).map((key, i) => (
              <TableCell key={i}>{key}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(row => (
            <TableRow key={row.lead_id}>
              <TableCell>{row.lead_name}</TableCell>
              {Object.values(row.values || {}).map((val, i) => (
                <TableCell key={i}>{val}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
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
    </Box>




    </Grid>
  )
}

export default Leads
