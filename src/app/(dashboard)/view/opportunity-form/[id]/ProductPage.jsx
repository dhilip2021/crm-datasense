'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import ProductSelectorDialog from './ProductSelectorDialog'
import ProductBulkEditDialog from './ProductBulkEditDialog'
import { toast } from 'react-toastify'

// ✅ Utility for currency
const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

function ProductPage({ leadId, leadData, fetchLeadFromId, itemsData }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [loader, setLoader] = useState(false)

  const [deleteProductId, setDeleteProductId] = useState(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const [openBulkEdit, setOpenBulkEdit] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const summary = useMemo(() => {
    if (!leadData?.items?.length) return { qty: 0, subtotal: 0, discount: 0, gstAmount: 0, total: 0 }

    let qty = 0,
      subtotal = 0,
      discount = 0,
      gstAmount = 0

    leadData.items.forEach(order => {
      order.item_ref.forEach(p => {
        const itemQty = p.quantity || 0
        const unitPrice = p.unitPrice || 0
        const itemSubtotal = itemQty * unitPrice
        const itemDiscount = p.discountType === 'Flat %' ? (itemSubtotal * (p.discount || 0)) / 100 : p.discount || 0
        const itemGst = ((itemSubtotal - itemDiscount) * (p.itemMasterRef?.gst || 0)) / 100

        qty += itemQty
        subtotal += itemSubtotal
        discount += itemDiscount
        gstAmount += itemGst
      })
    })

    const total = subtotal - discount + gstAmount

    return { qty, subtotal, discount, gstAmount, total }
  }, [leadData])

  const confirmDeleteProduct = productId => {
    setDeleteProductId(productId)
    setOpenDeleteModal(true)
  }

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return
    try {
      setLoader(true)
      await fetch(`/api/v1/admin/lead-form/${leadId}/products/${deleteProductId}`, { method: 'DELETE' })
      fetchLeadFromId()
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setLoader(false)
      setOpenDeleteModal(false)
      setDeleteProductId(null)
    }
  }

  // 🔹 Order-specific bulk edit
  const handleOpenBulkEdit = order => {
    console.log(order, '<<< orderrrrr')
    setEditingOrder(order)
    setOpenBulkEdit(true)
  }

  // 🔹 Order Delete Function
  const handleDeleteOrder = async itemId => {
    console.log(itemId, '<<< order idddd')

    if (!itemId) return

    try {
      setLoader(true)
      // Call DELETE API for the whole order
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}/orders/${itemId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message, {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        fetchLeadFromId() // Refresh lead data
      } else {
        toast.error(data.message, {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
        console.error('Delete failed:', data.message)
      }
    } catch (err) {
      console.error('Delete failed', err)
    } finally {
      setLoader(false)
    }
  }
  const handleCloseBulkEdit = () => {
    setEditingOrder(null)
    setOpenBulkEdit(false)
  }

  return (
    <Box>
      <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: '#009cde', '&:hover': { bgcolor: '#007bb5' }, borderRadius: 1, textTransform: 'none' }}
        >
          + Add Items
        </Button>
      </Box>

      {leadData?.items?.length > 0 ? (
        leadData.items.map(order => {
          // 🔹 Calculate summary per order
          let qty = 0,
            subtotal = 0,
            discount = 0,
            gstAmount = 0

          order.item_ref.forEach(p => {
            const itemQty = p.quantity || 0
            const unitPrice = p.unitPrice || 0
            const itemSubtotal = itemQty * unitPrice
            const itemDiscount =
              p.discountType === 'Flat %' ? (itemSubtotal * (p.discount || 0)) / 100 : p.discount || 0
            const itemGst = ((itemSubtotal - itemDiscount) * (p.itemMasterRef?.gst || 0)) / 100

            qty += itemQty
            subtotal += itemSubtotal
            discount += itemDiscount
            gstAmount += itemGst
          })

          const total = subtotal - discount + gstAmount

          return (
            <Paper
              key={order._id}
              sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid #e0e0e0', overflowX: 'auto' }}
            >
              <Box display='flex' justifyContent='space-between'>
                <Typography variant='subtitle1' fontWeight={700} mb={1}>
                  Item ID: {order.item_id}
                </Typography>
                <Box display={'flex'} justifyContent={'space-between'} gap={2}>
                  <Button variant='contained' color='success' size='small' onClick={() => handleOpenBulkEdit(order)}>
                    Edit Items
                  </Button>

                  <Button
                    variant='contained'
                    color='error'
                    size='small'
                    onClick={() => handleDeleteOrder(order.item_id)}
                  >
                    Delete Items
                  </Button>
                </Box>
              </Box>

              {/* Items Table */}
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    {[
                      'Item Code',
                      'Item Name',
                      'Item Type',
                      'Qty',
                      'UOM',
                      'Unit Price',
                      'Discount',
                      'GST',
                      'Final Price'
                    ].map(head => (
                      <TableCell
                        key={head}
                        sx={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', color: '#555' }}
                        align={['Qty', 'Unit Price', 'Discount', 'Final Price'].includes(head) ? 'right' : 'left'}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.item_ref.map((p, idx) => (
                    <TableRow key={p._id || idx}>
                      <TableCell sx={{ py: 2, fontSize: 13 }}>{p.item_id}</TableCell>
                      <TableCell sx={{ py: 2, fontSize: 13 }}>{p.itemMasterRef?.item_name || '—'}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip label={p.itemMasterRef?.item_type || '—'} size='small' />
                      </TableCell>
                      <TableCell align='center' sx={{ py: 2, fontSize: 13 }}>
                        {p.quantity}
                      </TableCell>
                      <TableCell align='center' sx={{ py: 2, fontSize: 13 }}>
                        {p.itemMasterRef?.uom || '—'}
                      </TableCell>
                      <TableCell align='right' sx={{ py: 2, fontSize: 13 }}>
                        {formatCurrency(p.unitPrice)}
                      </TableCell>
                      <TableCell align='right' sx={{ py: 2, fontSize: 13 }}>
                        {p.discountType === 'Flat Amount' ? `₹${p.discount}` : `${p.discount || 0}%`}
                      </TableCell>
                      <TableCell align='center' sx={{ py: 2, fontSize: 13 }}>
                        {`${p.itemMasterRef?.gst || 0}%`}
                      </TableCell>
                      <TableCell align='right' sx={{ py: 2, fontSize: 13, fontWeight: 600, color: '#4caf50' }}>
                        {formatCurrency(p.finalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 🔹 Per Order Summary */}

              <Box mt={2} textAlign='right'>
                <Divider sx={{ mb: 1 }} />
                <Typography variant='body2' sx={{ fontSize: 13 }}>
                  Total Qty: <strong>{qty}</strong>
                </Typography>
                <Typography variant='body2' sx={{ fontSize: 13 }}>
                  Subtotal: <strong>{formatCurrency(subtotal)}</strong>
                </Typography>
                <Typography variant='body2' color='error' sx={{ fontSize: 13 }}>
                  Discount: -{formatCurrency(discount)}
                </Typography>
                <Typography variant='body2' sx={{ fontSize: 13 }}>
                  GST: <strong>{formatCurrency(gstAmount)}</strong>
                </Typography>
                <Typography variant='body2' sx={{ fontSize: 13 }}> ---------------------------------</Typography>
                <Typography variant='subtitle1' fontWeight={700} color='#4caf50'>
                  Grand Total: {formatCurrency(total)}
                </Typography>
                <Typography variant='body2' sx={{ fontSize: 13 }}> ---------------------------------</Typography>
              </Box>
            </Paper>
          )
        })
      ) : (
        <Typography align='center'>🚫 No items added yet</Typography>
      )}

      <ProductSelectorDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        leadId={leadId}
        fetchLeadFromId={fetchLeadFromId}
        itemsData={itemsData}
      />

      <ProductBulkEditDialog
        open={openBulkEdit}
        onClose={handleCloseBulkEdit}
        leadId={leadId}
        itemId={editingOrder?.item_id}
        products={editingOrder?.item_ref || []}
        fetchLeadFromId={fetchLeadFromId}
        itemsData={itemsData}
      />

      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button disabled={loader} onClick={handleDeleteProduct} color='error' variant='contained'>
            {loader ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ProductPage
