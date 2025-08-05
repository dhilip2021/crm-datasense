'use client'

import { Box, Button, Card, CardContent, Grid, MenuItem, TextField, Typography } from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import LoaderGif from '@assets/gif/loader.gif'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

function LeadFormPage() {
  const organization_id = Cookies.get('organization_id')
  const lead_form = 'lead-form'
 const router = useRouter()
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  //   const [page, setPage] = useState(0)
  const [sections, setSections] = useState([])
  const [formId, setFormId] = useState(null)
  const [values, setValues] = useState({})
  const [loader, setLoader] = useState(false)
  const handleChange = (fieldId, value) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleOnChange = e => {
    const { name, value } = e.target

    setSearch(value)
  }
  //   const handleChangePage = (event, newPage) => {
  //     setPage(newPage)
  //   }

  //   const handleChangeRowsPerPage = event => {
  //     setRowsPerPage(+event.target.value)
  //     setPage(0)
  //   }

  const handleClick = () => {
    router.push('/app/leads')
  }


  const handleSubmit = async () => {
    const missingFields = []
    const labelBasedValues = {}

    sections.forEach(section => {
      const allFields = [...(section.fields.left || []), ...(section.fields.right || [])]

      allFields.forEach(field => {
        const value = values[field.id]
        if (field.required && !value) {
          missingFields.push(field.label)
        }

        // Convert ID to Label
        if (value !== undefined && value !== '') {
          labelBasedValues[field.label] = value
        }
      })
    })

    if (missingFields.length > 0) {
      toast.error(`Please fill: ${missingFields.join(', ')}`)
      return
    }

    const payload = {
      organization_id,
      lead_form, // use the correct dynamic form name
      values: labelBasedValues,
      submittedAt: new Date().toISOString()
    }

    setLoader(true)

    // Uncomment below for actual submit
    const res = await fetch('/api/v1/admin/lead-form/form-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (data.success) {
      setLoader(false)
      toast.success('Form submitted successfully')
      setValues({})
    } else {
      setLoader(false)
      toast.error('Failed to submit form')
    }
  }

  const fetchFormByOrgAndName = async () => {
    setLoader(true)
    const res = await fetch(
      `/api/v1/admin/form-template/single?organization_id=${organization_id}&form_name=${lead_form}`
    )
    const json = await res.json()
    if (json?.success && json?.data?.sections?.length > 0) {
      setLoader(false)
      setSections(json?.data?.sections)
      setFormId(json.data._id)
    } else {
      setLoader(false)
      toast.error('Form not found')
    }
  }

  useEffect(() => {
    setCallFlag(true)
    fetchFormByOrgAndName()
  }, [])

  const renderField = field => {
    const label = (
      <>
        {field.label}
        {field.required && <span style={{ color: 'red' }}> *</span>}
      </>
    )

    switch (field.type) {
      case 'Dropdown':
        return (
          <TextField
            select
            fullWidth
            size='small'
            label={label}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
          >
            {field.options?.map((option, i) => (
              <MenuItem key={i} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        )

      case 'Multi-Line':
        return (
          <TextField
            fullWidth
            size='small'
            multiline
            minRows={field.rows || 3}
            label={label}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
          />
        )

      default:
        return (
          <TextField
            fullWidth
            size='small'
            label={label}
            placeholder={field.placeholder || ''}
            value={values[field.id] || ''}
            onChange={e => handleChange(field.id, e.target.value)}
          />
        )
    }
  }

  return (
    <Box>
      <Box px={3} py={4}>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          {loader && (
            <Box textAlign={'center'} width={'100%'}>
              <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  <Box p={40}>
                    <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {callFlag && !loader && sections?.length === 0 && (
            <Box textAlign={'center'} width={'100%'}>
              <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  <Box p={40}>
                    <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Leads Found</p>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {!loader &&
          sections?.length > 0 &&
          sections.map((section, sIndex) => (
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent>
                <Box key={section.id} gap={2} pb={2}>
                  <Typography fontWeight='bold' mb={2}>
                    {section.title || `Section ${sIndex + 1}`}
                  </Typography>

                  <Grid container spacing={2}>
                    {/* Left Column */}
                    <Grid item xs={12} sm={6} >
                      {(section.fields.left || []).map(field => (
                        <Box mb={4} key={field.id} >
                          {renderField(field)}
                        </Box>
                      ))}
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} sm={6} >
                      {(section.fields.right || []).map(field => (
                        <Box mb={4} key={field.id} >
                          {renderField(field)}
                        </Box>
                      ))}
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          ))}

        <Box display='flex' justifyContent='space-between' mt={2}>
             <Button variant='contained' color='warning'  onClick={handleClick}>
            cancel
          </Button>
          <Button variant='contained' color='primary' onClick={handleSubmit}>
            Submit
          </Button>
        </Box>

        <ToastContainer />
      </Box>
    </Box>
  )
}

export default LeadFormPage
