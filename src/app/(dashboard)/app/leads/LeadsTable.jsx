'use client'

import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper
} from '@mui/material'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Cookies from 'js-cookie'

const Leads = () => {
  const organization_id = Cookies.get('organization_id')
  const form_name = 'lead-form'

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filters, setFilters] = useState({ status: '', source: '', region: '', rep: '', value: '' })
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const res = await fetch(`/api/v1/admin/lead-form/list?organization_id=${organization_id}&form_name=${form_name}`)
    const json = await res.json()
    setLoading(false)
    if (json.success) {
      setData(json.data)
      setFilteredData(json.data)
    }
  }

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)

    const filtered = data.filter(
      row =>
        (!updated.status || row.values.Status === updated.status) &&
        (!updated.source || row.values['Lead Source'] === updated.source) &&
        (!updated.region || row.values.Region === updated.region) &&
        (!updated.rep || row.values['Assigned To'] === updated.rep) &&
        (!updated.value || row.values.Value === updated.value)
    )
    setFilteredData(filtered)
    setPage(0)
  }

  const handleExport = type => {
    const tableData = filteredData.map(row => ({
      'Lead ID': row.lead_id,
      Name: row.values['Full Name'] || '',
      Company: row.values['Company Name'] || '',
      Location: row.values['City / Location'] || '',
      Status: row.values['Status'] || '',
      'Assigned To': row.values['Assigned To'] || '',
      Source: row.values['Lead Source'] || '',
      Score: row.values.Score || '',
      'Last Activity': row.values['Last Activity'] || '',
      'Next Follow-up': row.values['Next Follow-up'] || ''
    }))

    if (type === 'excel' || type === 'csv') {
      const ws = XLSX.utils.json_to_sheet(tableData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Leads')
      XLSX.writeFile(wb, `leads.${type === 'excel' ? 'xlsx' : 'csv'}`)
    }

    if (type === 'pdf') {
      const doc = new jsPDF()
      const columns = Object.keys(tableData[0] || {})
      const rows = tableData.map(obj => columns.map(col => obj[col]))
      autoTable(doc, { head: [columns], body: rows })
      doc.save('leads.pdf')
    }
  }

  const columns = [
    'Lead ID',
    'Name',
    'Company',
    'Location',
    'Status',
    'Assigned To',
    'Source',
    'Score',
    'Last Activity',
    'Next Follow-up'
  ]

  return (
    <Box px={4} py={4}>
      <Grid container justifyContent='flex-end' alignItems='center' mb={2}>
        <Button variant='contained' href='/app/lead-form'>
          + New Lead
        </Button>
      </Grid>

      <Card elevation={1}>
        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} mb={2}>
            {['status', 'source', 'region', 'rep', 'value'].map((key, i) => (
              <Grid item xs={6} sm={2.4} key={i}>
                <Select
                  fullWidth
                  displayEmpty
                  size='small'
                  value={filters[key]}
                  onChange={e => handleFilterChange(key, e.target.value)}
                >
                  <MenuItem value=''>Filter by {key.charAt(0).toUpperCase() + key.slice(1)}</MenuItem>
                  {[...new Set(data.map(d => d.values[key.replace(/^\w/, c => c.toUpperCase())] || ''))]
                    .filter(Boolean)
                    .map((option, i) => (
                      <MenuItem key={i} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                </Select>
              </Grid>
            ))}
          </Grid>

          {/* Export Buttons */}
          <Box display='flex' gap={1} mb={2}>
            <Button onClick={() => handleExport('excel')} variant='outlined'>Export Excel</Button>
            <Button onClick={() => handleExport('csv')} variant='outlined'>Export CSV</Button>
            <Button onClick={() => handleExport('pdf')} variant='outlined'>Export PDF</Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Table with Scroll */}
          <Paper sx={{ width: '100%', overflow: 'auto' }}>
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col, i) => (
                      <TableCell key={i} sx={{ fontWeight: 600 }}>{col}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? [...Array(limit)].map((_, i) => (
                        <TableRow key={i}>
                          {columns.map((_, j) => (
                            <TableCell key={j}>
                              <Skeleton height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : filteredData.slice(page * limit, page * limit + limit).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.lead_id}</TableCell>
                          <TableCell>{row.values['Full Name']}</TableCell>
                          <TableCell>{row.values['Company Name']}</TableCell>
                          <TableCell>{row.values['City / Location']}</TableCell>
                          <TableCell>{row.values['Status']}</TableCell>
                          <TableCell>{row.values['Assigned To']}</TableCell>
                          <TableCell>{row.values['Lead Source']}</TableCell>
                          <TableCell>{row.values['Score']}</TableCell>
                          <TableCell>{row.values['Last Activity']}</TableCell>
                          <TableCell>{row.values['Next Follow-up']}</TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!loading && (
              <TablePagination
                component='div'
                count={filteredData.length}
                page={page}
                rowsPerPage={limit}
                rowsPerPageOptions={[5, 10, 25, 50]}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={e => {
                  setLimit(parseInt(e.target.value, 10))
                  setPage(0)
                }}
              />
            )}
          </Paper>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Leads
