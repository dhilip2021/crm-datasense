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
  DialogActions,
  CircularProgress
} from '@mui/material'
import { FormatBold, AttachFile } from '@mui/icons-material'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'
//react-toastify
import 'react-toastify/dist/ReactToastify.css'

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
  const [editingNote, setEditingNote] = useState(null) // holds note being edited

  const [noteError, setNoteError] = useState(false)
  const [titleError, setTitleError] = useState(false)
  const [loader, setLoader] = useState(false)

  const [open, setOpen] = useState(false)

  // 🔹 Refs for focus handling
  const titleRef = useRef(null)
  const noteRef = useRef(null)
  const saveRef = useRef(null)

  // Focus title when modal opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        titleRef.current?.focus()
      }, 100) // 100ms delay so Dialog content mounts
      return () => clearTimeout(timer)
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
    setEditingNote(null)
    setTitleError(false)
    setNoteError(false)
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
      const notePayload = {
        title,
        note,
        createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
        createdBy: editingNote ? editingNote.createdBy : user_name,
        _id: editingNote?._id // send _id if editing
      }

      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify({
          values: { Notes: [notePayload] }
        })
      })

      const result = await res.json()
      setLoader(false)

      if (result.success) {
        if (editingNote) {
          setNotes(prev => prev.map(n => (n._id === editingNote._id ? { ...n, title, note } : n)))
          toast.success('Note updated successfully', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })
        } else {
          toast.success('Note added successfully', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })
          const notes = result?.data?.values?.Notes
          const lastNote = notes?.[notes.length - 1]

          setNotes(prev => [lastNote, ...prev])
        }
      } else {
        toast.error(result.error || 'Error saving note', {
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
      setEditingNote(null)
      setOpen(false)
    } catch (err) {
      setOpen(false)
      setLoader(false)
      toast.error('Error while saving note', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
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
            {Array.isArray(notes) && notes?.length > 0 && (
              <Button
                variant='contained'
                size='small'
                onClick={e => {
                  e.stopPropagation()
                  setOpen(true)
                  handleClear()
                }}
                sx={{ marginRight: '20px' }}
              >
                + Create Note
              </Button>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          {Array.isArray(notes) && notes?.length > 0 ? (
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
                  <Avatar>{getIntial(`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`)}</Avatar>

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
                      Lead - <b>👤 {`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`}</b> • 📅{' '}
                      {(() => {
                        const d = new Date(n.createdAt)
                        const day = String(d.getDate()).padStart(2, '0')
                        const month = String(d.getMonth() + 1).padStart(2, '0')
                        const year = d.getFullYear()
                        return `${day}-${month}-${year}`
                      })()}
                      • ⏰ {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by{' '}
                      <b>👤 {n.createdBy}</b>
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
                              n.priority === 'High' ? 'error.light' : n.priority === 'Low' ? 'info.light' : 'grey.200'
                          }}
                        />
                      </Stack>
                    )}
                  </Box>
                  <Box display='flex' justifyContent='flex-end' mt={1}>
                    <Button
                      size='small'
                      onClick={() => {
                        setEditingNote(n) // store current note
                        setTitle(n.title)
                        setNote(n.note)
                        setOpen(true)
                      }}
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
              </Card>
            ))
          ) : (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: '#fafafa',
                border: '1px dashed #ccc',
                borderRadius: 3,
                mt: 3
              }}
            >
              <Typography variant='h6' color='text.secondary' gutterBottom>
                📝 No Notes Found
              </Typography>
              <Typography variant='body2' color='text.disabled' mb={2}>
                Start by adding your first note for this lead.
              </Typography>
              <Button variant='contained' size='small' onClick={() => setOpen(true)}>
                + Create Note
              </Button>
            </Card>
          )}
        </AccordionDetails>
      </Accordion>

      {/* 🔹 Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
        <DialogTitle>
          <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
            {editingNote ? 'Edit Note' : 'Create New Note'}
            <IconButton
              onClick={() => {
                setOpen(false)
                setEditingNote(null)
                handleClear()
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <TextField
            placeholder='Title'
            variant='standard'
            fullWidth
            autoFocus
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
          <Button onClick={handleClear} disabled={loader}>
            Clear
          </Button>
          <Button variant='contained' onClick={handleSave} disabled={loader}>
            {loader ? 'Saving...' : editingNote ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
       <ToastContainer
        position='bottom-center'
        autoClose={500} // all toasts auto close
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />
    </>
  )
}

export default NotesSection
