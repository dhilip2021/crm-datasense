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
  Autocomplete,
  CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helper/frontendHelper'

// const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)


const ProductSelectorDialog = ({ itemsData, open, onClose, leadId, fetchLeadFromId }) => {
  const getToken = Cookies.get('_token')

  const [selectedItems, setSelectedItems] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [loader, setLoader] = useState(false)
  const [addedItems, setAddedItems] = useState([])

  //   const handleAdd = () => {

  //     if (!selectedItems) return

  //     const unitPrice = selectedItems.basePrice || 0
  //     const totalPrice = quantity * unitPrice

  //     let finalPrice = totalPrice
  //     if (selectedItems.discountType === 'Flat %') {
  //       const totalDiscount = totalPrice * (discount / 100)
  //       finalPrice = totalPrice - totalDiscount
  //     } else if (selectedItems.discountType === 'Flat Amount') {
  //       finalPrice = totalPrice - discount
  //     }

  //     const newItem = {
  //   item_id: selectedItems.item_id,
  //   item_name: selectedItems.item_name,
  //   quantity,
  //   unitPrice,
  //   discount,
  //   discountType: selectedItems.discountType || 'Flat %', // default to %
  //   finalPrice
  // }

  //     setAddedItems(prev => [...prev, newItem])
  //     setSelectedItems(null)
  //     setQuantity(1)
  //     setDiscount(0)
  //   }
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
      item_name: selectedItems.item_name,
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

  const handleSave = async () => {
    if (addedItems.length === 0) return

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      setLoader(true)
      const result = await fetch(`/api/v1/admin/lead-form/${leadId}/add-product`, {
        method: 'POST',
        headers: header,
        body: JSON.stringify({ items: addedItems }) // ✅ now sends nested payload
      })

      const data = await result.json()
      setLoader(false)

      if (data.success) {
        toast.success('Products added successfully!', { autoClose: 1000, position: 'bottom-center' })
        fetchLeadFromId()
        setAddedItems([])
        setSelectedItems(null)
        setQuantity(1)
        setDiscount(0)
        onClose()
      } else {
        toast.error(data.message || 'Failed to add items')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Select Items for Lead</DialogTitle>
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
              // 🔹 Check if item is already added (disable it)
              const isDisabled = addedItems.some(order => order.item_ref.some(ref => ref.item_id === option.item_id))

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

        {/* Table of Added Products */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Unit Price</TableCell>
              <TableCell>Discount</TableCell>
              <TableCell>Final Price</TableCell>

              {/* 🔹 Dynamic Columns per item_type */}
              <TableCell>Details</TableCell>

              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {addedItems.map((order, i) =>
              order.item_ref.map((p, j) => (
                <TableRow key={`${i}-${j}`}>
                  <TableCell>{p.item_name}</TableCell>
                  <TableCell>{p.item_type}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell>{p.unitPrice}</TableCell>
                  <TableCell>
                    {p.discount} {p.discountType === 'Flat Amount' ? '' : '%'}
                  </TableCell>
                  <TableCell>{p.finalPrice}</TableCell>

                  <TableCell>
                    {p.item_type === 'Product' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>MRP:</strong> {formatCurrency(p.mrp) || '-'} <br />
                        <strong>GST:</strong> {`${p.gst}%` || '-'}
                      </>
                    )}
                    {p.item_type === 'Service' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>GST:</strong> {`${p.gst}%` || '-'} <br />
                        <strong>HSN:</strong> {p.hsn || '-'}
                      </>
                    )}
                    {p.item_type === 'License' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>Key:</strong> {p.licenseKey || '-'} <br />
                        <strong>Duration:</strong> {p.subscriptionDuration || '-'}
                      </>
                    )}
                    {p.item_type === 'Warranty' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>Warranty:</strong> {p.warrantyPeriod || '-'} months
                      </>
                    )}
                    {p.item_type === 'Subscription' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>Billing:</strong> {p.billingCycle || '-'} <br />
                        <strong>Duration:</strong> {p.subscriptionDuration || '-'}
                      </>
                    )}
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => handleRemove(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {addedItems.length === 0 && (
          <Typography textAlign='center' color='text.secondary' mt={2}>
            No items added yet...
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={addedItems.length === 0 || loader}
          sx={{ position: 'relative' }}
        >
          {loader ? 'Saving Products' : 'Save Products'}

          {loader && (
            <CircularProgress
              size={20}
              color='inherit'
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-10px',
                marginLeft: '-10px'
              }}
            />
          )}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ProductSelectorDialog
