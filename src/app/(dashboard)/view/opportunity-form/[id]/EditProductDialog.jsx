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
  Typography,
  CircularProgress
} from '@mui/material'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helper/frontendHelper'

// ✅ Utility for currency
// const formatCurrency = value =>  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

const EditProductDialog = ({ open, onClose, productRef, leadId, fetchLeadFromId }) => {


  console.log(productRef,"<< edit product list")
  const getToken = Cookies.get('_token')

  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [unitPrice, setUnitPrice] = useState(0)
  const [loader, setLoader] = useState(false)

  // Pre-fill when productRef is passed
  useEffect(() => {
    if (productRef) {
      setQuantity(productRef.quantity || 1)
      setDiscount(productRef.discount || 0)
      setUnitPrice(productRef.unitPrice || productRef.itemMasterRef?.mrp || 0)
    }
  }, [productRef])

  const finalPrice =
    productRef?.discountType === 'Flat Amount'
      ? quantity * unitPrice - discount
      : quantity * unitPrice - (discount / 100) * (quantity * unitPrice)

  const handleSave = async () => {
    if (!productRef) return
    try {
      setLoader(true)
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const body = {
        quantity,
        unitPrice,
        discount
      }

      const res = await fetch(
        `/api/v1/admin/lead-form/${leadId}/update-product/${productRef._id}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(body)
        }
      )

      const data = await res.json()
      setLoader(false)

      if (data.success) {
        toast.success('Product updated successfully!', { autoClose: 1000, position: 'bottom-center' })
        fetchLeadFromId()
        onClose()
      } else {
        toast.error(data.message || 'Failed to update product')
      }
    } catch (err) {
      console.error(err)
      setLoader(false)
      toast.error('Something went wrong')
    }
  }

  if (!productRef) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <Box my={2}>
          <Typography fontWeight={600}>{productRef.item_name}</Typography>
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
            label={productRef.discountType === 'Flat Amount' ? 'Discount Amount' : 'Discount %'}
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

        {/* 🔹 Extra Fields by item_type */}
        <Box mt={2}>
          {productRef.item_type === 'Product' && (
            <>
              <strong>UOM:</strong> {productRef.uom || '-'} <br />
              <strong>MRP:</strong> {productRef.mrp || '-'} <br />
              <strong>GST:</strong> {productRef.gst || '-'}
            </>
          )}
          {productRef.item_type === 'Service' && (
            <>
              <strong>UOM:</strong> {productRef.uom || '-'} <br />
              <strong>GST:</strong> {productRef.gst || '-'} <br />
              <strong>HSN:</strong> {productRef.hsn || '-'}
            </>
          )}
          {productRef.item_type === 'License' && (
            <>
              <strong>UOM:</strong> {productRef.uom || '-'} <br />
              <strong>Key:</strong> {productRef.licenseKey || '-'} <br />
              <strong>Duration:</strong> {productRef.subscriptionDuration || '-'}
            </>
          )}
          {productRef.item_type === 'Warranty' && (
            <>
              <strong>UOM:</strong> {productRef.uom || '-'} <br />
              <strong>Warranty:</strong> {productRef.warrantyPeriod || '-'} months
            </>
          )}
          {productRef.item_type === 'Subscription' && (
            <>
              <strong>UOM:</strong> {productRef.uom || '-'} <br />
              <strong>Billing:</strong> {productRef.billingCycle || '-'} <br />
              <strong>Duration:</strong> {productRef.subscriptionDuration || '-'}
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={loader} sx={{ position: 'relative' }}>
          {loader ? 'Saving...' : 'Save Changes'}
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

export default EditProductDialog
