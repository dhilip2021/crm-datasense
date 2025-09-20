'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from '@mui/material'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

// ✅ Utility for currency
const formatCurrency = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

const EditProductDialog = ({ open, onClose, product, leadId, fetchLeadFromId }) => {
  const getToken = Cookies.get('_token')

  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [unitPrice, setUnitPrice] = useState(0)

  // Pre-fill when product is passed
  useEffect(() => {
    if (product) {
      setQuantity(product.quantity || 1)
      setDiscount(product.discount || 0)
      setUnitPrice(product.unitPrice || 0)
    }
  }, [product])

  const finalPrice = quantity * unitPrice - (discount / 100) * (quantity * unitPrice)

  const handleSave = async () => {
    try {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const body = {
        product_id: product.product_id,
        quantity,
        unitPrice,
        discount,
        finalPrice
      }

      await fetch(`/api/v1/admin/lead-form/${leadId}/update-product/${product._id}`, {
        method: 'PUT',
        headers: header,
        body: JSON.stringify(body)
      })

      fetchLeadFromId()
      onClose()
      toast.success('Product updated successfully', {
        autoClose: 800,
        position: 'bottom-center',
        hideProgressBar: true
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to update product')
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Box my={2}>
          <Typography fontWeight={600}>{product.name}</Typography>
          <Typography variant='body2' color='text.secondary'>
            Unit Price: {formatCurrency(unitPrice)}
          </Typography>
        </Box>

        <Box display='flex' gap={2} my={2}>
          <TextField
            label='Quantity'
            type='number'
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            sx={{ width: 120 }}
            size='small'
          />
          <TextField
            label='Discount %'
            type='number'
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            sx={{ width: 120 }}
            size='small'
          />
          <TextField
            label='Final Price'
            value={formatCurrency(finalPrice)}
            sx={{ flex: 1 }}
            size='small'
            InputProps={{ readOnly: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditProductDialog
