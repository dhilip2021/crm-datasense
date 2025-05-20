/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React from 'react'

import Image from 'next/image'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Box, Button, CardHeader, Grid, InputAdornment, TextField } from '@mui/material'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify'

// Components Imports
import OptionsMenu from '@core/components/option-menu'
import { createLead, getAllLeadListApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import AddNotesPopup from './AddNotesPopup'

function getHours(value) {
  const givenTimestamp = new Date(value)
  const currentTime = new Date()
  const timeDifferenceMs = currentTime - givenTimestamp

  const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60))
  const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60)
  const timeDifferenceDays = Math.floor(timeDifferenceHours / 24)

  if (timeDifferenceDays >= 1) {
    return `${timeDifferenceDays} ${timeDifferenceDays < 2 ? 'day ago' : 'days ago'}`
  } else if (timeDifferenceHours >= 1) {
    const remainingMinutes = timeDifferenceMinutes % 60

    return `${timeDifferenceHours} ${
      timeDifferenceHours < 2 ? 'hr' : 'hrs'
    } ${remainingMinutes} ${remainingMinutes < 2 ? 'min ago' : 'mins ago'}`
  } else {
    return `${timeDifferenceMinutes} ${timeDifferenceMinutes < 2 ? 'min ago' : 'mins ago'}`
  }
}

function filterStatus(data) {
  const hasStatusOne = data.some(item => item.status === 1)

  return hasStatusOne
}

const CardNotes = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')

  const [callFag, setCallFlag] = React.useState(true)
  const [loader, setLoader] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [titles, setTitles] = React.useState('Add your notes')
  const [leadData, setLeadData] = React.useState([])
  const [search, setSearch] = React.useState('')

  const [inputs, setInputs] = React.useState({
    title: '',
    status: 1,
    comment: '',
    _id: ''
  })

  const [notesArr, setNotesArr] = React.useState([])

  const [errors, setErrors] = React.useState({
    title: false,
    status: false,
    comment: false,
    _id: false
  })

  const handleChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setErrors(prev => ({ ...prev, [name]: false }))
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ title: false, comment: false, status: false, _id: false })
    setInputs({ title: '', comment: '', status: 1, _id: '' })
  }

  const leadNotesCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createLead(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      getParticularLeadFn(organization_id)
    } else {
      getParticularLeadFn(organization_id)
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)

      // router.push(`/en/deal/edit-deal/${results?.payloadJson?.lead_slug_name}`);
    }
  }

  const handleOnChange = e => {
    const { name, value } = e.target

    setSearch(value)
  }

  const handleSubmit = () => {
    setOpen(false)

    if (inputs?.title === '') {
      setErrors(prev => ({ ...prev, ['title']: true }))
    } else {
      if (inputs._id === '') {
        const body = {
          Id: leadData[0]?._id,
          c_notes: inputs,
          c_activities: `Notes created ${inputs?.title}`
        }

        leadNotesCreation(body)
      } else {
        const body = {
          Id: leadData[0]?._id,
          c_notes: inputs,
          c_activities: `Notes updated ${inputs?.title}`
        }

        leadNotesCreation(body)
      }
    }
  }

  // const removeMenuData = (index)=>{
  //   let arr = [...menusArr];
  //   arr.splice(index, 1);
  //   setMenusArr(arr);
  // }

  const getParticularLeadFn = async organization_id => {
    setLoader(true)

    console.log('call 2')

    const results = await getAllLeadListApi(organization_id)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setLeadData(results?.payloadJson)
    } else {
      setLeadData([])
    }
  }

  const handleAction = (option, item) => {
    if (option === 'Edit') {
      console.log('Edit clicked for:', item)

      setTitles('Edit your notes')
      setInputs({
        title: item.title,
        comment: item.comment,
        status: item.status,
        _id: item._id
      })
      setOpen(true)

      // navigateToEdit(item)
    } else if (option === 'Delete') {
      console.log('Delete clicked for:', item)

      const obj = {
        title: item.title,
        comment: item.comment,
        status: 0,
        _id: item._id,
        createdAt: item.createdAt
      }

      setNotesArr(prev => prev.map(data => (data._id === obj._id ? { ...data, ...obj } : data)))

      const body = {
        Id: leadData[0]?._id,
        c_notes: obj,
        c_activities: `Notes deleted ${item?.title}`
      }

      console.log(body)
      leadNotesCreation(body)

      // showConfirmDeleteModal(item)
    }
  }

  // React.useEffect(() => {
  //   if (Array.isArray(leadData)) {
  //     const allNotes = leadData.flatMap(item =>
  //       item?.c_notes?.length > 0 ? item.c_notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []
  //     )

  //     setNotesArr(allNotes)
  //   }
  // }, [leadData])

  React.useEffect(() => {
    if (Array.isArray(leadData)) {
      // Collect all notes across all leads
      const allNotes = leadData
        .flatMap(item => item?.c_notes || []) // Safely get c_notes or empty array
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date descending

      setNotesArr(allNotes)
    }
  }, [leadData])

  React.useEffect(() => {
    if (callFag) {
      getParticularLeadFn(organization_id)
      setCallFlag(false)
    }
  }, [callFag])

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'} mb={4} mt={4}>
        <TextField
          autoComplete='off'
          placeholder='Search'
          name='search'
          value={search}
          onChange={e => handleOnChange(e)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line'></i>
              </InputAdornment>
            ),
            endAdornment: search?.length > 0 && (
              <InputAdornment position='start' sx={{ cursor: 'pointer' }}>
                <i className='ri-close-line' onClick={() => setSearch('')}></i>
              </InputAdornment>
            )
          }}
          size='small'
        />

        <Button
          onClick={() => setOpen(true)}
          startIcon={<i className='ri-add-line'></i>}
          variant='contained'
          className='mis-4'
        >
          Create Note
        </Button>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {loader && (
          <Box textAlign={'center'} width={'100%'} mt={'100px'} mb={'100px'}>
            <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
          </Box>
        )}

        {!loader && !filterStatus(notesArr) && (
          <Box textAlign={'center'} width={'100%'} mt={'100px'} mb={'100px'}>
            <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Notes Found!</p>
          </Box>
        )}
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Grid container spacing={6}>
          {Array.isArray(notesArr) &&
            notesArr.map(
              (item, index) =>
                item.status === 1 && (
                  <Grid item xs={12} sm={12} md={3} key={index}>
                    <Card>
                      <CardHeader
                        title={`${item.title}`}
                        action={
                          <OptionsMenu
                            iconClassName='text-textPrimary'
                            options={['Edit', 'Delete']}
                            onOptionClick={(option, e) => handleAction(option, item)}
                          />
                        }
                      />
                      <CardContent>
                        <div className='flex flex-col items-start'>
                          <Typography>{item.comment}</Typography>
                        </div>
                        <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2 mbe-5 mbs-[30px]'>
                          <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2'>
                            <Typography variant='subtitle2' color='text.disabled'>
                              {getHours(item.createdAt)}
                            </Typography>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                )
            )}
        </Grid>
        <AddNotesPopup
          open={open}
          close={handleClose}
          titles={titles}
          inputs={inputs}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors}
          handleBlur={handleBlur}
          loader={loader}
        />
      </Box>
      <ToastContainer />
    </Box>
  )
}

export default CardNotes
