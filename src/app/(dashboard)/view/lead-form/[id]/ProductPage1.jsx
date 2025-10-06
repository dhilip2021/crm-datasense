'use client'

import React, { useState, useMemo, useEffect } from 'react'
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
  Card,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined'
import ProductSelectorDialog from './ProductSelectorDialog'
import EditProductDialog from './EditProductDialog'

// ✅ Utility for currency
const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

function ProductPage({ leadId, leadData, fetchLeadFromId, itemsData }) {

console.log(leadData,"<<< Lead Data")

  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loader, setLoader] = useState(false)

  // ✅ Delete confirmation modal state
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

// ✅ Calculate summary
const summary = useMemo(() => {
  if (!leadData?.items?.length) return { qty: 0, subtotal: 0, discount: 0, total: 0 }

  let qty = 0
  let subtotal = 0
  let discount = 0

  leadData.items.forEach(order => {
    order.item_ref.forEach(p => {
      qty += p.quantity || 0
      subtotal += (p.unitPrice || 0) * (p.quantity || 0)
      discount += (p.unitPrice || 0) * (p.quantity || 0) * ((p.discount || 0) / 100)
    })
  })

  const total = subtotal - discount
  return { qty, subtotal, discount, total }
}, [leadData])

  // 🔹 Trigger delete confirmation
  const confirmDeleteProduct = productId => {
    setDeleteProductId(productId)
    setOpenDeleteModal(true)
  }

  // 🔹 Actual delete
  const handleDeleteProduct = async () => {
    if (!deleteProductId) return
    try {
      setLoader(true)
      await fetch(`/api/v1/admin/lead-form/${leadId}/products/${deleteProductId}`, { method: 'DELETE' })
      setLoader(false)
      fetchLeadFromId()
    } catch (err) {
      setLoader(false)
      console.error('Delete failed', err)
    } finally {
      setLoader(false)
      setOpenDeleteModal(false)
      setDeleteProductId(null)
    }
  }

  return (
    <Box>
      <Box display='flex' justifyContent='flex-end' mb={2}>
        <Button
          variant='contained'
          onClick={() => setOpenDialog(true)}
          sx={{
            bgcolor: '#009cde',
            size: 'small',
            '&:hover': { bgcolor: '#007bb5' },
            borderRadius: '8px',
            textTransform: 'none'
          }}
        >
          + Add Items
        </Button>
      </Box>

      {/* ✅ Product Table */}
      <Paper
        sx={{
          overflow: 'auto',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          maxHeight: 450
        }}
      >
        <Table stickyHeader size='small'>
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
                'Final Price',
                'Actions'
              ].map(head => (
                <TableCell
                  key={head}
                  sx={{
                    fontWeight: 700,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    color: '#555'
                  }}
                  align={['Qty', 'Unit Price', 'Discount', 'Final Price'].includes(head) ? 'right' : 'left'}
                >
                  {head}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {leadData?.items?.length > 0 ? (
              leadData.items.flatMap(order =>
                order.item_ref.map((p, idx) => (
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
                    <TableCell align='right' sx={{ py: 2, fontSize: 13, fontWeight: 600, color: '#4caf50' }}>
                      {formatCurrency(p.finalPrice)}
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        size='small'
                        sx={{ textTransform: 'none', color: '#1976d2', mr: 1 }}
                        onClick={() => setEditingProduct(order)}
                      >
                        Edit
                      </Button>
                      <Button
                        size='small'
                        sx={{ textTransform: 'none', color: '#d32f2f' }}
                        onClick={() => confirmDeleteProduct(p._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  🚫 No items added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 🔹 Footer Summary */}
      {leadData?.items?.length > 0 && (
        <Box mt={3} textAlign='right'>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='body2' sx={{ fontSize: 13 }}>
            Total Qty: <strong>{summary.qty}</strong>
          </Typography>
          <Typography variant='body2' sx={{ fontSize: 13 }}>
            Subtotal: <strong>{formatCurrency(summary.subtotal)}</strong>
          </Typography>
          <Typography variant='body2' color='error' sx={{ fontSize: 13 }}>
            Discount: -{formatCurrency(summary.discount)}
          </Typography>
          <Typography variant='h6' fontWeight={700} color='#4caf50'>
            Grand Total: {formatCurrency(summary.total)}
          </Typography>
        </Box>
      )}

      {/* 🔹 Product Selector Dialog */}
      <ProductSelectorDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        leadId={leadId}
        fetchLeadFromId={fetchLeadFromId}
        itemsData={itemsData}
      />

      {/* 🔹 Edit Product Dialog */}
      <EditProductDialog
        open={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        productRef={editingProduct}
        leadId={leadId}
        fetchLeadFromId={fetchLeadFromId}
      />

      {/* 🔹 Delete Confirmation Modal */}
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
