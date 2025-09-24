'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Card,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'

import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import NoteDialog from './NoteDialog'


const NotesSection = ({ leadId, leadData }) => {
  const getToken = Cookies.get('_token')
  const user_name = Cookies.get('user_name')

  const leadArrayData = leadData?.values?.Notes || []
  const sortedNotes = [...leadArrayData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState(sortedNotes)
  const [editingNote, setEditingNote] = useState(null)
  const [noteError, setNoteError] = useState(false)
  const [loader, setLoader] = useState(false)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [viewAnchor, setViewAnchor] = useState(null)
  const [view, setView] = useState('latest')
  const [visibleCount, setVisibleCount] = useState(5) // show first 5 initially
  const loaderRef = useRef(null)

  const noteRef = useRef(null)
  const saveRef = useRef(null)

  // menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuNote, setMenuNote] = useState(null)

  // expand state
  const [expandedNoteId, setExpandedNoteId] = useState(null)

  const toggleExpand = id => {
    setExpandedNoteId(prev => (prev === id ? null : id))
  }

  const handleMenuOpen = (event, note) => {
    setAnchorEl(event.currentTarget)
    setMenuNote(note)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuNote(null)
  }

  const handleChange = e => {
    const { name, value } = e.target
    if (name === 'note') {
      setNoteError(false)
      setNote(value)
    } else if (name === 'title') {
      setTitle(value)
    }
  }

  const handleClear = () => {
    setNote('')
    setTitle('')
    setEditingNote(null)
    setNoteError(false)
  }

  function hasInitialSpace(str = '') {
    return str.length > 0 && str[0] === ' '
  }

  

  const handleSave = async () => {

  // Remove leading/trailing spaces
  const trimmedNote = note?.trim()

  if (!trimmedNote) {
    setNoteError(true)
    noteRef.current?.focus()
    return
  }

  try {
    const notePayload = {
      title,
      note: trimmedNote, // use trimmed value
      createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
      createdBy: editingNote ? editingNote.createdBy : user_name,
      _id: editingNote?._id
    }

    setLoader(true)
    const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      },
      body: JSON.stringify({
        values: { Notes: [notePayload] },
        lead_touch: 'touch'   // 🔹 Add this
      })
    })

    const result = await res.json()
    setLoader(false)

    if (result.success) {
      if (editingNote) {
        setNotes(prev =>
          prev.map(n =>
            n._id === editingNote._id ? { ...n, title, note: trimmedNote } : n
          )
        )
        toast.success('Note updated successfully', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      } else {
        toast.success('Note added successfully', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
        const notes = result?.data?.values?.Notes
        const lastNote = notes?.[notes.length - 1]
        setNotes(prev => [lastNote, ...prev])
      }
    } else {
      toast.error(result.error || 'Error saving note', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }

    handleClear()
    setEditingNote(null)
    setOpen(false)

  } catch (err) {
    setOpen(false)
    setLoader(false)
    toast.error('Error while saving note', {
      autoClose: 500,
      position: 'bottom-center',
      hideProgressBar: true
    })
  }
}


  // 🔎 Filter + Sort notes
  const filteredNotes = [...notes]
    .filter(
      n => n.title?.toLowerCase().includes(search.toLowerCase()) || n.note?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      view === 'latest' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt)
    )

  useEffect(() => {
    if (!loaderRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => prev + 5) // load 5 more when reached
        }
      },
      { threshold: 1.0 }
    )

    observer.observe(loaderRef.current)

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [])

  return (
    <Box>
      {/* Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        {/* <Typography variant='h6' fontWeight='bold'>
          Notes
        </Typography> */}
        {/* <Button
          variant='contained'
          onClick={() => {
            setOpen(true)
            handleClear()
          }}
          sx={{ bgcolor: '#AB09F7',size:"small", '&:hover': { bgcolor: '#AB09F7' }, borderRadius: '8px', textTransform: 'none' }}
        >
          + Create Note 
        </Button> */}
      </Box>

      {/* Search + Sort */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={10}>
          <TextField
            autoComplete='off'
            placeholder='Search Notes'
            variant='outlined'
            fullWidth
            value={search}
            size='small'
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Box display='flex' justifyContent='flex-end'>
            <Button
              sx={{ marginRight: '25px', color: '#000', border: '1px solid #000' }}
              variant='outlined'
              endIcon={<ArrowDropDownIcon />}
              onClick={e => {
                e.stopPropagation()
                setViewAnchor(e.currentTarget)
              }}
            >
              {view === 'latest' ? 'Latest' : 'Oldest'}
            </Button>
          </Box>
          <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>
            <MenuItem
              onClick={() => {
                setView('latest')
                setViewAnchor(null)
              }}
            >
              Latest
            </MenuItem>
            <MenuItem
              onClick={() => {
                setView('oldest')
                setViewAnchor(null)
              }}
            >
              Oldest
            </MenuItem>
          </Menu>
        </Grid>
      </Grid>

      {/* Notes list */}
      {filteredNotes.length > 0 ? (
        filteredNotes.slice(0, visibleCount).map(n => (
          <Card
            key={n._id}
            sx={{
              p: 2,
              mb: 4,
              mt: 2,
              borderRadius: 2,
              border: '2px solid #ebebeb',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#fafafa' }
            }}
          >
            {/* Top Row */}
            <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
              <Box flex={1}>
                <Typography fontWeight='bold'>{n.title || ''}</Typography>

                {/* Show either preview or full note */}
                <Typography sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'pre-line' }}>
                  {expandedNoteId === n._id
                    ? // 🔹 Full Note with URL detection
                      (() => {
                        const urlRegex = /(https?:\/\/[^\s]+)/g
                        const parts = n.note.split(urlRegex)
                        return parts.map((part, index) =>
                          urlRegex.test(part) ? (
                            <a
                              key={index}
                              href={part}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{ color: '#1976d2', textDecoration: 'underline', wordBreak: 'break-word' }}
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          )
                        )
                      })()
                    : // 🔹 Preview Mode (only first line)
                      (() => {
                        const firstLine = n.note.split('\n')[0] // take only first line
                        return n.note.includes('\n') ? `${firstLine}...` : firstLine
                      })()}
                </Typography>

                {/* Meta (always show at bottom when expanded, else compact) */}

                <Box display='flex' alignItems='center' gap={2} mt={2}>
                  <Typography variant='body2' color='text.secondary' display={"flex"} alignItems={"center"} gap={2}>
                    <img loading='lazy' width='20' src='/images/icons/user.svg' alt='User Icon' />
                    {n.createdBy}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' display={"flex"} alignItems={"center"} gap={2}>
                    <img loading='lazy' width='20' src='/images/icons/calendar.svg' alt='calendar' />
                    
                    {new Date(n.createdAt).toLocaleDateString('en-GB')}  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                   
                  </Typography>
                </Box>
              </Box>

              {/* Actions */}
              <Box display='flex' alignItems='center' gap={1}>
                <IconButton size='small' onClick={() => toggleExpand(n._id)}>
                  <ExpandMoreIcon
                    fontSize='small'
                    style={{
                      transform: expandedNoteId === n._id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </IconButton>
                <IconButton size='small' onClick={e => handleMenuOpen(e, n)}>
                  <MoreVertIcon fontSize='small' />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))
      ) : (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', border: '1px dashed #ccc', borderRadius: 3, mt: 3 }}>
          <Typography variant='h6' color='text.secondary' gutterBottom>
            📝 No Notes Found
          </Typography>
          <Typography variant='body2' color='text.disabled' mb={2}>
            Start by adding your first note for this lead.
          </Typography>
          <Button variant='contained' onClick={() => setOpen(true)}>
            + Create Note
          </Button>
        </Card>
      )}

      {/* Loader div (trigger infinite scroll) */}
      {visibleCount < filteredNotes.length && (
        <Box ref={loaderRef} sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

          {/* Modal */}
          <NoteDialog 
          open={open}
          setOpen={setOpen}
          setEditingNote ={setEditingNote}
          handleClear={handleClear}
          editingNote={editingNote}
          title={title}
          note={note}
          handleChange={handleChange}
          noteRef={noteRef}
          noteError={noteError}
          loader={loader}
          handleSave={handleSave}
          saveRef={saveRef}
          />




      {/* More Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (menuNote) {
              setEditingNote(menuNote)
              setTitle(menuNote.title)
              setNote(menuNote.note)
              setOpen(true)
            }
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize='small' />
          </ListItemIcon>
          Edit
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            if (menuNote) {
              console.log('Delete clicked for', menuNote._id)
              // TODO: call delete API
            }
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize='small' />
          </ListItemIcon>
          Delete
        </MenuItem> */}
      </Menu>

      <ToastContainer position='bottom-center' autoClose={500} hideProgressBar />
    </Box>
  )
}

export default NotesSection
