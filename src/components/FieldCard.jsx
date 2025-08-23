import React, { useEffect, useState } from 'react'
import {
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  FormLabel,
  Box,
  Button,
  Select,
  InputLabel,
  Tooltip,
  FormControl,
  Switch
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'


const FieldCard = ({ field, index, onUpdate, onDelete, removeField, handleMakeRequired, handleSetPermission }) => {
  const [editingFieldIndex, setEditingFieldIndex] = useState(null)

  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = event => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const [countryCodes, setCountryCodes] = useState([])

  const editPropertyClick = () => {
    if (editingFieldIndex === null) {
      setEditingFieldIndex(index)
      handleMenuClose()
    } else {
      setEditingFieldIndex(null)
      handleMenuClose()
    }
  }

  const renderProperties = () => {
    switch (field.type) {
      case 'Single Line':
        return (
          <>
            {/*  */}
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                Single Line Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
               <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size='small'
              label='Placeholder'
              value={field.placeholder || ''}
              onChange={e => onUpdate(index, { ...field, placeholder: e.target.value })}
            />

            <TextField
              fullWidth
              type='number'
              size='small'
              label='Min Number of characters'
              value={field.minChars || 3}
              onChange={e => onUpdate(index, { ...field, minChars: e.target.value })}
            />
            <TextField
              fullWidth
              type='number'
              size='small'
              label='Max Number of characters'
              value={field.maxChars || 255}
              onChange={e => onUpdate(index, { ...field, maxChars: e.target.value })}
            />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
                  />
                }
                label='Required'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.autoComplte || false}
                    onChange={e => onUpdate(index, { ...field, autoComplte: e.target.checked })}
                  />
                }
                label='Auto Complete'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.allowSplCharacter || false}
                    onChange={e => onUpdate(index, { ...field, allowSplCharacter: e.target.checked })}
                  />
                }
                label='Allow Special Charcter'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.allowDuplicate === false}
                    onChange={e => onUpdate(index, { ...field, allowDuplicate: !e.target.checked })}
                  />
                }
                label='Do not allow duplicate values'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isEncrypted || false}
                    onChange={e => onUpdate(index, { ...field, isEncrypted: e.target.checked })}
                  />
                }
                label='Encrypt field'
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isExternal || false}
                    onChange={e => onUpdate(index, { ...field, isExternal: e.target.checked })}
                  />
                }
                label='Set as External Field'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'Multi-Line':
        return (
          <>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Multi-Line Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size='small'
              label='Placeholder'
              value={field.placeholder || ''}
              onChange={e => onUpdate(index, { ...field, placeholder: e.target.value })}
            />

            <div>
              <Typography variant='body2'>Type:</Typography>
              <RadioGroup
                row
                value={field.subType || ''}
                onChange={e => onUpdate(index, { ...field, subType: e.target.value })}
              >
                {[
                  { label: 'Plain Text Small', value: 'plain-small' },
                  { label: 'Plain Text Large', value: 'plain-large' },
                  { label: 'Rich Text', value: 'rich' }
                ].map(opt => (
                  <FormControlLabel key={opt.value} value={opt.value} control={<Radio />} label={opt.label} />
                ))}
              </RadioGroup>
            </div>

            <div className='bg-green-100 text-sm p-2 rounded'>
              Character Limit: {field.subType === 'rich' ? 'Unlimited (Rich Text)' : '2000'}
              <br />
              (Remaining fields count in small type: 9/10)
              <br />
              (Remaining rich text fields: 5/5)
            </div>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
                  />
                }
                label='Required'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.autoComplte || false}
                    onChange={e => onUpdate(index, { ...field, autoComplte: e.target.checked })}
                  />
                }
                label='Auto Complete'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isEncrypted || false}
                    onChange={e => onUpdate(index, { ...field, isEncrypted: e.target.checked })}
                  />
                }
                label='Encrypt Field'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>

            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'Email':
        return (
          <>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                Email Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
               <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              size='small'
              label='Placeholder'
              value={field.placeholder || ''}
              onChange={e => onUpdate(index, { ...field, placeholder: e.target.value })}
            />
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
                  />
                }
                label='Required'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.autoComplte || false}
                    onChange={e => onUpdate(index, { ...field, autoComplte: e.target.checked })}
                  />
                }
                label='Auto Complete'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.noDuplicates || false}
                    onChange={e => onUpdate(index, { ...field, noDuplicates: e.target.checked })}
                  />
                }
                label='Do not allow duplicate values'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isEncrypted || false}
                    onChange={e => onUpdate(index, { ...field, isEncrypted: e.target.checked })}
                  />
                }
                label='Encrypt field'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'Phone':
        return (
          <div className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                Phone Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>

            {/* Country Code Selector */}
            <FormControl fullWidth size='small'>
              <InputLabel>Country Code</InputLabel>
              <Select
                value={field.countryCode || '+91'} // default India
                label='Country Code'
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    countryCode: e.target.value
                  })
                }
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300 // 👈 height limit
                    }
                  }
                }}
              >
                {countryCodes.map(country => (
                  <MenuItem key={country.code} value={country.dial_code}>
                    {country.code} {country.dial_code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 👉 Phone Input Preview (sync with country code) */}
            {/* <TextField
              fullWidth
              size='small'
              label='Phone Number'
              value={`${field.countryCode || '+91'} ${field.value || ''}`}
              onChange={e =>
                onUpdate(index, {
                  ...field,
                  value: e.target.value.replace(field.countryCode || '+91', '').trim()
                })
              }
              placeholder={field.placeholder || 'Enter phone number'}
              inputProps={{ maxLength: field.maxLength || 10 }}
            /> */}

            {/* Placeholder */}
            <TextField
              fullWidth
              size='small'
              label='Placeholder'
              value={field.placeholder || ''}
              onChange={e => onUpdate(index, { ...field, placeholder: e.target.value })}
            />

            {/* Max length */}
            <TextField
              type='number'
              label='Max Characters'
              fullWidth
              size='small'
              value={field.maxLength || ''}
              onChange={e =>
                onUpdate(index, {
                  ...field,
                  maxLength: parseInt(e.target.value || 0)
                })
              }
              placeholder='e.g. 10'
            />

            {/* Options */}
            {[
              { key: 'autoComplte', label: 'Auto Complete' },
              { key: 'required', label: 'Required' },
              { key: 'isPublic', label: 'Mark as Public' },
              { key: 'noDuplicates', label: 'Do not allow duplicate values' },
              { key: 'isEncrypted', label: 'Encrypt field' }
            ].map(opt => (
              <Box key={opt.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={opt.label}
                />
              </Box>
            ))}

            {/* Tooltip Section */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showTooltip || false}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      showTooltip: e.target.checked
                    })
                  }
                />
              }
              label='Show Tooltip'
            />

            {field.showTooltip && (
              <>
                <TextField
                  label='Tooltip Message'
                  multiline
                  fullWidth
                  rows={2}
                  size='small'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel component='legend' sx={{ mt: 1 }}>
                  Tooltip Display Type
                </FormLabel>
                <RadioGroup
                  row
                  name={`tooltipType-${field.id}`}
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </div>
        )

      case 'Dropdown':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Dropdown Options:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>

            {(field.options || []).map((opt, i) => (
              <Box key={i} display='flex' alignItems='center' gap={1}>
                <TextField
                  size='small'
                  fullWidth
                  value={opt}
                  onChange={e => {
                    const updated = [...field.options]
                    updated[i] = e.target.value
                    onUpdate(index, { ...field, options: updated })
                  }}
                  placeholder={`Option ${i + 1}`}
                />
                <IconButton
                  size='small'
                  onClick={() => {
                    const updated = field.options.filter((_, idx) => idx !== i)
                    // Remove defaultValue if it was the deleted one
                    const updatedField = {
                      ...field,
                      options: updated
                    }
                    if (field.defaultValue === opt) {
                      updatedField.defaultValue = ''
                    }
                    onUpdate(index, updatedField)
                  }}
                >
                  <CloseIcon fontSize='small' sx={{ color: 'gray' }} />
                </IconButton>
              </Box>
            ))}
            <Button
              onClick={() => onUpdate(index, { ...field, options: [...(field.options || []), ''] })}
              size='small'
              variant='text'
              sx={{ textTransform: 'none', pl: 0 }}
            >
              + Add Option
            </Button>

            <TextField
              label='Default Value'
              fullWidth
              size='small'
              select
              value={field.defaultValue || ''}
              onChange={e => onUpdate(index, { ...field, defaultValue: e.target.value })}
            >
              <MenuItem value=''>- None -</MenuItem>
              {(field.options || []).map((opt, i) => (
                <MenuItem key={i} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.trackHistory || false}
                  onChange={e => onUpdate(index, { ...field, trackHistory: e.target.checked })}
                />
              }
              label='Enable history tracking for picklist values'
            />

            <FormLabel>Sort order preference</FormLabel>
            <RadioGroup
              row
              name={`sortOrder-${field.id}`}
              value={field.sortOrder || 'entered'}
              onChange={e => onUpdate(index, { ...field, sortOrder: e.target.value })}
            >
              <FormControlLabel value='entered' control={<Radio />} label='Entered order' />
              <FormControlLabel value='alphabetical' control={<Radio />} label='Alphabetical order' />
            </RadioGroup>

            {[
              { key: 'required', label: 'Required' },
              { key: 'enableColor', label: 'Enable color for options' },
              { key: 'isPublic', label: 'Mark as Public' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={opt.label}
                />
              </Box>
            ))}

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showTooltip || false}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      showTooltip: e.target.checked
                    })
                  }
                />
              }
              label='Show Tooltip'
            />

            {field.showTooltip && (
              <>
                <TextField
                  label='Tooltip Message'
                  multiline
                  fullWidth
                  rows={2}
                  size='small'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel sx={{ mt: 1 }}>Tooltip Display Type</FormLabel>
                <RadioGroup
                  row
                  name={`tooltipType-${field.id}`}
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </Box>
        )

      case 'Switch':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                Toggle Settings:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </Box>

            {/* Default Value Switch */}
            <FormControlLabel
              control={
                <Switch
                  checked={field.defaultValue || false}
                  onChange={e => onUpdate(index, { ...field, defaultValue: e.target.checked })}
                />
              }
              label={`Default Value: ${field.defaultValue ? 'On' : 'Off'}`}
            />

            {/* History tracking */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.trackHistory || false}
                  onChange={e => onUpdate(index, { ...field, trackHistory: e.target.checked })}
                />
              }
              label='Enable history tracking for toggle changes'
            />

            {/* Extra common options */}
            {[
              { key: 'required', label: 'Required' },
              { key: 'isPublic', label: 'Mark as Public' }
            ].map(opt => (
              <Box key={opt.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e => onUpdate(index, { ...field, [opt.key]: e.target.checked })}
                    />
                  }
                  label={opt.label}
                />
              </Box>
            ))}

            {/* Tooltip Settings */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showTooltip || false}
                  onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                />
              }
              label='Show Tooltip'
            />

            {field.showTooltip && (
              <>
                <TextField
                  label='Tooltip Message'
                  multiline
                  fullWidth
                  rows={2}
                  size='small'
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel sx={{ mt: 1 }}>Tooltip Display Type</FormLabel>
                <RadioGroup
                  row
                  name={`tooltipType-${field.id}`}
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </Box>
        )

      case 'RadioButton':
        return (
          <Box className='space-y-3'>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
              <Typography variant='body2' fontWeight='medium'>
                Radio Button Options:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </Box>

            {(field.options || []).map((opt, i) => (
              <Box key={i} display='flex' alignItems='center' gap={1}>
                <TextField
                  size='small'
                  fullWidth
                  value={opt}
                  onChange={e => {
                    const updated = [...field.options]
                    updated[i] = e.target.value
                    onUpdate(index, { ...field, options: updated })
                  }}
                  placeholder={`Option ${i + 1}`}
                />
                <IconButton
                  size='small'
                  onClick={() => {
                    const updated = field.options.filter((_, idx) => idx !== i)
                    const updatedField = {
                      ...field,
                      options: updated
                    }
                    if (field.defaultValue === opt) {
                      updatedField.defaultValue = ''
                    }
                    onUpdate(index, updatedField)
                  }}
                >
                  <CloseIcon fontSize='small' sx={{ color: 'gray' }} />
                </IconButton>
              </Box>
            ))}

            <Button
              onClick={() => onUpdate(index, { ...field, options: [...(field.options || []), ''] })}
              size='small'
              variant='text'
              sx={{ textTransform: 'none', pl: 0 }}
            >
              + Add Option
            </Button>

            <Box>
              <FormLabel>Default Selected Option</FormLabel>
              <RadioGroup
                value={field.defaultValue || ''}
                onChange={e => onUpdate(index, { ...field, defaultValue: e.target.value })}
              >
                {(field.options || []).map((opt, i) => (
                  <FormControlLabel key={i} value={opt} control={<Radio />} label={opt || `Option ${i + 1}`} />
                ))}
              </RadioGroup>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.trackHistory || false}
                    onChange={e => onUpdate(index, { ...field, trackHistory: e.target.checked })}
                  />
                }
                label='Enable history tracking for radio selection'
              />
            </Box>
            <Box>
              <FormLabel>Sort order preference</FormLabel>
              <RadioGroup
                row
                name={`sortOrder-${field.id}`}
                value={field.sortOrder || 'entered'}
                onChange={e => onUpdate(index, { ...field, sortOrder: e.target.value })}
              >
                <FormControlLabel value='entered' control={<Radio />} label='Entered order' />
                <FormControlLabel value='alphabetical' control={<Radio />} label='Alphabetical order' />
              </RadioGroup>
            </Box>

            {[
              { key: 'required', label: 'Required' },
              { key: 'isPublic', label: 'Mark as Public' }
            ].map(opt => (
              <Box key={opt.key}>
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field[opt.key] || false}
                        onChange={e =>
                          onUpdate(index, {
                            ...field,
                            [opt.key]: e.target.checked
                          })
                        }
                      />
                    }
                    label={opt.label}
                  />
                </Box>
              </Box>
            ))}

            <FormControlLabel
              control={
                <Checkbox
                  checked={field.showTooltip || false}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      showTooltip: e.target.checked
                    })
                  }
                />
              }
              label='Show Tooltip'
            />

            {field.showTooltip && (
              <>
                <TextField
                  label='Tooltip Message'
                  multiline
                  fullWidth
                  rows={2}
                  size='small'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel sx={{ mt: 1 }}>Tooltip Display Type</FormLabel>
                <RadioGroup
                  row
                  name={`tooltipType-${field.id}`}
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </Box>
        )

      case 'Multi-Select':
        return (
          <Box className='space-y-3'>
            {/* Options */}
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Multi Select Options:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <CloseIcon sx={{ color: 'red' }} />
              </IconButton>
            </Box>
            {(field.options || []).map((opt, i) => (
              <TextField
                key={i}
                fullWidth
                size='small'
                value={opt}
                onChange={e => {
                  const updated = [...field.options]
                  updated[i] = e.target.value
                  onUpdate(index, { ...field, options: updated })
                }}
                placeholder={`Option ${i + 1}`}
              />
            ))}
            <Button
              variant='text'
              size='small'
              onClick={() =>
                onUpdate(index, {
                  ...field,
                  options: [...(field.options || []), '']
                })
              }
            >
              + Add Option
            </Button>

            {/* Default values multi-select */}
            <Box>
              <FormLabel sx={{ mt: 2 }}>Select default value(s)</FormLabel>
              <Select
                fullWidth
                size='small'
                multiple
                value={field.defaultValue || []}
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    defaultValue: e.target.value
                  })
                }
                renderValue={selected => selected.join(', ')}
              >
                {(field.options || []).map((opt, i) => (
                  <MenuItem key={i} value={opt}>
                    <Checkbox checked={field.defaultValue?.includes(opt)} />
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Sort Order */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.sortOrder === 'alphabetical'}
                    onChange={e => {
                      const value = e.target.checked ? 'alphabetical' : 'entered'
                      onUpdate(index, { ...field, sortOrder: value })
                    }}
                  />
                }
                label='Display values alphabetically, instead of in the order entered'
              />
            </Box>

            {/* Boolean options */}
            {[
              { key: 'required', label: 'Required' },
              { key: 'isPublic', label: 'Mark as Public' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={opt.label}
                />
              </Box>
            ))}

            {/* Tooltip toggle */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e =>
                      onUpdate(index, {
                        ...field,
                        showTooltip: e.target.checked
                      })
                    }
                  />
                }
                label='Show Tooltip'
              />
            </Box>

            {/* Tooltip config */}
            {field.showTooltip && (
              <>
                <TextField
                  label='Tooltip Message'
                  fullWidth
                  multiline
                  size='small'
                  rows={2}
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel component='legend' sx={{ mt: 1 }}>
                  Tooltip Display Type
                </FormLabel>
                <RadioGroup
                  row
                  name={`tooltipType-${field.id}`}
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </Box>
        )

      case 'Date':
        return (
          <>
            {/* Options */}
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Date Properties::
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
                  />
                }
                label='Required'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.allowPastDate || false}
                    onChange={e => onUpdate(index, { ...field, allowPastDate: e.target.checked })}
                  />
                }
                label='Not Allow Past Date'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isEncrypted || false}
                    onChange={e => onUpdate(index, { ...field, isEncrypted: e.target.checked })}
                  />
                }
                label='Encrypt field'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'Date Time':
        return (
          <>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Date and Time Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.required || false}
                    onChange={e => onUpdate(index, { ...field, required: e.target.checked })}
                  />
                }
                label='Required'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isEncrypted || false}
                    onChange={e => onUpdate(index, { ...field, isEncrypted: e.target.checked })}
                  />
                }
                label='Encrypt field'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'Number':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Number Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* Maximum Digits Allowed */}
            <Box display='flex' alignItems='center' gap={2}>
              <Box flex={1}>
                <InputLabel shrink>Maximum digits allowed</InputLabel>
                <Select
                  fullWidth
                  size='small'
                  value={field.maxDigits || 9}
                  onChange={e => onUpdate(index, { ...field, maxDigits: e.target.value })}
                >
                  {[...Array(21)].map((_, i) => (
                    <MenuItem key={i} value={i + 1}>
                      {i + 1}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>Digits</Box>
            </Box>

            {/* Checkbox Options */}
            {[
              {
                key: 'required',
                label: 'Required'
              },
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Anyone viewing this record can see this field'
              },
              {
                key: 'noDuplicates',
                label: 'Do not allow duplicate values',
                tooltip: 'Each record should have a unique value for this field'
              },
              {
                key: 'isEncrypted',
                label: 'Encrypt field',
                tooltip: 'Field value is stored securely in encrypted format'
              },
              {
                key: 'showNumberSeparator',
                label: 'Display with Number separator',
                tooltip: '12345678 becomes 12,345,678'
              },
              {
                key: 'showTooltip',
                label: 'Show Tooltip'
              }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          <InfoOutlinedIcon fontSize='small' color='action' />
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip Message + Type */}
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  size='small'
                  label='Tooltip Message'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  rows={2}
                  inputProps={{ maxLength: 255 }}
                  placeholder='Type tooltip message'
                />

                <FormLabel sx={{ mt: 1 }}>Tooltip Display Type</FormLabel>
                <Box display='flex' gap={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.tooltipType === 'icon'}
                        onChange={() =>
                          onUpdate(index, {
                            ...field,
                            tooltipType: 'icon'
                          })
                        }
                      />
                    }
                    label='Info Icon'
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.tooltipType === 'static'}
                        onChange={() =>
                          onUpdate(index, {
                            ...field,
                            tooltipType: 'static'
                          })
                        }
                      />
                    }
                    label='Static Text'
                  />
                </Box>
              </>
            )}
          </Box>
        )

      case 'Auto-Number':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Auto Number Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* Auto-Number Format Label */}
            <Box display='flex' alignItems='center' gap={1}>
              <InputLabel shrink>Auto-Number Format</InputLabel>
              <Tooltip title='Define how the number should be generated' arrow>
                <InfoOutlinedIcon fontSize='small' color='action' />
              </Tooltip>
            </Box>

            {/* Prefix */}
            <TextField
              fullWidth
              size='small'
              label='Prefix'
              value={field.prefix || ''}
              onChange={e => onUpdate(index, { ...field, prefix: e.target.value })}
            />

            {/* Starting Number */}
            <TextField
              fullWidth
              required
              size='small'
              label='Starting Number'
              type='number'
              value={field.startingNumber || ''}
              onChange={e =>
                onUpdate(index, {
                  ...field,
                  startingNumber: e.target.value
                })
              }
            />

            {/* Suffix */}
            <TextField
              fullWidth
              size='small'
              label='Suffix'
              value={field.suffix || ''}
              onChange={e => onUpdate(index, { ...field, suffix: e.target.value })}
            />

            {/* Preview */}
            <Typography variant='body2' color='primary' sx={{ fontWeight: 500 }}>
              Preview: {`${field.prefix || ''}${field.startingNumber || ''}${field.suffix || ''}`}
            </Typography>

            {/* Checkboxes */}
            {[
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Anyone viewing this record can see this field'
              },
              {
                key: 'updateExisting',
                label: 'Also update existing records'
              },
              {
                key: 'showTooltip',
                label: 'Show Tooltip'
              }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          <InfoOutlinedIcon fontSize='small' color='action' />
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip message (only if enabled) */}
            {field.showTooltip && (
              <TextField
                fullWidth
                size='small'
                multiline
                label='Tooltip Message'
                value={field.tooltipMessage || ''}
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    tooltipMessage: e.target.value
                  })
                }
                placeholder='Type tooltip message'
                rows={2}
              />
            )}
          </Box>
        )

      case 'Currency':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Currency Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* Max Digits Allowed */}
            <FormControl fullWidth size='small'>
              <InputLabel>Maximum digits allowed</InputLabel>
              <Select
                label='Maximum digits allowed'
                value={field.maxDigits || 16}
                onChange={e => onUpdate(index, { ...field, maxDigits: e.target.value })}
              >
                {[...Array(20).keys()].map(n => (
                  <MenuItem key={n + 1} value={n + 1}>
                    {n + 1}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant='caption' color='text.secondary'>
                Eg: 12345.55
              </Typography>
            </FormControl>

            {/* Decimal Places */}
            <FormControl fullWidth size='small'>
              <InputLabel>Number of decimal places</InputLabel>
              <Select
                label='Number of decimal places'
                value={field.decimalPlaces || 2}
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    decimalPlaces: e.target.value
                  })
                }
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant='caption' color='text.secondary'>
                Eg: 12345.55
              </Typography>
            </FormControl>

            {/* Rounding Option */}
            <FormControl fullWidth size='small'>
              <InputLabel>Rounding Option</InputLabel>
              <Select
                label='Rounding Option'
                value={field.rounding || 'Normal'}
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    rounding: e.target.value
                  })
                }
              >
                <MenuItem value='Normal'>Normal</MenuItem>
                <MenuItem value='Round Up'>Round Up</MenuItem>
                <MenuItem value='Round Down'>Round Down</MenuItem>
              </Select>
            </FormControl>

            {/* Checkboxes */}
            {[
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Anyone viewing this record can see this field'
              },
              { key: 'required', label: 'Required' },
              {
                key: 'encrypt',
                label: 'Encrypt field',
                tooltip: 'Value will be stored securely'
              },
              { key: 'showTooltip', label: 'Show Tooltip' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          {opt.key === 'encrypt' ? (
                            <HelpOutlineIcon fontSize='small' color='action' />
                          ) : (
                            <InfoOutlinedIcon fontSize='small' color='action' />
                          )}
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip Text */}
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </Box>
        )

      case 'Decimal':
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Decimal Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
               <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* Max Digits */}
            <FormControl fullWidth size='small'>
              <InputLabel>Maximum digits allowed</InputLabel>
              <Select
                label='Maximum digits allowed'
                value={field.maxDigits || 16}
                onChange={e => onUpdate(index, { ...field, maxDigits: e.target.value })}
              >
                {[...Array(20).keys()].map(n => (
                  <MenuItem key={n + 1} value={n + 1}>
                    {n + 1}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant='caption' color='text.secondary'>
                Digits
              </Typography>
            </FormControl>

            {/* Decimal Places */}
            <FormControl fullWidth size='small'>
              <InputLabel>Number of decimal places</InputLabel>
              <Select
                label='Number of decimal places'
                value={field.decimalPlaces || 2}
                onChange={e =>
                  onUpdate(index, {
                    ...field,
                    decimalPlaces: e.target.value
                  })
                }
              >
                {[0, 1, 2, 3, 4].map(n => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant='caption' color='text.secondary'>
                Decimal
              </Typography>
            </FormControl>

            {/* Checkboxes */}
            {[
              { key: 'required', label: 'Required' },
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Anyone viewing this record can see this field'
              },
              {
                key: 'encrypt',
                label: 'Encrypt field',
                tooltip: 'Value will be stored securely'
              },
              {
                key: 'numberSeparator',
                label: 'Display with Number separator',
                tooltip: 'Show thousands separator, e.g., 1,00,000'
              },
              { key: 'showTooltip', label: 'Show Tooltip' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          {opt.key === 'encrypt' ? (
                            <HelpOutlineIcon fontSize='small' color='action' />
                          ) : (
                            <InfoOutlinedIcon fontSize='small' color='action' />
                          )}
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip Text + Icon Type */}
            {field.showTooltip && (
              <Box>
                <TextField
                  fullWidth
                  size='small'
                  multiline
                  label='Tooltip Message'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  rows={2}
                  helperText='Max of 255 characters'
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio size='small' />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio size='small' />} label='Static Text' />
                </RadioGroup>
              </Box>
            )}
          </Box>
        )

      case 'User': {
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                User Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
               <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* User Type (Single / Multiple) */}
            <FormControl component='fieldset'>
              <RadioGroup
                row
                value={field.userType || 'single'}
                onChange={e => onUpdate(index, { ...field, userType: e.target.value })}
              >
                <FormControlLabel value='single' control={<Radio size='small' />} label='Single User' />
                <FormControlLabel value='multiple' control={<Radio size='small' />} label='Multiple Users' />
              </RadioGroup>
            </FormControl>

            {/* Allow Record Accessibility */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.allowAccess || false}
                  onChange={e => onUpdate(index, { ...field, allowAccess: e.target.checked })}
                />
              }
              label={
                <Box display='flex' alignItems='center' gap={0.5}>
                  Allow Record Accessibility
                  <Tooltip title='Choose access level for selected users' arrow>
                    <InfoOutlinedIcon fontSize='small' color='action' />
                  </Tooltip>
                </Box>
              }
            />

            {/* Permission Dropdown */}
            {field.allowAccess && (
              <FormControl fullWidth size='small'>
                <InputLabel>Permission</InputLabel>
                <Select
                  label='Permission'
                  value={field.permission || 'Full Access'}
                  onChange={e => onUpdate(index, { ...field, permission: e.target.value })}
                >
                  <MenuItem value='Full Access'>Full Access</MenuItem>
                  <MenuItem value='Read Write'>Read Write</MenuItem>
                  <MenuItem value='Read Only'>Read Only</MenuItem>
                </Select>
              </FormControl>
            )}

            {/* Additional Options */}
            {[
              { key: 'required', label: 'Required' },
              { key: 'filterUsers', label: 'Filter Users' },
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Visible to all users with access'
              },
              { key: 'showTooltip', label: 'Show Tooltip' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e => onUpdate(index, { ...field, [opt.key]: e.target.checked })}
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          <InfoOutlinedIcon fontSize='small' color='action' />
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip Config */}
            {field.showTooltip && (
              <Box>
                <TextField
                  fullWidth
                  size='small'
                  multiline
                  label='Tooltip Message'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  rows={2}
                  helperText='Max of 255 characters'
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio size='small' />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio size='small' />} label='Static Text' />
                </RadioGroup>
              </Box>
            )}
          </Box>
        )
      }

      case 'Checkbox':
        return (
          <>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                Checkbox Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.isPublic || false}
                    onChange={e => onUpdate(index, { ...field, isPublic: e.target.checked })}
                  />
                }
                label='Mark as Public'
              />
            </Box>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.noDuplicates || false}
                    onChange={e => onUpdate(index, { ...field, noDuplicates: e.target.checked })}
                  />
                }
                label='Enable by Default'
              />
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={field.showTooltip || false}
                    onChange={e => onUpdate(index, { ...field, showTooltip: e.target.checked })}
                  />
                }
                label='Show Tooltip'
              />
            </Box>
            {field.showTooltip && (
              <>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Tooltip Message'
                  inputProps={{ maxLength: 255 }}
                  value={field.tooltipMessage || ''}
                  onChange={e => onUpdate(index, { ...field, tooltipMessage: e.target.value })}
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e => onUpdate(index, { ...field, tooltipType: e.target.value })}
                >
                  <FormControlLabel value='icon' control={<Radio />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio />} label='Static Text' />
                </RadioGroup>
              </>
            )}
          </>
        )

      case 'URL': {
        return (
          <Box className='space-y-3'>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              <Typography variant='body2' fontWeight='medium'>
                {' '}
                URL Properties:
              </Typography>
              <IconButton aria-label='close' onClick={() => editPropertyClick()}>
                <VisibilityOffIcon sx={{ color: 'gray' }} />
              </IconButton>
            </Box>
            {/* Field Label */}
            <TextField
              fullWidth
              required
              size='small'
              label='Field Label'
              value={field.label || ''}
              onChange={e => onUpdate(index, { ...field, label: e.target.value })}
            />

            {/* Max characters allowed */}
            <TextField
              fullWidth
              required
              type='number'
              size='small'
              label='Number of characters allowed'
              inputProps={{ min: 1, max: 450 }}
              value={field.maxCharacters || 450}
              onChange={e =>
                onUpdate(index, {
                  ...field,
                  maxCharacters: parseInt(e.target.value) || 1
                })
              }
              helperText={`Max of ${field.maxCharacters || 450} characters`}
            />

            {/* Checkboxes with optional tooltips */}
            {[
              { key: 'required', label: 'Required' },
              {
                key: 'isPublic',
                label: 'Mark as Public',
                tooltip: 'Anyone viewing this record can see this field'
              },
              {
                key: 'noDuplicate',
                label: 'Do not allow duplicate values',
                tooltip: 'Each record must have a unique value'
              },
              {
                key: 'encrypt',
                label: 'Encrypt field',
                tooltip: 'Value will be stored securely'
              },
              { key: 'showTooltip', label: 'Show Tooltip' }
            ].map(opt => (
              <Box>
                <FormControlLabel
                  key={opt.key}
                  control={
                    <Checkbox
                      checked={field[opt.key] || false}
                      onChange={e =>
                        onUpdate(index, {
                          ...field,
                          [opt.key]: e.target.checked
                        })
                      }
                    />
                  }
                  label={
                    <Box display='flex' alignItems='center' gap={0.5}>
                      {opt.label}
                      {opt.tooltip && (
                        <Tooltip title={opt.tooltip} arrow>
                          <InfoOutlinedIcon fontSize='small' color='action' />
                        </Tooltip>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}

            {/* Tooltip Message input if Show Tooltip is enabled */}
            {field.showTooltip && (
              <Box>
                <TextField
                  fullWidth
                  size='small'
                  multiline
                  rows={2}
                  label='Tooltip Message'
                  value={field.tooltipMessage || ''}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipMessage: e.target.value
                    })
                  }
                  helperText='Max of 255 characters'
                />

                <RadioGroup
                  row
                  value={field.tooltipType || 'icon'}
                  onChange={e =>
                    onUpdate(index, {
                      ...field,
                      tooltipType: e.target.value
                    })
                  }
                >
                  <FormControlLabel value='icon' control={<Radio size='small' />} label='Info Icon' />
                  <FormControlLabel value='static' control={<Radio size='small' />} label='Static Text' />
                </RadioGroup>
              </Box>
            )}
          </Box>
        )
      }

      default:
        return null
    }
  }

  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
  }, [])

  return (
    <div className='border rounded p-3 bg-white mb-4 shadow-sm'>
      <div className='flex justify-between items-start'>
        <div>
          <Typography fontWeight='medium'>
            {field.label}
            {field.required && (
              <Typography component='span' sx={{ color: 'red', ml: 0.5 }}>
                *
              </Typography>
            )}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {field.type}
          </Typography>
        </div>

        <div>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                handleMakeRequired(index)
                handleMenuClose()
              }}
            >
              Mark as required
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSetPermission(index)
                handleMenuClose()
              }}
            >
              Set Permission
            </MenuItem>
            <MenuItem onClick={() => editPropertyClick()}>
              {editingFieldIndex === null ? 'Edit Properties' : 'Close Properties'}{' '}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(index)
                handleMenuClose()
              }}
              sx={{ color: 'red' }}
            >
              Remove Field
            </MenuItem>
          </Menu>
        </div>
      </div>

      {editingFieldIndex === index && <div className='mt-4 space-y-3 border-t pt-3'>{renderProperties()}</div>}
    </div>
  )
}

export default FieldCard
