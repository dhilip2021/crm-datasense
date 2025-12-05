import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import React from 'react'

function ProductList({ leadData, handleDeleteOrder, handleOpenBulkEdit, dealFnCall, formatCurrency }) {
  return (
    <>
      {leadData?.items?.map(order => {
        let qty = 0,
          subtotal = 0,
          discount = 0,
          gstAmount = 0

        order.item_ref
          .filter(p => p.itemMasterRef?.item_type === 'Product')
          .forEach(p => {
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
          <>
            {order.item_ref.some(p => p?.itemMasterRef?.item_type === 'Product') && (
              <Paper
                key={order._id}
                sx={{ mb: 3, p: 2, borderRadius: 2, border: '1px solid #e0e0e0', overflowX: 'auto' }}
              >
                {/* 🔹 Header Section */}
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='subtitle1' fontWeight={700} mb={1}>
                    Product Item ID: {order.item_id}
                  </Typography>
                  <Box display='flex' gap={2}>
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

                {/* 🔹 Items Table */}
                <Table size='small'>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      {[
                        'Product Name',
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
                        <TableCell sx={{ py: 2, fontSize: 13 }}>{p.itemMasterRef?.product_name || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={p.itemMasterRef?.item_type || '—'}
                            size='small'
                            color={p.itemMasterRef?.item_type === 'Service' ? 'warning' : 'info'}
                          />
                        </TableCell>
                        <TableCell align='center'>{p.quantity}</TableCell>
                        <TableCell align='center'>{p.itemMasterRef?.uom || '—'}</TableCell>
                        <TableCell align='right'>{formatCurrency(p.unitPrice)}</TableCell>
                        <TableCell align='right'>
                          {p.discountType === 'Flat Amount' ? `₹${p.discount}` : `${p.discount || 0}%`}
                        </TableCell>
                        <TableCell align='center'>{`${p.itemMasterRef?.gst || 0}%`}</TableCell>
                        <TableCell align='right' sx={{ fontWeight: 600, color: '#4caf50' }}>
                          {formatCurrency(p.finalPrice)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 🔹 Summary */}
                <Box mt={2} textAlign='right'>
                  <Divider sx={{ mb: 1 }} />
                  <Typography variant='body2'>
                    Total Qty: <strong>{qty}</strong>
                  </Typography>
                  <Typography variant='body2'>
                    Subtotal: <strong>{formatCurrency(subtotal)}</strong>
                  </Typography>
                  <Typography variant='body2' color='error'>
                    Discount: -{formatCurrency(discount)}
                  </Typography>
                  <Typography variant='body2'>
                    GST: <strong>{formatCurrency(gstAmount)}</strong>
                  </Typography>
                  <Typography variant='subtitle1' fontWeight={700} color='#4caf50'>
                    Grand Total: {formatCurrency(total)}
                  </Typography>
                </Box>

                {/* 🔹 Confirm Button */}
                <Box textAlign='right' mt={2}>
                  <Chip
                    onClick={() => dealFnCall(order.item_id)}
                    label='Product Quotation'
                    color='primary'
                    variant='filled'
                    sx={{
                      cursor: 'pointer',
                      fontSize: '1rem',
                      px: 5,
                      py: 3,
                      borderRadius: '12px',
                      '&:hover': {
                        backgroundColor: '#f3f4f6',
                        color: '#009cde',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                </Box>
              </Paper>
            )}
          </>
        )
      })}
    </>
  )
}

export default ProductList
