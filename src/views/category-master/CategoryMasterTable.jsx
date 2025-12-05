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
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { createCategoryMaster, deleteCategoryMasterApi, postCategoryMasterListApi } from '@/apiFunctions/ApiAction'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import LoaderGif from '@assets/gif/loader.gif'
import { toast, ToastContainer } from 'react-toastify'
import { capitalizeWords } from '@/helper/frontendHelper'
import DeleteConformPopup from './DeleteConformPopup'
import AddCategoryMasterPopup from './AddCategoryMasterPopup'
// import DeleteConformPopup from './DeleteConformPopup'

const CategoryMasterTable = () => {
  const getToken = Cookies.get('_token')
   const item_access = Cookies.get('item_access')
      const itemTypes = item_access.split(',').map(item => item.trim())
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [categoryMasterDataList, setCategoryMasterDataList] = useState([])
  const [open, setOpen] = useState(false)
  const [titles, setTitles] = useState('Add your category')
  const [delOpen, setDelOpen] = useState(false)
  const [delId, setDelId] = useState('')
  const [delTitle, setDelTitle] = useState('')

  const [inputs, setInputs] = useState({
    category_type: "",
    prod_name: "",
    n_status: 1,
    _id: ''
  })

  const [errors, setErrors] = useState({
    category_type: false,
    prod_name: false,
    n_status: false,
    _id: ''
  })

  const handleSwitchChange = index => async event => {
    const updatedRows = [...categoryMasterDataList]
    updatedRows[index].n_status = event.target.checked ? 1 : 0
    setCategoryMasterDataList(updatedRows)

    const body = {
      Id: updatedRows[index]._id,
      n_status: updatedRows[index].n_status
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createCategoryMaster(body, header)

    if (results?.appStatusCode === 0) {
      if (body.n_status === 0) {
        toast.error(`${updatedRows[index].prod_name} Status Inactive `)
      } else {
        toast.success(`${updatedRows[index].prod_name} Status Active `)
      }
    } else {
      toast.error(results?.error)
    }

    //  setLoader(false)
  }

  const addChanges = () => {
    setInputs({
      category_type: '',
      prod_name: '',
      n_status: '',
      _id: ''
    })
    setOpen(true)
  }

  const editChanges = row => {
    setTitles('Edit your Category')
    setInputs({
      category_type: row?.category_type,
      prod_name: row?.prod_name,
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
    const deleteRes = await deleteCategoryMasterApi(delId, header)

    if (deleteRes?.appStatusCode !== 0) {
      setLoader(false)
      toast.success(deleteRes?.error)
      getCategoryMasterList()
    } else {
      setLoader(false)
      getCategoryMasterList()
      toast.success(deleteRes?.message)
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    
    if (name === 'category_type') {
      setInputs(prev => ({ ...prev, [name]: value }))
      setErrors(prev => ({ ...prev, category_type: false }))
    }else if (name === 'prod_name') {
      setInputs(prev => ({ ...prev, [name]: value }))
      setErrors(prev => ({ ...prev, prod_name: false }))
    } else {
      setInputs(prev => ({ ...prev, [name]: capitalizeWords(value) }))
    }
  }

  const handleSubmit = () => {
    // ❌ validation check
    if (!inputs?.category_type || inputs?.category_type.toString().trim() === '') {
      setErrors(prev => ({ ...prev, category_type: true }))
      toast.error('Category name is required') // show toast also
      return
    }else if (!inputs?.prod_name || inputs?.prod_name.toString().trim() === '') {
      setErrors(prev => ({ ...prev, prod_name: true }))
      toast.error('Category name is required') // show toast also
      return
    }

    // ✅ close popup only if validation passes
    setOpen(false)

    if (inputs?._id === '') {
      const body = {
        category_type: inputs?.category_type,
        prod_name: inputs?.prod_name
      }
      categoryMasterCreation(body)
    } else {
      const body = {
        Id: inputs?._id,
        category_type: inputs?.category_type,
        prod_name: inputs?.prod_name
      }
      categoryMasterCreation(body)
    }
  }

  const categoryMasterCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createCategoryMaster(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      getCategoryMasterList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)
      getCategoryMasterList()
    }
  }

  const handleBlur = () => {}

  const handleClose = () => {
    setOpen(false)
    setErrors({ prod_name: false, n_status: false })
    setInputs({ category_type: '',prod_name: '', n_status: 1 })
    
  }

  const getCategoryMasterList = async () => {
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

    const results = await postCategoryMasterListApi(body, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      setCategoryMasterDataList(results?.payloadJson[0]?.data)
    } else {
      setCategoryMasterDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        getCategoryMasterList()
      } else if (search?.length == 0) {
        setLoader(true)
        getCategoryMasterList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      setLoader(true)
      getCategoryMasterList()
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
          Add Category
        </Button>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {loader && (
          <Box textAlign={'center'} width={'100%'}>
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
          </Box>
        )}

        {callFlag && !loader && categoryMasterDataList?.length === 0 && (
          <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center' width='100%' py={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: 'center',
                border: '1px dashed #ccc',
                borderRadius: 2,
                bgcolor: '#fafafa',
                maxWidth: 400
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant='h6' gutterBottom>
                No Category Value Found
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                You can add a new Category value by clicking the "Add" button above.
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>

      {!loader && categoryMasterDataList?.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label='sticky table'>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell sx={{ width: '60px', fontWeight: 800 }}> S.no</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Category Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Items Name</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Items id </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {categoryMasterDataList.map((row, index) => (
                  <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                    <TableCell sx={{ width: '60px' }}>{index + 1}</TableCell>
                    <TableCell>
                      <b onClick={() => editChanges(row)} style={{ color: '#000', cursor: 'pointer' }}>
                        {row?.category_type}
                      </b>
                    </TableCell>
                    <TableCell>
                      <b onClick={() => editChanges(row)} style={{ color: '#000', cursor: 'pointer' }}>
                        {row?.prod_name}
                      </b>
                    </TableCell>
                    <TableCell>{row?.prod_id}</TableCell>
                    <TableCell>
                      <Switch checked={row.n_status === 1} onChange={handleSwitchChange(index)} />
                    </TableCell>

                    <TableCell>
                      <IconButton
                        onClick={() => editChanges(row)}
                        sx={{ color: '#009CDE', '&:hover': { bgcolor: '#e3f2fd' } }}
                      >
                        <Tooltip title='Edit Category' arrow>
                          <EditIcon />
                        </Tooltip>
                      </IconButton>
                      <IconButton
                        onClick={() => deleteFn(row?._id)}
                        sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                      >
                        <Tooltip title='Delete Category' arrow>
                          <DeleteIcon />
                        </Tooltip>
                      </IconButton>
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
      )}
      <DeleteConformPopup open={delOpen} title={delTitle} close={delClose} deleteConfirm={deleteConfirm} />
      <AddCategoryMasterPopup
        open={open}
        close={handleClose}
        titles={titles}
        inputs={inputs}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        handleBlur={handleBlur}
        loader={loader}
        itemTypes={itemTypes}
      />
    </Box>
  )
}

export default CategoryMasterTable
