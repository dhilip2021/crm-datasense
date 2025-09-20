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

function ProductPage({ leadId, leadData, fetchLeadFromId }) {
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loader, setLoader] = useState(false)

  // ✅ Delete confirmation modal state
  const [deleteProductId, setDeleteProductId] = useState(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  // ✅ Calculate summary
  const summary = useMemo(() => {
    if (!leadData?.products?.length) return { qty: 0, subtotal: 0, discount: 0, total: 0 }

    const qty = leadData.products.reduce((acc, p) => acc + (p.quantity || 0), 0)
    const subtotal = leadData.products.reduce((acc, p) => acc + p.unitPrice * p.quantity, 0)
    const discount = leadData.products.reduce((acc, p) => acc + (p.unitPrice * p.quantity * (p.discount || 0)) / 100, 0)
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
    <Box mt={6}>
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          bgcolor: '#fff'
        }}
      >
        {/* 🔹 Header */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Box display='flex' alignItems='center' gap={1.5}>
            <ShoppingBagOutlinedIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
            <Typography variant='h6' fontWeight={700}>
              Products
            </Typography>
          </Box>

          <Button
            variant='contained'
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: '#9c27b0',
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1.2,
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 3px 6px rgba(0,0,0,0.15)',
              '&:hover': { backgroundColor: '#7b1fa2' }
            }}
          >
            + Add Products
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

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
                {['Code', 'Name', 'Category', 'Qty', 'Unit Price', 'Discount', 'Final Price', 'Actions'].map(head => (
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
              {leadData?.products?.length > 0 ? (
                leadData.products.map((p, idx) => (
                  <TableRow
                    key={p._id || idx}
                    hover
                    sx={{
                      '&:nth-of-type(odd)': { bgcolor: '#fcfcfc' },
                      '&:hover': { bgcolor: '#f9f5ff' }
                    }}
                  >
                    <TableCell sx={{ py: 2, fontSize: 13 }}>{p.productRef?.code || p.product_id}</TableCell>
                    <TableCell sx={{ py: 2, fontSize: 13 }}>{p.productRef?.name || '—'}</TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={p.productRef?.category || '—'}
                        size='small'
                        sx={{
                          bgcolor:
                            p.productRef?.category === 'Service'
                              ? '#fff3e0'
                              : p.productRef?.category === 'Subscription'
                                ? '#e3f2fd'
                                : '#f3e5f5',
                          color: '#333',
                          fontWeight: 500,
                          px: 1.5,
                          py: 0.5
                        }}
                      />
                    </TableCell>
                    <TableCell align='center' sx={{ py: 2, fontSize: 13 }}>
                      {p.quantity}
                    </TableCell>
                    <TableCell align='right' sx={{ py: 2, fontSize: 13 }}>
                      {formatCurrency(p.unitPrice)}
                    </TableCell>
                    <TableCell align='right' sx={{ py: 2, fontSize: 13 }}>
                      <Chip
                        label={p.discountType === 'Flat Amount' ? `₹${p.discount}` : `${p.discount || 0}%`}
                        size='small'
                        sx={{
                          bgcolor:
                            p.discountType === 'Flat %'
                              ? p.discount > 0
                                ? '#e8f5e9' // greenish for percentage discount
                                : '#eeeeee'
                              : p.discountType === 'Flat Amount'
                                ? p.discount > 0
                                  ? '#fff3e0' // orangish for flat amount discount
                                  : '#eeeeee'
                                : '#eeeeee',
                          color:
                            p.discountType === 'Flat %'
                              ? p.discount > 0
                                ? '#2e7d32'
                                : '#616161'
                              : p.discountType === 'Flat Amount'
                                ? p.discount > 0
                                  ? '#ef6c00'
                                  : '#616161'
                                : '#616161',
                          fontWeight: 500,
                          px: 1.2
                        }}
                      />
                    </TableCell>
                    <TableCell align='right' sx={{ py: 2, fontSize: 13, fontWeight: 600, color: '#4caf50' }}>
                      {formatCurrency(p.finalPrice)}
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        size='small'
                        sx={{ textTransform: 'none', color: '#1976d2', mr: 1 }}
                        onClick={() => setEditingProduct(p)}
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
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align='center'>
                    <Box py={8}>
                      <Typography variant='body1' fontWeight={500} color='text.secondary' mb={1}>
                        🚫 No products added yet
                      </Typography>
                      <Button
                        onClick={() => setOpenDialog(true)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          color: '#9c27b0'
                        }}
                      >
                        + Add your first product
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* 🔹 Footer Summary */}
        {leadData?.products?.length > 0 && (
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
        />

        {/* 🔹 Edit Product Dialog */}
        <EditProductDialog
          open={!!editingProduct}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
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
            <Button disabled={loader}  onClick={handleDeleteProduct} color='error' variant='contained'>
              {loader  ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  )
}

export default ProductPage
