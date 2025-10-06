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
  Box,
  Autocomplete
} from '@mui/material'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'

const ProductBulkEditDialog = ({ open, onClose, leadId, orderId, products, fetchLeadFromId, itemsData }) => {
  const token = Cookies.get('_token')
  const [editedProducts, setEditedProducts] = useState([])
  const [loader, setLoader] = useState(false)
  const [selectedItems, setSelectedItems] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)

  // 🟩 Add item logic
  const handleAdd = () => {
    if (!selectedItems) return

    const unitPrice = selectedItems.basePrice || 0
    const totalPrice = quantity * unitPrice
    let finalPrice = totalPrice

    // 🔹 Apply discount
    if (selectedItems.discountType === 'Flat %') {
      const totalDiscount = totalPrice * (discount / 100)
      finalPrice = totalPrice - totalDiscount
    } else if (selectedItems.discountType === 'Flat Amount') {
      finalPrice = totalPrice - discount
    }

    // 🔹 Extra fields by type
    let extraFields = {}
    switch (selectedItems.item_type) {
      case 'Product':
        extraFields = { uom: selectedItems.uom, mrp: selectedItems.mrp, gst: selectedItems.gst }
        break
      case 'Service':
        extraFields = { uom: selectedItems.uom, gst: selectedItems.gst, hsn: selectedItems.hsn }
        break
      case 'License':
        extraFields = {
          uom: selectedItems.uom,
          licenseKey: selectedItems.licenseKey,
          subscriptionDuration: selectedItems.subscriptionDuration
        }
        break
      case 'Warranty':
        extraFields = { uom: selectedItems.uom, warrantyPeriod: selectedItems.warrantyPeriod }
        break
      case 'Subscription':
        extraFields = {
          uom: selectedItems.uom,
          billingCycle: selectedItems.billingCycle,
          subscriptionDuration: selectedItems.subscriptionDuration
        }
        break
      default:
        extraFields = {}
    }

    // 🔹 Final new item object
    const newItem = {
      itemMasterRef: selectedItems._id,
      item_id: selectedItems.item_id,
      item_name: selectedItems.item_name,
      item_type: selectedItems.item_type,
      quantity,
      unitPrice,
      discount,
      discountType: selectedItems.discountType || 'Flat %',
      finalPrice,
      ...extraFields
    }

    // ✅ Push the new item directly into editedProducts (so it appears in table)
    setEditedProducts(prev => [...prev, newItem])

    // reset fields
    setSelectedItems(null)
    setQuantity(1)
    setDiscount(0)
  }

  // 🟨 Remove item
  const handleRemove = item_id => {
    setEditedProducts(prev => prev.filter(p => p.item_id !== item_id))
  }

  // 🟦 Load existing products (edit mode)
  useEffect(() => {
    if (products?.length) {
      const cloned = products.map(p => ({ ...p }))
      setEditedProducts(cloned)
    }
  }, [products])

  // 🟧 Update values
  const handleChange = (index, field, value) => {
    let numericValue = Number(value)
    if (numericValue < 0) numericValue = 0

    setEditedProducts(prev => {
      const updated = [...prev]
      updated[index][field] = numericValue

      const qty = updated[index].quantity || 0
      const unitPrice = updated[index].unitPrice || 0
      const discount = updated[index].discount || 0

      if (updated[index].discountType === 'Flat %') {
        updated[index].finalPrice = qty * unitPrice - (qty * unitPrice * discount) / 100
      } else if (updated[index].discountType === 'Flat Amount') {
        updated[index].finalPrice = qty * unitPrice - discount
      } else {
        updated[index].finalPrice = qty * unitPrice
      }

      return updated
    })
  }

  // 🟩 Save all edited + new products
  const handleSave = async () => {
    if (!editedProducts.length) return
    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}/bulk-update-products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          order_id: orderId,
          items: editedProducts
        })
      })
      const data = await res.json()
      setLoader(false)

      if (data.success) {
        toast.success('Products updated successfully!', { autoClose: 1000, position: 'bottom-center' })
        fetchLeadFromId()
        onClose()
      } else {
        toast.error(data.message || 'Failed to update products')
      }
    } catch (err) {
      console.error(err)
      setLoader(false)
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Edit Items</DialogTitle>

      <DialogContent>
        <Box display='flex' gap={2} my={2}>
          {/* <Autocomplete
            options={itemsData}
            getOptionLabel={option => `${option.item_name} (${option.item_type})` || ''}
            value={selectedItems}
            onChange={(e, newVal) => setSelectedItems(newVal)}
            sx={{ flex: 2 }}
            size='small'
            renderInput={params => <TextField {...params} label='Select Items' />}
          /> */}
          <Autocomplete
            options={itemsData}
            getOptionLabel={option => `${option.item_name} (${option.item_type})` || ''}
            value={selectedItems}
            onChange={(e, newVal) => setSelectedItems(newVal)}
            sx={{ flex: 2 }}
            size='small'
            renderOption={(props, option) => {
              // 🔹 Check if this option is already added in editedProducts
              const isDisabled = editedProducts.some(item => item.item_id === option.item_id)

              return (
                <li
                  {...props}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  {option.item_name} ({option.item_type})
                </li>
              )
            }}
            renderInput={params => <TextField {...params} label='Select Items' />}
          />
          {/* <TextField
            label='Qty'
            type='number'
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            sx={{ width: 100 }}
            size='small'
          />
          <TextField
            label={selectedItems?.discountType === 'Flat Amount' ? 'Discount Amount' : 'Discount %'}
            type='number'
            value={discount}
            onChange={e => setDiscount(Number(e.target.value))}
            sx={{ width: 120 }}
            size='small'
          /> */}

          <TextField
            label='Qty'
            type='number'
            value={quantity}
            onChange={e => {
              const val = Number(e.target.value)
              if (val >= 0) setQuantity(val) // ✅ block minus values
            }}
            onKeyDown={e => {
              if (e.key === '-' || e.key === 'e') e.preventDefault() // 🚫 prevent typing '-' or 'e'
            }}
            sx={{ width: 100 }}
            size='small'
          />

          <TextField
            label={selectedItems?.discountType === 'Flat Amount' ? 'Discount Amount' : 'Discount %'}
            type='number'
            value={discount}
            onChange={e => {
              const val = Number(e.target.value)
              if (val >= 0) setDiscount(val) // ✅ block minus values
            }}
            onKeyDown={e => {
              if (e.key === '-' || e.key === 'e') e.preventDefault() // 🚫 prevent negative or exponential input
            }}
            sx={{ width: 120 }}
            size='small'
          />
          <Button variant='contained' onClick={handleAdd}>
            Add
          </Button>
        </Box>

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Final Price</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {editedProducts.map((p, i) => (
              <TableRow key={p.item_id || i}>
                <TableCell>{p.itemMasterRef?.item_name || p.item_name}</TableCell>
                <TableCell>
                  <TextField
                    type='number'
                    size='small'
                    value={p.quantity}
                    onChange={e => handleChange(i, 'quantity', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type='number'
                    size='small'
                    value={p.discount}
                    onChange={e => handleChange(i, 'discount', e.target.value)}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>{p.finalPrice}</TableCell>
                <TableCell>
                  <Button variant='outlined' color='error' size='small' onClick={() => handleRemove(p.item_id)}>
                    Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={loader}>
          {loader ? 'Updating...' : 'Update Items'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductBulkEditDialog
