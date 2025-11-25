'use client'

import React, { useState, useEffect } from 'react'
import {
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box,
  Typography,
  MenuItem,
  Chip,
  Collapse,
  Button,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Switch,
  InputAdornment,
  Paper
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import LoaderGif from '@assets/gif/loader.gif'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add' // Added this import
import AddItemDialog from './AddItemDialog'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import {
  createItemMaster,
  createTaxMaster,
  createUOMMaster,
  getTaxMasterListApi,
  getUOMMasterListApi,
  postItemMasterListApi
} from '@/apiFunctions/ApiAction'
import Image from 'next/image'
import AddUOMMasterPopup from '@/views/uom-master/AddUOMMasterPopup'
import AddTaxMasterPopup from '@/views/tax-master/AddTaxMasterPopup'
import { formatCurrency } from '@/helper/frontendHelper'

const ItemMasterList = () => {
  const getToken = Cookies.get('_token')
  const [items, setItems] = useState([])
  const [callFlag, setCallFlag] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({})
  const [open, setOpen] = useState(false)
  const [openUOM, setOpenUOM] = useState(false)
  const [openTax, setOpenTax] = useState(false)
  const [titlesTax, setTitlesTax] = useState('Add your Tax')
  const [titlesUOM, setTitlesUOM] = useState('Add your UOM')
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [uomList, setUomList] = useState([])
  const [taxList, setTaxList] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [titles, setTitles] = useState('Add New')
  const [item, setItem] = useState({
    item_type: 'Product',
    item_name: '',
    item_code: '',
    description: '',
    uom: '',
    basePrice: '',
    mrp: '',
    distributorPrice: '',
    gst: '',
    hsn: '',
    licenseKey: '',
    warrantyPeriod: '',
    billingCycle: '',
    subscriptionDuration: ''
  })

  const [inputsUOM, setInputsUOM] = useState({
    uom_code: '',
    uom_label: '',
    n_status: 1,
    _id: ''
  })

  const [errors, setErrors] = useState({
    uom_code: false,
    uom_label: false,
    n_status: false,
    _id: ''
  })

    const [inputsTax, setInputsTax] = useState({
    tax_value: 0,
    n_status: 1,
    _id: ''
  })

  const [errorsTax, setErrorsTax] = useState({
    tax_value: false,
    n_status: false,
    _id: ''
  })

  function isValidMobileNumberStrict(value) {
    if (!/^\d+$/.test(value)) return false
    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[0-9][0-9]*$/
    return regex.test(digitsOnly)
  }

  // *****************UOM Function START**************************************

  const addUOMChanges = () => {
    setOpen(false)
    setOpenUOM(true)
  }

  const handleCloseUOM = () => {
    setOpenUOM(false)
    setOpen(true)
    setErrors({ uom_code: false, uom_label: false, n_status: false })
    setInputsUOM({ uom_code: '', uom_label: '', n_status: 1 })
  }

  const handleBlur = () => {}

  // Helper to capitalize each word (for labels)
  const capitalizeWords = str => str.replace(/\b\w/g, char => char.toUpperCase())

  const handleUOMChange = e => {
    const { name, value } = e.target

    setInputsUOM(prev => ({
        ...prev,
        [name]: name === 'uom_label' ? capitalizeWords(value) : value
      }))

      // reset error only for changed field
      setErrors(prev => ({
        ...prev,
        [name]: false
      }))

    
  }

  const handleUOMSubmit = () => {
    // ❌ validation check
    if (!inputsUOM?.uom_code || inputsUOM?.uom_code.toString().trim() === '') {
      setErrors(prev => ({ ...prev, uom_code: true }))
      toast.error('UOM Code is required') // show toast also
      return
    }

    if (!inputsUOM?.uom_label || inputsUOM?.uom_label.toString().trim() === '') {
      setErrors(prev => ({ ...prev, uom_label: true }))
      toast.error('UOM Label is required') // show toast also
      return
    }

    // ✅ close popup only if validation passes
    setOpen(false)

    if (inputsUOM?._id === '') {
      const body = {
        uom_code: inputsUOM?.uom_code,
        uom_label: inputsUOM?.uom_label
      }
      uomMasterCreation(body)
    } else {
      const body = {
        Id: inputsUOM?._id,
        uom_code: inputsUOM?.uom_code,
        uom_label: inputsUOM?.uom_label
      }
      uomMasterCreation(body)
    }
  }

  const uomMasterCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createUOMMaster(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpenUOM(false)
      getUOMList()
      setOpen(true)
      // getUOMMasterList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpenUOM(false)
      getUOMList()
      setOpen(true)
      // getUOMMasterList()
    }
  }

  // *****************UOM Function END**************************************
  // *****************TAX Function START**************************************


  const addTaxChanges = () => {
    setInputsTax({
      tax_value: '',
      n_status: '',
      _id: ''
    })
    setOpen(false)
    setOpenTax(true)

  }


const handleCloseTax = () => {
    setOpenTax(false)
    setOpen(true)
    setErrorsTax({ tax_value: false, n_status: false })
    setInputsTax({ tax_value: '', n_status: 1 })
  }


  const handleChangeTax = e => {
      const { name, value } = e.target
  
      if (name === 'tax_value') {
        // allow only digits
        const onlyNums = value.replace(/[^0-9]/g, '')
        setInputsTax(prev => ({ ...prev, [name]: onlyNums }))
        setErrorsTax(prev => ({ ...prev, tax_value: false }))
      } else {
        setInputsTax(prev => ({ ...prev, [name]: capitalizeWords(value) }))
      }
    }
  
    const handleSubmitTax = () => {
      // ❌ validation check
      if (!inputsTax?.tax_value || inputsTax?.tax_value.toString().trim() === '') {
        setErrorsTax(prev => ({ ...prev, tax_value: true }))
        toast.error('Tax value is required') // show toast also
        return
      }
  
      // ✅ close popup only if validation passes
      // setOpenTax(false)
      // setOpen(true)
  
      if (inputsTax?._id === '') {
        const body = {
          tax_value: inputsTax?.tax_value
        }
        taxMasterCreation(body)
      } else {
        const body = {
          Id: inputsTax?._id,
          tax_value: inputsTax?.tax_value
        }
        taxMasterCreation(body)
      }
    }
  
    const taxMasterCreation = async body => {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
  
      setLoader(true)
      const results = await createTaxMaster(body, header)
      if (results?.appStatusCode !== 0) {
        toast?.error(results?.error)
        setLoader(false)
        setOpenTax(false)
        setOpen(true)
        getTaxList()
      } else {
        setLoader(false)
        toast?.success(results?.message)
        setOpenTax(false)
        setOpen(true)
        getTaxList()
      }
    }



  // *****************TAX Function END**************************************

  

  const handleChange = (field, value) => {

    if(field === 'basePrice' || field === 'mrp'){
      const res = isValidMobileNumberStrict(value)

    if (value.startsWith('0')) return // Prevent typing 0 at start
    if (!/^\d*$/.test(value)) return // Only digits allowed

    if (value === '' || res) {
      setItem({ ...item, [field]: value })
    }
    }else{
      setItem({ ...item, [field]: value })
    }
    
  }

  const handleSwitchChange = index => async event => {
    const updatedRows = [...items]
    updatedRows[index].n_status = event.target.checked ? 'Active' : 'Inactive'
    setItems(updatedRows)

    const body = {
      Id: updatedRows[index]._id,
      n_status: updatedRows[index].n_status
    }

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createItemMaster(body, header)
    setLoader(false)
    if (results?.appStatusCode === 0) {
      if (body.n_status === 0) {
        toast.error(`${updatedRows[index].item_name} Status Inactive `)
      } else {
        toast.success(`${updatedRows[index].item_name} Status Active `)
      }
    } else {
      toast.error(results?.error)
    }
  }

  const handleSubmit = async () => {
    console.log('New Item:', item)

    if (!item.item_code || !item.item_name) return

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)

    const body = JSON.stringify(item)

    const results = await createItemMaster(body, header)

    if (results?.appStatusCode !== 0) {
      toast.error('Item not added!', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      setLoader(false)
    } else {
      setLoader(false)
      toast.success('Item Added Successfully!', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      resetForm()
      fetchItems()
    }
  }

  const resetForm = () => {
    setItem({
      item_type: 'Product',
      item_name: '',
      item_code: '',
      description: '',
      uom: '',
      basePrice: '',
      mrp: '',
      distributorPrice: '',
      gst: '',
      hsn: '',
      licenseKey: '',
      warrantyPeriod: '',
      billingCycle: '',
      subscriptionDuration: ''
    })
    setOpen(false)
  }

  const getUOMList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const results = await getUOMMasterListApi(header)

    if (results?.appStatusCode === 0) {
      setUomList(results.payloadJson)
    } else {
      setUomList([])
    }
  }

  const getTaxList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const results = await getTaxMasterListApi(header)

    console.log(results, '<<< TAXXX RESULTSSS')

    if (results?.appStatusCode === 0) {
      setTaxList(results.payloadJson)
    } else {
      setTaxList([])
    }
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

  // Fetch items
  const fetchItems = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const body = {
      n_page: page + 1,
      n_limit: rowsPerPage,
      c_search_term: search
    }
    setLoader(true)
    const results = await postItemMasterListApi(body, header)
    setLoader(false)
    if (results?.appStatusCode === 0) {
      setItems(results?.payloadJson[0]?.data)
      setCount(results?.payloadJson[0]?.total_count?.at(0)?.count)
    } else {
      setItems([])
    }

    // const res = await fetch('/api/v1/admin/item-master/list', { headers: header })
    // const data = await res.json()
    // console.log()
    // if (data.success) setItems(data.payloadJson)
  }

  // Delete
  const handleDelete = async id => {
    try {
      const res = await fetch(`/api/v1/admin/item-master/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Items deleted successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        })
        fetchItems()
      } else {
        toast.error('Failed to delete item!', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (error) {
      toast.error('Error deleting item!', {
        autoClose: 1000,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
    setDeleteDialogOpen(false)
    setDeleteItemId(null)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteItemId(id)
    setDeleteDialogOpen(true)
  }

  const handleItemClick = () => {
    setItem({
      item_type: 'Product',
      item_name: '',
      item_code: '',
      description: '',
      uom: '',
      basePrice: '',
      mrp: '',
      distributorPrice: '',
      gst: '',
      hsn: '',
      licenseKey: '',
      warrantyPeriod: '',
      billingCycle: '',
      subscriptionDuration: ''
    })
    setOpen(true)
  }

  // Edit
  const handleEdit = row => {
    setTitles('Edit')
    setItem({
      item_type: row?.item_type,
      item_name: row?.item_name,
      item_code: row?.item_code,
      description: row?.description,
      uom: row?.uom,
      basePrice: row?.basePrice,
      mrp: row?.mrp,
      distributorPrice: row?.distributorPrice,
      gst: row?.gst,
      hsn: row?.hsn,
      licenseKey: row?.licenseKey,
      warrantyPeriod: row?.warrantyPeriod,
      billingCycle: row?.billingCycle,
      subscriptionDuration: row?.subscriptionDuration
    })
    setOpen(true)
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        fetchItems()
      } else if (search?.length == 0) {
        setLoader(true)
        fetchItems()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    // 🔹 First-time mount logic
    getUOMList()
    getTaxList() // ✅ runs only once on first render
    fetchItems()
  }, []) // empty dependency → run only on mount

  useEffect(() => {
    if (callFlag) {
      getUOMList()
      getTaxList()
      fetchItems()
    }
  }, [page, rowsPerPage])

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
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
          variant='contained'
          onClick={handleItemClick}
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            bgcolor: '#009CDE',
            '&:hover': { bgcolor: '#009CDE' }
          }}
        >
          Create Item
        </Button>
      </Box>
      <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />

      <Box
        sx={{
          // bgcolor: 'white',
          // borderRadius: '8px',
          // maxHeight: 500,
          // boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          // overflow: 'auto',
          // width: '100%'

          bgcolor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
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

          {callFlag && !loader && items?.length === 0 && (
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
                  No Item Value Found
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  You can add a new Item value by clicking the "Create" button above.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
        <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
          {!loader && items?.length > 0 && (
            <Table
              stickyHeader
              size='small'
              sx={{
                minWidth: 1200,
                borderRadius: 2,
                boxShadow: '0px 3px 8px rgba(0,0,0,0.05)',
                '& .MuiTableRow-root:hover': {
                  backgroundColor: '#f1f5f9',
                  cursor: 'pointer'
                },
                '& .MuiTableCell-root': {
                  borderBottom: '1px solid #e0e0e0',
                  py: 1.5
                },
                '& .MuiTableCell-stickyHeader': {
                  backgroundColor: '#fff',
                  color: '#333',
                  fontWeight: 'bold',
                  letterSpacing: 0.5
                }
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      color: '#374151',
                      position: 'sticky',
                      left: 0,
                      zIndex: 9,
                      minWidth: 120
                    }}
                  >
                    Item Code
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Item Name
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Item Type
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    UOM
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Base Price
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Gst (%)
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Mrp
                  </TableCell>
                  {/* <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Distributor Price
                  </TableCell> */}
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Hsn
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    License Key
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Warranty Period
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Billing Cycle
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Subscription Duration
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 'bold', color: '#374151', minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}
                  >
                    Actions
                  </TableCell>
                  {/* <TableCell /> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(items) &&
                  items.map((p, i) => (
                    <React.Fragment key={i}>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                        <TableCell
                          sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            minWidth: 120
                          }}
                        >
                          <b onClick={() => handleEdit(p)} style={{ color: '#000', cursor: 'pointer' }}>
                            {p?.item_code}
                          </b>
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.item_name}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.item_type}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.uom}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatCurrency(p.basePrice)}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.gst} %
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {formatCurrency(p.mrp)}
                        </TableCell>
                        {/* <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.distributorPrice}
                        </TableCell> */}
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.hsn}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.licenseKey}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.warrantyPeriod}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.billingCycle}
                        </TableCell>
                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {p.subscriptionDuration}
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200
                            // whiteSpace: 'nowrap',
                            // overflow: 'hidden',
                            // textOverflow: 'ellipsis'
                          }}
                        >
                         

                          <Switch checked={p.n_status === 'Active'} onChange={handleSwitchChange(i)} />
                        </TableCell>

                        <TableCell
                          sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          <>
                            <IconButton
                              onClick={() => handleEdit(p)}
                              sx={{ color: '#009CDE', '&:hover': { bgcolor: '#e3f2fd' } }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => openDeleteDialog(p._id)}
                              sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography textAlign='center' color='text.secondary' sx={{ py: 4 }}>
                        No items found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>

        {Array.isArray(items) && items?.length > 0 && (
          <TablePagination
            component='div'
            count={count}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={event => {
              setRowsPerPage(parseInt(event.target.value, 10))
              setPage(0) // reset to first page
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Box>

      <AddItemDialog
        open={open}
        onClose={() => setOpen(false)}
        fetchItems={fetchItems}
        uomList={uomList}
        taxList={taxList}
        titles={titles}
        item={item}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        addUOMChanges={addUOMChanges}
        addTaxChanges={addTaxChanges}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            bgcolor: '#f9fafb'
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '12px 12px 0 0' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant='body1' sx={{ color: '#374151' }}>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': { bgcolor: '#f3f4f6' }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteItemId)}
            variant='contained'
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <AddUOMMasterPopup
        open={openUOM}
        close={handleCloseUOM}
        titles={titlesUOM}
        inputs={inputsUOM}
        handleChange={handleUOMChange}
        handleSubmit={handleUOMSubmit}
        errors={errors}
        handleBlur={handleBlur}
        loader={loader}
      />
      <AddTaxMasterPopup
              open={openTax}
              close={handleCloseTax}
              titles={titlesTax}
              inputs={inputsTax}
              handleChange={handleChangeTax}
              handleSubmit={handleSubmitTax}
              errors={errorsTax}
              handleBlur={handleBlur}
              loader={loader}
            />
    </Box>
  )
}

export default ItemMasterList
