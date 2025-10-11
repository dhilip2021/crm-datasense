import React from 'react'
import {
  TextField,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

function NoteDialog({
  open,
  setOpen,
  setEditingNote,
  handleClear,
  editingNote,
  title,
  note,
  handleChange,
  noteRef,
  noteError,
  loader,
  handleSave,
  saveRef
}) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Box display='flex' alignItems='center' justifyContent='space-between'>
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
          value={title}
          onChange={handleChange}
          name='title'
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          autoFocus
          placeholder="What's this note about? *"
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
            if (e.key === ' ' && note.length === 0) {
              e.preventDefault()
            } else if (e.key === 'Enter' && e.shiftKey) {
              e.preventDefault()
              saveRef.current?.focus()
            }
          }}
        />
      </DialogContent>

      <DialogActions>
        <Box display='flex' justifyContent='space-between' width='100%'>
          <Button
            variant='outlined'
            onClick={() => {
              setOpen(false)
              setEditingNote(null)
              handleClear()
            }}
            disabled={loader}
          >
            Close
          </Button>
          <Button ref={saveRef} variant='contained' onClick={handleSave} disabled={loader || note?.length === 0}>
            {loader ? <CircularProgress size={18} /> : editingNote ? 'Update' : 'Save'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default NoteDialog
