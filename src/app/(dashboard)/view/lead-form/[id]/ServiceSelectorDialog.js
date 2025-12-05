'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box,
  Typography,
  Autocomplete,
  CircularProgress,
  MenuItem
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helper/frontendHelper'
import { useRouter } from 'next/navigation'

const ServiceSelectorDialog = ({ itemsData, open, onClose, leadId, fetchLeadFromId }) => {
  const router = useRouter()
  const getToken = Cookies.get('_token')

  const serviceItems = itemsData.filter(item => item.item_type === 'Service')

  const [selectedItems, setSelectedItems] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [discount, setDiscount] = useState(0)
  const [loader, setLoader] = useState(false)
  const [addedItems, setAddedItems] = useState([])

  const handleAddService = () => {
    router.push('/items')
  }

  const handleAdd = () => {

    console.log(selectedItems,"<<< selectedItemsssss")

    if (!selectedItems) return

    // const unitPrice = selectedItems.basePrice || 0
    // const totalPrice = quantity * unitPrice
    // let finalPrice = totalPrice

    // if (selectedItems.discountType === 'Flat %') {
    //   finalPrice = totalPrice - totalPrice * (discount / 100)
    // } else if (selectedItems.discountType === 'Flat Amount') {
    //   finalPrice = totalPrice - discount
    // }

    let extraFields = {}
    switch (selectedItems.item_type) {
      case 'Service':
        extraFields = {
          uom: selectedItems.uom,
          gst: selectedItems.gst,
          hsn: selectedItems.hsn,
          service_type: selectedItems.service_type || '',
          service_duration: selectedItems.service_duration || '',
          service_charge: selectedItems.service_charge || ''
        }
        break
      case 'Product':
        extraFields = { uom: selectedItems.uom, mrp: selectedItems.mrp, gst: selectedItems.gst }
        break
      case 'License':
        extraFields = {
          uom: selectedItems.uom,
          licenseKey: selectedItems.licenseKey,
          subscriptionDuration: selectedItems.subscriptionDuration
        }
        break
      case 'Warranty':
        extraFields = { uom: selectedItems.uom, warrantyPeriod: selectedItems.warrantyPeriod }
        break
      case 'Subscription':
        extraFields = {
          uom: selectedItems.uom,
          billingCycle: selectedItems.billingCycle,
          subscriptionDuration: selectedItems.subscriptionDuration
        }
        break
    }

    const newItem = {
      itemMasterRef: selectedItems._id,
      item_id: selectedItems.item_id,
      service_name: selectedItems.service_name,
      item_type: selectedItems.item_type,
    //   quantity,
    //   unitPrice,
    //   discount,
    //   discountType: selectedItems.discountType || 'Flat %',
    //   finalPrice,
      ...extraFields
    }

    setAddedItems(prev => [...prev, { item_ref: [newItem] }])
    setSelectedItems(null)
    setQuantity(1)
    setDiscount(0)
  }

  const handleRemove = index => {
    setAddedItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (addedItems.length === 0) return
    try {
      setLoader(true)
      const result = await fetch(`/api/v1/admin/lead-form/${leadId}/add-service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify({ items: addedItems })
      })

      const data = await result.json()
      setLoader(false)

      if (data.success) {
        toast.success('Services added successfully!', { autoClose: 1000 })
        fetchLeadFromId()
        setAddedItems([])
        onClose()
      } else {
        toast.error(data.message || 'Failed to add items')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>Select Service for Lead</DialogTitle>
      <DialogContent>
        <Box display='flex' gap={2} my={2}>
          <Autocomplete
            options={serviceItems}
            noOptionsText={
              <Button size='small' variant='outlined' onClick={handleAddService}>
                ➕ Add Service
              </Button>
            }
            getOptionLabel={option => `${option.service_name} (${option.item_type})` || ''}
            value={selectedItems}
            onChange={(e, newVal) => setSelectedItems(newVal)}
            sx={{ flex: 2 }}
            size='small'
            renderOption={(props, option) => {
              const isDisabled = addedItems.some(order =>
                order.item_ref.some(ref => ref.item_id === option.item_id)
              )

              return (
                <li
                  {...props}
                  style={{
                    opacity: isDisabled ? 0.5 : 1,
                    pointerEvents: isDisabled ? 'none' : 'auto',
                    cursor: isDisabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  {option.service_name} ({option.item_type})
                </li>
              )
            }}
            renderInput={params => <TextField {...params} label='Select Service' />}
          />

          {selectedItems?.item_type === 'Service' && (
            <>
              <TextField
                label='Service Type'
                select
                size='small'
                sx={{ width: 140 }}
                value={selectedItems.service_type || ''}
                onChange={e => setSelectedItems({ ...selectedItems, service_type: e.target.value })}
              >
                {['On-site', 'Remote'].map((type, i) => (
                  <MenuItem key={i} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label='Duration (Days)'
                type='number'
                size='small'
                sx={{ width: 120 }}
                value={selectedItems.service_duration || ''}
                onChange={e =>
                  setSelectedItems({ ...selectedItems, service_duration: e.target.value })
                }
              />

              <TextField
                label='Service Charge'
                type='number'
                size='small'
                sx={{ width: 140 }}
                value={selectedItems.service_charge || ''}
                onChange={e =>
                  setSelectedItems({ ...selectedItems, service_charge: e.target.value })
                }
              />
            </>
          )}

          <Button variant='contained' onClick={handleAdd}>
            Add
          </Button>
        </Box>

        {/* TABLE */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Service Name</TableCell>
              <TableCell>Item Type</TableCell>
              <TableCell>HSN</TableCell>
              <TableCell>Service Type</TableCell>
              <TableCell>Duration (Days)</TableCell>
              <TableCell>Service Charge</TableCell>
              <TableCell>Other Details</TableCell>
              <TableCell>Remove</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {addedItems.map((order, i) =>
              order.item_ref.map((p, j) => (
                <TableRow key={`${i}-${j}`}>
                  <TableCell>{p.service_name}</TableCell>
                  <TableCell>{p.item_type}</TableCell>
                  <TableCell>{p.hsn}</TableCell>
                  <TableCell>{p.service_type}</TableCell>
                  <TableCell>{p.service_duration} days</TableCell>
                  <TableCell>
                    {p.service_charge}
                  </TableCell>

                  <TableCell>
                    {p.item_type === 'Service' && (
                      <>
                        <strong>UOM:</strong> {p.uom || '-'} <br />
                        <strong>GST:</strong> {p.gst}% 
                        {/* <strong>HSN:</strong> {p.hsn || '-'} <br /> */}
                        {/* <strong>Type:</strong> {p.service_type || '-'} <br /> */}
                        {/* <strong>Duration:</strong> {p.service_duration || '-'} Days <br /> */}
                        {/* <strong>Charge:</strong> ₹{p.service_charge || '-'} */}
                      </>
                    )}
                  </TableCell>

                  <TableCell>
                    <IconButton onClick={() => handleRemove(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!addedItems.length && (
          <Typography textAlign='center' color='text.secondary' mt={2}>
            No services added yet...
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={handleSave} disabled={!addedItems.length || loader}>
          {loader ? 'Savings...' : 'Save Services'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ServiceSelectorDialog
