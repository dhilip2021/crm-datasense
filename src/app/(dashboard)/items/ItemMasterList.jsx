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
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel
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
  createCategoryMaster,
  createItemMaster,
  createTaxMaster,
  createUOMMaster,
  getCategoryMasterListApi,
  getTaxMasterListApi,
  getUOMMasterListApi,
  postItemMasterListApi
} from '@/apiFunctions/ApiAction'
import Image from 'next/image'
import AddUOMMasterPopup from '@/views/uom-master/AddUOMMasterPopup'
import AddTaxMasterPopup from '@/views/tax-master/AddTaxMasterPopup'
import { converDayJsDate, formatCurrency } from '@/helper/frontendHelper'
import AddCategoryMasterPopup from '@/views/category-master/AddCategoryMasterPopup'

const ItemMasterList = () => {
  const getToken = Cookies.get('_token')
  const item_access = Cookies.get('item_access')
  const itemTypes = item_access.split(',').map(item => item.trim())
  const [items, setItems] = useState([])
  const [callFlag, setCallFlag] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({})
  const [open, setOpen] = useState(false)
  const [openUOM, setOpenUOM] = useState(false)
  const [openTax, setOpenTax] = useState(false)
  const [openCategory, setOpenCategory] = useState(false)
  const [titlesTax, setTitlesTax] = useState('Add your Tax')
  const [titlesUOM, setTitlesUOM] = useState('Add your UOM')
  const [titlesCategory, setTitlesCategory] = useState('Add your Category')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [uomList, setUomList] = useState([])
  const [taxList, setTaxList] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [titles, setTitles] = useState('Add New')
  const [item, setItem] = useState({
    item_type: 'Product',
    product_name: '',
    product_code: '',
    product_category: '',
    stock: '',
    description: '',
    uom: '',
    basePrice: '',
    mrp: '',
    distributorPrice: '',
    gst: '',
    hsn: '',
    license_key: '',
    warranty_duration: '',
    billing_cycle: 'Monthly',
    subscription_start_date: null,
    warranty_available: 'Yes',
    product_status: 'Active',
    service_code: '',
    service_name: '',
    service_category: '',
    service_type: 'On-site',
    service_duration: '',
    service_charge: '',
    selling_price: '',
    warranty_on_service: '',
    service_status: 'Active',
    license_code: '',
    license_name: '',
    license_category: '',
    license_validity: '',
    license_price: '',
    license_renewal_price: '',
    no_of_users: '',
    activation_type: 'Online',
    subscription_included: 'Yes',
    license_status: 'Active',
    warranty_code: '',
    warranty_plan: '',
    warranty_covered_product: '',
    coverage_type: '',
    warranty_cost: '',
    warranty_provider: '',
    warranty_claim_limits: '',
    warranty_expiry_date: null,
    warranty_status: 'Active',
    subscription_code: '',
    subscription_name: '',
    plan_type: '',
    subscription_price: '',
    subscription_renewal_price: '',
    auto_renewal_price: 'Yes',
    no_of_devices: '',
    subscription_end_date: null,
    subscription_status: 'Active',
    description: ''
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

  const [inputsCategory, setInputsCategory] = useState({
    category_type: '',
    prod_name: '',
    n_status: 1,
    _id: ''
  })

  const [errorsCategory, setErrorsCategory] = useState({
    category_type: false,
    prod_name: false,
    n_status: false,
    _id: ''
  })

  function isValidMobileNumberStrict(value) {
    if (!/^\d+$/.test(value)) return false
    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[0-9][0-9]*$/
    return regex.test(digitsOnly)
  }

  const handleCheck = (e, name) => {
    console.log(e.target.checked, '<< e.target.checked')
    console.log(name, '<< name')

    if (name === 'product_status') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Active' })
      } else {
        setItem({ ...item, [name]: 'Inactive' })
      }
    } else if (name === 'warranty_available') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Yes' })
      } else {
        setItem({ ...item, [name]: 'No' })
      }
    } else if (name === 'service_status') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Active' })
      } else {
        setItem({ ...item, [name]: 'Inactive' })
      }
    } else if (name === 'license_status') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Active' })
      } else {
        setItem({ ...item, [name]: 'Inactive' })
      }
    } else if (name === 'subscription_included') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Yes' })
      } else {
        setItem({ ...item, [name]: 'No' })
      }
    } else if (name === 'warranty_status') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Active' })
      } else {
        setItem({ ...item, [name]: 'Inactive' })
      }
    } else if (name === 'subscription_status') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Active' })
      } else {
        setItem({ ...item, [name]: 'Inactive' })
      }
    } else if (name === 'auto_renewal_price') {
      if (e.target.checked) {
        setItem({ ...item, [name]: 'Yes' })
      } else {
        setItem({ ...item, [name]: 'No' })
      }
    }
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

  // *****************Category Function START**************************************

  const addCategoryChanges = () => {
    setInputsCategory({
      category_type: '',
      prod_name: '',
      n_status: '',
      _id: ''
    })
    setOpen(false)
    setOpenCategory(true)
  }

  const handleCloseCategory = () => {
    setOpenCategory(false)
    setOpen(true)
    setErrorsCategory({ prod_name: false, n_status: false })
    setInputsCategory({ prod_name: '', n_status: 1 })
  }

  const handleChangeCategory = e => {
    const { name, value } = e.target

    if (name === 'category_type') {
      setInputsCategory(prev => ({ ...prev, [name]: value }))
      setErrorsCategory(prev => ({ ...prev, category_type: false }))
    } else if (name === 'prod_name') {
      setInputsCategory(prev => ({ ...prev, [name]: value }))
      setErrorsCategory(prev => ({ ...prev, prod_name: false }))
    } else {
      setInputsCategory(prev => ({ ...prev, [name]: capitalizeWords(value) }))
    }
  }

  const handleSubmitCategory = () => {
    // ❌ validation check
    if (!inputsCategory?.category_type || inputsCategory?.category_type.toString().trim() === '') {
      setErrorsCategory(prev => ({ ...prev, category_type: true }))
      toast.error('Category name is required') // show toast also
      return
    } else if (!inputsCategory?.prod_name || inputsCategory?.prod_name.toString().trim() === '') {
      setErrorsCategory(prev => ({ ...prev, prod_name: true }))
      toast.error('Category name is required') // show toast also
      return
    }

    // ✅ close popup only if validation passes
    setOpen(false)

    if (inputsCategory?._id === '') {
      const body = {
        category_type: inputsCategory?.category_type,
        prod_name: inputsCategory?.prod_name
      }
      categoryMasterCreation(body)
    } else {
      const body = {
        Id: inputsCategory?._id,
        category_type: inputsCategory?.category_type,
        prod_name: inputsCategory?.prod_name
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
      setOpenCategory(false)
      setOpen(true)
      getCategoryList()
    } else {
      setLoader(false)
      toast?.success(results?.message)
      setOpenCategory(false)
      setOpen(true)
      getCategoryList()
    }
  }

  // *****************Category Function END**************************************

  const handleChange = (field, value) => {
    if (
      field === 'basePrice' ||
      field === 'mrp' ||
      field === 'stock' ||
      field === 'service_duration' ||
      field === 'service_charge' ||
      field === 'selling_price' ||
      field === 'warranty_on_service' ||
      field === 'license_validity' ||
      field === 'license_price' ||
      field === 'license_renewal_price' ||
      field === 'no_of_users' ||
      field === 'warranty_duration' ||
      field === 'warranty_cost' ||
      field === 'warranty_claim_limits' ||
      field === 'subscription_price' ||
      field === 'subscription_renewal_price' ||
      field === 'no_of_devices'
    ) {
      const res = isValidMobileNumberStrict(value)

      if (value.startsWith('0')) return // Prevent typing 0 at start
      if (!/^\d*$/.test(value)) return // Only digits allowed

      if (value === '' || res) {
        setItem({ ...item, [field]: value })
      }
    } else if (field === 'item_type') {
      setItem({ ...item, [field]: value })
    } else {
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
        toast.error(`${updatedRows[index].product_name} Status Inactive `)
      } else {
        toast.success(`${updatedRows[index].product_name} Status Active `)
      }
    } else {
      toast.error(results?.error)
    }
  }

  const handleSubmit = async () => {
    if (item.item_type === 'Product' && (!item.product_code || !item.product_name)) {
      toast.error('Product Not Added', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      if (!item.product_code || !item.product_name) return
    }

    if (item.item_type === 'Service' && (!item.service_code || !item.service_name)) {
      toast.error('Service Not Added', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      if (!item.service_code || !item.service_name) return
    }

    if (item.item_type === 'License' && (!item.license_name || !item.license_code)) {
      toast.error('License Not Added', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      if (!item.license_code || !item.license_name) return
    }

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
      resetForm(item?.item_type)
      setOpen(false)
      fetchItems()
    }
  }

  const resetForm = value => {
    setItem({
      item_type: value,
      product_name: '',
      product_code: '',
      description: '',
      uom: '',
      basePrice: '',
      mrp: '',
      distributorPrice: '',
      gst: '',
      hsn: '',
      product_category: '',
      stock: '',
      warranty_available: 'Yes',
      product_status: 'Active',

      license_key: '',
      warranty_duration: '',
      billing_cycle: 'Monthly',

      service_code: '',
      service_name: '',
      service_category: '',
      service_type: 'On-site',
      service_duration: '',
      service_charge: '',
      selling_price: '',
      warranty_on_service: '',
      service_status: 'Active',
      license_code: '',
      license_name: '',
      license_category: '',
      license_validity: '',
      license_price: '',
      license_renewal_price: '',
      no_of_users: '',
      activation_type: 'Online',
      subscription_included: 'Yes',
      license_status: 'Active',
      warranty_code: '',
      warranty_plan: '',
      warranty_covered_product: '',
      coverage_type: '',
      warranty_cost: '',
      warranty_provider: '',
      warranty_claim_limits: '',
      warranty_expiry_date: null,
      warranty_status: 'Active',
      subscription_code: '',
      subscription_name: '',
      plan_type: '',
      subscription_price: '',
      subscription_renewal_price: '',
      auto_renewal_price: 'Yes',
      no_of_devices: '',
      subscription_start_date: null,
      subscription_end_date: null,
      subscription_status: 'Active',
      description: ''
    })
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

    if (results?.appStatusCode === 0) {
      setTaxList(results.payloadJson)
    } else {
      setTaxList([])
    }
  }

  const getCategoryList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    const results = await getCategoryMasterListApi(header)

    if (results?.appStatusCode === 0) {
      setCategoryList(results.payloadJson)
    } else {
      setCategoryList([])
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

  const handleItemClick = itemType => {
    setItem({
      item_type: itemType,
      product_name: '',
      product_code: '',
      description: '',
      uom: '',
      basePrice: '',
      mrp: '',
      distributorPrice: '',
      gst: '',
      hsn: '',
      license_key: '',
      warranty_duration: '',
      billing_cycle: 'Monthly',
      subscription_start_date: null,
      product_category: '',
      stock: '',
      warranty_available: 'Yes',
      product_status: 'Active',
      service_code: '',
      service_name: '',
      service_category: '',
      service_type: 'On-site',
      service_duration: '',
      service_charge: '',
      selling_price: '',
      warranty_on_service: '',
      service_status: 'Active',
      license_code: '',
      license_name: '',
      license_category: '',
      license_validity: '',
      license_price: '',
      license_renewal_price: '',
      no_of_users: '',
      activation_type: 'Online',
      subscription_included: 'Yes',
      license_status: 'Active',
      warranty_code: '',
      warranty_plan: '',
      warranty_covered_product: '',
      coverage_type: '',
      warranty_cost: '',
      warranty_provider: '',
      warranty_claim_limits: '',
      warranty_expiry_date: null,
      warranty_status: 'Active',
      subscription_code: '',
      subscription_name: '',
      plan_type: '',
      subscription_price: '',
      subscription_renewal_price: '',
      auto_renewal_price: 'Yes',
      no_of_devices: '',
      subscription_end_date: null,
      subscription_status: 'Active',
      description: ''
    })
    setOpen(true)
  }

  // Edit
  const handleEdit = row => {
    setTitles('Edit')
    setItem({
      item_type: row?.item_type,
      product_name: row?.product_name,
      product_code: row?.product_code,
      description: row?.description,
      uom: row?.uom,
      basePrice: row?.basePrice,
      mrp: row?.mrp,
      distributorPrice: row?.distributorPrice,
      gst: row?.gst,
      hsn: row?.hsn,

      warranty_duration: row?.warranty_duration,
      billing_cycle: row?.billing_cycle,
      subscription_start_date: row?.subscription_start_date,
      product_category: row?.product_category,
      stock: row?.stock,
      warranty_available: row?.warranty_available,
      product_status: row?.product_status,

      service_code: row?.service_code,
      service_name: row?.service_name,
      service_category: row?.service_category,
      service_type: row?.service_type,
      service_duration: row?.service_duration,
      service_charge: row?.service_charge,
      selling_price: row?.selling_price,
      warranty_on_service: row?.warranty_on_service,
      service_status: row?.service_status,

      license_key: row?.license_key,
      license_code: row?.license_code,
      license_name: row?.license_name,
      license_category: row?.license_category,
      license_validity: row?.license_validity,
      license_price: row?.license_price,
      license_renewal_price: row?.license_renewal_price,
      no_of_users: row?.no_of_users,
      activation_type: row?.activation_type,
      subscription_included: row?.subscription_included,
      license_status: row?.license_status,

      warranty_code: row?.warranty_code,
      warranty_plan: row?.warranty_plan,
      warranty_covered_product: row?.warranty_covered_product,
      coverage_type: row?.coverage_type,
      warranty_cost: row?.warranty_cost,
      warranty_provider: row?.warranty_provider,
      warranty_claim_limits: row?.warranty_claim_limits,
      warranty_expiry_date: row?.warranty_expiry_date,
      warranty_status: row?.warranty_status,

      subscription_code: row?.subscription_code,
      subscription_name: row?.subscription_name,
      plan_type: row?.plan_type,
      subscription_price: row?.subscription_price,
      subscription_renewal_price: row?.subscription_renewal_price,
      auto_renewal_price: row?.auto_renewal_price,
      no_of_devices: row?.no_of_devices,
      subscription_end_date: row?.subscription_end_date,
      subscription_status: row?.subscription_status,
      description: row?.description
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
    getCategoryList()
  }, []) // empty dependency → run only on mount

  useEffect(() => {
    if (callFlag) {
      getUOMList()
      getTaxList()
      fetchItems()
      getCategoryList()
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
        <RadioGroup row value={item.item_type} onChange={e => handleChange('item_type', e.target.value)}>
          {Array.isArray(itemTypes) &&
            itemTypes.map(option => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
        </RadioGroup>
        <Button
          variant='contained'
          onClick={() => handleItemClick(item.item_type)}
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
                  {item.item_type == 'Product' && (
                    <>
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
                        Item Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Product Code
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Product Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Product Description
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        UOM
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Base Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Gst (%)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Mrp
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Product Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Actions
                      </TableCell>
                    </>
                  )}
                  {item.item_type == 'Service' && (
                    <>
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
                        Item Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Code
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Description
                      </TableCell>
                       <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Type
                      </TableCell>
                       <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Duration (hours)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Charge
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Selling Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty on Service (months)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       UOM
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       GST (%)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Service Status
                      </TableCell>

                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Actions
                      </TableCell>
                    </>
                  )}
                  {item.item_type == 'License' && (
                    <>
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
                        Item Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Code
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Description
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Key
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Validity (Months)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        No of Users
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        GST %
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Active Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Actions
                      </TableCell>
                    </>
                  )}
                  {item.item_type == 'Warranty' && (
                    <>
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
                        Item Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Code
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Plan
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Covered Product
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Coverage Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Duration (yrs)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Cost
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Waranty Clim Limit
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       Waranty Provider
                      </TableCell>
                       <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       Waranty Expiry Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Active Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        License Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Actions
                      </TableCell>
                    </>
                  )}
                   {item.item_type == 'Subscription' && (
                    <>
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
                        Item Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Subscription Code
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Subscription Name
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Plan Type
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Billing Cycle
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Subscription Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Renewal Price
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       No of Device
                      </TableCell>
                       <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                       Subscription Start Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Subscription End Date
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        GST (%)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Auto Renewal
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Subscription Status
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: '#374151',
                          minWidth: 180,
                          maxWidth: 200,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Actions
                      </TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {Array.isArray(items) &&
                  items.map((p, i) => (
                    <React.Fragment key={i}>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                        {item.item_type == p.item_type && item.item_type == 'Product' && (
                          <>
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
                                {p.item_type}
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
                              {p?.product_code}
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
                              {p.product_name}
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
                              {p.description}
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
                            <TableCell
                              sx={{
                                minWidth: 180,
                                maxWidth: 200
                              }}
                            >
                              <Switch checked={p.product_status === 'Active'} onChange={handleSwitchChange(i)} />
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
                          </>
                        )}
                        {item.item_type == p.item_type && item.item_type == 'Service' && (
                          <>
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
                                {p.item_type}
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
                              {p?.service_code}
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
                              {p.service_name}
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
                              {p.description}
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
                              {p.service_type}
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
                              {p.service_duration}
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
                              {formatCurrency(p.service_charge)}
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
                              {formatCurrency(p.selling_price)}
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
                              {p.warranty_on_service} months
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
                              {p.gst} %
                            </TableCell>
                            <TableCell
                              sx={{
                                minWidth: 180,
                                maxWidth: 200
                              }}
                            >
                              <Switch checked={p.service_status === 'Active'} onChange={handleSwitchChange(i)} />
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
                          </>
                        )}
                        {item.item_type == p.item_type && item.item_type == 'License' && (
                          <>
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
                                {p.item_type}
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
                              {p?.license_code}
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
                              {p.license_name}
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
                              {p.description}
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
                              {p.license_key}
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
                              {p.license_validity} months
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
                              {formatCurrency(p.license_price)}
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
                              {p.no_of_users}
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
                                maxWidth: 200
                              }}
                            >
                              <Switch checked={p.license_status === 'Active'} onChange={handleSwitchChange(i)} />
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
                          </>
                        )}
                         {item.item_type == p.item_type && item.item_type == 'Warranty' && (
                          <>
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
                                {p.item_type}
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
                              {p?.warranty_code}
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
                              {p.warranty_plan}
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
                              {p.warranty_covered_product}
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
                              {p.coverage_type}
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
                              {p.warranty_duration}
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
                              {p.warranty_cost}
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
                              {p.warranty_claim_limits}
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
                              {p.warranty_provider}
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
                              {converDayJsDate(p.warranty_expiry_date)}
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
                              {p.activation_type}
                            </TableCell>

                           

                            <TableCell
                              sx={{
                                minWidth: 180,
                                maxWidth: 200
                              }}
                            >
                              <Switch checked={p.license_status === 'Active'} onChange={handleSwitchChange(i)} />
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
                          </>
                        )} 
                        {item.item_type == p.item_type && item.item_type == 'Subscription' && (
                          <>
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
                                {p.item_type}
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
                              {p?.subscription_code}
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
                              {p.subscription_name}
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
                              {p.plan_type}
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
                              {p.billing_cycle}
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
                              {p.subscription_price}
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
                              {p.subscription_renewal_price}
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
                              {p.no_of_devices}
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
                              {converDayJsDate(p.subscription_start_date)}
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
                              {converDayJsDate(p.subscription_end_date)}
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
                              {p.auto_renewal_price}
                            </TableCell>


                           

                           

                            <TableCell
                              sx={{
                                minWidth: 180,
                                maxWidth: 200
                              }}
                            >
                              <Switch checked={p.subscription_status === 'Active'} onChange={handleSwitchChange(i)} />
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
                          </>
                        )}
                      </TableRow>
                    </React.Fragment>
                  ))}
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
        categoryList={categoryList}
        titles={titles}
        item={item}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        addUOMChanges={addUOMChanges}
        addTaxChanges={addTaxChanges}
        handleCheck={handleCheck}
        addCategoryChanges={addCategoryChanges}
        itemTypes={itemTypes}
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
      <AddCategoryMasterPopup
        open={openCategory}
        close={handleCloseCategory}
        titles={titlesCategory}
        inputs={inputsCategory}
        handleChange={handleChangeCategory}
        handleSubmit={handleSubmitCategory}
        errors={errorsCategory}
        handleBlur={handleBlur}
        loader={loader}
        itemTypes={itemTypes}
      />
    </Box>
  )
}

export default ItemMasterList
