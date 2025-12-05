'use client'

import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TableSortLabel,
  TextField,
  Box
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

const sampleData = [
  { id: 1, name: 'Leads', module_name: 'Leads', href: '/builder/lead-form' },
  { id: 2, name: 'Customer (Accounts/Contacts)', module_name: 'Customer', href: '/builder/customer-form' },
  { id: 3, name: 'Opportunities / Deals', module_name: 'Opportunities', href: '/builder/opportunities-form' },
  { id: 4, name: 'Contacts', module_name: 'Contacts', href: '/builder/contact-form' },
  { id: 5, name: 'Orders', module_name: 'Orders', href: '/builder' },
  { id: 6, name: 'Support Tickets', module_name: 'Support_Tickets', href: '/builder' }
]

export default function BuilderPage() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [orderBy, setOrderBy] = useState('name')
  const [order, setOrder] = useState('asc')
  const [searchText, setSearchText] = useState('')


  const router = useRouter()
    const { payloadJson } = useSelector(state => state.menu)
  
  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false;
  
    const found = payloadJson.find(
      m =>
        m.menu_privileage_name === 'Setup' &&
        m.sub_menu_privileage_name === ''
    );
  
    return found?.view_status === true;
  };
  
    useEffect(() => {
    if (payloadJson.length > 0) {
      if (!hasViewPermission()) {
        router.push('/');
      }
    }
  }, [payloadJson]);




  const handleSort = property => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const filteredData = sampleData.filter(
    row =>
      row.name.toLowerCase().includes(searchText.toLowerCase()) ||
      row.module_name.toLowerCase().includes(searchText.toLowerCase())
  )

  const sortedData = [...filteredData].sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy].localeCompare(b[orderBy])
    } else {
      return b[orderBy].localeCompare(a[orderBy])
    }
  })

  const paginatedData = sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* 🔍 Search Box */}
      <Box p={2}>
        <TextField
          fullWidth
          size='small'
          label='Search by Name or Module'
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
      </Box>

      {/* 🧾 Table */}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell sortDirection={orderBy === 'name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Displayed in tabs as
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'module_name' ? order : false}>
                <TableSortLabel
                  active={orderBy === 'module_name'}
                  direction={orderBy === 'module_name' ? order : 'asc'}
                  onClick={() => handleSort('module_name')}
                >
                  Module Name
                </TableSortLabel>
              </TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Link href={row.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <strong>{row.name}</strong>
                  </Link>
                </TableCell>
                <TableCell>{row.module_name}</TableCell>
                <TableCell align='right'>
                  <IconButton color='primary' size='small' onClick={() => alert(`Edit ${row.name}`)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color='error' size='small' onClick={() => alert(`Delete ${row.name}`)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align='center'>
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 📄 Pagination Controls */}
      <TablePagination
        component='div'
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  )
}
