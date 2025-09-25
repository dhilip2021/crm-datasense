'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
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
  Grid
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

const categories = ['Product', 'Service', 'Subscription', 'License']
const statuses = ['Active', 'Inactive']
const discountTypes = ['Flat %', 'Flat Amount']
const taxCategories = ['5%', '12%', '18%', '28%']

const ProductMasterDialog = ({ open, onClose, fetchProducts }) => {
  const getToken = Cookies.get('_token')
  const [products, setProducts] = useState([])
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    category: '',
    industryTags: [],
    subCategory: '',
    description: '',
    uom: '',
    basePrice: '',
    currency: 'INR',
    taxCategory: '',
    discountType: '',
    priceBooks: [],
    status: 'Active'
  })

  const [editingIndex, setEditingIndex] = useState(null)
  const [editData, setEditData] = useState({})

  // Add Product
  const handleAddProduct = async () => {
    if (!newProduct.code || !newProduct.name) return

    console.log(newProduct, '<<< NEW PRODUCTTT')
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const res = await fetch('/api/v1/admin/products/create', {
      method: 'POST',
      headers: header,
      body: JSON.stringify(newProduct)
    })
    const data = await res.json()

    if (data.success) {
      toast.success('Product Added Successfully!', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      resetForm()
      fetchProducts()
    }
  }

  // Reset form
  const resetForm = () => {
    setNewProduct({
      code: '',
      name: '',
      category: '',
      industryTags: [],
      subCategory: '',
      description: '',
      uom: '',
      basePrice: '',
      currency: 'INR',
      taxCategory: '',
      discountType: '',
      priceBooks: [],
      status: 'Active'
    })
    onClose()
  }

  // Add PriceBook
  const handleAddPriceBook = () => {
    setNewProduct({
      ...newProduct,
      priceBooks: [...newProduct.priceBooks, { name: '', price: '' }]
    })
  }

  // Update PriceBook inline
  const handlePriceBookChange = (index, field, value) => {
    const updated = [...newProduct.priceBooks]
    updated[index][field] = value
    setNewProduct({ ...newProduct, priceBooks: updated })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          bgcolor: '#f9fafb'
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: '#009CDE',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}
      >
        Add Product Master
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CancelIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ bgcolor: 'white', borderRadius: '8px', p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#374151' }}>
            Product Details
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                required
                label="SKU Code"
                placeholder="Enter Unique SKU or Barcode"
                value={newProduct.code}
                onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                required
                label="Product Name"
                placeholder="E.g., Radiant Matte Lipstick – Coral"
                value={newProduct.name}
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                select
                label="Category"
                value={newProduct.category}
                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              >
                {categories.map(c => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Sub Category"
                value={newProduct.subCategory}
                onChange={e => setNewProduct({ ...newProduct, subCategory: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Industry Tags (comma separated)"
                value={newProduct.industryTags.join(',')}
                onChange={e => setNewProduct({ ...newProduct, industryTags: e.target.value.split(',').map(tag => tag.trim()) })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="UOM"
                value={newProduct.uom}
                onChange={e => setNewProduct({ ...newProduct, uom: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Base Price"
                type="number"
                value={newProduct.basePrice}
                onChange={e => setNewProduct({ ...newProduct, basePrice: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                label="Currency"
                value={newProduct.currency}
                onChange={e => setNewProduct({ ...newProduct, currency: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                select
                label="Tax Category"
                value={newProduct.taxCategory}
                onChange={e => setNewProduct({ ...newProduct, taxCategory: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              >
                {taxCategories.map(t => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                select
                label="Discount Type"
                value={newProduct.discountType}
                onChange={e => setNewProduct({ ...newProduct, discountType: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              >
                {discountTypes.map(d => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                size="small"
                fullWidth
                select
                label="Status"
                value={newProduct.status}
                onChange={e => setNewProduct({ ...newProduct, status: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              >
                {statuses.map(s => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                size="small"
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newProduct.description}
                onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                sx={{
                  '& .MuiInputBase-root': { borderRadius: '8px' },
                  '& .MuiInputLabel-root': { color: '#374151', fontWeight: 'medium' }
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* <Box sx={{ mt: 4, bgcolor: 'white', borderRadius: '8px', p: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: '#374151' }}>
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
              {newProduct.priceBooks.map((pb, i) => (
                <TableRow key={i} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={pb.name}
                      onChange={e => handlePriceBookChange(i, 'name', e.target.value)}
                      sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={pb.price}
                      onChange={e => handlePriceBookChange(i, 'price', e.target.value)}
                      sx={{ '& .MuiInputBase-root': { borderRadius: '8px' } }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddPriceBook}
                    sx={{
                      bgcolor: '#009CDE',
                      color: 'white',
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#1565c0' }
                    }}
                  >
                    Add Price Book
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box> */}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <Box display="flex" justifyContent="space-between" width="100%">
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': { bgcolor: '#f3f4f6' }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleAddProduct}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              bgcolor: '#009CDE',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Add Product
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ProductMasterDialog