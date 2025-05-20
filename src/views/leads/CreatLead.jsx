/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import Cookies from 'js-cookie'

import { ToastContainer, toast } from 'react-toastify'

import { Box, Button, Card, CardContent, Divider, Grid, InputAdornment, MenuItem, Select, TextField, Typography } from '@mui/material'

import { createLead, getFieldListApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'

const keys = [
  'organization_id',
  'salutation',
  'lead_name',
  'lead_id',
  'lead_slug_name',
  'first_name',
  'last_name',
  'email',
  'mobile',
  'phone',
  'gender',
  'organization',
  'website',
  'no_of_employees',
  'annual_revenue',
  'industry',
  'job_title',
  'lead_source',
  'status',
  'live_status'
]

const getMatchedKey = slugLabel => {
  const snakeKey = slugLabel.replace(/-/g, '_')

  return keys.find(key => snakeKey.includes(key)) || snakeKey
}

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeEmail(email) {
  return email.toLowerCase()
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return regex.test(email)
}

function isValidNumberStrict(value) {
  const regex = /^[1-9][0-9]*$/

  return regex.test(value)
}

function isValidMobileNumberStrict(value) {
  if (value?.length > 10) {
    return false
  } else {
    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[6-9][0-9]*$/

    return regex.test(digitsOnly)
  }
}

function formatIndianNumber(number) {
  return new Intl.NumberFormat('en-IN').format(Number(number))
}

function formatURL(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }

  return url
}

