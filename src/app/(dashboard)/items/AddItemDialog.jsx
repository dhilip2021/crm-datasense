'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  MenuItem
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { createItemMaster } from '@/apiFunctions/ApiAction'


const AddItemDialog = ({ open, onClose, fetchItems, uomList, taxList, titles, item, handleSubmit, handleChange }) => {


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold'
        }}
      >
        {titles} {item.item_type}
        <CancelIcon onClick={onClose} sx={{ cursor: 'pointer', fontSize: 20 }} />
      </DialogTitle>

      <DialogContent dividers>
        {/* General Details */}
        <Box mb={3}>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            General Details
          </Typography>
          <RadioGroup row value={item.item_type} onChange={e => handleChange('item_type', e.target.value)}>
            {['Product', 'Service', 'License', 'Warranty', 'Subscription'].map(option => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>

          <Grid container spacing={2} mt={1}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete='off'
                label='Item Name *'
                fullWidth
                size='small'
                value={item.item_name}
                onChange={e => handleChange('item_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                autoComplete='off'
                label='Item Code *'
                fullWidth
                size='small'
                value={item.item_code}
                onChange={e => handleChange('item_code', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete='off'
                label='Description'
                fullWidth
                size='small'
                multiline
                rows={3}
                value={item.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Pricing & Tax */}
        <Box>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            Pricing & Tax
          </Typography>
          <Grid container spacing={2}>
            {/* UOM common for all */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label='UOM *'
                fullWidth
                select
                size='small'
                value={item.uom}
                onChange={e => handleChange('uom', e.target.value)}
              >
                {uomList.map((u, index) => (
                  <MenuItem key={index} value={u.uom_code}>
                    {u.uom_code} ({u.uom_label})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Base Price - common */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                autoComplete='off'
                label='Base Price *'
                fullWidth
                size='small'
                type='number'
                value={item.basePrice}
                onChange={e => handleChange('basePrice', e.target.value)}
              />
            </Grid>

            {/* Conditional Fields */}
            {item.item_type === 'Product' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='MRP *'
                    fullWidth
                    size='small'
                    type='number'
                    value={item.mrp}
                    onChange={e => handleChange('mrp', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Distributor Price'
                    fullWidth
                    size='small'
                    type='number'
                    value={item.distributorPrice}
                    onChange={e => handleChange('distributorPrice', e.target.value)}
                  />
                </Grid>
              </>
            )}

            {item.item_type === 'Service' && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  autoComplete='off'
                  label='SAC/HSN Code'
                  fullWidth
                  size='small'
                  value={item.hsn}
                  onChange={e => handleChange('hsn', e.target.value)}
                />
              </Grid>
            )}

            {item.item_type === 'License' && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  autoComplete='off'
                  label='License Key'
                  fullWidth
                  size='small'
                  value={item.licenseKey}
                  onChange={e => handleChange('licenseKey', e.target.value)}
                />
              </Grid>
            )}

            {item.item_type === 'Warranty' && (
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  autoComplete='off'
                  label='Warranty Period (months)'
                  fullWidth
                  size='small'
                  type='number'
                  value={item.warrantyPeriod}
                  onChange={e => handleChange('warrantyPeriod', e.target.value)}
                />
              </Grid>
            )}

            {item.item_type === 'Subscription' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Billing Cycle'
                    fullWidth
                    size='small'
                    placeholder='Monthly / Yearly'
                    value={item.billingCycle}
                    onChange={e => handleChange('billingCycle', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Subscription Duration'
                    fullWidth
                    size='small'
                    placeholder='e.g., 12 Months'
                    value={item.subscriptionDuration}
                    onChange={e => handleChange('subscriptionDuration', e.target.value)}
                  />
                </Grid>
              </>
            )}

            {/* GST for all except Warranty */}
            {item.item_type !== 'Warranty' && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label='GST % *'
                  fullWidth
                  select
                  size='small'
                  value={item.gst}
                  onChange={e => handleChange('gst', e.target.value)}
                >
                  {taxList.map((g,i) => (
                    <MenuItem key={i} value={g.tax_value}>
                      {g.tax_value}%
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          variant='contained'
          sx={{ bgcolor: '#009CDE', '&:hover': { bgcolor: '#007bbf' } }}
          onClick={handleSubmit}
        >
          Add {item.item_type}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddItemDialog
