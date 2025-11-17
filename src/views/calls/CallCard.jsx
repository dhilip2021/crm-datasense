'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BusinessIcon from '@mui/icons-material/Business'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import NotesIcon from '@mui/icons-material/Notes'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'

// Escape regex special characters
const escapeRegex = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Highlight matched text
const highlightText = (text, search) => {
  if (!text) return ''
  if (!search) return text
  const escapedSearch = escapeRegex(search)
  const regex = new RegExp(`(${escapedSearch})`, 'gi')
  const parts = String(text).split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ backgroundColor: '#fff176', padding: '0 2px', borderRadius: 2 }}>
        {part}
      </span>
    ) : (
      part
    )
  )
}

const CallCard = ({ search, calls, onEdit, onAdd, initialLimit = 4, loadMoreStep = 4 }) => {
  const user_name = Cookies.get('user_name')

  const filteredLeads = calls.filter(
    lead => Array.isArray(lead.values?.Activity[0]?.call) && lead.values?.Activity[0]?.call.length > 0
  )

  console.log(filteredLeads, '<<< filteredLeads')
  const [limit, setLimit] = useState(initialLimit)
  const [leadId, setLeadId] = useState('')
  const [noteType, setNoteType] = useState('Add Note')

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [editData, setEditData] = useState({ title: '', note: '' })

  // 🔹 Add Note button click
  const handleAddClick = lead_id => {
    setNoteType('Add Call')
    setLeadId(lead_id)
    setSelectedNote(null)
    setEditData({ title: '', note: '' })
    setOpenDialog(true)
  }

  // 🔹 Edit Note button click
  const handleEditClick = (note, lead_id) => {
    setNoteType('Edit call')
    setLeadId(lead_id)
    setSelectedNote(note)
    setEditData({ title: note.title || '', note: note.note || '' })
    setOpenDialog(true)
  }

  // 🔹 Close dialog
  const handleClose = () => {
    setNoteType('')
    setOpenDialog(false)
    setSelectedNote(null)
  }

  // 🔹 Save/Add note
  const handleSave = () => {
    if (noteType === 'Edit Note' && onEdit && selectedNote) {
      const updatedNote = {
        ...selectedNote,
        ...editData,
        lead_id: leadId
      }
      onEdit(updatedNote)
    } else if (noteType === 'Add Note' && onAdd) {
      const newNote = {
        title: editData.title,
        note: editData.note,
        lead_id: leadId,
        createdAt: new Date().toISOString(),
        createdBy: user_name // customize if needed
      }
      onAdd(newNote)
    }
    setOpenDialog(false)
  }

  const handleChange = e => {
    const { name, value } = e.target
    setEditData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoadMore = () => setLimit(prev => prev + loadMoreStep)

  if (filteredLeads.length === 0) {
    return (
      <Box
        sx={{
          p: 6,
          borderRadius: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
          border: '1px dashed #ccc',
          width: '100%',
          mt: 2
        }}
      >
        <NotesIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
          No calls available yet.
        </Typography>
      </Box>
    )
  }

  const displayedLeads = filteredLeads.slice(0, limit)

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {displayedLeads.map(lead => (
          <Grid item xs={12} sm={6} key={lead._id}>
            <Box
              sx={{
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                width: '100%',
                bgcolor: 'background.paper'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                <Box display='flex' alignItems='center' gap={1.5}>
                  <BusinessIcon color='primary' />
                  <Typography variant='h6' fontWeight={600}>
                    {lead.values?.Company || lead.lead_name}
                  </Typography>
                  <Chip
                    label={lead.values?.['Lead Status'] || 'New / Attempted Contact'}
                    color='primary'
                    variant='outlined'
                    size='small'
                    sx={{ fontSize: 12 }}
                  />
                </Box>

                <Typography variant='body2' color='text.secondary' sx={{ mt: { xs: 1, sm: 0 } }}>
                  Total Calls: {lead.values.Activity[0].call.length}
                </Typography>
                {/* <Button
                  variant='contained'
                  color='primary'
                  onClick={() => handleAddClick(lead.lead_id)}
                  startIcon={<AddIcon />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      backgroundColor: '#2e7d32',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Add Call
                </Button> */}
              </Box>

              {/* Notes List */}
              <Box sx={{ p: 2.5 }}>
                {lead.values.Activity[0].call.map((data, index) => (
                  <Box key={data._id || index}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                        transition: '0.2s ease',
                        '&:hover': { bgcolor: 'grey.50' }
                      }}
                    >
                      {/* LEFT SECTION */}
                      <Box sx={{ flex: 1 }}>
                        {/* Call Response */}
                        <Typography
                          variant='subtitle1'
                          fontWeight={600}
                          sx={{ mb: 0.5, color: 'text.primary', fontSize: 15 }}
                        >
                          {highlightText(data.response, search)}
                        </Typography>

                        {/* META INFO */}
                        <Box
                          display='flex'
                          alignItems='center'
                          flexWrap='wrap'
                          gap={1.5}
                          sx={{ color: 'text.secondary', fontSize: 13 }}
                        >
                          <Box display='flex' alignItems='center' gap={0.5}>
                            <CalendarMonthIcon fontSize='small' sx={{ fontSize: 18 }} />
                            <Typography variant='body2'>
                              {dayjs(data.startTime).format('DD MMM YYYY, hh:mm A')}
                            </Typography>
                          </Box>

                          <Divider orientation='vertical' flexItem />

                          <Box display='flex' alignItems='center' gap={0.5}>
                            <PersonOutlineIcon fontSize='small' sx={{ fontSize: 18 }} />
                            <Typography variant='body2'>{data.createdBy || 'Unknown'}</Typography>
                          </Box>

                          <Divider orientation='vertical' flexItem />

                          <Chip label={`Duration: ${data.duration}`} size='small' />
                        </Box>

                        {/* FROM → TO */}
                        <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                          <b>From:</b> {data.from} &nbsp;&nbsp; <b>To:</b> {data.to}
                        </Typography>
                      </Box>

                      {/* Edit (disable because calls = not notes) */}
                      {/* <Tooltip title='Edit Call'>
                        <IconButton disabled size='small' sx={{ opacity: 0.3 }}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip> */}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Load More */}
      {limit < filteredLeads.length && (
        <Box textAlign='center' mt={2}>
          <Button variant='contained' onClick={handleLoadMore}>
            Load More
          </Button>
        </Box>
      )}

      {/* ✏️ Add/Edit Note Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth='sm' fullWidth>
        <DialogTitle>{noteType}</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label='Title'
            name='title'
            value={editData.title}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />
          <TextField
            fullWidth
            multiline
            rows={5}
            label='Note'
            name='note'
            value={editData.note}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} variant='outlined'>
            Cancel
          </Button>
          <Button onClick={handleSave} variant='contained' color='primary'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default CallCard