const CreatLead = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const router = useRouter()

  const [loader, setLoader] = useState(false)
  const [fieldDataList, setFieldDataList] = useState([])
  const [inputs, setInputs] = useState([])
  const [errors, setErrors] = useState([])

  const handleBlur = () => {
    const missingFields = inputs
      .filter(item => item.mandatory === 'yes' && !item.value?.trim())
      .map(item => item.slug_label)

    setErrors(missingFields)

    const emailField = inputs.find(item => item.slug_label === 'email')

    if (emailField && emailField.value.trim() !== '') {
      const emailCheck = isValidEmail(emailField.value)

      if (!emailCheck) {
        // Add "email" to the error state if it's not already included
        setErrors(prevErrors => (prevErrors.includes('email') ? prevErrors : [...prevErrors, 'email']))
      } else {
        // Remove "email" from errors if it's valid
        setErrors(prevErrors => prevErrors.filter(e => e !== 'email'))
      }
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    // Helper to remove error when field is valid
    const removeError = field => {
      setErrors(prevErrors => prevErrors.filter(err => err !== field))
    }

    if (name === 'email') {
      setInputs(prevInputs =>
        prevInputs.map(input => (input.slug_label === name ? { ...input, value: normalizeEmail(value) } : input))
      )
      if (normalizeEmail(value)) removeError(name)
    } else if (name === 'annual-revenue') {
      const cleanedValue = value.replace(/,/g, '') // remove commas
      const res = Number(cleanedValue)

      if (value === '' || !isNaN(res)) {
        const formattedValue = value === '' ? '' : formatIndianNumber(cleanedValue)

        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: formattedValue } : input))
        )

        if (value === '' || !isNaN(res)) removeError(name)
      }
    } else if (name === getMatchedKey('mobile-no')) {
      const res = isValidMobileNumberStrict(value)

      if (value === '' || res) {
        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: value } : input))
        )
        if (res || value === '') removeError(name)
      }
    } else if (name === getMatchedKey('phone-no')) {
      const res = isValidMobileNumberStrict(value)

      if (value === '' || res) {
        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: value } : input))
        )
        if (res || value === '') removeError(name)
      }
    } else if (name === 'website') {
      setInputs(prevInputs =>
        prevInputs.map(input =>
          input.slug_label === name ? { ...input, value: normalizeEmail(formatURL(value)) } : input
        )
      )
      if (normalizeEmail(value)) removeError(name)
    } else {
      setInputs(prevInputs =>
        prevInputs.map(input => (input.slug_label === name ? { ...input, value: capitalizeWords(value) } : input))
      )
      if (value.trim() !== '') removeError(name)
    }
  }

  const getFieldList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)

    const results = await getFieldListApi(organization_id, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      const resArr = results?.payloadJson[0]?.fields

      setFieldDataList(resArr)
      const dumArr = []

      resArr.map(data => {
        dumArr.push({
          label: data?.label,
          slug_label: data?.slug_label,
          mandatory: data?.mandatory,
          value: '',
          type: data?.type,
          items: data?.items
        })
      })

      setInputs(dumArr)
    } else {
      setFieldDataList([])
    }
  }

  const funcreateLead = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createLead(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
    } else {
      setLoader(false)
      toast?.success(results?.message)
      router.push('/leads')
      // router.push(`/leads/edit-lead/${results?.payloadJson?.lead_slug_name}`)
    }
  }

  const handleSubmit = () => {
    const inputObject = inputs.reduce((acc, curr) => {
      const matchedKey = getMatchedKey(curr.slug_label)

      acc[matchedKey] = curr.value

      return acc
    }, {})

    // Get all mandatory fields that are empty
    const missingFields = inputs
      .filter(item => item.mandatory === 'yes' && !item.value?.trim())
      .map(item => item.slug_label)

    let newErrors = [...missingFields]

    const emailField = inputs.find(item => item.slug_label === 'email')

    if (emailField && emailField.value.trim() !== '') {
      const emailCheck = isValidEmail(emailField.value)

      if (!emailCheck) {
        newErrors.push('email')
      }
    }

    // Remove duplicates using Set and update the error state
    setErrors(Array.from(new Set(newErrors)))

    // If there are any missing required fields
    if (Array.from(new Set(newErrors)).length > 0) {
      // setErrors([...errors, missingFields]);
      return false
    } else {
      // If all validations pass, prepare payload
      const body = {
        organization_id,
        live_status: 'lead',
        status: 'new',
        ...inputObject
      }

      // Submit the form (uncomment this in actual use)
      funcreateLead(body)
    }
  }

  const handleClick = () => {
    router.push('/leads')
  }

  useEffect(() => {
    getFieldList()
  }, [])
  useEffect(() => {
    console.log(inputs,"<<< INPUTSS")
  }, [inputs])
  

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Card>

        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          {loader && (
            <Box textAlign={'center'} width={'100%'} mt={'200px'} mb={'100px'}>
              <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
            </Box>
          )}
          {!loader && inputs?.length === 0 && (
            <Box textAlign={'center'} width={'100%'} mt={'100px'} mb={'100px'}>
              <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Fields Found</p>

              <Link href={'/fields/add-field'}>
                <Button
                  startIcon={<i className='ri-add-line'></i>}
                  color='primary'
                  variant='contained'
                  sx={{ color: '#fff', ml: 2, mt: 5 }}
                  type='submit'
                >
                  Add Field
                </Button>
              </Link>
            </Box>
          )}
        </Box>
      </Card>

      {Array.isArray(inputs) && inputs?.length > 0 && (
        <Card className='bs-full'>
         
         
          
            
        
      
          <CardContent>
          
            <Box pt={2} pb={5}>
            <Typography variant='h5'>Person :</Typography>
              <Box pt={2}>
                <Grid container spacing={6}>
                  {Array.isArray(inputs) &&
                    inputs?.slice(0, 7)?.map((item, index) => (
                      <>
                        {item?.type === 'text' && (
                          <Grid item xs={4}>
                            <TextField
                              autoComplete='off'
                              fullWidth
                              id='outlined-basic'
                              label={`${item?.label} ${item?.mandatory === 'yes' ? '*' : ''}`}
                              variant='outlined'
                              type='text'
                              name={item?.slug_label}
                              size='small'
                              value={item?.value}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors?.includes(item?.slug_label)}
                              helperText={errors?.includes(item?.slug_label) && `Please enter ${item?.label}`}
                              sx={{
                                '.MuiFormHelperText-root': {
                                  ml: 0
                                }
                              }}
                            />
                          </Grid>
                        )}
                        {item?.type === 'select' && (
                          <Grid item xs={4}>
                            <TextField
                              select
                              fullWidth
                              id='outlined-basic'
                              label={`${item?.label} ${item?.mandatory === 'yes' ? `*` : ''}`}
                              variant='outlined'
                              type='text'
                              name={item?.slug_label}
                              size='small'
                              value={item?.value}
                              onChange={handleChange}
                              error={errors?.includes(item?.slug_label)}
                              helperText={errors?.includes(item?.slug_label) && `Please select ${item?.label}`}
                              sx={{
                                '.MuiFormHelperText-root': {
                                  ml: 0
                                }
                              }}
                            >
                              {item?.items?.map((list, ids) => (
                                <MenuItem value={list?.menu_value} key={ids}>
                                  {list?.menu_value}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        )}
                      </>
                    ))}
                </Grid>
              </Box>
            </Box>
             
            <Box pt={5} pb={5}>
            <Typography variant='h5'>Organization :</Typography>
              <Box pt={2}>
                <Grid container spacing={6}>
                  {Array.isArray(inputs) &&
                    inputs?.slice(7)?.map((item, index) => (
                      <>
                        {item?.type === 'text' && (
                          <Grid item xs={4}>
                            <TextField
                              autoComplete='off'
                              fullWidth
                              id='outlined-basic'
                              label={`${item?.label} ${item?.mandatory === 'yes' ? '*' : ''}`}
                              variant='outlined'
                              type='text'
                              name={item?.slug_label}
                              size='small'
                              value={item?.value}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={errors?.includes(item?.slug_label)}
                              helperText={errors?.includes(item?.slug_label) && `Please enter ${item?.label}`}
                              sx={{
                                '.MuiFormHelperText-root': {
                                  ml: 0
                                }
                              }}
                            />
                          </Grid>
                        )}
                        {item?.type === 'select' && (
                          <Grid item xs={4}>
                            <TextField
                              select
                              fullWidth
                              id='outlined-basic'
                              label={`${item?.label} ${item?.mandatory === 'yes' ? `*` : ''}`}
                              variant='outlined'
                              type='text'
                              name={item?.slug_label}
                              size='small'
                              value={item?.value}
                              onChange={handleChange}
                              error={errors?.includes(item?.slug_label)}
                              helperText={errors?.includes(item?.slug_label) && `Please select ${item?.label}`}
                              sx={{
                                '.MuiFormHelperText-root': {
                                  ml: 0
                                }
                              }}
                            >
                              {item?.items?.map((list, ids) => (
                                <MenuItem value={list?.menu_value} key={ids}>
                                  {list?.menu_value}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        )}
                      </>
                    ))}
                </Grid>
              </Box>
            </Box>

            <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2} mt={4}>
              <Button color='primary' variant='outlined' onClick={handleClick}>
                Cancel
              </Button>
              <Button
                disabled={loader}
                onClick={handleSubmit}
                color='primary'
                variant='contained'
                sx={{ color: '#fff', ml: 2 }}
                type='submit'
              >
                Submit
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      <ToastContainer />
    </Box>
  )
}

export default CreatLead
