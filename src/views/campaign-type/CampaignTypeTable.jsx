/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useEffect, useState } from 'react'

import Image from 'next/image'

import Cookies from 'js-cookie'

// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { Box, Button, Card, CardContent, InputAdornment, TextField, Tooltip } from '@mui/material'

import { addCampaignTypeApi, deleteCampaignTypeApi, getAllCampaigntypeApi, updateCampaigntypeApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import { toast, ToastContainer } from 'react-toastify'
import DeleteConformPopup from './DeleteConformPopup'
import { capitalizeWords } from '@/helper/frontendHelper'
import AddCampaignTypePopup from './AddCampaignTypePopup'

const CampaignTypeTable = () => {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [campaignTypeDataList, setCampaignTypeDataList] = useState([])
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState('Add your Campaign')
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState('')
  const [delTitle, setDelTitle] = useState('')

  const [inputs, setInputs] = useState({
    campaign_name: '',
    description: '',
    _id: ''
  })

  const [errors, setErrors] = useState({
    campaign_name: false,
    description: false,
    _id: ''
  })

  const addChanges = () => {
    setInputs({
      campaign_name: '',
      description: '',
      _id: ''
    })
    setOpen(true)
  }

  const editChanges = row => {
    setTitles('Edit your Campaign')
    setInputs({
      campaign_name: row?.campaign_name,
      description: row?.description,
      _id: row?._id
    })
    setOpen(true)
  }

  const handleOnChange = e => {
    const { name, value } = e.target

    setSearch(value)
  }

  const SwitchPage = (event, newPage) => {
    setPage(newPage)
  }

  const SwitchRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const delClose = () => {
    setDelOpen(false)
    setDelId('')
    setDelTitle('')
  }
  const deleteFn = id => {
    setDelOpen(true)
    setDelId(id)
    setDelTitle('Are you sure you want to delete this?')
  }

  const deleteConfirm = () => {
    setDelOpen(false)
    deletefuntion(delId)
  }

  const deletefuntion = async delId => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    setLoader(true)
    const deleteRes = await deleteCampaignTypeApi(delId, header)

    if (deleteRes?.success) {
       setLoader(false)
      getCampaignTypeList()
      toast.success("Deleted Successfully !!!")
    } else {
     

      setLoader(false)
      toast.success("Not Delete !!!")
      getCampaignTypeList()
    }
  }

  const handleChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setErrors(prev => ({ ...prev, [name]: false }))
    setInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))
  }

  const handleSubmit = () => {
    setOpen(false)

    if (inputs?.campaign_name === '') {
      setErrors(prev => ({ ...prev, ['campaign_name']: true }))
    } else if (inputs?.description === '') {
      setErrors(prev => ({ ...prev, ['description']: true }))
    } else {
      if (inputs?._id === '') {
        const body = {
          organization_id: organization_id,
          campaign_name: inputs?.campaign_name,
          description: inputs?.description
        }
        campaignTypeCreation(body)
      } else {
        const id = inputs?._id
        const body = {
          organization_id: organization_id,
          campaign_name: inputs?.campaign_name,
          description: inputs?.description
        }
        campaignTypeUpdate(id,body)
      }
    }
  }

  const campaignTypeCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await addCampaignTypeApi(body, header)

    if (results?.success) {
      setLoader(false)
      toast?.success("Added successfully")
      setOpen(false)
      getCampaignTypeList()
    } else {
      toast?.error("Not Add... please check")
      setLoader(false)
      setOpen(false)
      getCampaignTypeList()
    }
  }

  const campaignTypeUpdate = async (id,body) => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await updateCampaigntypeApi(id,body, header)

    if (results?.success) {
      setLoader(false)
      toast?.success("Updated successfully")
      setOpen(false)
      getCampaignTypeList()
    } else {
      toast?.error("Not Updated.. Please check")
      setLoader(false)
      setOpen(false)
      getCampaignTypeList()
    }
  }



  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ campaign_name: false, description: false })
  }

  const getCampaignTypeList = async () => {
    setLoader(true)

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const body = {
      n_page: page + 1,
      n_limit: rowsPerPage,
      c_search_term: search
    }

    const results = await getAllCampaigntypeApi(body, header)

    setLoader(false)

    if (results?.success) {
      setCount(results?.total)
      setCampaignTypeDataList(results?.data)
    } else {
      setCampaignTypeDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        getCampaignTypeList()
      } else if (search?.length == 0) {
        setLoader(true)
        getCampaignTypeList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      setLoader(true)
      getCampaignTypeList()
    }
  }, [page, rowsPerPage])

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'} mb={4}>
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
          onClick={() => addChanges()}
          startIcon={<i className='ri-add-line'></i>}
          variant='contained'
          className='mis-4'
        >
          Add Campaign Type
        </Button>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {loader && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
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
                        <Image src={LoaderGif} alt="loading" width={100} height={100} />
                       
                    </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {callFlag && !loader && campaignTypeDataList?.length === 0 && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
                <Box p={40}>
                  <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Gender Found</p>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {!loader && campaignTypeDataList?.length > 0 && (
        <Card className='bs-full'>
          <CardContent>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '60px', fontWeight: 800 }}> S.no</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Campaign Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Description </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {campaignTypeDataList.map((row, index) => (
                      <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                        <TableCell sx={{ width: '60px' }}>{index + 1}</TableCell>
                        <TableCell>
                          <b onClick={() => editChanges(row)} style={{ color: '#000', cursor: 'pointer' }}>
                            {row?.campaign_name}
                          </b>
                        </TableCell>
                        <TableCell>{row?.description}</TableCell>
                        <TableCell>
                          <Box display={'flex'}>
                            {' '}
                            <Tooltip title={`Edit ${row?.campaign_name} Campaign`} arrow>
                              <i
                                className='ri-edit-box-line'
                                onClick={() => editChanges(row)}
                                style={{ color: '#4caf50', cursor: 'pointer' }}
                              ></i>
                            </Tooltip>{' '}
                            <Box>
                              <Tooltip title={`Delete ${row?.campaign_name} Campaign`} arrow>
                                <i
                                  className='ri-delete-bin-3-fill'
                                  style={{ color: '#ff5555', cursor: 'pointer' }}
                                  onClick={() => deleteFn(row?._id)}
                                ></i>
                              </Tooltip>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component='div'
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={SwitchPage}
                onRowsPerPageChange={SwitchRowsPerPage}
              />
            </Paper>
          </CardContent>
        </Card>
      )}
      <DeleteConformPopup open={delOpen} title={delTitle} close={delClose} deleteConfirm={deleteConfirm} />
      <AddCampaignTypePopup
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
  )
}

export default CampaignTypeTable
