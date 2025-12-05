'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EventIcon from '@mui/icons-material/Event'
import Cookies from 'js-cookie'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { decrypCryptoReq, encryptCryptoRes } from '@/helper/frontendHelper'
import EditableField from './EditableField'
import NotesSection from './NotesSection'
import LeadCard from './LeadCard'
import StatusFiled from './StatusFiled'
import Image from 'next/image'
import LoaderGif from '@assets/gif/loader.gif'
import Link from 'next/link'
// import OpenActivities from './OpenActivities'
// import ProductSelectorDialog from './ProductSelectorDialog'
import ProductPage from './ProductPage'
import TaskTabs from './TaskTabs'
import { getHierarchyUserListApi, getTypeItemMasterListApi, getUserAllListApi } from '@/apiFunctions/ApiAction'
import slugify from 'slugify'
import ConvertDealDialog from './ConvertDealDialog'
import ProposalDialogPage from './ProposalDialogPage'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
// import CloseActivities from './closeActivities'

// ✅ Validation rules
const fieldValidators = {
  Email: val => {
    if (!val) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(val)) return 'Invalid email format'
    return null
  },
  // Phone: val => {
  //   if (!val) return 'Phone is required'
  //   if (!/^\d{10}$/.test(val)) return 'Phone must be 10 digits'
  //   return null
  // },

  Phone: val => {
    if (!val) return 'Phone is required'

    // ✅ Accepts:
    // - 8012005747
    // - +918012005747
    // - +447912345678
    // - +971501234567
    // ❌ Rejects:
    // - +91 8012005747 (spaces)
    // - +91-8012005747 (special chars)
    // - alphabets or symbols

    const phoneRegex = /^\+?\d{10,15}$/

    if (!phoneRegex.test(val)) {
      return 'Enter a valid phone number (10–15 digits, optional +country code)'
    }

    return null
  },
  'First Name': val => (!val ? 'First Name is required' : null),
  'Last Name': val => (!val ? 'Last Name is required' : null),
  Company: val => (!val ? 'Company name is required' : null),
  Pincode: val => {
    if (!val) return 'Pincode is required'
    if (!/^\d{5,6}$/.test(val)) return 'Pincode must be 5 or 6 digits'
    return null
  }
}

const generateQuotationNumber = leadData => {
  const date = new Date()
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-4) // last 4 digits
  const leadInc = leadData?.auto_inc_id || '0000'

  return `QTN-${yyyy}${mm}${dd}-${leadInc}-${timestamp}`
}

