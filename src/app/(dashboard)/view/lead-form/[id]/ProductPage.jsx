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
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material'
import ProductSelectorDialog from './ProductSelectorDialog'
import ProductBulkEditDialog from './ProductBulkEditDialog'
import { toast } from 'react-toastify'
import { formatCurrency } from '@/helper/frontendHelper'
import EmptyItems from '../../empty-items/EmptyItems'
import { useRouter } from 'next/navigation'
import ServiceSelectorDialog from './ServiceSelectorDialog'
import ProductList from './ProductList'
import ServiceList from './ServiceList'

// ✅ Utility for currency
// const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

function ProductPage({ leadId, leadData, fetchLeadFromId, itemsData, dealFnCall, itemTypes,hasEditPermission, hasAddPermission,hasDeletePermission }) {


  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const menuActions = {
    Product: () => setOpenProductDialog(true),
    Service: () => setOpenServiceDialog(true),
    Subscription: () => alert('Subscription Selected'),
    License: () => alert('License Selected'),
    Warranty: () => alert('Warranty Selected')
  }

  const getIcon = type => {
    switch (type) {
      case 'Product':
        return '📦'
      case 'Service':
        return '🛠'
      case 'Subscription':
        return '🎫'
      case 'License':
        return '🔐'
      case 'Warranty':
        return '📝'
      default:
        return '📁'
    }
  }
  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const router = useRouter()
  const [openProductDialog, setOpenProductDialog] = useState(false)
  const [openServiceDialog, setOpenServiceDialog] = useState(false)
  const [loader, setLoader] = useState(false)

  const [deleteProductId, setDeleteProductId] = useState(null)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)

  const [openBulkEdit, setOpenBulkEdit] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)

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
    setEditingOrder(order)
    setOpenBulkEdit(true)
  }

  // 🔹 Order Delete Function
  const handleDeleteOrder = async itemId => {
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
        {hasAddPermission() && 
        <Button
          variant='contained'
          onClick={handleClick}
          sx={{
            bgcolor: '#009cde',
            '&:hover': { bgcolor: '#007bb5' },
            borderRadius: 1,
            textTransform: 'none'
          }}
        >
          + Add Items
        </Button>
        }
        

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {itemTypes.map(type => (
            <MenuItem
              key={type}
              onClick={() => {
                menuActions[type]()
                handleClose()
              }}
            >
              {getIcon(type)}&nbsp; {type}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {leadData?.items?.length > 0 ? (
        <>
          <ProductList
            leadData={leadData}
            handleDeleteOrder={handleDeleteOrder}
            handleOpenBulkEdit={handleOpenBulkEdit}
            dealFnCall={dealFnCall}
            formatCurrency={formatCurrency}
            hasEditPermission= {hasEditPermission}
            hasAddPermission= {hasAddPermission}
            hasDeletePermission= {hasDeletePermission}
          />
          <ServiceList
            leadData={leadData}
            handleDeleteOrder={handleDeleteOrder}
            handleOpenBulkEdit={handleOpenBulkEdit}
            dealFnCall={dealFnCall}
            formatCurrency={formatCurrency}
            hasEditPermission= {hasEditPermission}
            hasAddPermission= {hasAddPermission}
            hasDeletePermission= {hasDeletePermission}
          />
        </>
      ) : (
        <EmptyItems
          onAdd={() => router.push('/items')}
          primaryText='🚫 No items added yet'
          secondaryText="You don't have any items yet. Click below to create your first item."
          buttonText='Create Item'
        />
      )}

      <ProductSelectorDialog
        open={openProductDialog}
        onClose={() => setOpenProductDialog(false)}
        leadId={leadId}
        fetchLeadFromId={fetchLeadFromId}
        itemsData={itemsData}
      />
      <ServiceSelectorDialog
        open={openServiceDialog}
        onClose={() => setOpenServiceDialog(false)}
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
