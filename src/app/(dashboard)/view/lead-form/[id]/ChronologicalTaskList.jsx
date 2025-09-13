'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TablePagination,
  Box,
  Button,
} from '@mui/material'

const ChronologicalTaskList = ({ tasks, onEdit }) => {
  // 🟢 Pagination states
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0) // reset page
  }

  // 🟢 Slice data for current page
  const paginatedTasks = tasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Task Info ({tasks.length})</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedTasks.map((a, i) => (
            <TableRow key={a._id || i}>
              <TableCell>
                <Typography color='primary'>{a.subject}</Typography>

                {/* Call Info */}
                {a.type === 'Call' && (
                  <Typography variant='body2'>
                    Call Purpose : {a.purpose} | Call Agenda : {a.agenda}
                  </Typography>
                )}

                {/* Task Info */}
                {a.type === 'Task' && (
                  <Typography
                    variant='body2'
                    sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                  >
                    Status:
                    <Chip
                      label={a.status}
                      size='small'
                      sx={{
                        bgcolor: a.status === 'Completed' ? 'success.main' : 'warning.main',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    />
                    | Priority:
                    <Chip
                      label={a.priority}
                      size='small'
                      sx={{
                        bgcolor:
                          a.priority === 'High'
                            ? 'error.main'
                            : a.priority === 'Medium'
                            ? 'info.main'
                            : 'default',
                        color: '#fff',
                        fontWeight: 500,
                      }}
                    />
                  </Typography>
                )}
              </TableCell>

              <TableCell>{a.owner}</TableCell>
              <TableCell>{a.dueDate ? dayjs(a.dueDate).format('DD MMM YYYY') : '-'}</TableCell>
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

export default ChronologicalTaskList
