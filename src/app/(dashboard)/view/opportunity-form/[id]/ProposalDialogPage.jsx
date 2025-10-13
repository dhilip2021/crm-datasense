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
  TextField
} from '@mui/material'
import Cookies from 'js-cookie'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const ProposalDialogPage = ({ open, onClose, leadData, handleQtyChange, dataItems }) => {


  console.log(leadData,"<<< leadDataaaaaaaaaa")
  console.log(dataItems,"<<< itemsssssssssssssss")

  const organization_name = Cookies.get('organization_name')
  const user_name = Cookies.get('user_name')
  const email = Cookies.get('email')

  const [notes, setNotes] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])

  // const grandTotal = items?.reduce((acc, i) => acc + i.finalPrice, 0)
  const grandTotal = Array.isArray(dataItems) ? dataItems.reduce((acc, i) => acc + (i.finalPrice || 0), 0) : 0

  const handleFileUpload = e => {
    const files = Array.from(e.target.files)
    setUploadedFiles([...uploadedFiles, ...files])
  }

  const handleSend = () => {
    console.log('Send quotation to customer', { dataItems, notes, uploadedFiles })
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
    doc.text('Phone: +91 XXXXX XXXXX', margin, 80)
    doc.text(`Email: ${email} | Website: www.datasense.in`, margin, 95)

    // Date & Quotation No
    doc.setFont('helvetica', 'bold')
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, 50)
    doc.text(`Quotation No: QTN-001`, 400, 65)

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

    // Subject
    doc.setFont('helvetica', 'bold')
    doc.text(`Subject: Quotation for ${leadData.items[0]?.item_ref[0]?.itemMasterRef.item_name}`, margin, y)
    y += lineHeight * 2

    // Greeting
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
      `${item.unitPrice}`,
      `${item.finalPrice}`
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

    const finalY = doc.lastAutoTable.finalY + lineHeight

    // Subtotal, GST, Total
    const subtotal = grandTotal
    const gst = Math.round(subtotal * 0.18)
    const totalAmount = subtotal + gst

    doc.setFont('helvetica', 'bold')
    doc.text(`Subtotal:  ${subtotal}`, margin + 350, finalY)
    doc.text(`GST (18%):  ${gst}`, margin + 350, finalY + lineHeight)
    doc.text(`Total Amount:  ${totalAmount}`, margin + 350, finalY + lineHeight * 2)

    // Terms & Conditions
    const termsY = finalY + lineHeight * 5
    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions:', margin, termsY)
    doc.setFont('helvetica', 'normal')
    doc.text('Payment Terms: 50% advance, 50% on delivery.', margin, termsY + lineHeight)
    doc.text('Delivery Timeline: Within 15 days from order confirmation.', margin, termsY + lineHeight * 2)
    doc.text('Validity: This quotation is valid for 30 days.', margin, termsY + lineHeight * 3)

    // Closing
    const closingY = termsY + lineHeight * 6
    doc.text(
      'We look forward to doing business with you. Please feel free to contact us for any clarifications.',
      margin,
      closingY
    )
    doc.text('Best Regards,', margin, closingY + lineHeight * 2)
    doc.text(user_name, margin, closingY + lineHeight * 3)
    doc.text('CEO', margin, closingY + lineHeight * 4)
    doc.text(organization_name, margin, closingY + lineHeight * 5)

    doc.save(`Quotation_${leadData.values['Deal Name']}.pdf`)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Send Proposal / Quotation</DialogTitle>
      <DialogContent sx={{ mt: 1.5 }}>
        <Box p={4}>
          {/* Page Header */}
          <Box display='flex' justifyContent='space-between' mb={3} flexWrap='wrap'>
            <Typography variant='h4' fontWeight='bold'>
              Proposal / Quotation
            </Typography>
            <Button variant='contained' color='primary' sx={{ mt: { xs: 2, sm: 0 } }}>
              + New Quotation
            </Button>
          </Box>

          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold'>
                Customer Info
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mt={2} justifyContent='space-between'>
                <Box>
                  <Typography>
                    <b>Name:</b> {leadData.values['First Name']} {leadData.values['Last Name']}
                  </Typography>
                  <Typography>
                    <b>Email:</b> {leadData.values['Email']}
                  </Typography>
                  <Typography>
                    <b>Phone:</b> {leadData.values['Phone']}
                  </Typography>
                </Box>
                <Box>
                  <Typography>
                    <b>Company:</b> {leadData.values['Company']}
                  </Typography>
                  <Typography>
                    <b>Lead Status:</b> {leadData.values['Lead Status']}
                  </Typography>
                  <Typography>
                    <b>Lead Source:</b> {leadData.values['Lead Source']}
                  </Typography>
                  <Typography>
                    <b>Next Follow-up:</b> {leadData.values['Next Follow-up Date']}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold'>
                Deal Info
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} mt={2} justifyContent='space-between'>
                {/* Left Column */}
                <Box>
                  <Typography>
                    <b>Deal Name:</b> {leadData.values['Deal Name']}
                  </Typography>
                  <Typography>
                    <b>Expected Revenue:</b> {leadData.values['Expected Revenue']}
                  </Typography>
                  <Typography>
                    <b>Closing Date:</b> {leadData.values['Closing Date']}
                  </Typography>
                </Box>

                {/* Right Column */}
                <Box>
                  <Typography>
                    <b>Industry:</b> {leadData.values['Industry']}
                  </Typography>
                  <Typography>
                    <b>Company Size:</b> {leadData.values['Company Size']}
                  </Typography>
                  <Typography>
                    <b>Timeline to Buy:</b> {leadData.values['Timeline to Buy']}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Quotation Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={2}>
                Quotation Items
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Unit Price</TableCell>
                    <TableCell>Final Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(dataItems) && dataItems.length > 0 ? (
                    dataItems.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item?.itemMasterRef?.item_name || '-'}</TableCell>
                        <TableCell>{item?.itemMasterRef?.description || '-'}</TableCell>
                        <TableCell>
                          <TextField
                            type='number'
                            value={item?.quantity || 0}
                            onChange={e => handleQtyChange(idx, e.target.value)}
                            size='small'
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell>{item?.unitPrice || 0}</TableCell>
                        <TableCell>{item?.finalPrice || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align='center'>
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={4} align='right'>
                      <b>Grand Total:</b>
                    </TableCell>
                    <TableCell>
                      <b>{grandTotal}</b>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Attach Documents */}
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
                  <Chip
                    key={i}
                    label={file.name}
                    onDelete={() => setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i))}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Notes / Terms */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' fontWeight='bold' mb={1}>
                Notes / Terms & Conditions
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder='Add notes or terms here...'
              />
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', gap: 2, pb: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Close
        </Button>
        <Box>
          <Button variant='contained' color='primary' onClick={handleSend}>
            Send to Customer
          </Button>
          <Button variant='contained' color='secondary' onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default ProposalDialogPage
