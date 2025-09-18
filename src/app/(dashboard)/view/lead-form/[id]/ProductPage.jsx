'use client'

import React, { useState } from 'react'
import { Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Typography, Paper, Card } from '@mui/material'
import ProductSelectorDialog from './ProductSelectorDialog'

function ProductPage({ leadId, leadData, fetchLeadFromId }) {
  const [openDialog, setOpenDialog] = useState(false)

  return (
    <Box mt={8}>
         <Card sx={{ p: 2, bgcolor: '#ffffff', mt:"5" }}>
      
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
        <Typography variant='h6'>Products</Typography>
        <Button variant='contained' onClick={() => setOpenDialog(true)}>
          + Add Products
        </Button>
      </Box>

      {/* ✅ Product Table */}
      <Paper sx={{ overflow: 'auto' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align='center'>Qty</TableCell>
              <TableCell align='right'>Unit Price</TableCell>
              <TableCell align='right'>Discount (%)</TableCell>
              <TableCell align='right'>Final Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leadData?.products?.length > 0 ? (
              leadData.products.map((p, idx) => (
                <TableRow key={p._id || idx}>
                  <TableCell>{p.productRef?.code || p.product_id}</TableCell>
                  <TableCell>{p.productRef?.name || '—'}</TableCell>
                  <TableCell>{p.productRef?.category || '—'}</TableCell>
                  <TableCell align='center'>{p.quantity}</TableCell>
                  <TableCell align='right'>₹{p.unitPrice}</TableCell>
                  <TableCell align='right'>{p.discount}%</TableCell>
                  <TableCell align='right'>₹{p.finalPrice}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align='center'>
                  <Typography variant='body2' color='text.secondary'>
                    No products added yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 🔹 Product Selector Dialog */}
      <ProductSelectorDialog open={openDialog} onClose={() => setOpenDialog(false)} leadId={leadId} fetchLeadFromId={fetchLeadFromId} />
    
    </Card>
    </Box>
   
    
  )
}

export default ProductPage
