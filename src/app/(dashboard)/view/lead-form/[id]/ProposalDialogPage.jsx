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

const ProposalDialogPage = ({ open, onClose, leadData, handleQtyChange, dataItems }) => {
  const quoNumber = dataItems[0]?.quotationNumber
  const getToken = Cookies.get('_token')
  const organization_name = Cookies.get('organization_name')
  const user_name = Cookies.get('user_name')
  const email = Cookies.get('email')
  const mobile = Cookies.get('mobile')

  const calculateItemTotals = item => {
    const qty = Number(item?.quantity || 0)
    const price = Number(item?.unitPrice || 0)
    const discount = Number(item?.discount || 0) // %
    const gst = Number(item?.itemMasterRef?.gst || 0) // Correct source!

    const subtotal = qty * price
    const discountAmount = (subtotal * discount) / 100
    const taxableAmount = subtotal - discountAmount
    const gstAmount = (taxableAmount * gst) / 100
    const finalPrice = taxableAmount + gstAmount

    return { subtotal, discountAmount, gstAmount, finalPrice }
  }

  const totals = Array.isArray(dataItems)
    ? dataItems.reduce(
        (acc, item) => {
          const { subtotal, discountAmount, gstAmount, finalPrice } = calculateItemTotals(item)
          acc.subtotal += subtotal
          acc.discountAmount += discountAmount
          acc.gstAmount += gstAmount
          acc.finalPrice += finalPrice
          return acc
        },
        { subtotal: 0, discountAmount: 0, gstAmount: 0, finalPrice: 0 }
      )
    : { subtotal: 0, discountAmount: 0, gstAmount: 0, finalPrice: 0 }

  const [notes, setNotes] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  // const grandTotal = items?.reduce((acc, i) => acc + i.finalPrice, 0)
  const grandTotal = Array.isArray(dataItems) ? dataItems.reduce((acc, i) => acc + (i.finalPrice || 0), 0) : 0

  const handleFileUpload = e => {
    const files = Array.from(e.target.files)
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const handleSend = async () => {
    const leadId = leadData?.lead_id

    if (!leadData.values['Email']) {
      alert('Customer email not found!')
      return
    }

    // Prepare Quotation Table HTML
    const itemsHtml = dataItems
      .map(
        (item, idx) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${idx + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.itemMasterRef.item_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">₹${item.unitPrice.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align:right;">₹${item.finalPrice.toFixed(2)}</td>
    </tr>`
      )
      .join('')
    const formattedNotes = notes ? notes.replace(/\n/g, '<br>') : ''
    const quoData = {
      from: '"Lumivo CRM Datasense" <no-reply@datasense.in>', // sender address
      to: leadData.values['Email'], // customer email
      subject: `Quotation for ${leadData.values['Lead Name']} - ${organization_name}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; padding:20px; background:#f9fafc;">
        <h2 style="text-align:center; color:#1976d2; margin-bottom:10px;">${organization_name}</h2>
        <h3 style="text-align:center; color:#d1d1d1; margin-bottom:20px;">Quotation No: ${quoNumber}</h3>
        <p>Dear <b>${leadData.values['First Name']} ${leadData.values['Last Name']}</b>,</p>
        <p>We are pleased to share our quotation for your requirement <b>${leadData.values['Lead Name']}</b>. Please find the details below:</p>
        
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <thead>
            <tr style="background:#2980b9; color:#fff;">
              <th style="padding:8px; border:1px solid #ddd;">#</th>
              <th style="padding:8px; border:1px solid #ddd;">Item</th>
              <th style="padding:8px; border:1px solid #ddd;">Qty</th>
              <th style="padding:8px; border:1px solid #ddd;">Unit Price</th>
              <th style="padding:8px; border:1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <p style="margin-top:15px; text-align:right;">
          <b>Subtotal:</b> ₹${totals.subtotal.toFixed(2)}<br>
          <b>Discount:</b> -₹${totals.discountAmount.toFixed(2)}<br>
          <b>GST:</b> ₹${totals.gstAmount.toFixed(2)}<br>
          <b>Total Amount:</b> ₹${totals.finalPrice.toFixed(2)}
        </p>


       ${
         formattedNotes
           ? `<p style="margin-top:15px; line-height:1.6;"><b>Terms & Conditions:</b><br>${formattedNotes}</p>`
           : ''
       }

        <p style="margin-top:20px;">We look forward to doing business with you. Please feel free to contact us for any clarifications.</p>

        <p style="margin-top:20px;">Best Regards,<br>
          <b>${user_name}</b><br>
          CEO, ${organization_name}
        </p>
      </div>
    `
    }

    try {
      const quoPayload = {
        quotation_id: quoNumber,
        quotation_data: quoData, // use trimmed value
        // createdAt: editingNote ? editingNote.createdAt : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: user_name
        // _id: editingNote?._id
      }

      // setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify({
          values: { Quotation: [quoPayload] },
          lead_touch: 'touch'
        })
      })

      const result = await res.json()
      console.log(result)

      onClose();

      // setLoader(false)

      if (result.success) {
        toast.success('Quotation updated successfully', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      } else {
        toast.error(result.error || 'Error saving note', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (err) {
      toast.error('Error while saving note', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4')
    const margin = 40
    const lineHeight = 14

    // Header: Company Info
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(organization_name, margin, 50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Address Line 1, Address Line 2', margin, 65)
    doc.text(`Phone: ${mobile}`, margin, 80)
    doc.text(`Email: ${email} | Website: www.datasense.in`, margin, 95)

    // Date & Quotation No
    doc.setFont('helvetica', 'bold')
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 380, 50)
    doc.text(`Quotation No: ${quoNumber}`, 380, 65)

    let y = 120

    // Client Info
    doc.setFont('helvetica', 'bold')
    doc.text('To:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${leadData.values['First Name']} ${leadData.values['Last Name']}`, margin, y + lineHeight)
    doc.text(`${leadData.values['Company']}`, margin, y + lineHeight * 2)
    doc.text(
      `${leadData.values['Street']}, ${leadData.values['City']}, ${leadData.values['State']} - ${leadData.values['Pincode']}, ${leadData.values['Country']}`,
      margin,
      y + lineHeight * 3
    )

    y += lineHeight * 5

    // Subject & Greeting
    doc.setFont('helvetica', 'bold')
    doc.text(`Subject: Quotation for ${leadData.items[0]?.item_ref[0]?.itemMasterRef.item_name}`, margin, y)
    y += lineHeight * 2
    doc.setFont('helvetica', 'normal')
    doc.text(`Dear ${leadData.values['First Name']},`, margin, y)
    y += lineHeight * 2
    doc.text(`We are pleased to submit our quotation for your requirements as below:`, margin, y)
    y += lineHeight * 2

    // Quotation Items Table
    const tableColumn = ['Item', 'Description', 'Qty', 'Unit Price', 'Total']
    const tableRows = dataItems.map((item, index) => [
      index + 1,
      item.itemMasterRef.item_name,
      item.quantity,
      `${item.unitPrice.toFixed(2)}`,
      `${item.finalPrice.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin }
    })

    let finalY = doc.lastAutoTable.finalY + lineHeight

    // Totals Section
    const subtotal = totals.subtotal
    const gst = totals.gstAmount
    const totalAmount = totals.finalPrice
    const xPos = margin + 480

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)

    doc.text(`Subtotal: ${subtotal.toFixed(2)}`, xPos, finalY, { align: 'right' })
    doc.text(`Discount: -${totals.discountAmount.toFixed(2)}`, xPos, finalY + lineHeight, { align: 'right' })
    doc.text(`GST: ${gst.toFixed(2)}`, xPos, finalY + lineHeight * 2, { align: 'right' })
    doc.text(`Total Amount: ${totalAmount.toFixed(2)}`, xPos, finalY + lineHeight * 3, { align: 'right' })

    const termsY = finalY + lineHeight * 5
    if (notes && notes.trim() !== '') {
      // Terms & Conditions
      doc.setFont('helvetica', 'bold')
      doc.text('Terms & Conditions:', margin, termsY)
      doc.setFont('helvetica', 'normal')
      // doc.text(notes, margin, termsY + lineHeight)

      const noteLines = doc.splitTextToSize(notes, 500) // wrap long notes
      noteLines.forEach((line, i) => {
        doc.text(line, margin, termsY + lineHeight * (i + 1))
      })
    }
    // Closing
    const closingY = termsY + lineHeight * 6
    doc.setFont('helvetica', 'normal')
    doc.text(
      'We look forward to doing business with you. Please feel free to contact us for any clarifications.',
      margin,
      closingY
    )
    doc.text('Best Regards,', margin, closingY + lineHeight * 2)
    doc.text(user_name, margin, closingY + lineHeight * 3)
    doc.text('CEO', margin, closingY + lineHeight * 4)
    doc.text(organization_name, margin, closingY + lineHeight * 5)
    doc.save(`Quotation_${leadData.values['Lead Name']}.pdf`)
  }

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
                Valid for 30 days
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
                    <b>Lead Name:</b> {leadData.values['Lead Name']}
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
                    {['Item', 'Description', 'Qty', 'Unit Price', 'Total'].map((label, index) => (
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
                          <TableCell>{item?.itemMasterRef?.item_name || '-'}</TableCell>
                          <TableCell>{item?.itemMasterRef?.description || '-'}</TableCell>
                          <TableCell align='right'>{item.quantity}</TableCell>
                          <TableCell align='right'>₹{item.unitPrice.toFixed(2)}</TableCell>
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
                    <TableCell colSpan={4} align='right'>
                      <b>Subtotal:</b>
                    </TableCell>
                    <TableCell align='right'>
                      <b>₹{totals.subtotal.toFixed(2)}</b>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={4} align='right'>
                      <b>Discount:</b>
                    </TableCell>
                    <TableCell align='right' sx={{ color: 'error.main' }}>
                      - ₹{totals.discountAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={4} align='right'>
                      <b>GST (18%):</b>
                    </TableCell>
                    <TableCell align='right'>₹{totals.gstAmount.toFixed(2)}</TableCell>
                  </TableRow>

                  <TableRow sx={{ backgroundColor: '#e9f7ef' }}>
                    <TableCell colSpan={4} align='right'>
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
                {uploadedFiles.map((file, i) => (
                  <Chip key={i} label={file.name} onDelete={() => removeFile(i)} />
                ))}
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

export default ProposalDialogPage
