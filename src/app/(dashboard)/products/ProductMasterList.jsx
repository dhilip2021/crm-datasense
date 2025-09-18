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
  DialogActions
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import ProductMasterDialog from './ProductMasterDialog'
import AddIcon from '@mui/icons-material/Add' // Added this import

const ProductMasterList = () => {
  const getToken = Cookies.get('_token')
  const [products, setProducts] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({})
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState(null)

  // Fetch products
  const fetchProducts = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const res = await fetch('/api/v1/admin/products/list', { headers: header })
    const data = await res.json()
    if (data.success) setProducts(data.payloadJson)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Delete
  const handleDelete = async id => {
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false
        })
        fetchProducts()
      } else {
        toast.error('Failed to delete product!', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (error) {
      toast.error('Error deleting product!', {
        autoClose: 1000,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
    setDeleteDialogOpen(false)
    setDeleteProductId(null)
  }

  // Open delete confirmation dialog
  const openDeleteDialog = id => {
    setDeleteProductId(id)
    setDeleteDialogOpen(true)
  }

  // Edit
  const handleEdit = index => {
    setEditingIndex(index)
    setEditData({ ...products[index] })
    setExpandedRow(index)
  }

  // Save Edit
  const handleSaveEdit = async id => {
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify(editData)
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Product updated successfully!', {
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
        fetchProducts()
      } else {
        toast.error('Failed to update product!', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (error) {
      toast.error('Error updating product!', {
        autoClose: 1000,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
  }

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditData({})
    setExpandedRow(null)
  }

  // Handle nested price book edit
  const handlePriceBookChange = (idx, field, value) => {
    const updatedBooks = [...editData.priceBooks]
    updatedBooks[idx][field] = value
    setEditData({ ...editData, priceBooks: updatedBooks })
  }

  // Toggle row expansion
  const handleToggleExpand = index => {
    setExpandedRow(expandedRow === index ? null : index)
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#f9fafb', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#374151' }}>
              Product List
            </Typography>
            <Button
              variant="contained"
              onClick={() => setOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                bgcolor: '#8c57ff',
                '&:hover': { bgcolor: '#8c57ff' }
              }}
            >
              Create Product
            </Button>
          </Box>
          <Divider sx={{ mb: 3, borderColor: '#e5e7eb' }} />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ bgcolor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Base Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Actions</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p, i) => (
                  <React.Fragment key={p._id}>
                    <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                      <TableCell>{editingIndex === i ? <TextField size="small" value={editData.code} onChange={e => setEditData({ ...editData, code: e.target.value })} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} /> : p.code}</TableCell>
                      <TableCell>{editingIndex === i ? <TextField size="small" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} /> : p.name}</TableCell>
                      <TableCell>{editingIndex === i ? <TextField size="small" select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}><MenuItem value="Product">Product</MenuItem><MenuItem value="Service">Service</MenuItem><MenuItem value="Subscription">Subscription</MenuItem><MenuItem value="License">License</MenuItem></TextField> : p.category}</TableCell>
                      <TableCell>{editingIndex === i ? <TextField size="small" type="number" value={editData.basePrice} onChange={e => setEditData({ ...editData, basePrice: e.target.value })} sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }} /> : p.basePrice}</TableCell>
                      <TableCell>
                        {editingIndex === i ? (
                          <TextField
                            size="small"
                            select
                            value={editData.status}
                            onChange={e => setEditData({ ...editData, status: e.target.value })}
                            sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                          >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                          </TextField>
                        ) : (
                          <Chip
                            label={p.status}
                            color={p.status === 'Active' ? 'success' : 'default'}
                            size="small"
                            sx={{ borderRadius: '6px' }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {editingIndex === i ? (
                          <>
                            <IconButton onClick={() => handleSaveEdit(p._id)} sx={{ color: '#8c57ff', '&:hover': { bgcolor: '#e3f2fd' } }}>
                              <SaveIcon />
                            </IconButton>
                            <IconButton onClick={handleCancelEdit} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                              <CancelIcon />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton onClick={() => handleEdit(i)} sx={{ color: '#8c57ff', '&:hover': { bgcolor: '#e3f2fd' } }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => openDeleteDialog(p._id)} sx={{ color: '#ef4444', '&:hover': { bgcolor: '#fee2e2' } }}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleToggleExpand(i)} sx={{ color: '#374151' }}>
                          {expandedRow === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0, borderBottom: 'none' }}>
                        <Collapse in={expandedRow === i} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: '#f9fafb' }}>
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: '#374151' }}>
                              Price Books
                            </Typography>
                            <Table size="small" sx={{ border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                              <TableHead>
                                <TableRow sx={{ bgcolor: '#f3f4f6' }}>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Name</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#374151' }}>Price</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {(editingIndex === i ? editData.priceBooks : p.priceBooks)?.map((pb, idx) => (
                                  <TableRow key={idx} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                    <TableCell>
                                      {editingIndex === i ? (
                                        <TextField
                                          size="small"
                                          value={pb.name}
                                          onChange={e => handlePriceBookChange(idx, 'name', e.target.value)}
                                          sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                                        />
                                      ) : (
                                        pb.name
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {editingIndex === i ? (
                                        <TextField
                                          size="small"
                                          type="number"
                                          value={pb.price}
                                          onChange={e => handlePriceBookChange(idx, 'price', e.target.value)}
                                          sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                                        />
                                      ) : (
                                        pb.price
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
                        No products found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Grid>
      </Grid>

      <ProductMasterDialog open={open} onClose={() => setOpen(false)} fetchProducts={fetchProducts} />

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
          <Typography variant="body1" sx={{ color: '#374151' }}>
            Are you sure you want to delete this product? This action cannot be undone.
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
            onClick={() => handleDelete(deleteProductId)}
            variant="contained"
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

export default ProductMasterList