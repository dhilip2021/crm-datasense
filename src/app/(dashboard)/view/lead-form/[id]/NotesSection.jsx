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
import DeleteIcon from '@mui/icons-material/Delete'

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
  const companyName = leadData?.values?.Company || '-'
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
  const [collapsed, setCollapsed] = useState(true)

  const noteRef = useRef(null)
  const saveRef = useRef(null)
  const scrollContainerRef = useRef(null)

  // menu state
  const [anchorEl, setAnchorEl] = useState(null)
  const [menuNote, setMenuNote] = useState(null)

  // expand state
  const [expandedNoteId, setExpandedNoteId] = useState(null)

  const toggleExpand = id => {
    setExpandedNoteId(prev => (prev === id ? null : id))
  }

  const handleMenuOpen = (event, note) => {
    // setAnchorEl(event.currentTarget)
    setMenuNote(note)
    // setOpen(true)
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
      setTimeout(() => {
        noteRef.current?.focus()
      }, 0) // 👈 ensures ref mounted
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
          lead_touch: 'touch' // 🔹 Add this
        })
      })

      const result = await res.json()
      setLoader(false)

      if (result.success) {
        if (editingNote) {
          setNotes(prev => prev.map(n => (n._id === editingNote._id ? { ...n, title, note: trimmedNote } : n)))
          toast.success('Note updated successfully', {
            autoClose: 500,
            position: 'bottom-center',
            hideProgressBar: true
          })
          noteRef.current?.focus()
        } else {
          toast.success('Note added successfully', {
            autoClose: 500,
            position: 'bottom-center',
            hideProgressBar: true
          })
          const notes = result?.data?.values?.Notes
          const lastNote = notes?.[notes.length - 1]
          setNotes(prev => [lastNote, ...prev])
          noteRef.current?.focus()
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

  const highlightText = (text, query) => {
    if (!query) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} style={{ backgroundColor: '#ffeb3b', fontWeight: 500 }}>
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  const highlightNoteText = (text, query) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ backgroundColor: '#ffeb3b', fontWeight: 500 }}>
        {part}
      </span>
    ) : (
      part
    )
  )
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
    if (!scrollContainerRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(prev => Math.min(prev + 5, filteredNotes.length))
        }
      },
      { root: scrollContainerRef.current, threshold: 0.1 } // 👈 observe inside scrollable box
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [filteredNotes.length])

  return (
    <Box>
      {/* Header */}
      {/* <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          onClick={() => {
            setOpen(true)
            handleClear()
          }}
        >
          + Create Note
        </Button>
      </Box> */}

      {/* Search + Sort */}
      <Grid container spacing={0}>
        <Grid item xs={12} md={10}>
          <TextField
            autoComplete='off'
            placeholder='Search notes'
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
            sx={{
              mb: 2,
              bgcolor: '#ffffff',
              color: '#4c4c4c',
              font: '14px',
              borderRadius: 2,
              '& .MuiInputBase-input::placeholder': {
                color: '#4c4c4c', // placeholder black
                opacity: 1 // important, illati grey ah blend aagum
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Box display='flex' justifyContent='flex-end'>
            <Button
              sx={{ color: '#000', border: '1px solid #000' }}
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

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '74vh', // total container height
          gap: 1
        }}
      >
        <Box
          ref={scrollContainerRef}
          sx={{
            flex: 1, // take remaining space
            overflowY: 'auto',
            pr: 1 // padding for scrollbar
          }}
        >
          {/* Notes list */}
          {filteredNotes.length > 0 ? (
            filteredNotes.slice(0, visibleCount).map(n => (
              <>
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
                      <Box display='flex' alignItems='center' gap={2} mb={4}>
                        {/* <Typography fontWeight='bold'>{n.title || ''}</Typography> */}
                        <Typography fontWeight='bold'>{highlightText(n.title || '', search)}</Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          display={'flex'}
                          alignItems={'center'}
                          gap={2}
                        >
                          <img loading='lazy' width='20' src='/images/icons/building.svg' alt='Building Icon' />
                          {/* {companyName} */}
                          {highlightText(companyName, search)}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          display={'flex'}
                          alignItems={'center'}
                          gap={2}
                        >
                          <img loading='lazy' width='20' src='/images/icons/calendar.svg' alt='calendar icon' />
                          {new Date(n.createdAt).toLocaleDateString('en-GB')}{' '}
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          display={'flex'}
                          alignItems={'center'}
                          gap={2}
                        >
                          <img loading='lazy' width='20' src='/images/icons/user.svg' alt='User Icon' />
                          {n.createdBy}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'></Typography>
                      </Box>

                      {/* Show either preview or full note */}
                      {/* <Typography sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                        {(() => {
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
                        })()}
                      </Typography> */}

                      <Typography sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>
                        {(() => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g
                          const parts = n.note.split(urlRegex)

                          return parts.map((part, index) =>
                            urlRegex.test(part) ? (
                              <a
                                key={index}
                                href={part}
                                target='_blank'
                                rel='noopener noreferrer'
                                style={{
                                  color: '#1976d2',
                                  textDecoration: 'underline',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {part}
                              </a>
                            ) : (
                              <React.Fragment key={index}>{highlightNoteText(part, search)}</React.Fragment>
                            )
                          )
                        })()}
                      </Typography>

                      {/* Meta (always show at bottom when expanded, else compact) */}
                    </Box>

                    {/* Actions */}
                    <Box display='flex' alignItems='center' gap={1}>
                      <img
                        onClick={() => {
                          setEditingNote(n) // set the note to edit
                          setTitle(n.title) // populate title field
                          setNote(n.note) // populate note field
                          // setOpen(true) // open the modal/form
                        }}
                        loading='lazy'
                        width='35'
                        src='/images/icons/edit.svg'
                        alt='Building Icon'
                        style={{ cursor: 'pointer' }}
                      />
                    </Box>
                  </Box>
                </Card>
                {editingNote && editingNote._id === n._id && (
                  <Card
                    sx={{
                      p: 2,
                      border: '2px solid #009cde',
                      borderRadius: 2,
                      boxShadow: 'none',
                      mt: 2
                    }}
                  >
                    <Box display='flex' flexDirection='column' gap={2}>
                      {/* Title */}
                      <TextField
                        name='title'
                        placeholder='Title..'
                        variant='standard'
                        value={title}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          fontWeight: 500,
                          '& input::placeholder': { fontSize: 15 }
                        }}
                      />

                      {/* Notes */}
                      <TextField
                        name='note'
                        placeholder='Notes...'
                        variant='standard'
                        multiline
                        rows={3}
                        value={note}
                        onChange={handleChange}
                        // inputRef={noteRef}   // ✅ correct ref binding
                        fullWidth
                        error={noteError}
                        InputProps={{ disableUnderline: true }}
                        sx={{
                          '& textarea::placeholder': { fontSize: 14 }
                        }}
                        helperText={noteError && 'Please enter notes'}
                        onKeyDown={e => {
                          if (e.key === ' ' && note.length === 0) {
                            e.preventDefault()
                          } else if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault()
                            saveRef.current?.focus()
                          }
                        }}
                      />

                      {/* Bottom row - Attachment + Actions */}
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        mt={1}
                        pt={1}
                        borderTop='1px solid #eee'
                      >
                        {/* Attachment Icon */}
                        <IconButton size='small'>
                          <img src='/images/icons/attachment.svg' alt='Attach' width='20' />
                        </IconButton>

                        {/* Actions */}
                        <Box display='flex' gap={1}>
                          <Button onClick={handleClear} variant='text' sx={{ textTransform: 'none', color: '#555' }}>
                            Cancel
                          </Button>
                          <Button
                            ref={saveRef}
                            variant='contained'
                            onClick={handleSave}
                            disabled={loader}
                            sx={{
                              textTransform: 'none',
                              borderRadius: 2,
                              bgcolor: '#0096db',
                              '&:hover': { bgcolor: '#0288d1' }
                            }}
                          >
                            {loader ? <CircularProgress size={18} color='inherit' /> : editingNote ? 'Update' : 'Save'}
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                )}
              </>
            ))
          ) : (
            <Card
              sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa', border: '1px dashed #ccc', borderRadius: 3, mt: 3 }}
            >
              <Typography variant='h6' color='text.secondary' gutterBottom>
                📝 No Notes Found
              </Typography>
              <Typography variant='body2' color='text.disabled' mb={2}>
                Start by adding your first note for this lead.
              </Typography>
              {/* <Button variant='contained' onClick={() => setOpen(true)}>
                + Create Note
              </Button> */}
            </Card>
          )}

          {visibleCount < filteredNotes.length && (
            <Box ref={loaderRef} sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        {/* <Box
          sx={{
            pr: 4 // padding for scrollbar
          }}
        >
          {!editingNote && (
            <Card
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: 'none',
                mt: 2
              }}
            >
              <Box display='flex' flexDirection='column' gap={2}>
                <TextField
                  name='title'
                  placeholder='Title..'
                  variant='standard'
                  value={title}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    fontWeight: 500,
                    '& input::placeholder': { fontSize: 15 }
                  }}
                />

                <TextField
                  name='note'
                  placeholder='Notes...'
                  variant='standard'
                  multiline
                  rows={3}
                  value={note}
                  onChange={handleChange}
                  inputRef={noteRef}
                  fullWidth
                  error={noteError}
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    '& textarea::placeholder': { fontSize: 14 }
                  }}
                  helperText={noteError && 'Please enter notes'}
                  onKeyDown={e => {
                    if (e.key === ' ' && note.length === 0) {
                      e.preventDefault()
                    } else if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault()
                      saveRef.current?.focus()
                    }
                  }}
                />

                <Box
                  display='flex'
                  alignItems='center'
                  justifyContent='space-between'
                  mt={1}
                  pt={1}
                  borderTop='1px solid #eee'
                >
                  <IconButton size='small'>
                    <img src='/images/icons/attachment.svg' alt='Attach' width='20' />
                  </IconButton>

                  <Box display='flex' gap={1}>
                    <Button onClick={handleClear} variant='text' sx={{ textTransform: 'none', color: '#555' }}>
                      Cancel
                    </Button>
                    <Button
                      ref={saveRef}
                      variant='contained'
                      onClick={handleSave}
                      disabled={loader}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        bgcolor: '#0096db',
                        '&:hover': { bgcolor: '#0288d1' }
                      }}
                    >
                      {loader ? <CircularProgress size={18} color='inherit' /> : editingNote ? 'Update' : 'Save'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Card>
          )}
        </Box> */}

        <Box sx={{ pr: 4 }}>
          {!editingNote && (
            <Card
              sx={{
                p: 2,
                border: '2px solid #009cde',
                borderRadius: 2,
                boxShadow: 'none',
                mt: 2
              }}
            >
              <Box display='flex' flexDirection='column' gap={2}>
                {/* Title */}
                <TextField
                  name='title'
                  placeholder='Title..'
                  variant='standard'
                  value={title}
                  onChange={handleChange}
                  onFocus={() => setCollapsed(false)} // 👈 expand when clicked
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    fontWeight: 500,
                    '& input::placeholder': { fontSize: 15 }
                  }}
                />

                {/* Show other fields only if expanded */}
                {!collapsed && (
                  <>
                    {/* Notes */}
                    <TextField
                      name='note'
                      placeholder='Notes...'
                      variant='standard'
                      multiline
                      rows={3}
                      value={note}
                      onChange={handleChange}
                      inputRef={noteRef}
                      fullWidth
                      error={noteError}
                      InputProps={{ disableUnderline: true }}
                      sx={{
                        '& textarea::placeholder': { fontSize: 14 }
                      }}
                      helperText={noteError && 'Please enter notes'}
                      onKeyDown={e => {
                        if (e.key === ' ' && note.length === 0) {
                          e.preventDefault()
                        } else if (e.key === 'Enter' && e.shiftKey) {
                          e.preventDefault()
                          saveRef.current?.focus()
                        }
                      }}
                    />

                    {/* Bottom row - Actions */}
                    <Box
                      display='flex'
                      alignItems='center'
                      justifyContent='space-between'
                      mt={1}
                      pt={1}
                      borderTop='1px solid #eee'
                    >
                      <IconButton size='small'>
                        <img src='/images/icons/attachment.svg' alt='Attach' width='20' />
                      </IconButton>

                      <Box display='flex' gap={1}>
                        <Button
                          onClick={() => {
                            handleClear()
                            setCollapsed(true) // 👈 collapse again
                          }}
                          variant='text'
                          sx={{ textTransform: 'none', color: '#555' }}
                        >
                          Cancel
                        </Button>
                        <Button
                          ref={saveRef}
                          variant='contained'
                          onClick={handleSave}
                          disabled={loader}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            bgcolor: '#0096db',
                            '&:hover': { bgcolor: '#0288d1' }
                          }}
                        >
                          {loader ? <CircularProgress size={18} color='inherit' /> : editingNote ? 'Update' : 'Save'}
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          )}
        </Box>
      </Box>

      {/* Loader div (trigger infinite scroll) */}

      {/* Modal */}
      <NoteDialog
        open={open}
        setOpen={setOpen}
        setEditingNote={setEditingNote}
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
              // setOpen(true)
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