const LeadDetailView = () => {
  const params = useParams()
  const encryptedId = decodeURIComponent(params.id)

  const getToken = Cookies.get('_token')
  const organization_name = Cookies.get('organization_name')
  const user_name = Cookies.get('user_name')
  const user_id = Cookies.get('user_id')
  const email = Cookies.get('email')
  const mobile = Cookies.get('mobile')
  const organization_id = Cookies.get('organization_id')
  const organization_logo = Cookies.get('organization_logo')
  const organization_address = Cookies.get('organization_address')
  const item_access = Cookies.get('item_access')
  const itemTypes = item_access ? item_access.split(',').map(item => item.trim()) : []

  const leadId = decrypCryptoReq(encryptedId)
  const [expanded, setExpanded] = useState(0) // 0 = first open by default
  const [tabIndex, setTabIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [userList, setUserList] = useState([])
  const [itemList, setItemList] = useState([])
  const [itemType, setItemType] = useState(itemTypes?.length > 0 ? itemTypes[0] : '')

  const lead_form = 'lead-form'
  const opportunity_form = 'opportunities-form'

  const router = useRouter()
  const [loader, setLoader] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leadData, setLeadData] = useState(null)
  const [sections, setSections] = useState([])
  const [sectionsOpportunity, setSectionsOpportunity] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [fieldOpportunityConfig, setFieldOpportunityConfig] = useState({})
  const [itemsData, setItemsData] = useState([])
  const [dealConfirm, setDealConfirm] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [orderId, setOrderId] = useState('')
  // 🧠 leadData = API response object you shared above
  const [accountName, setAccountName] = useState('')
  const [contactName, setContactName] = useState('')
  const [createDeal, setCreateDeal] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [dataItems, setDataItems] = useState([])

  const quoNumber = dataItems[0]?.quotationNumber
  // 🧩 Prefill default values from leadData

  const [dealData, setDealData] = useState({
    amount: '',
    dealName: leadData?.values?.Company || accountName || '',
    closingDate: null,
    stage: leadData?.values?.['Lead Status'] || 'Qualification',
    'Assigned To': user_id
  })

  // 🔹 Flatten helper
  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      Object.values(section.fields).forEach(fieldGroup => {
        fieldGroup.forEach(field => {
          flat.push({
            sectionName: section.title || section.sectionName || '',
            ...field
          })
        })
      })
    })
    return flat
  }

  const handleQtyChange = (index, value) => {
    const newItems = [...items]
    newItems[index].quantity = Number(value)
    newItems[index].finalPrice = newItems[index].quantity * newItems[index].unitPrice
    setDataItems(newItems)
  }

  const handleClose = () => {
    setConfirm(false)
  }

  const handleTabChange = (e, newValue) => {
    setTabIndex(newValue)
    if (newValue === 2) {
      setOpen(true)
    }
  }
  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
      )
      setLoader(false)
      const json = await res.json()
      if (json?.success && json.data?.sections?.length > 0) {
        setSections(json.data.sections)

        const flattened = flattenFields(json.data.sections)
        const config = {}
        flattened.forEach(field => {
          if (field.type === 'Dropdown' && field.options?.length > 0) {
            config[field.label] = field.options
          }
        })
        setFieldConfig(config)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  // 🔹 Fetch template
  const fetchOpportunityFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${opportunity_form}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
      )
      setLoader(false)
      const json = await res.json()
      if (json?.success && json.data?.sections?.length > 0) {
        setSectionsOpportunity(json.data.sections)

        const flattened = flattenFields(json.data.sections)
        const config = {}
        flattened.forEach(field => {
          if (field.type === 'Dropdown' && field.options?.length > 0) {
            config[field.label] = field.options
          }
        })
        setFieldOpportunityConfig(config)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  // Fetch user list
  const getUserListFn = async () => {
    try {
      const results = await getHierarchyUserListApi()
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setUserList(results.payloadJson)
      } else {
        setUserList([])
      }
    } catch (err) {
      console.error('User list error:', err)
      setUserList([])
    }
  }

  // 🔹 Fetch lead data
  const fetchLeadFromId = async () => {
    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        }
      })
      setLoader(false)
      const data = await res.json()
      if (data.success) setLeadData(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }

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
      <td style="padding: 8px; border: 1px solid #ddd;">${item.itemMasterRef.product_name}</td>
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
      subject: `Quotation for ${leadData.values['Company']} - ${organization_name}`,
      html: `
<div style="font-family: Arial, sans-serif; max-width:700px; margin:auto; border:1px solid #e0e0e0; border-radius:10px; padding:20px; background:#f9fafc;">

  <!-- ===== Header with Logo and Company Details ===== -->
  <table style="width:100%; margin-bottom:20px;">
    <tr>
      <td style="width:50%;">
        <img src="${organization_logo}" alt="Company Logo" style="max-width:150px; height:auto;">
      </td>
      <td style="text-align:right; font-size:12px; color:#555;">
        <b>${organization_name}</b><br>
        ${organization_address}<br>
        Phone: ${mobile}<br>
        Email: ${email}<br>
      </td>
    </tr>
  </table>

  <!-- ===== Title ===== -->
  <h2 style="text-align:center; color:#1976d2; margin-bottom:5px;">QUOTATION</h2>
  <p style="text-align:center; color:#888; margin-bottom:20px;">Quotation No: ${quoNumber}</p>

  <!-- ===== Greeting ===== -->
  <p>Dear <b>${leadData.values['First Name']} ${leadData.values['Last Name']}</b>,</p>
  <p>Thank you for your interest in <b>${organization_name}</b>. Please find below the quotation for your requirement from <b>${leadData.values['Company']}</b>:</p>

  <!-- ===== Items Table ===== -->
  <table style="width:100%; border-collapse:collapse; margin-top:10px;">
    <thead>
      <tr style="background:#2980b9; color:#fff;">
        <th style="padding:8px; border:1px solid #ddd;">#</th>
        <th style="padding:8px; border:1px solid #ddd;">Item</th>
        <th style="padding:8px; border:1px solid #ddd; text-align:right;">Qty</th>
        <th style="padding:8px; border:1px solid #ddd; text-align:right;">GST</th>
        <th style="padding:8px; border:1px solid #ddd; text-align:right;">Unit Price</th>
        <th style="padding:8px; border:1px solid #ddd; text-align:right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${dataItems
        .map(
          (item, idx) => `
      <tr>
        <td style="padding:8px; border:1px solid #ddd;">${idx + 1}</td>
        <td style="padding:8px; border:1px solid #ddd;">${item.itemMasterRef.product_name}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">${item.quantity}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">${item.itemMasterRef.gst}%</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">₹${item.unitPrice.toFixed(2)}</td>
        <td style="padding:8px; border:1px solid #ddd; text-align:right;">₹${item.finalPrice.toFixed(2)}</td>
      </tr>`
        )
        .join('')}
    </tbody>
  </table>

 <!-- ===== Total Summary ===== -->
<div style="margin-top:15px; text-align:right; font-size:14px;">
  <b>Subtotal:</b> ₹${totals.subtotal.toFixed(2)}<br>

  ${totals.discountAmount > 0 ? `<b>Discount:</b> -₹${totals.discountAmount.toFixed(2)}<br>` : ''}

  <b>GST:</b> ₹${totals.gstAmount.toFixed(2)}<br>
  <b>Total Amount:</b> <span style="font-size:16px; color:#1976d2;">₹${totals.finalPrice.toFixed(2)}</span>
</div>

  <!-- ===== Notes / Terms ===== -->
  ${
    formattedNotes
      ? `<p style="margin-top:15px; line-height:1.6;"><b>Terms & Conditions:</b><br>${formattedNotes}</p>`
      : ''
  }

  <!-- ===== Footer / Signature ===== -->
  <p style="margin-top:25px;">We look forward to doing business with you. Please feel free to contact us for any clarifications.</p>

  <p style="margin-top:15px;">Best Regards,<br>
    <b>${user_name}</b><br>
    ${email}<br>
    ${organization_name}
  </p>
</div>
`
    }

    handleClose()

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

      // setLoader(false)

      if (result.success) {
        console.log('toast msg')

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

  const handleDownloadPDF2 = () => {
    const doc = new jsPDF('p', 'pt', 'a4')
    const margin = 40
    const lineHeight = 14

    // 👉 Add Logo (Base64 or URL) here
    const logoWidth = 70
    const logoHeight = 30
    doc.addImage(organization_logo, 'PNG', margin, 20, logoWidth, logoHeight)
    // Header text shifted a bit down to avoid overlapping with logo
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(organization_name, margin + logoWidth + 10, 50)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(organization_name, margin + logoWidth + 10, 50)

    // Properly aligned wrapped address
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const wrappedAddress = doc.splitTextToSize(organization_address, 250) // max width 250px
    doc.text(wrappedAddress, margin + logoWidth + 10, 65)

    doc.text(`Phone: ${mobile}`, margin + logoWidth + 10, 80 + wrappedAddress.length * 5)
    doc.text(`Email: ${email} | Website: www.datasense.in`, margin + logoWidth + 10, 95 + wrappedAddress.length * 5)

    // Date and Quotation No (Right Side)
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
    doc.text(`Subject: Quotation for ${leadData.items[0]?.item_ref[0]?.itemMasterRef.product_name}`, margin, y)
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
      item.itemMasterRef.product_name,
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

    const companyName = leadData.values['Company']
      ?.trim()
      .replace(/\s+/g, '-') // spaces → hyphens
      .replace(/[^a-zA-Z0-9-]/g, '') // remove special characters
    doc.save(`Quotation_${companyName}.pdf`)
  }

  const handleDownloadPDF3 = () => {
    const doc = new jsPDF('p', 'pt', 'a4')
    const margin = 40
    let y = 40

    // ======== HEADER WITH LOGO & ORG DETAILS ========
    const logoWidth = 70
    const logoHeight = 40
    doc.addImage(organization_logo, 'PNG', margin, y, logoWidth, logoHeight)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(organization_name, margin + logoWidth + 10, y + 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    // const wrappedAddress = doc.splitTextToSize(organization_address, 250)
    // doc.text(wrappedAddress, margin + logoWidth + 10, y + 35)

    // Decode and split address
    const decodedAddress = decodeURIComponent(organization_address)
    const addressLines = decodedAddress.split('\n')

    // Starting point for address print
    let addressY = y + 35

    // Print each line and adjust y dynamically
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + logoWidth + 10, addressY)
      addressY += 12 // Move to next line
    })

    // Now print Phone & Email correctly BELOW the address
    doc.text(`Phone: ${mobile}`, margin + logoWidth + 10, addressY + 5)
    doc.text(`Email: ${email} | Website: www.datasense.in`, margin + logoWidth + 10, addressY + 20)

    // Update y based on final printed position
    y = addressY + 40

    // Draw line below header
    y += 90
    doc.setLineWidth(0.5)
    doc.line(margin, y, 555, y)
    y += 20

    // ======== QUOTATION TITLE ========
    // doc.setFontSize(18)
    // doc.setFont('helvetica', 'bold')
    // doc.text('QUOTATION', margin, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, y)
    doc.text(`Quotation No: ${quoNumber}`, 400, y + 15)

    y += 40

    // ======== CLIENT DETAILS IN BOX ========
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', margin, y)
    y += 15

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const clientName = `${leadData.values['First Name']} ${leadData.values['Last Name']}` || ''
    const clientAddress = `${leadData.values['Street']}, ${leadData.values['City']}, ${leadData.values['State']} - ${leadData.values['Pincode']}, ${leadData.values['Country']}`

    doc.text(clientName, margin, y)
    doc.text(leadData.values['Company'], margin, y + 15)
    const wrappedClientAddr = doc.splitTextToSize(clientAddress, 500)
    doc.text(wrappedClientAddr, margin, y + 30)

    y += wrappedClientAddr.length * 10 + 50

    // ======== SUBJECT LINE ========
    doc.setFont('helvetica', 'bold')
    doc.text(`Subject: Quotation for ${leadData.items[0]?.item_ref[0]?.itemMasterRef.product_name}`, margin, y)
    y += 25

    doc.setFont('helvetica', 'normal')
    doc.text(`Dear ${leadData.values['First Name']},`, margin, y)
    y += 20
    doc.text(`We are pleased to submit our quotation for your requirements as below:`, margin, y)
    y += 20

    // ======== TABLE FOR ITEMS ========
    const tableColumn = ['#', 'Item', 'Qty', 'GST %', 'Unit Price', 'Total']

    const tableRows = dataItems.map((item, index) => [
      index + 1,
      item.itemMasterRef.product_name,
      item.quantity,
      `${item.itemMasterRef.gst}%`, // Show GST with %
      `${item.unitPrice.toFixed(2)}`,
      `${item.finalPrice.toFixed(2)}`
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 150 },
        2: { cellWidth: 50 },
        3: { cellWidth: 70 },
        4: { cellWidth: 80 },
        5: { cellWidth: 90, halign: 'right' } // ⬅ Total Right Align
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin }
    })

    let finalY = doc.lastAutoTable.finalY + 20

    // ======== TOTALS BOX (RIGHT ALIGNED) ========
    const totalsBoxX = 350
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')

    // Subtotal
    doc.text(`Subtotal: `, totalsBoxX, finalY)
    doc.text(`${totals.subtotal.toFixed(2)}`, totalsBoxX + 150, finalY, { align: 'right' })

    let nextY = finalY + 15

    // 🔥 Show Discount ONLY if not zero
    if (totals.discountAmount > 0) {
      doc.text(`Discount: `, totalsBoxX, nextY)
      doc.text(`-${totals.discountAmount.toFixed(2)}`, totalsBoxX + 150, nextY, { align: 'right' })
      nextY += 15
    }

    // GST
    doc.text(`GST: `, totalsBoxX, nextY)
    doc.text(`${totals.gstAmount.toFixed(2)}`, totalsBoxX + 150, nextY, { align: 'right' })

    // Draw line before Grand Total
    doc.line(totalsBoxX, nextY + 10, totalsBoxX + 150, nextY + 10)

    // Grand Total
    doc.setFontSize(12)
    doc.text(`Grand Total: `, totalsBoxX, nextY + 30)
    doc.text(`${totals.finalPrice.toFixed(2)}`, totalsBoxX + 150, nextY + 30, { align: 'right' })

    finalY = nextY + 70

    // ======== TERMS & CONDITIONS ========
    if (notes && notes.trim() !== '') {
      doc.setFont('helvetica', 'bold')
      doc.text('Terms & Conditions:', margin, finalY)
      doc.setFont('helvetica', 'normal')
      const wrappedNotes = doc.splitTextToSize(notes, 500)
      wrappedNotes.forEach((line, i) => {
        doc.text(line, margin, finalY + 15 + i * 12)
      })
      finalY += wrappedNotes.length * 12 + 30
    }

    // ======== SIGNATURE BLOCK ========
    doc.text('Best Regards,', margin, finalY)
    doc.text(user_name, margin, finalY + 20)
    doc.text(email, margin, finalY + 35)
    doc.text(organization_name, margin, finalY + 50)

    // ======== FOOTER ========
    doc.setFontSize(8)
    doc.setTextColor(120)
    // doc.text(
    //   'This is a system-generated quotation. No signature is required.',
    //   margin,
    //   820
    // );
    doc.text('Thank you for choosing Lumivo Datasense Technologies!', 400, 820, { align: 'right' })

    // ======== SAVE FILE WITH CLEAN NAME ========
    const companyName = leadData.values['Company']
      ?.trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')

    doc.save(`Quotation_${companyName}.pdf`)
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4')
    const margin = 40
    let y = margin

    // ======== HEADER (LOGO + ORG DETAILS) ========
    const logoWidth = 70
    const logoHeight = 40
    doc.addImage(organization_logo, 'PNG', margin, y, logoWidth, logoHeight)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(organization_name, margin + logoWidth + 10, y + 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)

    const decodedAddress = decodeURIComponent(organization_address)
    const addressLines = decodedAddress.split('\n')

    let addressY = y + 35
    addressLines.forEach(line => {
      doc.text(line.trim(), margin + logoWidth + 10, addressY)
      addressY += 12
    })

    doc.text(`Phone: ${mobile}`, margin + logoWidth + 10, addressY + 5)
    doc.text(`Email: ${email}`, margin + logoWidth + 10, addressY + 20)
    y = addressY + 50

    // Line after header
    doc.setLineWidth(0.5)
    doc.line(margin, y, 555, y)
    y += 30

    // ======== DATE & QUOTATION NO ========
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 400, y)
    doc.text(`Quotation No: ${quoNumber}`, 400, y + 15)

    y += 40

    // ======== CLIENT DETAILS ========
    doc.setFont('helvetica', 'bold')
    doc.text('Bill To:', margin, y)
    y += 15

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const clientName = `${leadData.values['First Name']} ${leadData.values['Last Name']}` || ''
    const clientAddress = `${leadData.values['Street']}, ${leadData.values['City']}, ${leadData.values['State']} - ${leadData.values['Pincode']}, ${leadData.values['Country']}`

    doc.text(clientName, margin, y)
    doc.text(leadData.values['Company'], margin, y + 15)

    const wrappedClientAddr = doc.splitTextToSize(clientAddress, 500)
    doc.text(wrappedClientAddr, margin, y + 30)

    y += wrappedClientAddr.length * 12 + 50

    // ======== SUBJECT ========
    doc.setFont('helvetica', 'bold')
    doc.text(`Subject: Quotation for ${leadData.items[0]?.item_ref[0]?.itemMasterRef.product_name}`, margin, y)
    y += 25

    doc.setFont('helvetica', 'normal')
    doc.text(`Dear ${leadData.values['First Name']},`, margin, y)
    y += 20
    doc.text(`We are pleased to submit our quotation for your requirements as below:`, margin, y)
    y += 30

    // ======== ITEMS TABLE ========
    const tableColumn = ['#', 'Item', 'Qty', 'GST %', 'Unit Price', 'Total']
    const tableRows = dataItems.map((item, index) => [
      index + 1,
      item.itemMasterRef.product_name,
      item.quantity,
      `${item.itemMasterRef.gst}%`,
      `${item.unitPrice.toFixed(2)}`,
      `${item.finalPrice.toFixed(2)}`
    ])

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: y,
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 150 },
        2: { cellWidth: 50 },
        3: { cellWidth: 70 },
        4: { cellWidth: 80 },
        5: { cellWidth: 90, halign: 'right' }
      },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: margin, right: margin }
    })

    let finalY = doc.lastAutoTable.finalY + 30

    // ======== TOTALS SECTION ========
    const totalsBoxX = 350
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')

    doc.text('Subtotal:', totalsBoxX, finalY)
    doc.text(`${totals.subtotal.toFixed(2)}`, totalsBoxX + 150, finalY, { align: 'right' })
    finalY += 15

    if (totals.discountAmount > 0) {
      doc.text('Discount:', totalsBoxX, finalY)
      doc.text(`-${totals.discountAmount.toFixed(2)}`, totalsBoxX + 150, finalY, { align: 'right' })
      finalY += 15
    }

    doc.text('GST:', totalsBoxX, finalY)
    doc.text(`${totals.gstAmount.toFixed(2)}`, totalsBoxX + 150, finalY, { align: 'right' })

    doc.line(totalsBoxX, finalY + 10, totalsBoxX + 150, finalY + 10)

    doc.setFontSize(12)
    doc.text('Grand Total:', totalsBoxX, finalY + 30)
    doc.text(`${totals.finalPrice.toFixed(2)}`, totalsBoxX + 150, finalY + 30, { align: 'right' })

    finalY += 70

    // ======== TERMS & CONDITIONS ========
    if (notes?.trim()) {
      doc.setFont('helvetica', 'bold')
      doc.text('Terms & Conditions:', margin, finalY)
      doc.setFont('helvetica', 'normal')

      const wrappedNotes = doc.splitTextToSize(notes, 500)
      wrappedNotes.forEach((line, i) => {
        doc.text(line, margin, finalY + 15 + i * 12)
      })

      finalY += wrappedNotes.length * 12 + 30
    }

    // ======== SIGNATURE ========
    doc.text('Best Regards,', margin, finalY)
    doc.text(user_name, margin, finalY + 20)
    doc.text(email, margin, finalY + 35)
    doc.text(organization_name, margin, finalY + 50)

    // ======== FOOTER ========
    doc.setFontSize(8)
    doc.setTextColor(120)
    doc.text('Thank you for choosing Lumivo Datasense Technologies!', 555 - margin, 820, { align: 'right' })

    // ======== SAVE PDF ========
    const companyName = leadData.values['Company']
      ?.trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')

    doc.save(`Quotation_${companyName || 'Client'}.pdf`)
  }

  useEffect(() => {
    if (sections.length > 0 && leadId) {
      fetchLeadFromId()
      getUserListFn()
    }
  }, [sections, leadId])

  useEffect(() => {
    console.log('fetchFormTemplate() call 7')
    fetchFormTemplate()
    fetchOpportunityFormTemplate()
  }, [])

  // Fetch products from API
  useEffect(() => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    if (open) {
      setLoader(true)
      fetch('/api/v1/admin/item-master/list', { headers: header })
        .then(res => res.json())
        .then(data => {
          setLoader(false)

          if (data.appStatusCode === 0) setItemsData(data.payloadJson)
        })
    }
  }, [open])

  const onToggleFlag = async row => {
    const leadId = row?.lead_id

    try {
      const flagupdatedValues = {
        _id: row?._id,
        organization_id: row?.organization_id,
        auto_inc_id: row?.auto_inc_id,
        lead_name: row?.lead_name,
        lead_id: row?.lead_id,
        lead_flag: row?.lead_flag === 1 ? 0 : 1,
        lead_touch: row?.lead_touch,
        lead_slug_name: row?.lead_slug_name,
        form_name: row?.form_name,
        submittedAt: new Date().toISOString(),
        c_role_id: row?.c_role_id,
        c_createdBy: row?.c_createdBy,
        updatedAt: row?.updatedAt,
        createdAt: row?.createdAt
      }

      // 🔹 Persist to API
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(flagupdatedValues)
      })

      const result = await res.json()

      if (!result.success) {
        toast.error('Failed to update field')
        // fetchData()
        fetchLeadFromId()
      } else {
        toast.success('Flag Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        // fetchData()
        fetchLeadFromId()
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error(err)
    }
  }

  const dealFunCall = (id, lead_name) => {
    setDealConfirm(true)
    setDealData({
      amount: '',
      dealName: leadData?.values?.Company || accountName || '',
      closingDate: null,
      stage: 'New Opportunity',
      // stage: leadData?.values?.['Lead Status'] || 'Qualification',
      'Assigned To': user_id
    })
  }

  const dealFnCall = order_ID => {
    if (!leadData?.items || leadData.items.length === 0 || !order_ID) {
      setDataItems([])
      return
    }

    // Find the matching item group by orderId
    const selectedOrder = leadData.items.find(item => item.item_id === order_ID)
    const items = selectedOrder?.item_ref || []
    // ✅ Generate Quotation Number
    const quotationNumber = generateQuotationNumber(leadData)

    // ✅ Attach quotation number to each item or store globally
    const itemsWithQTN = items.map(item => ({ ...item, quotationNumber }))

    console.log('Generated itemsWithQTN:', itemsWithQTN)
    setDataItems(itemsWithQTN)
    setOrderId(order_ID)
    setConfirm(true)
  }

  const handleDealClose = () => {
    setDealConfirm(false)
    setCreateDeal(false)
    setDealData({
      amount: '',
      dealName: leadData?.values?.Company || accountName || '',
      closingDate: null,
      stage: leadData?.values?.['Lead Status'] || 'Qualification'
    })
  }

  const handleConvert = () => {
    convertLeadFn(leadData, createDeal, dealData)
    handleDealClose()
  }

  const convertLeadFn = async (leadData, createDeal, dealData) => {
    try {
      const id = leadData?._id
      const organization_id = leadData?.organization_id
      const auto_inc_id = leadData?.auto_inc_id
      const lead_id = leadData?.lead_id
      const form_name = createDeal ? 'opportunity-form' : 'lead-form'
      const c_role_id = leadData?.c_role_id
      const c_createdBy = leadData?.c_createdBy
      const c_createdByName = leadData?.c_createdByName
      const submittedAt = leadData?.submittedAt
      const createdAt = leadData?.createdAt
      const updatedAt = new Date().toISOString()

      const originalName = leadData?.lead_name || ''
      const nextLeadName = createDeal ? originalName.replace(/lead/i, 'OPPORTUNITY') : originalName

      const slugLeadString = nextLeadName.replace(/[^\w\s]|_/g, '')
      const slug_lead_name = slugify(slugLeadString, {
        replacement: '-',
        lower: true,
        locale: 'en'
      })

      // 📌 Base values (always included)
      const values = {
        'Lead Status': createDeal ? dealData?.stage : 'Contacted / Qualification',
        'Assigned To': createDeal ? dealData['Assigned To'] : user_id
      }

      // 📌 Only include deal fields WHEN createDeal is true
      if (createDeal) {
        values['Deal Name'] = dealData?.dealName || ''
        values['Expected Revenue'] = dealData?.amount || ''
        values['Closing Date'] = dealData?.closingDate ? new Date(dealData.closingDate).toISOString().split('T')[0] : ''
      }

      // 🧠 Final payload
      const payload = {
        _id: id,
        form_name,
        lead_name: nextLeadName,
        lead_slug_name: slug_lead_name,
        values,
        lead_touch: 'touch',
        updatedAt: new Date().toISOString()
      }

      console.log(payload, '<<< paylaod convert to lead')
      // 🔹 If you want to update to API, uncomment below:

      const res = await fetch(`/api/v1/admin/lead-form/${lead_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()
      if (result.success) {
        console.log(createDeal, '<<< ceratetetetete')
        toast.success(createDeal ? 'Lead successfully converted to Opportunity' : 'Lead updated successfully', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
        router.push(
          createDeal ? `/view/opportunity-form/${encodeURIComponent(encryptCryptoRes(leadData.lead_id))}` : '/app/leads'
        )
      } else {
        toast.error('Update failed, please try again!')
      }
    } catch (err) {
      console.error('❌ Error converting lead:', err)
    }
  }

  // Fetch user list
  const getItemListFn = async itemType => {
    try {
      // const itemType = "Product"
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const results = await getTypeItemMasterListApi(itemType, header)
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setItemList(results.payloadJson)
      } else {
        setItemList([])
      }
    } catch (err) {
      setItemList([])
    }
  }

  useEffect(() => {
    if (leadData) {
      const values = leadData.values || {}
      const firstName = values['First Name']?.trim() || ''
      const lastName = values['Last Name']?.trim() || ''
      const fullContactName = `${firstName} ${lastName}`.trim()
      setAccountName(values['Company'] || '—')
      setContactName(fullContactName || '—')
      setOwnerName(leadData.c_createdByName || '—')
    }
  }, [leadData])

  useEffect(() => {
    getItemListFn(itemType)
  }, [itemType])

  // 🔹 Save handler
  const handleFieldSave = async (label, newValue, reasonKey, selectedReasons) => {
    try {
      // Base values
      const updatedValues = {
        [label]: newValue
      }

      // 🔹 Add reason fields dynamically
      if (reasonKey && selectedReasons?.length) {
        updatedValues[reasonKey] = selectedReasons
      }

      const updatedLeadValues = {
        _id: leadData?._id,
        organization_id: leadData?.organization_id,
        auto_inc_id: leadData?.auto_inc_id,
        lead_name: leadData?.lead_name,
        lead_id: leadData?.lead_id,
        lead_slug_name: leadData?.lead_slug_name,
        form_name: leadData?.form_name,
        lead_touch: 'touch',
        // values: {
        //   [label]: newValue // update particular field
        // },
        values: updatedValues, // ✅ both Lead Status + Reasons
        submittedAt: new Date().toISOString(),
        c_role_id: leadData?.c_role_id,
        c_createdBy: leadData?.c_createdBy,
        updatedAt: leadData?.updatedAt,
        createdAt: leadData?.createdAt
      }

      // 🔹 Persist to API
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(updatedLeadValues)
      })

      const result = await res.json()

      console.log(result, '<<<responseeee')

      if (!result.success) {
        toast.error('Failed to update field')
        fetchLeadFromId() // rollback to latest DB values
      } else {
        toast.success(result?.message || 'Updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        fetchLeadFromId() // rollback to latest DB values
      }
    } catch (err) {
      toast.error('Error saving field')
      console.error(err)
    }
  }

  if (loader) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          bgcolor: 'rgba(255,255,255,0.7)',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1300
        }}
      >
        <Image src={LoaderGif} alt='loading' width={100} height={100} />
      </Box>
    )
  }

  if (!leadData && !loader) {
    return (
      <></>
      // <Card sx={{ p: 4, textAlign: 'center', mt: 3 }}>
      //   <Typography variant='h6'>📝 No lead found</Typography>
      //   <Link href='/app/lead-form'>
      //     <Button variant='contained' size='small'>
      //       + Create New Lead
      //     </Button>
      //   </Link>
      // </Card>
    )
  }

  const fields = leadData?.values || {}

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Box
          sx={{
            width: '100%'
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            variant='fullWidth'
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              bgcolor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '16px',
              minHeight: '44px',
              p: '4px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
              '& .MuiTab-root': {
                flex: 1,
                minHeight: '36px',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                color: '#444',
                // transition: "all 0.25s ease",
                '&:hover': {
                  bgcolor: '#f0f7ff',
                  color: '#009cde',
                  border: '1px solid #009cde33'
                },
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#009cde',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }
              }
            }}
          >
            <Tab label='Notes' />
            <Tab label='Activities' />
            <Tab label='Items' />
          </Tabs>
        </Box>
      </Grid>

      <Grid item xs={12} md={8}>
        {/* Tabs */}

        {/* Tab Panels */}
        {tabIndex === 0 && (
          <Box>
            <NotesSection leadId={leadId} leadData={leadData} />
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            {/* <OpenActivities leadId={leadId} leadData={leadData} /> */}

            <TaskTabs leadId={leadId} leadData={leadData} fetchLeadFromId={fetchLeadFromId} />
          </Box>
        )}

        {tabIndex === 2 && (
          <Box>
            <ProductPage
              leadId={leadId}
              leadData={leadData}
              fetchLeadFromId={fetchLeadFromId}
              itemsData={itemsData}
              dealFnCall={dealFnCall}
              items={dataItems}
              itemTypes={itemTypes}
            />
          </Box>
        )}
      </Grid>

      {/* Right side */}
      <Grid item xs={12} md={4}>
        <Box>
          <Button
            disabled={loading}
            fullWidth
            variant='contained'
            color='primary'
            onClick={() => dealFunCall(leadData?._id, leadData?.lead_name)}
          >
            {' '}
            {loading ? <CircularProgress size={18} /> : 'Convert to Opportunity'}
          </Button>
        </Box>
        <Box
          sx={{
            position: 'sticky',
            top: 10, // navbar height adjust panni set pannu
            maxHeight: 'calc(100vh - 100px)', // viewport ku match panna
            overflowY: 'auto',
            pr: 1 // scrollbar overlap avoid
          }}
        >
          <LeadCard
            fields={fields}
            leadId={leadId}
            leadData={leadData}
            onToggleFlag={onToggleFlag}
            sections={sections}
            handleFieldSave={handleFieldSave}
          />

          {/* 🔹 Dynamic Sections */}
          {sections.map((section, index) => (
            <Box mb={2} key={section.id || section.title || index}>
              <Accordion expanded={expanded === index} onChange={() => setExpanded(expanded === index ? false : index)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {section.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {Object.values(section.fields)
                      .flat()
                      .filter(Boolean)
                      .map(field => (
                        <Grid item xs={12} sm={12} key={field.id || field.label}>
                          <EditableField
                            label={field.label}
                            field={field}
                            value={fields[field.label]}
                            type={
                              field.label === 'Next Follow-up Date'
                                ? 'date'
                                : field.type === 'Dropdown'
                                  ? 'select'
                                  : 'text'
                            }
                            options={fieldConfig[field.label] || []}
                            onSave={newValue => {
                              if (fieldValidators[field.label]) {
                                const err = fieldValidators[field.label](newValue)
                                if (err) {
                                  toast.error(err)
                                  return
                                }
                              }
                              handleFieldSave(field.label, newValue)
                            }}
                            userList={userList}
                            itemTypes={itemTypes}
                            itemList={itemList}
                            setItemType={setItemType}
                          />
                        </Grid>
                      ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ))}
        </Box>
        <ConvertDealDialog
          open={dealConfirm}
          onClose={handleDealClose}
          accountName={accountName}
          contactName={contactName}
          createDeal={createDeal}
          setCreateDeal={setCreateDeal}
          ownerName={ownerName}
          handleConvert={handleConvert}
          fieldOpportunityConfig={fieldOpportunityConfig}
          leadData={leadData}
          dealData={dealData}
          setDealData={setDealData}
          userList={userList}
          user_id={user_id}
        />
        <ProposalDialogPage
          open={confirm}
          onClose={handleClose}
          leadData={leadData}
          orderId={orderId}
          dataItems={dataItems}
          handleQtyChange={handleQtyChange}
          quoNumber={quoNumber}
          calculateItemTotals={calculateItemTotals}
          totals={totals}
          notes={notes}
          setNotes={setNotes}
          handleFileUpload={handleFileUpload}
          // removeFile={removeFile}
          handleSend={handleSend}
          handleDownloadPDF={handleDownloadPDF}
        />
      </Grid>
    </Grid>
  )
}

export default LeadDetailView
