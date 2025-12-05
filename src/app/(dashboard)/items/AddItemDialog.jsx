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
  MenuItem,
  Checkbox
} from '@mui/material'
import CancelIcon from '@mui/icons-material/Close'
import Cookies from 'js-cookie'
import { createItemMaster } from '@/apiFunctions/ApiAction'
import { formatCurrency } from '@/helper/frontendHelper'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const AddItemDialog = ({
  open,
  onClose,
  uomList,
  categoryList,
  taxList,
  titles,
  item,
  handleSubmit,
  handleChange,
  addUOMChanges,
  addTaxChanges,
  handleCheck,
  addCategoryChanges,
  itemTypes
}) => {
  console.log(categoryList, '<<< categoryList')
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
        <Box mb={3}>
          <Typography variant='subtitle1' sx={{ fontWeight: 'bold', mb: 1 }}>
            General Details
          </Typography>
          <RadioGroup row value={item.item_type} onChange={e => handleChange('item_type', e.target.value)}>
            {Array.isArray(itemTypes) &&
              itemTypes.map(option => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
          </RadioGroup>

          <Grid container spacing={2} mt={1}>
            {item.item_type === 'Product' && (
              <>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    autoComplete='off'
                    label='Product Name *'
                    fullWidth
                    size='small'
                    value={item.product_name}
                    onChange={e => handleChange('product_name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    autoComplete='off'
                    label='Product Code *'
                    fullWidth
                    size='small'
                    value={item.product_code}
                    onChange={e => handleChange('product_code', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Product Category'
                    fullWidth
                    select
                    size='small'
                    name='product_category'
                    value={item.product_category}
                    onChange={e => handleChange('product_category', e.target.value)}
                  >
                    {categoryList
                      .filter(u => u.category_type === 'Product') // 🔹 filter by category_type
                      .map((u, index) => (
                        <MenuItem key={index} value={u.prod_id}>
                          {u.prod_name}
                        </MenuItem>
                      ))}

                    <MenuItem
                      onClick={() => addCategoryChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Category
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    autoComplete='off'
                    label='Stock'
                    fullWidth
                    size='small'
                    value={item.stock}
                    onChange={e => handleChange('stock', e.target.value)}
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
              </>
            )}
            {item.item_type === 'Service' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Service Name *'
                    fullWidth
                    size='small'
                    value={item.service_name}
                    onChange={e => handleChange('service_name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Service Code *'
                    fullWidth
                    size='small'
                    value={item.service_code}
                    onChange={e => handleChange('service_code', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Service Category'
                    fullWidth
                    select
                    size='small'
                    name='product_category'
                    value={item.product_category}
                    onChange={e => handleChange('product_category', e.target.value)}
                  >
                    {categoryList
                      .filter(u => u.category_type === 'Service') // 🔹 filter by category_type
                      .map((u, index) => (
                        <MenuItem key={index} value={u.prod_id}>
                          {u.prod_name}
                        </MenuItem>
                      ))}

                    <MenuItem
                      onClick={() => addCategoryChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Category
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Service Type'
                    fullWidth
                    select
                    size='small'
                    name='service_type'
                    value={item.service_type}
                    onChange={e => handleChange('service_type', e.target.value)}
                  >
                    {['On-site', 'Remote'].map((u, index) => (
                      <MenuItem key={index} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
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
              </>
            )}

            {item.item_type === 'License' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='License Name *'
                    fullWidth
                    size='small'
                    value={item.license_name}
                    onChange={e => handleChange('license_name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='License Code *'
                    fullWidth
                    size='small'
                    value={item.license_code}
                    onChange={e => handleChange('license_code', e.target.value)}
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
              </>
            )}

            {item.item_type === 'Warranty' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Plan *'
                    fullWidth
                    size='small'
                    value={item.warranty_plan}
                    onChange={e => handleChange('warranty_plan', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Code *'
                    fullWidth
                    size='small'
                    value={item.warranty_code}
                    onChange={e => handleChange('warranty_code', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Covered Product *'
                    fullWidth
                    size='small'
                    value={item.warranty_covered_product}
                    onChange={e => handleChange('warranty_covered_product', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    autoComplete='off'
                    label='Coverage Type'
                    fullWidth
                    size='small'
                    multiline
                    rows={3}
                    value={item.coverage_type}
                    onChange={e => handleChange('coverage_type', e.target.value)}
                  />
                </Grid>
              </>
            )}

            {item.item_type === 'Subscription' && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Subcription Name *'
                    fullWidth
                    size='small'
                    value={item.subscription_name}
                    onChange={e => handleChange('subscription_name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete='off'
                    label='Subcription Code *'
                    fullWidth
                    size='small'
                    value={item.subscription_code}
                    onChange={e => handleChange('subscription_code', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    autoComplete='off'
                    label='Plan Type *'
                    fullWidth
                    size='small'
                    value={item.plan_type}
                    onChange={e => handleChange('plan_type', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    label='Billing Cycle'
                    fullWidth
                    select
                    size='small'
                    name='billing_cycle'
                    value={item.billing_cycle}
                    onChange={e => handleChange('billing_cycle', e.target.value)}
                  >
                    {['Monthly', 'Yearly'].map((u, index) => (
                      <MenuItem key={index} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
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

            {item.item_type === 'Product' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label='UOM *'
                    fullWidth
                    select
                    size='small'
                    name='uom'
                    value={item.uom}
                    onChange={e => handleChange('uom', e.target.value)}
                  >
                    {uomList.map((u, index) => (
                      <MenuItem key={index} value={u.uom_code}>
                        {u.uom_code} ({u.uom_label})
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addUOMChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New UOM
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    name='basePrice'
                    autoComplete='off'
                    label='Base Price *'
                    fullWidth
                    size='small'
                    value={item.basePrice}
                    onChange={e => handleChange('basePrice', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='MRP *'
                    fullWidth
                    size='small'
                    value={item.mrp}
                    onChange={e => handleChange('mrp', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label='GST % *'
                    fullWidth
                    select
                    size='small'
                    value={item.gst}
                    onChange={e => handleChange('gst', e.target.value)}
                  >
                    {taxList.map((g, i) => (
                      <MenuItem key={i} value={g.tax_value}>
                        {g.tax_value}%
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addTaxChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Tax
                    </MenuItem>
                  </TextField>
                </Grid>
                {/* <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Distributor Price'
                    fullWidth
                    size='small'
                    type='number'
                    value={item.distributorPrice}
                    onChange={e => handleChange('distributorPrice', e.target.value)}
                  />
                </Grid> */}
              </>
            )}

            {item.item_type === 'Service' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Service Duration (hours)*'
                    fullWidth
                    size='small'
                    value={item.service_duration}
                    onChange={e => handleChange('service_duration', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Service Charge *'
                    fullWidth
                    size='small'
                    value={item.service_charge}
                    onChange={e => handleChange('service_charge', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Selling Price *'
                    fullWidth
                    size='small'
                    value={item.selling_price}
                    onChange={e => handleChange('selling_price', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    autoComplete='off'
                    label='Warranty On Service (months)*'
                    fullWidth
                    size='small'
                    value={item.warranty_on_service}
                    onChange={e => handleChange('warranty_on_service', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='UOM *'
                    fullWidth
                    select
                    size='small'
                    name='uom'
                    value={item.uom}
                    onChange={e => handleChange('uom', e.target.value)}
                  >
                    {uomList.map((u, index) => (
                      <MenuItem key={index} value={u.uom_code}>
                        {u.uom_code} ({u.uom_label})
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addUOMChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New UOM
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='SAC/HSN Code'
                    fullWidth
                    size='small'
                    value={item.hsn}
                    onChange={e => handleChange('hsn', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='GST % *'
                    fullWidth
                    select
                    size='small'
                    value={item.gst}
                    onChange={e => handleChange('gst', e.target.value)}
                  >
                    {taxList.map((g, i) => (
                      <MenuItem key={i} value={g.tax_value}>
                        {g.tax_value}%
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addTaxChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Tax
                    </MenuItem>
                  </TextField>
                </Grid>
              </>
            )}

            {item.item_type === 'License' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='License Key'
                    fullWidth
                    size='small'
                    value={item.license_key}
                    onChange={e => handleChange('license_key', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='License validity (months)'
                    fullWidth
                    size='small'
                    value={item.license_validity}
                    onChange={e => handleChange('license_validity', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='License price'
                    fullWidth
                    size='small'
                    value={item.license_price}
                    onChange={e => handleChange('license_price', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='License Renewal price'
                    fullWidth
                    size='small'
                    value={item.license_renewal_price}
                    onChange={e => handleChange('license_renewal_price', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='No of Users'
                    fullWidth
                    size='small'
                    value={item.no_of_users}
                    onChange={e => handleChange('no_of_users', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='GST % *'
                    fullWidth
                    select
                    size='small'
                    value={item.gst}
                    onChange={e => handleChange('gst', e.target.value)}
                  >
                    {taxList.map((g, i) => (
                      <MenuItem key={i} value={g.tax_value}>
                        {g.tax_value}%
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addTaxChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Tax
                    </MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='Activation Type'
                    fullWidth
                    select
                    size='small'
                    name='activation_type'
                    value={item.activation_type}
                    onChange={e => handleChange('activation_type', e.target.value)}
                  >
                    {['Online', 'Remote'].map((u, index) => (
                      <MenuItem key={index} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            {item.item_type === 'Warranty' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Duration (yrs)'
                    fullWidth
                    size='small'
                    value={item.warranty_duration}
                    onChange={e => handleChange('warranty_duration', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Cost'
                    fullWidth
                    size='small'
                    value={item.warranty_cost}
                    onChange={e => handleChange('warranty_cost', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Claim Limit'
                    fullWidth
                    size='small'
                    value={item.warranty_claim_limits}
                    onChange={e => handleChange('warranty_claim_limits', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={8}>
                  <TextField
                    autoComplete='off'
                    label='Warranty Provider'
                    fullWidth
                    size='small'
                    value={item.warranty_provider}
                    onChange={e => handleChange('warranty_provider', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label='Warranty Expiry Date'
                      format='DD/MM/YYYY'
                      value={item.warranty_expiry_date}
                      onChange={val => handleChange('warranty_expiry_date', val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      disablePast
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            {item.item_type === 'Subscription' && (
              <>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Subscription Price *'
                    fullWidth
                    size='small'
                    value={item.subscription_price}
                    onChange={e => handleChange('subscription_price', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='Subscription Renewal Price *'
                    fullWidth
                    size='small'
                    value={item.subscription_renewal_price}
                    onChange={e => handleChange('subscription_renewal_price', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    autoComplete='off'
                    label='No of Devices *'
                    fullWidth
                    size='small'
                    value={item.no_of_devices}
                    onChange={e => handleChange('no_of_devices', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label='Subscription Start Date'
                      format='DD/MM/YYYY'
                      value={item.subscription_start_date}
                      onChange={val => handleChange('subscription_start_date', val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      disablePast
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label='Subscription End Date'
                      format='DD/MM/YYYY'
                      value={item.subscription_end_date}
                      onChange={val => handleChange('subscription_end_date', val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                      disablePast
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label='GST % *'
                    fullWidth
                    select
                    size='small'
                    value={item.gst}
                    onChange={e => handleChange('gst', e.target.value)}
                  >
                    {taxList.map((g, i) => (
                      <MenuItem key={i} value={g.tax_value}>
                        {g.tax_value}%
                      </MenuItem>
                    ))}
                    <MenuItem
                      onClick={() => addTaxChanges()}
                      sx={{
                        mt: 1,
                        border: '1px dashed #4CAF50',
                        borderRadius: 1,
                        color: '#4CAF50',
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'center',
                        py: 1.2,
                        '&:hover': {
                          backgroundColor: '#E8F5E9',
                          border: '1px solid #4CAF50'
                        }
                      }}
                    >
                      ➕ Add New Tax
                    </MenuItem>
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        <Box mt={5} display={'flex'} justifyContent={'space-between'}>
          {item.item_type === 'Product' && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'product_status')}
                checked={item?.product_status === 'Active'}
                label='Product Status'
              />
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'warranty_available')}
                checked={item?.warranty_available === 'Yes'}
                label='Warranty Available'
              />
            </>
          )}

          {item.item_type === 'Service' && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'service_status')}
                checked={item?.service_status === 'Active'}
                label='Service Status'
              />
            </>
          )}

          {item.item_type === 'License' && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'License_status')}
                checked={item?.license_status === 'Active'}
                label='license Status'
              />
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'subscription_included')}
                checked={item?.subscription_included === 'Yes'}
                label='Subscription Included'
              />
            </>
          )}

          {item.item_type === 'Warranty' && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'warranty_status')}
                checked={item?.warranty_status === 'Active'}
                label='Warranty Status'
              />
            </>
          )}

          {item.item_type === 'Subscription' && (
            <>
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'subscription_status')}
                checked={item?.subscription_status === 'Active'}
                label='Warranty Status'
              />
              <FormControlLabel
                control={<Checkbox />}
                onChange={e => handleCheck(e, 'auto_renewal_price')}
                checked={item?.auto_renewal_price === 'Yes'}
                label='Auto Renewal'
              />
            </>
          )}
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
