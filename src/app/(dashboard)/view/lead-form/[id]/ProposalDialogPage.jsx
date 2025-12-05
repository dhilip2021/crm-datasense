'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Table,
  Stack,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Divider,
  Grid
} from '@mui/material'
import Cookies from 'js-cookie'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast, ToastContainer } from 'react-toastify'
import SendIcon from '@mui/icons-material/Send'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'

const ProposalProductDialogPage = ({ 
  open, 
  onClose, 
  leadData, 
  handleQtyChange, 
  dataItems, 
  quoNumber, 
  calculateItemTotals,
  totals,
  notes,
  setNotes,
  handleFileUpload,
  handleSend,
  handleDownloadPDF
}) => {



 

  return (
  
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Send Proposal / Quotation</DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ bgcolor: '#f9f9fb', p: 3, borderRadius: 2 }}>
          {/* HEADER */}
          <Box display='flex' justifyContent='space-between' flexWrap='wrap' mb={3}>
            <Box>
              <Typography variant='h5' fontWeight='bold'>
                Proposal / Quotation
              </Typography>
              <Typography variant='subtitle2' color='text.secondary'>
                Generated on: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
            <Box textAlign='right'>
              <Typography variant='h5' fontWeight='bold' color='primary'>
                {quoNumber}
              </Typography>
              <Typography variant='subtitle2' color='text.secondary'>
                Valid for 7 days
              </Typography>
            </Box>
          </Box>

          {/* CUSTOMER INFO */}
          <Card sx={{ mb: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Typography>
                  <b>Name:</b> {leadData.values['First Name']} {leadData.values['Last Name']}
                </Typography>
                <Typography>
                  <b>Email:</b> {leadData.values['Email']}
                </Typography>
                <Typography>
                  <b>Phone:</b> {leadData.values['Phone']}
                </Typography>
                <Typography>
                  <b>Company:</b> {leadData.values['Company']}
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Lead INFO */}
          <Card sx={{ mb: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' gutterBottom>
                Lead Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <b>Company:</b> {leadData.values['Company']}
                  </Typography>
                  <Typography>
                    <b>Expected Revenue:</b> ₹{leadData.values['Expected Revenue']}
                  </Typography>
                  <Typography>
                    <b>Closing Date:</b> {leadData.values['Closing Date']}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <b>Industry:</b> {leadData.values['Industry']}
                  </Typography>
                  <Typography>
                    <b>Company Size:</b> {leadData.values['Company Size']}
                  </Typography>
                  <Typography>
                    <b>Timeline to Buy:</b> {leadData.values['Timeline to Buy']}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* QUOTATION ITEMS */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={2}>
                Quotation Items
              </Typography>

              <Table size='small'>
                <TableHead sx={{ backgroundColor: '#f0f4ff' }}>
                  <TableRow>
                    {['Item', 'Description', 'Qty', 'Unit Price','Gst', 'Total'].map((label, index) => (
                      <TableCell key={index} align={index > 1 ? 'right' : 'left'}>
                        <b>{label}</b>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dataItems?.length ? (
                    dataItems.map((item, idx) => {
                      const { subtotal } = calculateItemTotals(item)
                      return (
                        <TableRow key={idx} hover>
                          <TableCell>{item?.itemMasterRef?.product_name || '-'}</TableCell>
                          <TableCell>{item?.itemMasterRef?.description || '-'}</TableCell>
                          <TableCell align='right'>{item.quantity}</TableCell>
                          <TableCell align='right'>₹{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell align='right'>{item?.itemMasterRef?.gst} %</TableCell>
                          <TableCell align='right'>
                            <b>₹{subtotal.toFixed(2)}</b>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        No items available
                      </TableCell>
                    </TableRow>
                  )}


                  {/* TOTAL SECTION */}
                  <TableRow>
                    <TableCell colSpan={5} align='right'>
                      <b>Subtotal:</b>
                    </TableCell>
                    <TableCell align='right'>
                      <b>₹{totals.subtotal.toFixed(2)}</b>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={5} align='right'>
                      <b>Discount:</b>
                    </TableCell>
                    <TableCell align='right' sx={{ color: 'error.main' }}>
                      - ₹{totals.discountAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={5} align='right'>
                      <b>GST Amount:</b>
                    </TableCell>
                    <TableCell align='right'>₹{totals.gstAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  <TableRow sx={{ backgroundColor: '#e9f7ef' }}>
                    <TableCell colSpan={5} align='right'>
                      <Typography variant='h6' fontWeight='bold'>
                        Grand Total:
                      </Typography>
                    </TableCell>
                    <TableCell align='right'>
                      <Typography variant='h6' fontWeight='bold' color='success.main'>
                        ₹{totals.finalPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* NOTES */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold'>
                Notes / Terms & Conditions
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='Enter terms, validity, warranty, delivery notes...'
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>

          {/* FILE UPLOAD */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={1}>
                Attach Documents
              </Typography>
              <Button variant='outlined' component='label'>
                Upload Files
                <input hidden type='file' multiple onChange={handleFileUpload} />
              </Button>
              <Stack mt={2} spacing={1}>
                {/* {uploadedFiles.map((file, i) => (
                  <Chip key={i} label={file.name} onDelete={() => removeFile(i)} />
                ))} */}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
        <Box display='flex' gap={1}>
          <Button variant='contained' color='primary' startIcon={<SendIcon />} onClick={handleSend}>
            Send to Customer
          </Button>
          <Button variant='contained' color='secondary' startIcon={<PictureAsPdfIcon />} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ProposalProductDialogPage
