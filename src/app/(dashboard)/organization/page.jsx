'use client'

import {
  Grid,
  Typography,
  Divider,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Box,
  Card,
  CardContent
} from '@mui/material'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'
import { addOrganizationApi, getOrganizationByIdApi } from '@/apiFunctions/ApiAction'
import BusinessIcon from '@mui/icons-material/Business'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import GroupIcon from '@mui/icons-material/Group'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Image from 'next/image'
import LoaderGif from '@assets/gif/loader.gif'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'


function isValidMobileNumberStrict(value) {
  if (!/^\d+$/.test(value)) return false
  const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
  const regex = /^[0-9][0-9]*$/
  return regex.test(digitsOnly)
}

const Organization = () => {
   const router = useRouter()
  const organization_id = Cookies.get('organization_id')
  const [orgList, setOrgList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  // Fetch Organization details
  const orgFunctionCall = async organization_id => {
    setLoading(true)
    try {
      const orgListData = await getOrganizationByIdApi(organization_id)
      if (orgListData?.appStatusCode === 0) {
        setOrgList(orgListData?.payloadJson)
      } else {
        setOrgList(null)
      }
    } catch (error) {
      console.log('Error fetching organization', error)
    } finally {
      setLoading(false)
    }
  }

  // Logo Upload Handler
  const handleLogoUpload = async file => {
    if (!file) return

    // Show preview immediately
    setLogoPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/v1/admin/upload-logo', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Logo uploaded successfully!', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        // Save the uploaded file path in your orgList (server URL)
        setOrgList(prev => ({ ...prev, organization_logo: data.filePath }))
        // Optional: Update preview with server URL
        setLogoPreview(data.filePath)
      } else {
        toast.error('Failed to upload logo', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong', {
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

  const handleLogoDelete = async () => {
    if (!orgList.organization_logo) return

    try {
      const res = await fetch('/api/v1/admin/delete-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: orgList.organization_logo }) // send server path
      })
      const data = await res.json()

      if (data.success) {
        Cookies.remove('organization_logo')
        toast.success('Logo deleted successfully!', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        setOrgList(prev => ({ ...prev, organization_logo: '' }))
        setLogoPreview(null)
      } else {
        toast.error('Failed to delete logo', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong', {
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

  useEffect(() => {
    if (organization_id) orgFunctionCall(organization_id)
  }, [organization_id])

  // Handle input change
  const handleInputChange = e => {
    const { name, value } = e.target

    if (name === 'organization_emp_count') {
      const res = isValidMobileNumberStrict(value)

      if (value.startsWith('0')) return // Prevent typing 0 at start
      if (!/^\d*$/.test(value)) return // Only digits allowed

      if (value === '' || res) {
        setOrgList(prev => ({ ...prev, [name]: value }))
      }
    } else {
      setOrgList(prev => ({ ...prev, [name]: value }))
    }
  }

  // Handle Save
  const handleSave = async () => {
    if (!orgList) return

    const payload = {
      Id: orgList._id,
      organization_address: orgList.organization_address,
      organization_currency: orgList.organization_currency,
      organization_emp_count: orgList.organization_emp_count,
      organization_logo: orgList.organization_logo
    }

    setUpdating(true)
    try {
      const updateRes = await addOrganizationApi(payload)
      if (updateRes?.appStatusCode === 0) {
        Cookies.set('organization_logo', orgList?.organization_logo)
        toast.success('Organization Updated Successfully!', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        router.refresh()
      } else {
        toast.error('Update Failed!', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      }
    } catch (err) {
      toast.error('Error updating organization!', {
        autoClose: 500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    setLogoPreview(orgList?.organization_logo || null)
  }, [orgList?.organization_logo])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', // full screen center
          width: '100vw',
          bgcolor: 'rgba(255, 255, 255, 0.7)', // semi-transparent overlay
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1300 // above all dialogs
        }}
      >
        <Image src={LoaderGif} alt='loading' width={100} height={100} />
      </Box>

      // <Grid container justifyContent='center' alignItems='center' height='60vh'>
      //   <CircularProgress />
      // </Grid>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Box
          sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: '#fff',
            p: 2,
            borderRadius: 2,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <BusinessIcon fontSize='large' />
          <Typography variant='h5' fontWeight={600} color={"#fff"}>
            Organization Profile
          </Typography>
        </Box>

        {orgList ? (
          <>

            {/* Logo Section */}
            <Grid container spacing={3} alignItems='center'>
              <Grid item xs={12} md={3}>
                <Avatar
                  src={logoPreview || orgList.organization_logo || ''}
                  alt='Org Logo'
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 2,
                    boxShadow: 2,
                    bgcolor: '#f5f5f5',
                    border: '2px solid #ddd'
                  }}
                />
              </Grid>

              <Grid item xs={12} md={9}>
                <Box display='flex' gap={2} alignItems='center'>
                  {/* Hidden File Input */}
                  <input
                    type='file'
                    id='logoUploadInput'
                    style={{ display: 'none' }}
                    accept='image/*'
                    onChange={e => handleLogoUpload(e.target.files[0])}
                  />

                  {/* Upload Button */}
                  <Button
                    variant='outlined'
                    startIcon={<CloudUploadIcon />}
                    onClick={() => document.getElementById('logoUploadInput').click()}
                  >
                    Upload Logo
                  </Button>

                  {/* Delete Button — only show if logo exists */}
                  {orgList.organization_logo && (
                    <Button variant='outlined' color='error' onClick={handleLogoDelete}>
                      Delete Logo
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Editable Fields */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  disabled
                  fullWidth
                  label='Organization Name'
                  name='organization_name'
                  value={orgList.organization_name || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Employee Count'
                  name='organization_emp_count'
                  value={orgList.organization_emp_count || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <GroupIcon sx={{ mr: 1 }} />
                  }}
                  inputProps={{
                    minLength: 1,
                    maxLength: 3
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Organization Address'
                  name='organization_address'
                  value={orgList?.organization_address?.split(',').join('\n') || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <LocationOnIcon sx={{ mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Currency'
                  name='organization_currency'
                  value={orgList.organization_currency || ''}
                  onChange={handleInputChange}
                  InputProps={{
                    startAdornment: <MonetizationOnIcon sx={{ mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label='Created At'
                  value={new Date(orgList.createdAt).toLocaleDateString()}
                  InputProps={{ readOnly: true, startAdornment: <CalendarTodayIcon sx={{ mr: 1 }} /> }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Chip label={`Version: ${orgList.c_version}`} color='primary' variant='outlined' />
              </Grid>
               <Grid item xs={12} md={6}>
                     <Box display={'flex'} justifyContent={'flex-end'} gap={2}>
                     <Button
                  variant='contained'
                  size='large'
                  
                  sx={{ py: 1.2, fontWeight: 600 }}
                  onClick={handleSave}
                  disabled={updating}
                >
                  {updating ?  "Updating...": 'Save Changes'}
                </Button>
                  </Box>
               </Grid>
                 
               
            
            </Grid>
            
          </>
        ) : (
          <Typography>No Organization Data Found</Typography>
        )}
      </Paper>
    </Box>
  )
}

export default Organization
