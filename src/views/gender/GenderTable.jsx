/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useEffect, useState } from 'react'

import Link from 'next/link'

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
import { Box, Button, Card, CardContent, InputAdornment, Switch, TextField, Tooltip } from '@mui/material'

import { createGender, deleteGenderApi, postGenderListApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import { toast, ToastContainer } from 'react-toastify'
import DeleteConformPopup from './DeleteConformPopup'
import { capitalizeWords } from '@/helper/frontendHelper'
import AddGenderPopup from './AddGenderPopup'

const GenderTable = () => {
  const getToken = Cookies.get('_token')
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [genderDataList, setGenderDataList] = useState([])
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState('Add your gender')
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState('')
  const [delTitle, setDelTitle] = useState('')

  const [inputs, setInputs] = useState({
    gender_name: '',
    n_status: 1,
    _id: ''
  })

  const [errors, setErrors] = useState({
    gender_name: false,
    n_status: false,
    _id: ''
  })

  const handleSwitchChange = index => async event => {
    const updatedRows = [...genderDataList]
    updatedRows[index].n_status = event.target.checked ? 1 : 0
    setGenderDataList(updatedRows)

    const body = {
      Id: updatedRows[index]._id,
      n_status: updatedRows[index].n_status
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createGender(body, header)

    if (results?.appStatusCode === 0) {
      if (body.n_status === 0) {
        toast.error(`${updatedRows[index].gender_name} Status Inactive `)
      } else {
        toast.success(`${updatedRows[index].gender_name} Status Active `)
      }
    } else {
      toast.error(results?.error)
    }

    //  setLoader(false)
  }

  const addChanges = () => {
    setInputs({
      gender_name: '',
      n_status: '',
      _id: ''
    })
    setOpen(true)
  }

  const editChanges = row => {
    setInputs({
      gender_name: row?.gender_name,
      n_status: row?.n_status,
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
    const deleteRes = await deleteGenderApi(delId, header)

    if (deleteRes?.appStatusCode !== 0) {
      setLoader(false)
      toast.success(deleteRes?.error)
      getGenderList()
    } else {
      setLoader(false)
      getGenderList()
      toast.success(deleteRes?.message)
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

    if (inputs?.gender_name === '') {
      setErrors(prev => ({ ...prev, ['gender_name']: true }))
    } else {

        console.log()

      if (inputs?._id === '') {
        const body = {
          gender_name: inputs?.gender_name
        }
        genderCreation(body)
      } else {
        const body = {
          Id: inputs?._id,
          gender_name: inputs?.gender_name
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

    setLoader(true)
    const results = await createGender(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      getGenderList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)
      getGenderList()
    }
  }

  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ gender_name: false, n_status: false })
    setInputs({ gender_name: '', n_status: 1 })
  }

  const getGenderList = async () => {
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

    const results = await postGenderListApi(body, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      setGenderDataList(results?.payloadJson[0]?.data)
    } else {
      setGenderDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        getGenderList()
      } else if (search?.length == 0) {
        setLoader(true)
        getGenderList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      setLoader(true)
      getGenderList()
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
          Add Gender
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
                        <Image src={LoaderGif} alt="loading" width={200} height={200} />
                       
                    </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {callFlag && !loader && genderDataList?.length === 0 && (
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

      {!loader && genderDataList?.length > 0 && (
        <Card className='bs-full'>
          <CardContent>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '60px', fontWeight: 800 }}> S.no</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Gender Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Gender id </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {genderDataList.map((row, index) => (
                      <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                        <TableCell sx={{ width: '60px' }}>{index + 1}</TableCell>
                        <TableCell>
                            <b onClick={() => editChanges(row)}
                                style={{ color: '#000', cursor: 'pointer' }}>{row?.gender_name}</b>
                        </TableCell>
                        <TableCell>{row?.gender_id}</TableCell>
                        <TableCell>
                          <Switch checked={row.n_status === 1} onChange={handleSwitchChange(index)} />
                        </TableCell>

                        <TableCell>
                          <Box display={'flex'}>
                            {' '}
                            <Tooltip title='Edit Lead' arrow>
                              <i
                                className='ri-edit-box-line'
                                onClick={() => editChanges(row)}
                                style={{ color: '#4caf50', cursor: 'pointer' }}
                              ></i>
                            </Tooltip>{' '}
                            <Box>
                              <Tooltip title='Delete Lead' arrow>
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
      <ToastContainer />
      <DeleteConformPopup open={delOpen} title={delTitle} close={delClose} deleteConfirm={deleteConfirm} />
      <AddGenderPopup
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

export default GenderTable
