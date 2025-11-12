'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Grid
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'

export default function OpportunityReasonsManager() {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const [data, setData] = useState({ winReasons: [], lossReasons: [] })
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [type, setType] = useState('win')
  const [action, setAction] = useState('add')
  const [value, setValue] = useState('')
  const [oldValue, setOldValue] = useState('')

  // ✅ Fetch Data
  const fetchReasons = async () => {
    try {
      setLoading(true)

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const res = await fetch(`/api/v1/admin/opportunity/reasons?organization_id=${organization_id}`, {
        method: 'GET',
        headers: header
      })

      const result = await res.json()
      if (result.success) setData(result.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch reasons')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (organization_id) fetchReasons()
  }, [organization_id])

  // ✅ Save / Update
  const handleSave = async () => {
    if (!value.trim()) return toast.error('Reason cannot be empty')

    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const res = await fetch('/api/v1/admin/opportunity/reasons', {
        method: 'PUT',
        headers: header,
        body: JSON.stringify({ organization_id, type, action, value, oldValue })
      })

      const result = await res.json()
      if (result.success) {
        toast.success('Updated successfully')
        setDialogOpen(false)
        setValue('')
        setOldValue('')
        fetchReasons()
      } else toast.error(result.error || 'Update failed')
    } catch (err) {
      console.error(err)
      toast.error('Error saving reason')
    }
  }

  const handleDelete = async (reason, reasonType) => {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const res = await fetch('/api/v1/admin/opportunity/reasons', {
        method: 'PUT',
        headers: header,
        body: JSON.stringify({
          organization_id,
          type: reasonType,
          action: 'remove',
          value: reason
        })
      })

      const result = await res.json()
      if (result.success) {
        toast.success('Reason deleted')
        fetchReasons()
      } else toast.error(result.error)
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  // ✅ UI Layout
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h6' sx={{ fontWeight: 700, mb: 3 }}>
        Win / Loss Reasons List
      </Typography>

      {loading ? (
        <Stack alignItems='center' justifyContent='center' sx={{ py: 10 }}>
          <CircularProgress />
          <Typography variant='body2' sx={{ mt: 1 }}>
            Loading reasons...
          </Typography>
        </Stack>
      ) : (
        <Grid container spacing={4}>
          {/* 🟩 WIN REASONS */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                borderTop: '5px solid #16a34a',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  🏆 Win Reasons
                </Typography>
                <IconButton
                  color='success'
                  onClick={() => {
                    setType('win')
                    setAction('add')
                    setValue('')
                    setDialogOpen(true)
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {data.winReasons.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No win reasons found.
                </Typography>
              ) : (
                <Stack direction='row' flexWrap='wrap' gap={1}>
                  {data.winReasons.map(reason => (
                    <Chip
                      key={reason}
                      label={reason}
                      color='success'
                      variant='outlined'
                      onDelete={() => handleDelete(reason, 'win')}
                      deleteIcon={<DeleteIcon />}
                      onClick={() => {
                        setType('win')
                        setAction('edit')
                        setOldValue(reason)
                        setValue(reason)
                        setDialogOpen(true)
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>

          {/* 🟥 LOSS REASONS */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                borderTop: '5px solid #dc2626',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  ❌ Loss Reasons
                </Typography>
                <IconButton
                  color='error'
                  onClick={() => {
                    setType('loss')
                    setAction('add')
                    setValue('')
                    setDialogOpen(true)
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {data.lossReasons.length === 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 250
                  }}
                >
                  <Typography variant='h6' color='text.secondary'>
                    No loss reasons found
                  </Typography>
                </Box>
              ) : (
                <Stack direction='row' flexWrap='wrap' gap={1}>
                  {data.lossReasons.map(reason => (
                    <Chip
                      key={reason}
                      label={reason}
                      color='error'
                      variant='outlined'
                      onDelete={() => handleDelete(reason, 'loss')}
                      deleteIcon={<DeleteIcon />}
                      onClick={() => {
                        setType('loss')
                        setAction('edit')
                        setOldValue(reason)
                        setValue(reason)
                        setDialogOpen(true)
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ✏️ Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>{action === 'add' ? 'Add New Reason' : 'Edit Reason'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label='Reason' value={value} onChange={e => setValue(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleSave}>
            {action === 'add' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
