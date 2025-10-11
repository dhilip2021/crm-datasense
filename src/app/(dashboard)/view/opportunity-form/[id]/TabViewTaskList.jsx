'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TablePagination,
  Button,
} from '@mui/material'

const TabViewTaskList = ({ tasks, onEdit }) => {
  // 🟢 pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // reset page
  }

  // 🟢 slice tasks based on pagination
  const paginatedTasks =
    Array.isArray(tasks) && tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task Name</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTasks.map((t, i) => (
            <TableRow key={t._id || i}>
              <TableCell>
                <Typography color='primary'>{t.subject}</Typography>
              </TableCell>
              <TableCell>
                {t.dueDate ? dayjs(t.dueDate).format('DD MMM YYYY') : '-'}
              </TableCell>
              <TableCell>{t.owner}</TableCell>
              <TableCell>
                <Chip
                  label={t.status || 'Unknown'}
                  size='small'
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'bold',
                    bgcolor:
                      t.status === 'Completed'
                        ? 'success.light'
                        : t.status === 'In Progress'
                        ? 'warning.light'
                        : t.status === 'Deferred'
                        ? 'error.light'
                        : 'grey.300',
                    color: 'text.primary',
                  }}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={`Priority: ${t.priority || 'Medium'}`}
                  size='small'
                  sx={{
                    borderRadius: 2,
                    fontWeight: 'bold',
                    bgcolor:
                      t.priority === 'High'
                        ? 'error.light'
                        : t.priority === 'Low'
                        ? 'info.light'
                        : 'grey.200',
                    color: 'text.primary',
                  }}
                />
              </TableCell>
               <TableCell>
                  {onEdit && (
                                <Button size='small' variant='outlined' onClick={() => onEdit(t)}>
                                  ✏️
                                </Button>
                              )}
               </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🟢 Pagination Controls */}
      <TablePagination
        component='div'
        count={tasks.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  )
}

export default TabViewTaskList
