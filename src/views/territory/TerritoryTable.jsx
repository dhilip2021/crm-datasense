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

import {
  createTerritory,
  deleteSalutationApi,
  getTerritoryListApi,
  postTerritoryListApi
} from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'
import { toast, ToastContainer } from 'react-toastify'
import DeleteConformPopup from './DeleteConformPopup'
import { capitalizeWords } from '@/helper/frontendHelper'
import AddTerritoryPopup from './AddTerritoryPopup'

const TerritoryTable = () => {
  const getToken = Cookies.get('_token')

  const header = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken}`
  }

  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [territoryDataList, setTerritoryDataList] = useState([])
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState('Add your territory')
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState('')
  const [delTitle, setDelTitle] = useState('')
  const [selectedOption, setSelectedOption] = useState(null)
  const [inputs, setInputs] = useState({
    territory_name: '',
    parent_territory: '',
    is_group: false,
    n_status: '',
    _id: ''
  })

  const [errors, setErrors] = useState({
    territory_name: false,
    parent_territory: false,
    is_group: false,
    n_status: false,
    _id: false
  })
  const [territoryOptions, setTerritoryOptions] = useState([])

  const handleSwitchChange = index => async event => {
    const updatedRows = [...territoryDataList]
    updatedRows[index].n_status = event.target.checked ? 1 : 0
    setTerritoryDataList(updatedRows)

    const body = {
      Id: updatedRows[index]._id,
      n_status: updatedRows[index].n_status
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createTerritory(body, header)

    if (results?.appStatusCode === 0) {
      if (body.n_status === 0) {
        toast.error(`${updatedRows[index].territory_name} Status Inactive `)
      } else {
        toast.success(`${updatedRows[index].territory_name} Status Active `, {
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
      toast.error(results?.error)
    }

    //  setLoader(false)
  }

  const addChanges = () => {
    setInputs({
      territory_name: '',
      n_status: '',
      _id: ''
    })
    setOpen(true)
  }

  const editChanges = row => {
    setInputs({
      territory_name: row?.territory_name,
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
    const deleteRes = await deleteSalutationApi(delId, header)

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
      postTerritoryList()
    } else {
      setLoader(false)
      postTerritoryList()

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
    const { name, value, type, checked } = e.target
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  //    const handleAutoChange = (event, newValue) => {
  //     setInputs(prev => ({
  //       ...prev,
  //       parent_territory: newValue?.territory_name || '',
  //     }));
  //   };

  const handleAutoChange = (event, newValue) => {
    setSelectedOption(newValue)
    onSelect && onSelect(newValue) // callback to parent
  }

  const handleSubmit = () => {
    const payload = {
      territory_name: inputs.territory_name,
      is_group: inputs.is_group,
      parent_territory: inputs.is_group ? null : inputs.parent_territory
    }

    territoryCreation(payload)
  }

  const territoryCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createTerritory(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      postTerritoryList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)
      postTerritoryList()
    }
  }

  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ territory_name: false, n_status: false })
    setInputs({ territory_name: '', n_status: 1 })
  }

  const getTerritoryList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const results = await getTerritoryListApi('true', header)

    if (results?.appStatusCode === 0) {
      console.log(results?.payloadJson, '<<< REEEEEEE')
      setTerritoryOptions(results?.payloadJson)
    } else {
      setTerritoryOptions([])
    }
  }

  const postTerritoryList = async () => {
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

    const results = await postTerritoryListApi(body, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      setTerritoryDataList(results?.payloadJson[0]?.data)
    } else {
      setTerritoryDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        postTerritoryList()
      } else if (search?.length == 0) {
        setLoader(true)
        postTerritoryList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      setLoader(true)
      postTerritoryList()
    }
  }, [page, rowsPerPage])

  //   useEffect(() => {
  //     getTerritoryList()
  //   }, [])

  useEffect(() => {
    fetch('/api/v1/admin/territory/list?is_group_param=true', {
      method: 'GET',
      headers: header
    })
      .then(res => res.json())
      .then(data => {
        setTerritoryOptions(data?.payloadJson || [])
      })
      .catch(err => {
        console.error('Fetch error:', err)
      })
  }, [])

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
          Add Territory
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

        {callFlag && !loader && territoryDataList?.length === 0 && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
                <Box p={40}>
                  <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Salutation Found</p>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {!loader && territoryDataList?.length > 0 && (
        <Card className='bs-full'>
          <CardContent>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label='sticky table'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: '60px', fontWeight: 800 }}> S.no</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Territory Name</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Is Group </TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {territoryDataList.map((row, index) => (
                      <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                        <TableCell sx={{ width: '60px' }}>{index + 1}</TableCell>
                        <TableCell>
                          <b onClick={() => editChanges(row)} style={{ color: '#000', cursor: 'pointer' }}>
                            {row?.territory_name}
                          </b>
                        </TableCell>
                        <TableCell>{row?.is_group ? 'True' : 'False'}</TableCell>
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
      <AddTerritoryPopup
        open={open}
        close={handleClose}
        titles={titles}
        inputs={inputs}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        handleBlur={handleBlur}
        loader={loader}
        handleAutoChange={handleAutoChange}
        options={territoryOptions}
        selectedOption={selectedOption}
      />
    </Box>
  )
}

export default TerritoryTable
