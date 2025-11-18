'use client'

import {
  Box,
  Typography,
  Chip,
  Divider,
  IconButton,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  CircularProgress
} from '@mui/material'
import FlagIcon from '@mui/icons-material/Flag'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export default function LeadCard({ fields, leadId, leadData, onToggleFlag, sections, handleFieldSave }) {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const router = useRouter()

    const [data, setData] = useState({ winReasons: [], lossReasons: [] })
    const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [leadStatus, setLeadStatus] = useState(fields['Lead Status'] || '')
  const [leadLossReasons, setLossLeadReasons] = useState(
  Array.isArray(fields?.['Loss Reasons']) ? fields['Loss Reasons'] : []
)
const [leadWonReasons, setWonLeadReasons] = useState(
  Array.isArray(fields?.['Win Reasons']) ? fields['Win Reasons'] : []
)
  const [openReasonDialog, setOpenReasonDialog] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState([])
  const [reasonType, setReasonType] = useState('') // "won" or "lost"

  // Lead Status options
  const leadStatusOptions =
    sections
      .flatMap(sec => [...sec.fields.left, ...sec.fields.center, ...sec.fields.right])
      .find(f => f.label === 'Lead Status')?.options || []


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
         console.log(result.data,"<<< fetch Data resposne 123....")
        if (result.success) setData(result.data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch reasons')
        setLoading(false)
      }
    }
  






  // --- Handle Status Change ---
  const handleStatusChange = e => {
    const newStatus = e.target.value

    if (newStatus === 'Closed Lost') {
      setReasonType('lost')
      setOpenReasonDialog(true)
    } else if (newStatus === 'Closed Won') {
      setReasonType('won')
      setOpenReasonDialog(true)
    } else {
      setLeadStatus(newStatus)
      handleFieldSave('Lead Status', newStatus, '', '')
    }

    setEditing(false)
  }

  // --- Handle reason toggle ---
  const handleToggleReason = reason => {
    setSelectedReasons(prev => (prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]))
  }

  // --- Confirm reason selection ---
  const handleConfirmReasons = () => {
    const status = reasonType === 'won' ? 'Closed Won' : 'Closed Lost'
    const reasonKey = reasonType === 'won' ? 'Win Reasons' : 'Loss Reasons'

    setLeadStatus(status)
    handleFieldSave('Lead Status', status, reasonKey, selectedReasons)
    setOpenReasonDialog(false)
    setSelectedReasons([])
    setReasonType('')
  }

  // --- Close dialog ---
  const handleCloseDialog = () => {
    setOpenReasonDialog(false)
    setSelectedReasons([])
    setReasonType('')
  }

     useEffect(() => {
  setLeadStatus(fields?.['Lead Status'] || '')
  setWonLeadReasons(Array.isArray(fields?.['Win Reasons']) ? fields['Win Reasons'] : [])
  setLossLeadReasons(Array.isArray(fields?.['Loss Reasons']) ? fields['Loss Reasons'] : [])
}, [fields])


    useEffect(() => {
      if (organization_id) fetchReasons()
    }, [organization_id])

  return (
    <>
      <Box
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          p: 3,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }}
        mt={2}
        mb={4}
      >
        {/* Header Section */}
        <Box display='flex' justifyContent='space-between'>
          <Box>
            <Box display='flex' alignItems='center' mb={2}>
              <Typography variant='h5' fontWeight='bold' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {fields['First Name']} {fields['Last Name']}
              </Typography>
              <IconButton
                onClick={() => onToggleFlag(leadData)}
                sx={{
                  bgcolor: leadData.lead_flag === 0 ? 'grey.200' : 'orange.100',
                  '&:hover': {
                    bgcolor: leadData.lead_flag === 0 ? 'grey.300' : 'orange.200'
                  },
                  borderRadius: '8px',
                  transition: '0.3s'
                }}
              >
                <FlagIcon sx={{ color: leadData.lead_flag === 0 ? 'grey' : 'orange', fontSize: 28 }} />
              </IconButton>
            </Box>

            {/* Editable Lead Status */}
            {editing ? (
              <TextField
                select
                value={leadStatus}
                onChange={handleStatusChange}
                size='small'
                onBlur={() => setEditing(false)}
              >
                {leadStatusOptions.map(opt => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Box>
                <Chip
                  label={leadStatus}
                  color='primary'
                  variant='outlined'
                  size='small'
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setEditing(true)}
                />

                {leadStatus === 'Closed Won' && leadWonReasons.length > 0 && (
                  <Box mt={1}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                      Win Reasons:
                    </Typography>
                    <Box display='flex' flexWrap='wrap' gap={1}>
                      {leadWonReasons.map((reason, index) => (
                        <Chip key={index} label={reason} color='success' variant='outlined' size='small' />
                      ))}
                    </Box>
                  </Box>
                )}

                {leadStatus === 'Closed Lost' && leadLossReasons.length > 0 && (
                  <Box mt={1}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 0.5 }}>
                      Loss Reasons:
                    </Typography>
                    <Box display='flex' flexWrap='wrap' gap={1}>
                      {leadLossReasons.map((reason, index) => (
                        <Chip key={index} label={reason} color='error' variant='outlined' size='small' />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Typography variant='body1'>
            <strong>Score:</strong>{' '}
            <Chip
              label={fields['Score']}
              color={fields['Score'] >= 70 ? 'success' : 'warning'}
              sx={{ fontWeight: 'bold' }}
            />
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Lead Details */}
        <Box display='flex' flexDirection='column' gap={1.2}>
          <Typography variant='body1'>
            Lead Id: <span style={{ fontWeight: 600 }}>{leadId}</span>
          </Typography>
          <Typography variant='body1' color={'#000'}>
            City:<span style={{ color: '#374151', fontWeight: 600 }}> {fields['City']}</span>
          </Typography>
          <Typography variant='body1'>
            Deal Name: <span style={{ fontWeight: 600 }}>{fields['Deal Name']}</span>
          </Typography>
          <Typography variant='body1'>
            Designation: <span style={{ fontWeight: 600 }}>{fields['Job Title']}</span>
          </Typography>
          <Typography variant='body1'>
            Website:{' '}
            {fields['Website'] ? (
              <a
                href={fields['Website'].startsWith('http') ? fields['Website'] : `https://${fields['Website']}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
              >
                {fields['Website']}
              </a>
            ) : (
              <span style={{ fontWeight: 600 }}>-</span>
            )}
          </Typography>
          <Typography variant='body1'>
            Lead Source: <span style={{ fontWeight: 600 }}>{fields['Lead Source']}</span>
          </Typography>
        </Box>
      </Box>

      {/* 💬 Win / Loss Reason Dialog */}
           <Dialog open={openReasonDialog} onClose={handleCloseDialog} maxWidth='xs' fullWidth>
             <DialogTitle sx={{ fontWeight: 600 }}>
               {reasonType === 'won' ? 'Select Win Reasons' : 'Select Loss Reasons'}
             </DialogTitle>
     
             <DialogContent dividers>
               {loading ? (
                 <Box display='flex' justifyContent='center' alignItems='center' py={3}>
                   <CircularProgress size={24} />
                 </Box>
               ) : (reasonType === 'won' ? data?.winReasons : data?.lossReasons)?.length > 0 ? (
                 <List>
                   {(reasonType === 'won' ? data?.winReasons : data?.lossReasons).map(reason => (
                     <ListItem key={reason} disablePadding>
                       <ListItemButton onClick={() => handleToggleReason(reason)}>
                         <ListItemIcon>
                           <Checkbox edge='start' checked={selectedReasons.includes(reason)} tabIndex={-1} disableRipple />
                         </ListItemIcon>
                         <ListItemText primary={reason} />
                       </ListItemButton>
                     </ListItem>
                   ))}
                 </List>
               ) : (
                 <Box textAlign='center' py={3}>
                   <Typography variant='body2' color='text.secondary' mb={2}>
                     No {reasonType === 'won' ? 'win' : 'loss'} reasons found.
                   </Typography>
                   <Button
                     variant='outlined'
                     color='primary'
                     size='small'
                     onClick={() => router.push('/reasons-master')} // ✅ Navigate to /reasons-master
                   >
                     ➕ Add New Reason
                   </Button>
                 </Box>
               )}
             </DialogContent>
     
             <DialogActions>
               <Button onClick={handleCloseDialog}>Cancel</Button>
               <Button
                 variant='contained'
                 color='primary'
                 disabled={selectedReasons.length === 0}
                 onClick={handleConfirmReasons}
               >
                 Confirm
               </Button>
             </DialogActions>
           </Dialog>
    </>
  )
}
