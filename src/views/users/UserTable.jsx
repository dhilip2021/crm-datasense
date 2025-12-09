'use client'

// MUI Imports
import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import Cookies from 'js-cookie'

import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CardContent from '@mui/material/CardContent'
import InputAdornment from '@mui/material/InputAdornment'
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select
} from '@mui/material'

//3rd Party api
import { ToastContainer, toast } from 'react-toastify'

// Component Imports
import Form from '@components/Form'
import { capitalizeWords, decrypCryptoRequest, encryptCryptoResponse, normalizeEmail } from '@/helper/frontendHelper'
import {
  checkMailApi,
  craeteUserApi,
  getAllOrganizationApi,
  getUserListApi,
  userPrivilegeApi
} from '@/apiFunctions/ApiAction'
import Link from 'next/link'

const isEmail = email => {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  if (email !== '' && email.match(emailFormat)) {
    return true
  }

  return false
}

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/

const UserTable = ({hasAddPermission, hasViewPermission, hasEditPermission, hasDeletePermission,type}) => {
  const organization_id = Cookies.get('organization_id')
  const item_access = Cookies.get('item_access')

  const itemTypes = item_access ? item_access.split(',').map(item => item.trim()) : [];
  const getToken = Cookies.get('_token')
  const rollId = Cookies.get('role_id')
  const router = useRouter()

  const [userId, setUserId] = useState('')
  const [edit, setEdit] = useState(false)
  const [orgList, setOrgList] = useState([])
  const [orgId, setOrgId] = useState('')

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [menuList, setMenuList] = useState([])
  const [loader, setLoader] = useState(false)

  const [inputs, setInputs] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    password: '',
    c_role_id: '',
    c_about_user: '',
    item_access: [],
    n_status: 1
  })

  const [errors, setErrors] = useState({
    id: false,
    first_name: false,
    last_name: false,
    email: false,
    mobile: false,
    password: false,
    c_role_id: false,
    c_about_user: false,
    item_access: false,
    n_status: false
  })

  const handleCheck = e => {
    if (e.target.checked) {
      setInputs({ ...inputs, n_status: 1 })
    } else {
      setInputs({ ...inputs, n_status: 0 })
    }
  }

  const getAllOrganizationList = async () => {
    const checkOrg = await getAllOrganizationApi()
    if (checkOrg?.appStatusCode === 0) {
      console.log(checkOrg, '<<< ORG LISTTTT')

      setOrgList(checkOrg?.payloadJson)
    } else {
      setOrgList([])
    }
  }

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleBlur = e => {
    const { name, value } = e.target
    if (name === 'email') {
      checkMail(value)
    }
  }

  const checkMail = async mail => {
    try {
      if (!mail || mail.trim() === '') return false

      const body = { email: mail }

      setLoader(true)
      const checkEmail = await checkMailApi(body)
      setLoader(false)
      console.log(userId, '<<< user IDDDD')

      if (checkEmail?.appStatusCode === 4) {
        // user exists
        if (userId === '') {
          setErrors(prev => ({ ...prev, email: true }))
          toast.error('Email already exists!', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })

          return false
        } else {
          setErrors(prev => ({ ...prev, email: false }))
          return true
        }
      } else {
        setErrors(prev => ({ ...prev, email: false }))
        return true
      }
    } catch (err) {
      setLoader(false)
      toast.error('Something went wrong while checking email', {
        autoClose: 500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      return false
    }
  }

  const handleOnOrgChange = e => {
    setOrgId(e.target.value)
  }

  const handleOnChange = e => {
    const { name, value, checked } = e.target

    if (name === 'first_name' || name === 'last_name') {
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
      setErrors({ ...errors, [name]: false })
    } else if (name === 'email') {
      setInputs({ ...inputs, [name]: normalizeEmail(value) })
      setErrors({ ...errors, [name]: false })
    } else if (
      name === 'Product' ||
      name === 'Service' ||
      name === 'License' ||
      name === 'Warranty' ||
      name === 'Subscription'
    ) {
      setErrors({ ...errors, item_access: false })

      // Add or remove from array
      let updated = [...inputs.item_access]
      if (checked) {
        updated.push(name)
      } else {
        updated = updated.filter(item => item !== name)
      }

      setInputs({ ...inputs, item_access: updated })
    } else {
      setInputs({ ...inputs, [name]: value })
      setErrors({ ...errors, [name]: false })
    }
  }
  // ✅ form submit
  const handleSubmit = async () => {
    try {
      // validate required fields
      if (inputs?.first_name === '') {
        setErrors({ ...errors, first_name: true })
        return
      }
      if (inputs?.last_name === '') {
        setErrors({ ...errors, last_name: true })
        return
      }
      if (inputs?.email === '') {
        setErrors({ ...errors, email: true })
        return
      }
      if (!isEmail(inputs?.email)) {
        setErrors({ ...errors, email: true })

        toast.error('Please enter valid Email', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        return
      }
      if (inputs?.password === '' && !edit) {
        setErrors({ ...errors, password: true })
        return
      }
      if (!inputs?.password.match(passRegex) && !edit) {
        setErrors({ ...errors, password: true })

        toast.error('Use strong password with letters, numbers & symbols', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        return
      }
      if (inputs?.c_role_id === '') {
        setErrors({ ...errors, c_role_id: true })
        return
      }

      // ✅ check email availability before submit
      const emailAvailable = await checkMail(inputs?.email)
      if (!emailAvailable) return // stop if already exists

      // ✅ prepare body
      const body = {
        organization_id: organization_id ? organization_id : orgId,
        first_name: inputs?.first_name,
        last_name: inputs?.last_name,
        c_about_user: inputs?.c_about_user,
        email: inputs?.email,
        mobile: inputs?.mobile,
        item_access: inputs?.item_access,
        role: '',
        c_role_id: inputs?.c_role_id,
        n_status: inputs?.n_status
      }

      if (!edit) {
        body['password'] = inputs?.password
      }
      if (inputs?.id !== '') {
        body['Id'] = inputs?.id
      }
      console.log(body,"<< mobile checkkk")
      const enycryptDAta = encryptCryptoResponse(body)
      const dataValue = { data: enycryptDAta }

      // ✅ API call
      setLoader(true)
      const results = await craeteUserApi(dataValue)
      setLoader(false)

      if (results?.appStatusCode !== 0) {
        toast.error(results?.error || 'Something went wrong', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      } else {
        toast.success(results?.message || 'User created successfully!', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        router.push('/users-list')
        setInputs({
          id: '',
          first_name: '',
          last_name: '',
          email: '',
          mobile: '',
          password: '',
          c_role_id: '',
          c_about_user: '',
          item_access: []
        })
      }
    } catch (err) {
      setLoader(false)
      toast.error('Unexpected error occurred!', {
        autoClose: 500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    }
  }

  const getUserListFn = async userId => {
    if (userId) {
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      try {
        setLoader(true)
        const results = await getUserListApi(userId, header)
        setLoader(false)
        if (results?.appStatusCode === 0) {
          console.log(results, '<<< user resultssss')

          setInputs({
            id: results?.payloadJson[0]?._id,
            first_name: results?.payloadJson[0]?.first_name,
            last_name: results?.payloadJson[0]?.last_name,
            // email: decrypCryptoRequest(results?.payloadJson[0]?.email),
            email: results?.payloadJson[0]?.email,
            mobile: results?.payloadJson[0]?.mobile,
            password: results?.payloadJson[0]?.password,
            c_role_id: results?.payloadJson[0]?.c_role_id,
            c_about_user: results?.payloadJson[0]?.c_about_user,
            n_status: results?.payloadJson[0]?.n_status,
            item_access: results?.payloadJson[0]?.item_access ? results?.payloadJson[0]?.item_access : [],
            
          })
        } else {
          console.log('error')
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  const GetAllRoleList = async () => {
    try {
      setLoader(true)
      const results = await userPrivilegeApi({
        role: ''
      })
      setLoader(false)
      setMenuList(results?.payloadJson)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {}, [])

  useEffect(() => {
    if (userId !== '') {
      getUserListFn(userId)
    }
  }, [userId])

  useEffect(() => {
    if (menuList?.length === 1) {
      setInputs({ ...inputs, c_role_id: menuList[0]?.c_role_id })
    }
  }, [menuList])

  useEffect(() => {
    GetAllRoleList()
    getAllOrganizationList()
    const fullUrl = window.location.href
    const segments = fullUrl.split('/')
    const id = segments.at(4) // or segments[segments.length - 1]

    if (id !== undefined) {
      setUserId(id)
      setEdit(true)
    } else {
      setUserId('')
      setEdit(false)
    }
  }, [])

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Card>
        <CardContent>
          <Form>
            <Grid container spacing={6}>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled={loader}
                  autoFocus
                  autoComplete='off'
                  fullWidth
                  label='First Name *'
                  placeholder='John'
                  name='first_name'
                  value={inputs.first_name}
                  onChange={handleOnChange}
                  error={errors?.first_name}
                  helperText={errors?.first_name && 'Please enter first name'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-user-3-line' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  autoComplete='off'
                  fullWidth
                  label='Last Name *'
                  placeholder='Doe'
                  name='last_name'
                  value={inputs.last_name}
                  onChange={handleOnChange}
                  error={errors?.last_name}
                  helperText={errors?.last_name && 'Please enter last name'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-user-3-line' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  autoComplete='off'
                  fullWidth
                  type='email *'
                  label='Email'
                  name='email'
                  value={inputs.email}
                  onChange={handleOnChange}
                  error={errors?.email}
                  helperText={
                    errors?.email && inputs?.email === ''
                      ? 'Please enter valid Email'
                      : errors?.email
                        ? 'Email already exists!'
                        : ''
                  }
                  placeholder='johndoe@gmail.com'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-mail-line' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                  onBlur={e => handleBlur(e)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  autoComplete='off'
                  fullWidth
                  type='mobile *'
                  label='Mobile'
                  name='mobile'
                  value={inputs.mobile}
                  onChange={handleOnChange}
                  error={errors?.mobile}
                  helperText={
                    errors?.mobile && inputs?.mobile === ''
                      ? 'Please enter valid Mobile'
                      : errors?.mobile
                        ? 'Mobile already exists!'
                        : ''
                  }
                  placeholder='+919876543210'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-mail-line' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
                  onBlur={e => handleBlur(e)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  disabled={edit}
                  autoComplete='new-password'
                  fullWidth
                  label='Password *'
                  placeholder='············'
                  id='form-layout-basic-password'
                  name='password'
                  value={inputs.password}
                  onChange={handleOnChange}
                  error={errors?.password}
                  helperText={errors?.password && 'Use 8 or more characters with a mix of letters, numbers & symbols'}
                  type={isPasswordShown ? 'text' : 'password'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-lock-line'></i>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle password visibility'
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id='form-layouts-separator-multiple-select-label'>Select Role *</InputLabel>
                  <Select
                    name='c_role_id'
                    value={inputs.c_role_id}
                    onChange={handleOnChange}
                    error={errors?.c_role_id}
                    helperText={errors?.c_role_id && 'Please select role'}
                    id='form-layouts-separator-multiple-select'
                    labelId='form-layouts-separator-multiple-select-label'
                    input={<OutlinedInput label='Language' id='select-multiple-language' />}
                    size='small'
                  >
                    {Array.isArray(menuList) &&
                      menuList?.map((data, index) => (
                        <MenuItem value={data?.c_role_id} key={index}>
                          {data?.c_role_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              {rollId === '27f01165688z' && (
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id='form-layouts-separator-multiple-select-label'>Select Organization</InputLabel>
                    <Select
                      name='org_id'
                      value={orgId}
                      onChange={handleOnOrgChange}
                      id='form-layouts-separator-multiple-select'
                      labelId='form-layouts-separator-multiple-select-label'
                      input={<OutlinedInput label='Language' id='select-multiple-language' />}
                      size='small'
                    >
                      {Array.isArray(orgList) &&
                        orgList?.map((data, index) => (
                          <MenuItem value={data?.organization_id} key={index}>
                            {data?.organization_name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  rows={4}
                  multiline
                  name='c_about_user'
                  value={inputs?.c_about_user}
                  onChange={handleOnChange}
                  label='About User'
                  placeholder='About...'
                  sx={{ '& .MuiOutlinedInput-root': { alignItems: 'baseline' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-message-2-line' />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                {/* <RadioGroup row value={inputs.item_access} name='item_access' onChange={e => handleOnChange(e)}>
                            {['Product', 'Service', 'License', 'Warranty', 'Subscription'].map(option => (
                              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
                            ))}
                          </RadioGroup> */}

                <Box mt={1}>
                  <FormControl component='fieldset' error={Boolean(errors.item_access)}>
                    {/* <FormGroup row>
                      {itemTypes.map(type => (
                        <FormControlLabel
                          key={type}
                          control={
                            <Checkbox
                              checked={inputs.item_access.includes(type)}
                              onChange={handleOnChange}
                              name={type}
                            />
                          }
                          label={type}
                        />
                      ))}
                    </FormGroup> */}

                    {/* <FormGroup row>
                      {itemTypes.map(option => (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                              name={option}
                              checked={inputs.item_access.includes(option)} // array ல check பண்ண
                              onChange={handleOnChange}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </FormGroup> */}
                     <FormGroup row>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={inputs.item_access.includes('Product')}
                            onChange={handleOnChange}
                            name='Product'
                          />
                        }
                        label='Product'
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={inputs.item_access.includes('Service')}
                            onChange={handleOnChange}
                            name='Service'
                          />
                        }
                        label='Service'
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={inputs.item_access.includes('License')}
                            onChange={handleOnChange}
                            name='License'
                          />
                        }
                        label='License'
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={inputs.item_access.includes('Warranty')}
                            onChange={handleOnChange}
                            name='Warranty'
                          />
                        }
                        label='Warranty'
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={inputs.item_access.includes('Subscription')}
                            onChange={handleOnChange}
                            name='Subscription'
                          />
                        }
                        label='Subscription'
                      />
                    </FormGroup>

                    {errors.item_access && <FormHelperText>Please select at least one item access</FormHelperText>}
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12} md={12}>
                <FormControlLabel
                  control={<Checkbox />}
                  onChange={handleCheck}
                  checked={inputs?.n_status === 1}
                  label='Status'
                />
              </Grid>

              <Grid item xs={12}>
                <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2} mt={4}>
                  <Link href={'/users-list'}>
                    <Button color='primary' variant='outlined'>
                      Cancel
                    </Button>
                  </Link>

                    {
                      type==="add" &&
                       <Button 
                    disabled={!hasAddPermission()}
                    variant='contained' type='submit' onClick={handleSubmit}>
                    Submit 
                  </Button>
                    }
                     {
                      type==="edit" &&
                       <Button 
                    disabled={!hasEditPermission()}
                    variant='contained' type='submit' onClick={handleSubmit}>
                    Submit
                  </Button>
                    }
                   
                  
                  
                </Box>
              </Grid>
            </Grid>
          </Form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UserTable
