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
  TablePagination
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'

import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import AddIcon from '@mui/icons-material/Add' // Added this import
import AddItemDialog from './AddItemDialog'
import { createItemMaster, getTaxMasterListApi, getUOMMasterListApi, postItemMasterListApi } from '@/apiFunctions/ApiAction'

const ItemMasterList = () => {
  const getToken = Cookies.get('_token')
  const [items, setItems] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({})
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [uomList, setUomList] = useState([])
  const [taxList, setTaxList] = useState([])
  const [titles, setTitles] = useState('Add New Item')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)



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

  const handleChange = (field, value) => {
    setItem({ ...item, [field]: value })
  }

  const handleSubmit = async () => {
    console.log('New Item:', item)

    if (!item.item_code || !item.item_name) return

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)

    const body= JSON.stringify(item)

    console.log(body,"<<< BODDYYY")


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

    // const res = await fetch('/api/v1/admin/item-master/add', {
    //   method: 'POST',
    //   headers: header,
    //   body: JSON.stringify(item)
    // })
    // const data = await res.json()

    // if (data.success) {
    //   toast.success('Items Added Successfully!', {
    //     autoClose: 500,
    //     position: 'bottom-center',
    //     hideProgressBar: true,
    //     closeOnClick: true,
    //     pauseOnHover: false,
    //     draggable: false,
    //     progress: undefined
    //   })

      
    // }

    // onClose()
    // fetchItems()
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

    const results = await postItemMasterListApi(body, header)

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

  // Edit
  const handleEdit = row => {

    console.log(row,"<<< rowwwwwww")
    setTitles('Edit Item')
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
      subscriptionDuration: row?.subscriptionDuration,
    })
    setOpen(true)
  }

  // Save Edit
  const handleSaveEdit = async id => {
    try {
      const res = await fetch(`/api/v1/admin/item-master/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify(editData)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Item updated successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        })
        setEditingIndex(null)
        setEditData({})
        setExpandedRow(null)
        fetchItems()
      } else {
        toast.error('Failed to update item!', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (error) {
      toast.error('Error updating item!', {
        autoClose: 1000,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
  }

  useEffect(() => {
    getUOMList()
    getTaxList()
    fetchItems()
  }, [])

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#374151' }}>
              Item List
            </Typography>
            <Button
              variant='contained'
              onClick={() => setOpen(true)}
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
        </Grid>

        <Grid item xs={12}>
          <Box
            sx={{ bgcolor: 'white', borderRadius: '8px', maxHeight: 500, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'auto',width:"100%" }}
          >
           

            <Table stickyHeader
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
              }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151', position: 'sticky',
                      left: 0,
                      zIndex: 9,
                      minWidth: 120 }}>Item Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151',   minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Item Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Item Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Base Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Gst</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Mrp</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Distributor Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Hsn</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>License Key</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Warranty Period</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Billing Cycle</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Subscription Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' ,  minWidth: 180, maxWidth: 200, whiteSpace: 'nowrap' }}>Actions</TableCell>
                  {/* <TableCell /> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((p, i) => (
                  <React.Fragment key={i}>
                    <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell sx={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            backgroundColor: '#fff',
                            minWidth: 120
                          }}>
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
                      >{p.item_name}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.item_type}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.uom}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.basePrice}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.gst}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.mrp}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.distributorPrice}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.hsn}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.licenseKey}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.warrantyPeriod}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.billingCycle}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.subscriptionDuration}</TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                        <Chip
                          label={p.n_status}
                          color={p.n_status === 'Active' ? 'success' : 'default'}
                          size='small'
                          sx={{ borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell sx={{
                            minWidth: 180,
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
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
        </Grid>
      </Grid>
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
    </Box>
  )
}

export default ItemMasterList
