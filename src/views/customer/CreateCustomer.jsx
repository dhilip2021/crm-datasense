/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

import Cookies from 'js-cookie'

import { ToastContainer, toast } from 'react-toastify'

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material'

import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import { createCustomer } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'

const salutationOptions = [
  { label: 'Dr' },
  { label: 'Madam' },
  { label: 'Master' },
  { label: 'Miss' },
  { label: 'Mr' },
  { label: 'Mrs' },
  { label: 'Ms' },
  { label: 'Mx' },
  { label: 'Prof' }
]
const prospectOptions = [{ label: 'ABC Tech' }, { label: 'XRF Design' }]

const genderOptions = [
  { label: 'Female' },
  { label: 'Genderqueer' },
  { label: 'Male' },
  { label: 'Non-Conforming' },
  { label: 'Other' },
  { label: 'Prefer not to say' },
  { label: 'Transgender' }
]
const territories = [
  { label: 'All Territories', group: 'Global' },
  { label: 'India', group: 'All Territories' },
  { label: 'Rest Of The World', group: 'All Territories' },
  { label: 'Tamil Nadu', group: 'All Territories' }
]

const leadOptions = [
  {
    id: 'CRM-LEAD-2025-00001',
    description: 'Recommendations, Administrator, Opportunity'
  },
  {
    id: 'CRM-LEAD-2025-00003',
    description: 'Notifications-noreply, Administrator, Opportunity'
  },
  {
    id: 'CRM-LEAD-2025-00004',
    description: 'Support, Administrator, Opportunity'
  },
  {
    id: 'CRM-LEAD-2025-00005',
    description: 'Googledev-noreply, Administrator, Opportunity'
  },
  {
    id: 'CRM-LEAD-2025-00006',
    description: 'Sc-noreply, Administrator, Opportunity'
  }
]

const opportunityOptions = [
  {
    id: 'CRM-OPP-2025-00017',
    description: "Is AI replacing recruiters? Here's what…, Open, 2025-07-28, CRM-LEAD-2025-00003, Sales, WAM DS"
  },
  {
    id: 'CRM-OPP-2025-00018',
    description: 'Dhilip, follow Brais Moure…, Open, 2025-07-28, CRM-LEAD-2025-00008, Sales, WAM DS'
  },
  {
    id: 'CRM-OPP-2025-00019',
    description: 'Dhilip, just trust us…, Open, 2025-07-28, CRM-LEAD-2025-00001, Sales, WAM DS'
  }
]

const accountManagerOptions = [
  {
    id: 'Administrator',
    display: 'Administrator'
  },
  {
    id: 'dhilipbeece001@gmail.com',
    display: 'dhilipbeece001@gmail.com',
    description: 'Dhilip Personal'
  },
  {
    id: 'Guest',
    display: 'Guest'
  }
]

const CreatCustomer = () => {
  const getToken = Cookies.get('_token')
  const router = useRouter()

  const [loader, setLoader] = useState(false)
  const [inputs, setInputs] = useState({
    customer_name: '',
    customer_type: 'Company',
    salutation: '',
    gender: '',
    territory_id: '',
    lead_id: '',
    opportunity_id: '',
    prospect_id: '',
    account_manager: '',
    billing_currency_id: '',
    price_list_id: '',
    bank_account_id: ''
  })
  const [errors, setErrors] = useState({})

  const handleBlur = e => {
    const { name, value } = e.target

    if (value.trim() === '') {
      setErrors(prev => ({
        ...prev,
        [name]: 'This field is required'
      }))
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    setInputs(prev => ({ ...prev, [name]: value }))

    // Clear error on change
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const CustomerApiCall = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)

    const results = await createCustomer(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
    } else {
      setLoader(false)
      toast?.success(results?.message)
      router.push('/leads')
    }
  }

  const handleSubmit = () => {}

  const handleClick = () => {
    router.push('/customer')
  }

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
            </Box>
          )}
        </Box>
      </Card>

      <Card className='bs-full'>
        <CardContent>
          <Box pt={2} pb={5}>
            <Typography variant='h5'>Customer Details :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}>
                {inputs?.customer_type === 'Individual' && (
                  <Grid item xs={3}>
                    <Autocomplete
                      fullWidth
                      options={[...salutationOptions, { label: '__create' }, { label: '__advanced' }]}
                      getOptionLabel={option => {
                        if (option.label === '__create') return 'Create a new Salutation'
                        if (option.label === '__advanced') return 'Advanced Search'
                        return option.label
                      }}
                      onChange={(event, newValue) => {
                        if (newValue?.label === '__create') {
                          alert('Open Create Salutation modal')
                        } else if (newValue?.label === '__advanced') {
                          alert('Open Advanced Search')
                        } else {
                          setInputs(prev => ({ ...prev, salutation: newValue?.label || '' }))
                        }
                      }}
                      renderOption={(props, option) => {
                        if (option.label === '__create') {
                          return (
                            <li {...props}>
                              <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                              Create a new Salutation
                            </li>
                          )
                        }
                        if (option.label === '__advanced') {
                          return (
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          )
                        }
                        return (
                          <li {...props}>
                            <strong>{option.label}</strong>
                          </li>
                        )
                      }}
                      renderInput={params => (
                        <TextField {...params} label='Salutation' variant='outlined' size='small' />
                      )}
                      value={salutationOptions.find(opt => opt.label === inputs.salutation) || null}
                    />
                  </Grid>
                )}

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    onBlur={handleBlur}
                    autoComplete='off'
                    id='outlined-basic'
                    label='Customer Name *'
                    variant='outlined'
                    type='text'
                    name='customer_name'
                    size='small'
                    value={inputs.customer_name}
                    onChange={handleChange}
                    error={Boolean(errors.customer_name)}
                    helperText={errors.customer_name}
                    //    sx={{
                    //     '& .MuiOutlinedInput-root': {
                    //       position: 'relative',
                    //       '&::before': {
                    //         content: '""',
                    //         position: 'absolute',
                    //         left: 0,
                    //         top: 0,
                    //         bottom: 0,
                    //         width: '4px', // thickness of the strip
                    //         backgroundColor: 'error.main',
                    //         borderTopLeftRadius: '4px', // match the TextField’s rounded corners
                    //         borderBottomLeftRadius: '4px'
                    //       }
                    //     }
                    //   }}
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    onBlur={handleBlur}
                    autoComplete='off'
                    id='customer-type'
                    label='Customer Type *'
                    variant='outlined'
                    select
                    name='customer_type'
                    size='small'
                    value={inputs.customer_type}
                    onChange={handleChange}
                    error={Boolean(errors.customer_type)}
                    helperText={errors.customer_type}
                  >
                    <MenuItem value='Individual'>Individual</MenuItem>
                    <MenuItem value='Company'>Company</MenuItem>
                    <MenuItem value='Government'>Government</MenuItem>
                  </TextField>
                </Grid>

                {inputs?.customer_type === 'Individual' && (
                  <Grid item xs={3}>
                    <Autocomplete
                      fullWidth
                      options={[...genderOptions, { label: '__create' }, { label: '__advanced' }]}
                      getOptionLabel={option => {
                        if (option.label === '__create') return 'Create a new Gender'
                        if (option.label === '__advanced') return 'Advanced Search'
                        return option.label
                      }}
                      onChange={(event, newValue) => {
                        if (!newValue) return

                        if (newValue.label === '__create') {
                          alert('Open Create New Gender Dialog')
                        } else if (newValue.label === '__advanced') {
                          alert('Open Advanced Gender Search Dialog')
                        } else {
                          setInputs(prev => ({
                            ...prev,
                            gender: newValue.label
                          }))
                        }
                      }}
                      renderOption={(props, option) => {
                        if (option.label === '__create') {
                          return (
                            <li {...props}>
                              <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                              Create a new Gender
                            </li>
                          )
                        }

                        if (option.label === '__advanced') {
                          return (
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          )
                        }

                        return (
                          <li {...props}>
                            <strong>{option.label}</strong>
                          </li>
                        )
                      }}
                      value={genderOptions.find(opt => opt.label === inputs.gender) || null}
                      renderInput={params => <TextField {...params} label='Gender' variant='outlined' size='small' />}
                    />
                  </Grid>
                )}

                <Grid item xs={3}>
                  <Autocomplete
                    fullWidth
                    options={territories}
                    groupBy={option => option.group}
                    getOptionLabel={option => option.label}
                    value={territories.find(opt => opt.label === inputs.territory_id) || null}
                    onChange={(event, newValue) => {
                      if (typeof newValue === 'string') return

                      if (newValue?.label === '__create') {
                        // Handle Create Territory logic here
                        alert('Open Create New Territory Modal')
                      } else if (newValue?.label === '__advanced') {
                        // Handle Advanced Search logic
                        alert('Open Advanced Search Modal')
                      } else {
                        setInputs(prev => ({ ...prev, territory_id: newValue?.label || '' }))
                      }
                    }}
                    renderOption={(props, option) => {
                      // Special options
                      if (option.label === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Territory
                          </li>
                        )
                      }
                      if (option.label === '__advanced') {
                        return (
                          <li {...props}>
                            <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                            Advanced Search
                          </li>
                        )
                      }

                      // Normal options
                      return (
                        <li {...props}>
                          <div>
                            <strong>{option.label}</strong>
                            <div style={{ fontSize: '12px', color: '#999' }}>{option.group}</div>
                          </div>
                        </li>
                      )
                    }}
                    renderInput={params => <TextField {...params} label='Territory' size='small' variant='outlined' />}
                    // Append extra options at bottom
                    filterOptions={options => [...options, { label: '__create' }, { label: '__advanced' }]}
                  />
                </Grid>

                <Grid item xs={3}>
                  <Autocomplete
                    fullWidth
                    options={[...leadOptions, { id: '__create' }, { id: '__advanced' }]}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Lead'
                      if (option.id === '__advanced') return 'Advanced Search'
                      return option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Open Create Lead Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Open Advanced Search')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          lead_id: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Lead
                          </li>
                        )
                      }
                      if (option.id === '__advanced') {
                        return (
                          <li {...props}>
                            <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                            Advanced Search
                          </li>
                        )
                      }

                      return (
                        <li {...props}>
                          <div>
                            <strong>{option.id}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>{option.description}</div>
                          </div>
                        </li>
                      )
                    }}
                    renderInput={params => <TextField {...params} label='From Lead' variant='outlined' size='small' />}
                    value={leadOptions.find(opt => opt.id === inputs.lead_id) || null}
                  />
                </Grid>

                <Grid item xs={3}>
                  <Autocomplete
                    fullWidth
                    options={[...opportunityOptions, { id: '__create' }, { id: '__advanced' }]}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Opportunity'
                      if (option.id === '__advanced') return 'Advanced Search'
                      return option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Open Create New Opportunity Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Open Advanced Opportunity Search')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          opportunity_id: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Opportunity
                          </li>
                        )
                      }
                      if (option.id === '__advanced') {
                        return (
                          <li {...props}>
                            <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                            Advanced Search
                          </li>
                        )
                      }

                      return (
                        <li {...props}>
                          <div>
                            <strong>{option.id}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>{option.description}</div>
                          </div>
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} label='From Opportunity' variant='outlined' size='small' />
                    )}
                    value={opportunityOptions.find(opt => opt.id === inputs.opportunity_id) || null}
                  />
                </Grid>

                <Grid item xs={3}>
                  <Autocomplete
                    fullWidth
                    options={[...prospectOptions, { label: '__create' }, { label: '__advanced' }]}
                    getOptionLabel={option => {
                      if (option.label === '__create') return 'Create a new Prospect'
                      if (option.label === '__advanced') return 'Advanced Search'
                      return option.label
                    }}
                    onChange={(event, newValue) => {
                      if (newValue?.label === '__create') {
                        alert('Open Create Prospect modal')
                      } else if (newValue?.label === '__advanced') {
                        alert('Open Advanced Search')
                      } else {
                        setInputs(prev => ({ ...prev, prospect_id: newValue?.label || '' }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.label === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Prospect
                          </li>
                        )
                      }
                      if (option.label === '__advanced') {
                        return (
                          <li {...props}>
                            <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                            Advanced Search
                          </li>
                        )
                      }
                      return (
                        <li {...props}>
                          {' '}
                          <strong>{option.label}</strong>
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} label='From Prospect' variant='outlined' size='small' />
                    )}
                    value={prospectOptions.find(opt => opt.label === inputs.prospect_id) || null}
                  />
                </Grid>

                <Grid item xs={3}>
                  <Autocomplete
                    fullWidth
                    options={[...accountManagerOptions, { id: '__create' }, { id: '__advanced' }]}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new User'
                      if (option.id === '__advanced') return 'Advanced Search'
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create User Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Advanced Search Window')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          account_manager: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new User
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <li {...props}>
                            <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                            Advanced Search
                          </li>
                        )
                      }

                      return (
                        <li {...props}>
                          <div>
                            <strong>{option.display}</strong>
                            {option.description && (
                              <div style={{ fontSize: '12px', color: '#666' }}>{option.description}</div>
                            )}
                          </div>
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Account Manager' variant='outlined' size='small' />
                    )}
                    value={accountManagerOptions.find(opt => opt.id === inputs.account_manager) || null}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box pt={5} pb={5}>
            <Typography variant='h5'>Address & Contacts :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}></Grid>
            </Box>
          </Box>

          <Box pt={5} pb={5}>
            <Typography variant='h5'>Tax :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}></Grid>
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

      <ToastContainer />
    </Box>
  )
}

export default CreatCustomer
