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
import { Box, Checkbox, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material'

//3rd Party api
import { ToastContainer, toast } from 'react-toastify'

// Component Imports
import Form from '@components/Form'
import { capitalizeWords, normalizeEmail } from '@/helper/frontendHelper'
import { craeteUserApi, getUserListApi, userPrivilegeApi } from '@/apiFunctions/ApiAction'
import Link from 'next/link'

const isEmail = email => {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  if (email !== '' && email.match(emailFormat)) {
    return true
  }

  return false
}

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/

const UserTable = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const router = useRouter()

  const [userId, setUserId] = useState('')
  const [edit, setEdit] = useState(false)

  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [menuList, setMenuList] = useState([])
  const [loader, setLoader] = useState(false)

  const [inputs, setInputs] = useState({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    c_role_id: '',
    c_about_user: '',
    n_status: 1
  })

  const handleCheck = (e) => {
    if (e.target.checked) {
      setInputs({ ...inputs, n_status: 1 });
    } else {
      setInputs({ ...inputs, n_status: 0 });
    }
  };

  const [errors, setErrors] = useState({
    id: false,
    first_name: false,
    last_name: false,
    email: false,
    password: false,
    c_role_id: false,
    c_about_user: false,
    n_status:false
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleOnChange = e => {
    const { name, value } = e.target

    if (name === 'first_name' || name === 'last_name') {
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
      setErrors({ ...errors, [name]: false })
    } else if (name === 'email') {
      setInputs({ ...inputs, [name]: normalizeEmail(value) })
      setErrors({ ...errors, [name]: false })
    } else {
      setInputs({ ...inputs, [name]: value })
      setErrors({ ...errors, [name]: false })
    }
  }

  const handleSubmit = async () => {
    if (inputs?.first_name === '') {
      setErrors({ ...errors, first_name: true })
    } else if (inputs?.last_name === '') {
      setErrors({ ...errors, last_name: true })
    } else if (inputs?.email === '') {
      setErrors({ ...errors, email: true })
    } else if (!isEmail(inputs?.email)) {
      setErrors({ ...errors, email: true })
    } else if (inputs?.password === '') {
      setErrors({ ...errors, password: true })
    } else if (!inputs?.password.match(passRegex) && !edit) {
      setErrors({ ...errors, password: true })
    } else if (inputs?.c_role_id === '') {
      setErrors({ ...errors, c_role_id: true })
    } else {
      const body = {
        organization_id: organization_id,
        first_name: inputs?.first_name,
        last_name: inputs?.last_name,
        c_about_user: inputs?.c_about_user,
        email: inputs?.email,
        role: '',
        c_role_id: inputs?.c_role_id,
        n_status: inputs?.n_status
      }
      if(!edit){
        body['password'] = inputs?.password
      }
      if (inputs?.id !== '') {
        body['Id'] = inputs?.id
      }

      setLoader(true)
      const results = await craeteUserApi(body)
      if (results?.appStatusCode !== 0) {
        setLoader(false)
        toast?.error(results?.error)
      } else {
        setLoader(false)
        toast?.success(results?.message)
        router.push('/users-list')
        setInputs({
          id:"",
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          c_role_id: '',
          c_about_user: ''
        })
      }
    }
  }

  const getUserListFn = async userId => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    try {
      setLoader(true)
      const results = await getUserListApi(userId, header)
      setLoader(false)
      if (results?.appStatusCode === 0) {
        setInputs({
          id: results?.payloadJson[0]?._id,
          first_name: results?.payloadJson[0]?.first_name,
          last_name: results?.payloadJson[0]?.last_name,
          email: results?.payloadJson[0]?.email,
          password: results?.payloadJson[0]?.password,
          c_role_id: results?.payloadJson[0]?.c_role_id,
          c_about_user: results?.payloadJson[0]?.c_about_user,
          n_status: results?.payloadJson[0]?.n_status
        })
      } else {
      }
    } catch (err) {
      console.log(err)
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
    if(menuList?.length === 1 ){
      setInputs({ ...inputs, "c_role_id":  menuList[0]?.c_role_id})
    }
  }, [menuList])
  

  useEffect(() => {
    GetAllRoleList()
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
                  helperText={errors?.email && 'Please enter valid Email'}
                  placeholder='johndoe@gmail.com'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <i className='ri-mail-line' />
                      </InputAdornment>
                    )
                  }}
                  size='small'
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
              <Grid item xs={12} md={12}>
              <FormControlLabel
              control={<Checkbox />}
              onChange={handleCheck}
              checked={inputs?.n_status === 1}
              label="Status"
            />
                </Grid>
            
         
              <Grid item xs={12}>
                <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2} mt={4}>
                  <Link href={'/users-list'}>
                    <Button color='primary' variant='outlined'>
                      Cancel
                    </Button>
                  </Link>
                  <Button variant='contained' type='submit' onClick={handleSubmit}>
                    Submit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        </CardContent>
        <ToastContainer />
      </Card>
    </Box>
  )
}

export default UserTable
