'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// MUI Imports
import { Box, Card, CardContent, Grid, Button, TextField, InputAdornment, IconButton } from '@mui/material'

// Toast
import { ToastContainer, toast } from 'react-toastify'
import { changePasswordApi } from '@/apiFunctions/ApiAction'
import Cookies from 'js-cookie'

// Password Regex
const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/

const ChangePasswordView = () => {
  const router = useRouter()

  const getToken = Cookies.get('_token')

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [loader, setLoader] = useState(false)

  const [inputs, setInputs] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  // 👇 error messages ku string vachu vachom
  const [errors, setErrors] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleOnChange = e => {
    const { name, value } = e.target
    setInputs({ ...inputs, [name]: value })
    setErrors({ ...errors, [name]: '' }) // reset error msg
  }

   const logoutFn = () => {
      router.push('/login')
      Cookies.remove('riho_token')
      Cookies.remove('_token')
      Cookies.remove('_token_expiry')
      Cookies.remove('privileges')
      Cookies.remove('role_id')
      Cookies.remove('role_name')
      Cookies.remove('user_name')
      Cookies.remove('organization_id')
      Cookies.remove('organization_name')
      Cookies.remove('user_id')
      Cookies.remove('c_version')
      Cookies.remove('endedAt')
      
    }

  // ✅ form submit
  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if (inputs.old_password === '') {
        setErrors(prev => ({ ...prev, old_password: 'Old password is required' }))
        return
      } else if (inputs.new_password === '') {
        setErrors(prev => ({ ...prev, new_password: 'New password is required' }))
        return
      } else if (inputs.confirm_password === '') {
        setErrors(prev => ({ ...prev, confirm_password: 'Confirm password is required' }))
        return
      } else if (!inputs.old_password.match(passRegex)) {
        setErrors(prev => ({
          ...prev,
          old_password: 'Password must contain uppercase, lowercase, number & symbol (8-15 chars)'
        }))
        return
      } else if (!inputs.new_password.match(passRegex)) {
        setErrors(prev => ({
          ...prev,
          new_password: 'Password must contain uppercase, lowercase, number & symbol (8-15 chars)'
        }))
        return
      } else if (!inputs.confirm_password.match(passRegex)) {
        setErrors(prev => ({
          ...prev,
          confirm_password: 'Password must contain uppercase, lowercase, number & symbol (8-15 chars)'
        }))
        return
      } else if (inputs.new_password !== inputs.confirm_password) {
        setErrors(prev => ({ ...prev, confirm_password: 'Passwords do not match' }))
        return
      } else {
        const body = {
          c_old_pass: inputs.old_password,
          c_new_pass: inputs.new_password,
          c_confirm_pass: inputs.confirm_password
        }
        setLoader(true)

        // 🔥 API call panna place

        let results = await changePasswordApi(body, getToken)

        if (results) {
          

          if (results?.appStatusCode === 0) {
            setTimeout(() => {
              setLoader(false)
              toast.success(results?.message, {
                autoClose: 500, // 1 second la close
                position: 'bottom-center',
                hideProgressBar: true, // progress bar venam na
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined
              })
            }, 1500)

            logoutFn()


          } else {
            setTimeout(() => {
              setLoader(false)
              toast.error(results?.error, {
                autoClose: 500, // 1 second la close
                position: 'bottom-center',
                hideProgressBar: true, // progress bar venam na
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                progress: undefined
              })
            }, 1500)
          }
        } else {
          setTimeout(() => {
            setLoader(false)
            toast.error('Password not Changed ', {
              autoClose: 500, // 1 second la close
              position: 'bottom-center',
              hideProgressBar: true, // progress bar venam na
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              progress: undefined
            })
          }, 1500)
        }
      }
    } catch (err) {
      setLoader(false)
      toast.error('Unexpected error occurred!', { autoClose: 500, position: 'bottom-center' })
    }
  }

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Old Password */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Old Password *'
                  placeholder='**********'
                  name='old_password'
                  value={inputs.old_password}
                  onChange={handleOnChange}
                  error={!!errors.old_password}
                  helperText={errors.old_password}
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
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>

              {/* New Password */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='New Password *'
                  placeholder='**********'
                  name='new_password'
                  value={inputs.new_password}
                  onChange={handleOnChange}
                  error={!!errors.new_password}
                  helperText={errors.new_password}
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
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label='Confirm Password *'
                  placeholder='**********'
                  name='confirm_password'
                  value={inputs.confirm_password}
                  onChange={handleOnChange}
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password}
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
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  size='small'
                />
              </Grid>

              {/* Buttons */}
              <Grid item xs={12}>
                <Box display='flex' justifyContent='space-between' width='100%' mt={4}>
                  <Button color='primary' variant='outlined' onClick={() => router.push('/users-list')}>
                    Cancel
                  </Button>
                  <Button variant='contained' type='submit'>
                    Submit
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ChangePasswordView
