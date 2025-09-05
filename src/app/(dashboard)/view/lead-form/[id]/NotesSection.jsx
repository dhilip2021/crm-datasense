'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { FormatBold, AttachFile } from '@mui/icons-material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'

function getIntial(name = '') {
  const reIntial = (name.match(/\p{L}+/gu) || []).map(w => w[0].toUpperCase()).join('')
  return reIntial
}

const NotesSection = ({ leadId, leadData }) => {
  const getToken = Cookies.get('_token')
  const user_name = Cookies.get('user_name')

  const leadArrayData = leadData?.values?.Notes ? leadData.values.Notes : []

  const sortedNotes = [...leadArrayData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState(sortedNotes || [])

  const [noteError, setNoteError] = useState(false)
  const [titleError, setTitleError] = useState(false)

  const [open, setOpen] = useState(false)

  // 🔹 Refs for focus handling
  const titleRef = useRef(null)
  const noteRef = useRef(null)
  const saveRef = useRef(null)

  // Focus title when modal opens
  useEffect(() => {
    if (open && titleRef.current) {
      titleRef.current.focus()
    }
  }, [open])

  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'note') {
      setNoteError(false)
      setNote(value)
    } else if (name === 'title') {
      setTitleError(false)
      setTitle(value)
    }
  }

  const handleClear = () => {
    setNote('')
    setTitle('')
    if (titleRef.current) titleRef.current.focus()
  }

  const handleSave = async () => {
    if (note === '') {
      setNoteError(true)
      return
    }
    if (title === '') {
      setTitleError(true)
      return
    }

    try {
      const newNote = {
        title,
        note,
        createdAt: new Date().toISOString(),
        createdBy: user_name
      }

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify({
          values: { Notes: [newNote] }
        })
      })

      const result = await res.json()


      console.log(result,"<<< NOTES CREATEDDDDDDDD")
      if (result.success) {

        toast.success("Note added successfully", {
                autoClose: 500, // 1 second la close
                position: 'bottom-center',
                hideProgressBar: true, // progress bar venam na
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined
              })

        setNotes(prev => [newNote, ...prev])
      }else{
        toast.error(result.error, {
                autoClose: 500, // 1 second la close
                position: 'bottom-center',
                hideProgressBar: true, // progress bar venam na
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined
              })
      }

      handleClear()
      setOpen(false)
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3-content' id='panel3-header'>
          <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
            <Typography variant='h6' fontWeight='bold'>
              Notes
            </Typography>
            <Button
              variant='contained'
              size='small'
              onClick={e => {
                e.stopPropagation()
                setOpen(true)
              }}
              sx={{marginRight: "20px"}}
            >
              + Create Note
            </Button>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {/* {Array.isArray(notes) &&
            notes.map((n, i) => (
              <Card key={i} sx={{ p: 2, mb: 2 }}>
                <Box display='flex' alignItems='flex-start' gap={2}>
                  <Avatar>{getIntial(`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`)}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight='bold'>{n.title}</Typography>
                    <Typography>{n.note}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Lead - <b>{`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`}</b> •{' '}
                      {new Date(n.createdAt).toLocaleString()} by <b>{n.createdBy}</b>
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))} */}

            {Array.isArray(notes) &&
  notes.map((n, i) => (
    <Card
      key={i}
      sx={{
        p: 2,
        mb: 2,
        bgcolor: '#f9f9ff',
        borderRadius: 2,
        border: '1px solid #ddd'
      }}
    >
      <Box display='flex' alignItems='flex-start' gap={2}>
        {/* Avatar */}
        <Avatar>
          {getIntial(
            `${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`
          )}
        </Avatar>

        {/* Content */}
        <Box flex={1}>
          {/* Title */}
          <Typography fontWeight='bold' color='primary'>
            {n.title || 'Untitled Note'}
          </Typography>

          {/* Note content */}
          <Typography sx={{ mt: 0.5 }}>{n.note}</Typography>

          {/* Metadata */}
          <Typography variant='caption' color='text.secondary' display='block' mt={1}>
            Lead - <b>👤 {`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`}</b> •{' '} 📅 ⏰
            {new Date(n.createdAt).toLocaleString()} by <b> 👤 {n.createdBy}</b>
          </Typography>

          {/* Optional status / priority chips for visual consistency with tasks */}
          {n.status && n.priority && (
            <Stack direction='row' spacing={1} mt={1}>
              <Chip
                label={n.status}
                size='small'
                sx={{
                  bgcolor:
                    n.status === 'Completed'
                      ? 'success.light'
                      : n.status === 'In Progress'
                      ? 'warning.light'
                      : 'grey.300'
                }}
              />
              <Chip
                label={`Priority: ${n.priority}`}
                size='small'
                sx={{
                  bgcolor:
                    n.priority === 'High'
                      ? 'error.light'
                      : n.priority === 'Low'
                      ? 'info.light'
                      : 'grey.200'
                }}
              />
            </Stack>
          )}
        </Box>
      </Box>
    </Card>
  ))}
        </AccordionDetails>
      </Accordion>

      {/* 🔹 Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Create New Note
          <IconButton edge='end' color='inherit' onClick={() => setOpen(false)} aria-label='close' sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            placeholder='Title'
            variant='standard'
            fullWidth
            inputRef={titleRef}
            value={title}
            onChange={handleChange}
            name='title'
            error={titleError}
            helperText={titleError && 'Please enter title'}
            sx={{ mb: 2, mt: 1 }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                noteRef.current?.focus()
              }
            }}
          />
          <TextField
            placeholder="What's this note about?"
            multiline
            rows={4}
            fullWidth
            inputRef={noteRef}
            value={note}
            onChange={handleChange}
            name='note'
            error={noteError}
            helperText={noteError && 'Please enter notes'}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                saveRef.current?.focus()
              }
            }}
          />
          <Box mt={2} display='flex' gap={1}>
            <IconButton>
              <FormatBold />
            </IconButton>
            <IconButton>
              <AttachFile />
            </IconButton>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClear}>Clear</Button>
          <Button variant='contained' onClick={handleSave} ref={saveRef}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer position='bottom-center' />
    </>
  )
}

export default NotesSection
