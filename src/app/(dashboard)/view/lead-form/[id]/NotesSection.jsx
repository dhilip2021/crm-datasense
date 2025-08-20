'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, TextField, Button, Box, IconButton, Avatar } from '@mui/material'
import { FormatBold, AttachFile } from '@mui/icons-material'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

function getIntial(name = '') {
  const reIntial = (name.match(/\p{L}+/gu) || []) // words with letters (Unicode-safe)
    .map(w => w[0].toUpperCase()) // take first letter of each
    .join('')

  return reIntial
}

const NotesSection = ({ leadId, leadData }) => {


const leadArrayData = leadData?.values?.Notes ? leadData.values.Notes : []

// ✅ proper sorting
const sortedNotes = [...leadArrayData].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
)


  const [note, setNote] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState(sortedNotes? sortedNotes : [])

  const [noteError, setNoteError] = useState(false)
  const [titleError, setTitleError] = useState(false)

  // 🔹 ref for auto-focus
  const titleRef = useRef(null)

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
  }

  // 🔹 Save new note
const handleSave = async () => {
  if (note === '') {
    setNoteError(true)
  } else if (title === '') {
    setTitleError(true)
  } else {
    setNoteError(false)
    setTitleError(false)

    try {
      const newNote = {
        title,
        note,
        createdAt: new Date().toISOString()
      }

      console.log(newNote, "<<< new Note")

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          values: {
            Notes: [newNote] // ✅ only send new note
          }
        })
      })

      const result = await res.json()
      console.log('Note saved:', result)

      if (result.success) {
        // ✅ update local state immutably
        setNotes(prev => [newNote, ...prev]) // put newest on top
      }

      setTitle('')
      setNote('')
    } catch (err) {
      console.error('Error saving note:', err)
    }
  }
}


  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3-content' id='panel3-header'>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Typography variant='h6' fontWeight='bold'>
              Notes
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* List notes */}
          {Array.isArray(notes) &&
            notes.map((n, i) => (
              <Card key={i} sx={{ p: 2, mb: 2 }}>
                <Box display='flex' alignItems='flex-start' gap={2}>
                  <Avatar>{getIntial(`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`)}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight='bold'>{n.title}</Typography>
                    <Typography>{n.note}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Lead - <b>{`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`}</b> •{' '}
                      {new Date(n.createdAt).toLocaleString()} by {n.createdBy}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}

          {/* Editor */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mt: 2 }}>
            <TextField
              placeholder='Title'
              variant='standard'
              fullWidth
              //   inputRef={titleRef}
              value={title}
              onChange={e => handleChange(e)}
              sx={{ mb: 1 }}
              name='title'
              error={titleError}
              helperText={titleError && 'Please enter title'}
            />
            <TextField
              placeholder="What's this note about?"
              multiline
              rows={4}
              fullWidth
              value={note}
              onChange={e => handleChange(e)}
              sx={{ mb: 2 }}
              name='note'
              error={noteError}
              helperText={noteError && 'Please enter notes'}
            />

            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Box>
                <IconButton>
                  <FormatBold />
                </IconButton>
                <IconButton>
                  <AttachFile />
                </IconButton>
              </Box>
              <Box>
                <Button onClick={() => handleClear()}>Clear</Button>
                <Button variant='contained' onClick={()=>handleSave()}>
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default NotesSection
