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
  Autocomplete
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'

const ProductSelectorDialog = ({ open, onClose, leadId, fetchLeadFromId }) => {
  const getToken = Cookies.get('_token')

  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [addedProducts, setAddedProducts] = useState([])

  // Fetch products from API
  useEffect(() => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    if (open) {
      fetch('/api/v1/admin/products/list', { headers: header })
        .then(res => res.json())
        .then(data => {
          console.log(data, '<<< product Listttt')
          if (data.success) setProducts(data.payloadJson)
        })
    }
  }, [open])

  const handleAdd = () => {
    if (!selectedProduct) return
    const unitPrice = selectedProduct.basePrice || 0
    const finalPrice = quantity * unitPrice - (discount / 100) * unitPrice

    const newItem = {
      product_id: selectedProduct.product_id,
      name: selectedProduct.name,
      quantity,
      unitPrice,
      discount,
      finalPrice
    }

    setAddedProducts(prev => [...prev, newItem])
    setSelectedProduct(null)
    setQuantity(1)
    setDiscount(0)
  }

  const handleRemove = index => {
    setAddedProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    console.log(addedProducts, '<<<< addedProducts')

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    for (const item of addedProducts) {
      const result = await fetch(`/api/v1/admin/lead-form/${leadId}/add-product`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(item)
      })
    }
    onClose()
    fetchLeadFromId()
    toast.success('This product added', {
      autoClose: 500, // 1 second la close
      position: 'bottom-center',
      hideProgressBar: true, // progress bar venam na
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      progress: undefined
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Select Products for Lead</DialogTitle>
      <DialogContent>
        <Box display='flex' gap={2} my={2}>
          <Autocomplete
            options={products}
            getOptionLabel={option => option.name || ''}
            value={selectedProduct}
            onChange={(e, newVal) => setSelectedProduct(newVal)}
            sx={{ flex: 2 }}
            size='small'
            renderInput={params => <TextField {...params} label='Select Product' />}
          />
          <TextField
            label='Qty'
            type='number'
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            sx={{ width: 100 }}
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
          <Button variant='contained' onClick={handleAdd}>
            Add
          </Button>
        </Box>

        {/* Table of Added Products */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Discount %</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addedProducts.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>{p.unitPrice}</TableCell>
                <TableCell>{p.discount}</TableCell>
                <TableCell>{p.finalPrice}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleRemove(i)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {addedProducts.length === 0 && (
          <Typography textAlign='center' color='text.secondary' mt={2}>
            No products added yet...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={addedProducts.length === 0}>
          Save Products
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductSelectorDialog
