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

const ProductBulkEditDialog = ({ open, onClose, leadId, itemId, products, fetchLeadFromId, itemsData }) => {
  const token = Cookies.get('_token')
  const [editedProducts, setEditedProducts] = useState([])
  const [loader, setLoader] = useState(false)
  const [selectedItems, setSelectedItems] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [addedItems, setAddedItems] = useState([])

  const handleAdd = () => {
    if (!selectedItems) return

    const unitPrice = selectedItems.basePrice || 0
    const totalPrice = quantity * unitPrice
    let finalPrice = totalPrice

    // 🔹 Apply Discount
    if (selectedItems.discountType === 'Flat %') {
      const totalDiscount = totalPrice * (discount / 100)
      finalPrice = totalPrice - totalDiscount
    } else if (selectedItems.discountType === 'Flat Amount') {
      finalPrice = totalPrice - discount
    }

    // 🔹 Extra logic based on item_type
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

    // 🔹 Final object
    const newItem = {
      itemMasterRef: selectedItems._id, // ✅ mongo ref
      item_id: selectedItems.item_id,
      product_name: selectedItems.product_name,
      item_type: selectedItems.item_type,
      quantity,
      unitPrice,
      discount,
      discountType: selectedItems.discountType || 'Flat %',
      finalPrice,
      ...extraFields
    }

    // 🔹 Wrap inside order
    const newOrder = {
      item_ref: [newItem]
    }

    setAddedItems(prev => [...prev, newOrder])
    setSelectedItems(null)
    setQuantity(1)
    setDiscount(0)
  }

  // 🔹 Remove an entire order (you can also allow remove item_ref by index if needed)
  const handleRemove = index => {
    setAddedItems(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (products) {
      // Directly clone the array (products already is item_ref)
      const cloned = products.map(p => ({ ...p }))
      setEditedProducts(cloned)
    }
  }, [products])

  // const handleChange = (index, field, value) => {
  //   setEditedProducts(prev => {
  //     const updated = [...prev]
  //     updated[index][field] = Number(value)

  //     const qty = updated[index].quantity || 0
  //     const unitPrice = updated[index].unitPrice || 0
  //     const discount = updated[index].discount || 0
  //     if (updated[index].discountType === 'Flat %') {
  //       updated[index].finalPrice = qty * unitPrice - (qty * unitPrice * discount) / 100
  //     } else if (updated[index].discountType === 'Flat Amount') {
  //       updated[index].finalPrice = qty * unitPrice - discount
  //     } else {
  //       updated[index].finalPrice = qty * unitPrice
  //     }

  //     return updated
  //   })
  // }

  const handleChange = (index, field, value) => {
    let numericValue = Number(value)
    if (numericValue < 0) numericValue = 0 // ✅ prevent negative numbers

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
          item_id: itemId, // 👈 added this
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
          <Autocomplete
            options={itemsData}
            getOptionLabel={option => `${option.product_name} (${option.item_type})` || ''}
            value={selectedItems}
            onChange={(e, newVal) => setSelectedItems(newVal)}
            sx={{ flex: 2 }}
            size='small'
            renderInput={params => <TextField {...params} label='Select Items' />}
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
            label={selectedItems?.discountType === 'Flat Amount' ? 'Discount Amount' : 'Discount %'}
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

        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Final Price</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {editedProducts.map(p => (
              <TableRow key={p.item_id}>
                <TableCell>{p.itemMasterRef?.product_name || p.product_name}</TableCell>
                <TableCell>
                  <TextField
                    type='number'
                    size='small'
                    value={p.quantity}
                    onChange={e =>
                      handleChange(
                        editedProducts.findIndex(x => x.item_id === p.item_id),
                        'quantity',
                        e.target.value
                      )
                    }
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type='number'
                    size='small'
                    value={p.discount}
                    onChange={e =>
                      handleChange(
                        editedProducts.findIndex(x => x.item_id === p.item_id),
                        'discount',
                        e.target.value
                      )
                    }
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell>{p.finalPrice}</TableCell>
                <TableCell>
                  <Button
                    variant='outlined'
                    color='error'
                    size='small'
                    onClick={() => setEditedProducts(prev => prev.filter(x => x.item_id !== p.item_id))}
                  >
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
