/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useEffect, useRef, useState } from 'react'

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

import {
  createCustomer,
  createGender,
  createSalutation,
  postGenderListApi,
  postSalutationListApi
} from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import AddSalutationPopup from '../salutation/AddSalutationPopup'
import { capitalizeWords } from '@/helper/frontendHelper'
import AddGenderPopup from '../gender/AddGenderPopup'

const prospectOptions = [{ label: 'ABC Tech' }, { label: 'XRF Design' }]

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

const billingCurrencyOptions = [
  { id: 'AED', display: 'AED' },
  { id: 'AUD', display: 'AUD' },
  { id: 'CHF', display: 'CHF' },
  { id: 'CNY', display: 'CNY' },
  { id: 'EUR', display: 'EUR' },
  { id: 'GBP', display: 'GBP' },
  { id: 'INR', display: 'INR' },
  { id: 'JPY', display: 'JPY' },
  { id: 'USD', display: 'USD' },
  { id: '__create' },
  { id: '__advanced' }
]

const priceListOptions = [
  {
    id: 'Standard Selling',
    display: 'Standard Selling',
    description: 'INR',
    filters: 'Selling = Yes'
  },
  { id: '__create' },
  { id: '__advanced' }
]

const companyBankAccountOptions = [
  { id: '__filter', filters: 'Is Company Account = Yes' },
  { id: '__create' },
  { id: '__advanced' }
]

const customerPrimaryAddressOptions = [
  { id: '__filter', filters: 'Is Customer new Address = Yes' },
  { id: '__create' },
  { id: '__advanced' }
]

const customerPrimaryContactOptions = [
  { id: '__filter', filters: 'Is Customer new Contact = Yes' },
  { id: '__create' },
  { id: '__advanced' }
]

const CreatCustomer = () => {
  const customerNameRef = useRef(null)
  const getToken = Cookies.get('_token')
  const router = useRouter()
  const [salutationOptions, setSalutationOptions] = useState([])
  const [genderOptions, setGenderOptions] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [inputs, setInputs] = useState({
    customer_name: '',
    customer_type: 'Individual',
    salutation: '',
    gender: '',
    territory_id: '',
    lead_id: '',
    opportunity_id: '',
    prospect_id: '',
    account_manager: '',
    billing_currency: '',
    default_price_list: '',
    default_bank_account: '',
    customer_address: '',
    customer_contact: ''
  })
  const [errors, setErrors] = useState({})

  // ********************************************** Salutation Function open **********************************************
  const [openSalutation, setOpenSalutation] = useState(false)
  const [titlesSalutation, setTitlesSalutation] = useState('Add your salutation')

  const [salutationInputs, setSalutationInputs] = useState({
    salutation_name: '',
    n_status: 1,
    _id: ''
  })

  const [salutationErrors, setSalutationErrors] = useState({
    salutation_name: false,
    n_status: false,
    _id: ''
  })

  const handleSalutationChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setSalutationErrors(prev => ({ ...prev, [name]: false }))
    setSalutationInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))
  }

  const addSalutationChanges = () => {
    setSalutationInputs({
      salutation_name: '',
      n_status: '',
      _id: ''
    })
    setOpenSalutation(true)
  }

  const handleSalutationClose = () => {
    setOpenSalutation(false)
    setSalutationErrors({ salutation_name: false, n_status: false })
    setSalutationInputs({
      salutation_name: '',
      n_status: '',
      _id: ''
    })
  }

  const handleSalutationSubmit = () => {
    setOpenSalutation(false)

    if (salutationInputs?.salutation_name === '') {
      setErrors(prev => ({ ...prev, ['salutation_name']: true }))
    } else {
      if (salutationInputs?._id === '') {
        const body = {
          salutation_name: salutationInputs?.salutation_name
        }
        salutationCreation(body)
      } else {
        const body = {
          Id: salutationInputs?._id,
          salutation_name: salutationInputs?.salutation_name
        }
        salutationCreation(body)
      }
    }
  }

  const salutationCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createSalutation(body, header)

    if (results?.appStatusCode !== 0) {
      setOpenSalutation(false)
      toast?.error(results?.error)
      setInputs(prev => ({ ...prev, salutation: '' }))
      getSalutationList()
    } else {
      setOpenSalutation(false)
      toast?.success(results?.message)
      setInputs(prev => ({ ...prev, salutation: results?.payloadJson?.salutation_name }))
      getSalutationList()
    }
  }

  const getSalutationList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const body = {
      n_page: page + 1,
      n_limit: rowsPerPage,
      c_search_term: search
    }

    const results = await postSalutationListApi(body, header)

    setSalutationOptions(results?.payloadJson[0]?.data || [])
  }

  // ********************************************** Salutation Function close **********************************************

  // ********************************************** Gender Function open **********************************************

  const [openGender, setOpenGender] = useState(false)
  const [titlesGender, setTitlesGender] = useState('Add your gender')

  const [genderInputs, setGenderInputs] = useState({
    gender_name: '',
    n_status: 1,
    _id: ''
  })

  const [genderErrors, setGenderErrors] = useState({
    gender_name: false,
    n_status: false,
    _id: ''
  })

  const handleGenderChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setGenderErrors(prev => ({ ...prev, [name]: false }))
    setGenderInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))
  }

  const addGenderChanges = () => {
    setGenderInputs({
      gender_name: '',
      n_status: '',
      _id: ''
    })
    setOpenGender(true)
  }

  const handleGenderClose = () => {
    setOpenGender(false)
    setGenderErrors({ gender_name: false, n_status: false })
    setGenderInputs({
      gender_name: '',
      n_status: '',
      _id: ''
    })
  }

  const handleGenderSubmit = () => {
    setOpenGender(false)

    if (genderInputs?.gender_name === '') {
      setErrors(prev => ({ ...prev, ['gender_name']: true }))
    } else {
      if (genderInputs?._id === '') {
        const body = {
          gender_name: genderInputs?.gender_name
        }
        genderCreation(body)
      } else {
        const body = {
          Id: genderInputs?._id,
          gender_name: genderInputs?.gender_name
        }
        genderCreation(body)
      }
    }
  }

  const genderCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createGender(body, header)

    if (results?.appStatusCode !== 0) {
      setOpenGender(false)
      toast?.error(results?.error)
      setInputs(prev => ({ ...prev, gender: '' }))
      getGenderList()
    } else {
      setOpenGender(false)
      toast?.success(results?.message)
      setInputs(prev => ({ ...prev, gender: results?.payloadJson?.gender_name }))
      getGenderList()
    }
  }

  const getGenderList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const body = {
      n_page: page + 1,
      n_limit: rowsPerPage,
      c_search_term: search
    }

    const results = await postGenderListApi(body, header)

    console.log(results, '<<< FFFFFF')

    setGenderOptions(results?.payloadJson[0]?.data || [])
  }

  // ********************************************** Gender Function close **********************************************

  const handleBlur = e => {
    const { name, value } = e.target
    if (value.trim() === '') {
      setErrors(prev => ({
        ...prev,
        [name]: `${name} is required`
      }))
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    setInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))

    // Clear error on change
    setErrors(prev => ({ ...prev, [name]: '' }))
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
      router.push('/customer')
    }
  }

  const handleSubmit = () => {
    const newErrors = {}

    if (!inputs.customer_name || inputs.customer_name.trim() === '') {
      newErrors.customer_name = 'Customer Name is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      console.log(inputs, '<<< INPUTSSSS')

      CustomerApiCall(inputs)
    } else {
      // Scroll to the first error field
      const firstErrorKey = Object.keys(newErrors)[0]

      if (firstErrorKey === 'customer_name') {
        customerNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const handleClick = () => {
    router.push('/customer')
  }

  useEffect(() => {
    getSalutationList()
    getGenderList()
  }, [])

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Card>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          {loader && (
             <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh", // full screen center
                    width: "100vw",
                    bgcolor: "rgba(255, 255, 255, 0.7)", // semi-transparent overlay
                    position: "fixed",
                    top: 0,
                    left: 0,
                    zIndex: 1300, // above all dialogs
                  }}
                >
                    <Image src={LoaderGif} alt="loading" width={200} height={200} />
                   
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
        {!loader && (
           <CardContent>
          <Box pt={2} pb={2}>
            <Typography variant='h5'>Customer Details :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}>
                {inputs?.customer_type === 'Individual' && (
                  <Grid item xs={3}>
                    <Autocomplete
                      fullWidth
                      options={[
                        ...salutationOptions,
                        { salutation_name: '__create' },
                        { salutation_name: '__advanced' }
                      ]}
                      getOptionLabel={option => {
                        if (option.salutation_name === '__create') return 'Create a new Salutation'
                        if (option.salutation_name === '__advanced') return 'Advanced Search'
                        return option.salutation_name
                      }}
                      onChange={(event, newValue) => {
                        if (newValue?.salutation_name === '__create') {
                          // alert('Open Create Salutation modal')
                          addSalutationChanges()
                        } else if (newValue?.salutation_name === '__advanced') {
                          alert('Open Advanced Search')
                        } else {
                          setInputs(prev => ({ ...prev, salutation: newValue?.salutation_name || '' }))
                        }
                      }}
                      renderOption={(props, option) => {
                        if (option.salutation_name === '__create') {
                          return (
                            <li {...props}>
                              <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                              Create a new Salutation
                            </li>
                          )
                        }
                        if (option.salutation_name === '__advanced') {
                          return (
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          )
                        }
                        return (
                          <li {...props}>
                            <strong>{option.salutation_name}</strong>
                          </li>
                        )
                      }}
                      renderInput={params => (
                        <TextField {...params} label='Salutation' variant='outlined' size='small' />
                      )}
                      value={salutationOptions.find(opt => opt.salutation_name === inputs.salutation) || null}
                    />
                  </Grid>
                )}

                <Grid item xs={3}>
                  <TextField
                    inputRef={customerNameRef}
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
                      options={[...genderOptions, { gender_name: '__create' }, { gender_name: '__advanced' }]}
                      getOptionLabel={option => {
                        if (option.gender_name === '__create') return 'Create a new Gender'
                        if (option.gender_name === '__advanced') return 'Advanced Search'
                        return option.gender_name
                      }}
                      onChange={(event, newValue) => {
                        if (!newValue) return

                        if (newValue.gender_name === '__create') {
                          // alert('Open Create New Gender Dialog')
                          addGenderChanges()
                        } else if (newValue.gender_name === '__advanced') {
                          alert('Open Advanced Gender Search Dialog')
                        } else {
                          setInputs(prev => ({
                            ...prev,
                            gender: newValue.gender_name
                          }))
                        }
                      }}
                      renderOption={(props, option) => {
                        if (option.gender_name === '__create') {
                          return (
                            <li {...props}>
                              <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                              Create a new Gender
                            </li>
                          )
                        }

                        if (option.gender_name === '__advanced') {
                          return (
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          )
                        }

                        return (
                          <li {...props}>
                            <strong>{option.gender_name}</strong>
                          </li>
                        )
                      }}
                      value={genderOptions.find(opt => opt.gender_name === inputs.gender) || null}
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
          <Box pt={2} pb={4}>
            <Typography variant='h5'>Defaults :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}>
                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={billingCurrencyOptions}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Currency'
                      if (option.id === '__advanced') return 'Advanced Search'
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create Currency Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Open Advanced Search for Currency')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          billing_currency: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Currency
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <>
                            <Divider style={{ margin: '4px 0' }} />
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          </>
                        )
                      }

                      return (
                        <li {...props}>
                          <strong>{option.display}</strong>
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Billing Currency' variant='outlined' size='small' />
                    )}
                    value={billingCurrencyOptions.find(opt => opt.id === inputs.billing_currency) || null}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={priceListOptions}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Price List'
                      if (option.id === '__advanced') return 'Advanced Search'
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create Price List Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Advanced Search for Price List')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          default_price_list: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Price List
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <>
                            <Divider style={{ margin: '4px 0' }} />
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          </>
                        )
                      }

                      return (
                        <li {...props}>
                          <div>
                            <strong>{option.display}</strong>
                            <div style={{ fontSize: '12px', color: '#666' }}>{option.description}</div>
                            {option.filters && (
                              <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                Filters applied for <strong>{option.filters}</strong>
                              </div>
                            )}
                          </div>
                        </li>
                      )
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Default Price List' variant='outlined' size='small' />
                    )}
                    value={priceListOptions.find(opt => opt.id === inputs.default_price_list) || null}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={companyBankAccountOptions}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Bank Account'
                      if (option.id === '__advanced') return 'Advanced Search'
                      if (option.id === '__filter') return ''
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create Bank Account Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Advanced Search for Bank Accounts')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          default_bank_account: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__filter') {
                        return (
                          <li {...props} style={{ pointerEvents: 'none' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Filters applied for <strong>{option.filters}</strong>
                            </div>
                          </li>
                        )
                      }

                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Bank Account
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <>
                            <Divider style={{ margin: '4px 0' }} />
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          </>
                        )
                      }

                      return <li {...props}>{option.display}</li>
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Default Company Bank Account' variant='outlined' size='small' />
                    )}
                    value={companyBankAccountOptions.find(opt => opt.id === inputs.default_bank_account) || null}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>

          <Box pt={5} pb={2}>
            <Typography variant='h5'>Address & Contacts :</Typography>
            <Box pt={2}>
              <Grid container spacing={6}>
                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={customerPrimaryAddressOptions}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Address'
                      if (option.id === '__advanced') return 'Advanced Search'
                      if (option.id === '__filter') return ''
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create new Address Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Advanced Search for new Address')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          customer_address: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__filter') {
                        return (
                          <li {...props} style={{ pointerEvents: 'none' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Filters applied for <strong>{option.filters}</strong>
                            </div>
                          </li>
                        )
                      }

                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Address
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <>
                            <Divider style={{ margin: '4px 0' }} />
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          </>
                        )
                      }

                      return <li {...props}>{option.display}</li>
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Customer Primary Address' variant='outlined' size='small' />
                    )}
                    value={customerPrimaryAddressOptions.find(opt => opt.id === inputs.customer_address) || null}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    fullWidth
                    options={customerPrimaryContactOptions}
                    getOptionLabel={option => {
                      if (option.id === '__create') return 'Create a new Contact'
                      if (option.id === '__advanced') return 'Advanced Search'
                      if (option.id === '__filter') return ''
                      return option.display || option.id
                    }}
                    onChange={(event, newValue) => {
                      if (!newValue) return

                      if (newValue.id === '__create') {
                        alert('Create new Contact Modal')
                      } else if (newValue.id === '__advanced') {
                        alert('Advanced Search for new Contact')
                      } else {
                        setInputs(prev => ({
                          ...prev,
                          customer_contact: newValue.id
                        }))
                      }
                    }}
                    renderOption={(props, option) => {
                      if (option.id === '__filter') {
                        return (
                          <li {...props} style={{ pointerEvents: 'none' }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Filters applied for <strong>{option.filters}</strong>
                            </div>
                          </li>
                        )
                      }

                      if (option.id === '__create') {
                        return (
                          <li {...props}>
                            <AddIcon fontSize='small' style={{ marginRight: 8 }} />
                            Create a new Contact
                          </li>
                        )
                      }

                      if (option.id === '__advanced') {
                        return (
                          <>
                            <Divider style={{ margin: '4px 0' }} />
                            <li {...props}>
                              <SearchIcon fontSize='small' style={{ marginRight: 8 }} />
                              Advanced Search
                            </li>
                          </>
                        )
                      }

                      return <li {...props}>{option.display}</li>
                    }}
                    renderInput={params => (
                      <TextField {...params} label='Customer Primary Contact' variant='outlined' size='small' />
                    )}
                    value={customerPrimaryContactOptions.find(opt => opt.id === inputs.customer_contact) || null}
                  />
                </Grid>
              </Grid>
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
        )}
       
      </Card>


      <AddSalutationPopup
        open={openSalutation}
        close={handleSalutationClose}
        titles={titlesSalutation}
        inputs={salutationInputs}
        handleChange={handleSalutationChange}
        handleSubmit={handleSalutationSubmit}
        errors={salutationErrors}
        handleBlur={handleBlur}
        loader={loader}
      />
      <AddGenderPopup
        open={openGender}
        close={handleGenderClose}
        titles={titlesGender}
        inputs={genderInputs}
        handleChange={handleGenderChange}
        handleSubmit={handleGenderSubmit}
        errors={genderErrors}
        handleBlur={handleBlur}
        loader={loader}
      />
    </Box>
  )
}

export default CreatCustomer
