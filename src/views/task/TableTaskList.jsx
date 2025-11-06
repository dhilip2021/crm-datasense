'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  TableContainer,
  Paper,
  TablePagination
} from '@mui/material'
import dayjs from 'dayjs'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'


function extractTasksFromLeads(leads) {
  const taskData = []

  leads.forEach(lead => {
    const leadId = lead.lead_id
    const company = lead.values?.Company || '-'
    const phone = lead.values?.Phone || '-'

    // Check if Activity exists
    const activities = lead.values?.Activity || []
    activities.forEach(activityObj => {
      const tasks = activityObj.task || []
      tasks.forEach(task => {
        taskData.push({
          _id: task._id,
          subject: task.subject,
          dueDate: task.dueDate,
          status: task.status || 'Unknown',
          owner: task.owner || lead.assignedTo || '-',
          Company: company,
          Phone: phone,
          priority: task.priority || '-',
          lead_id: leadId,
          reminderDate: task.reminderDate || '-',
          reminderTime: task.reminderTime || '-'
        })
      })
    })
  })

  return taskData
}

function TableTaskList({ loading, tasks }) {

   const taskData = extractTasksFromLeads(tasks)


  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)






  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (!loading && tasks.length === 0) {
    return <Typography textAlign={'center'}>No tasks found 🚫</Typography>
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Company</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {taskData
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((task, idx) => (
              <TableRow key={task._id || idx}>
                <TableCell>
                  <Link
                                  href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(task['lead_id']))}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Typography fontWeight="bold" color="primary">
                    {task.subject || 'Untitled Task'}
                  </Typography>
                                </Link>
                  
                </TableCell>
                <TableCell>{task.owner}</TableCell>
                <TableCell>{task.Company || '-'}</TableCell>
                <TableCell>
                  {task.dueDate ? dayjs(task.dueDate).format('DD MMM YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.status || 'Unknown'}
                    sx={{
                      backgroundColor:
                        task.status === 'Completed'
                          ? '#4caf50'
                          : task.status === 'In Progress'
                          ? '#ff9800'
                          : task.status === 'Deferred'
                          ? '#9e9e9e'
                          : '#03a9f4',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={task.priority || '-'}
                    sx={{
                      backgroundColor:
                        task.priority === 'High'
                          ? '#f44336'
                          : task.priority === 'Medium'
                          ? '#ff9800'
                          : '#4caf50',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={taskData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20]}
      />
    </TableContainer>
  )
}

export default TableTaskList
