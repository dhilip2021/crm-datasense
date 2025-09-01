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

import { createRole, deleteRoleApi, postRoleListApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import { toast, ToastContainer } from 'react-toastify'
import { capitalizeWords } from '@/helper/frontendHelper'
import AddRolesPopup from './AddRolesPopup'
import DeleteConformPopup from './DeleteConformPopup'

const RolesTable = () => {
  const getToken = Cookies.get('_token')
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [rolesDataList, setRolesDataList] = useState([])
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState('Add your role')
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState('')
  const [delTitle, setDelTitle] = useState('')

  const [inputs, setInputs] = useState({
    c_role_name: '',
    c_description: '',
    n_status: 1,
    _id: ''
  })

  const [errors, setErrors] = useState({
    c_role_name: false,
    c_description: false,
    n_status: false,
    _id: ''
  })

  const handleSwitchChange = index => async event => {
    const updatedRows = [...rolesDataList]
    updatedRows[index].n_status = event.target.checked ? 1 : 0
    setRolesDataList(updatedRows)

    const body = {
      Id: updatedRows[index]._id,
      n_status: updatedRows[index].n_status
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createRole(body, header)

    if (results?.appStatusCode === 0) {
      if (body.n_status === 0) {
         toast.error(`${updatedRows[index].c_role_name} Status Inactive `, {
                        autoClose: 500, // 1 second la close
                        position: 'bottom-center',
                        hideProgressBar: true, // progress bar venam na
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined
                      })
      } else {
         toast.success(`${updatedRows[index].c_role_name} Status Active `, {
                        autoClose: 500, // 1 second la close
                        position: 'bottom-center',
                        hideProgressBar: true, // progress bar venam na
                        closeOnClick: true,
                        pauseOnHover: false,
                        draggable: false,
                        progress: undefined
                      })
      }
    } else {
       toast.error(results?.error, {
                      autoClose: 500, // 1 second la close
                      position: 'bottom-center',
                      hideProgressBar: true, // progress bar venam na
                      closeOnClick: true,
                      pauseOnHover: false,
                      draggable: false,
                      progress: undefined
                    })
    }

    //  setLoader(false)
  }

  const addChanges = () => {
    setInputs({
      c_role_name: '',
      c_description: '',
      n_status: '',
      _id: ''
    })
    setOpen(true)
  }

  const editChanges = row => {
    setInputs({
      c_role_name: row?.c_role_name,
      c_description: row?.c_description,
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
    const deleteRes = await deleteRoleApi(delId, header)

    if (deleteRes?.appStatusCode !== 0) {
      setLoader(false)
      toast.success(deleteRes?.error, {
                      autoClose: 500, // 1 second la close
                      position: 'bottom-center',
                      hideProgressBar: true, // progress bar venam na
                      closeOnClick: true,
                      pauseOnHover: false,
                      draggable: false,
                      progress: undefined
                    })
      getRolesList()
    } else {
      setLoader(false)
      getRolesList()
      toast.success(deleteRes?.message, {
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

  const handleChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setErrors(prev => ({ ...prev, [name]: false }))
    setInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))
  }

  const handleSubmit = () => {
    setOpen(false)

    if (inputs?.c_role_name === '') {
      setErrors(prev => ({ ...prev, ['c_role_name']: true }))
    } else {

        console.log()

      if (inputs?._id === '') {
        const body = {
          c_role_name: inputs?.c_role_name
        }
        rolesCreation(body)
      } else {
        const body = {
          Id: inputs?._id,
          c_role_name: inputs?.c_role_name
        }
        rolesCreation(body)
      }
    }
  }

  const rolesCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createRole(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      getRolesList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)
      getRolesList()
    }
  }

  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ c_role_name: false, n_status: false })
    setInputs({ c_role_name: '', n_status: 1 })
  }

  const getRolesList = async () => {
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

    const results = await postRoleListApi(body, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      setRolesDataList(results?.payloadJson[0]?.data)
    } else {
      setRolesDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        getRolesList()
      } else if (search?.length == 0) {
        setLoader(true)
        getRolesList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      setLoader(true)
      getRolesList()
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
          Add Roles
        </Button>
      </Box>

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

        {callFlag && !loader && rolesDataList?.length === 0 && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
                <Box p={40}>
                  <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Roles Found</p>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {!loader && rolesDataList?.length > 0 && (
        <Card className='bs-full'>
          <CardContent>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '60px', fontWeight: 800 }}> S.no</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Roles Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Description </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rolesDataList.map((row, index) => (
                      <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                        <TableCell sx={{ width: '60px' }}>{index + 1}</TableCell>
                        <TableCell>
                            <b onClick={() => editChanges(row)}
                                style={{ color: '#000', cursor: 'pointer' }}>{row?.c_role_name}</b>
                        </TableCell>
                        <TableCell>{row?.c_description}</TableCell>
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
      <AddRolesPopup
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

export default RolesTable
