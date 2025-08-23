'use client'

import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { IconButton, InputAdornment } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify';

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { changePasswordApi } from '@/apiFunctions/ApiAction'

const ChangePassword = ({ mode }) => {
  const router = useRouter()

  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false)
  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowConfirmPassword = () => setIsConfirmPasswordShown(show => !show)

  const [toastFlag, setToastFlag] = useState(false)
  const [password, setPassword] = useState('')
  const [cfpassword, setCfpassword] = useState('')

  const [error, setError] = useState({
    password: false,
    cfpassword: false
  })

  const tokenPath = window.location.href.split('?').at(1)

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/

  const formSubmitHandle = () => {
    if (password === '') {
      setError({ ...error, password: true })
    } else if (cfpassword === '') {
      setError({ ...error, cfpassword: true })
    } else if (!password.match(passRegex)) {
      setError({ ...error, password: true })
    } else if (password !== cfpassword) {
      setError({ ...error, cfpassword: true })
    } else {
      changePasswordFn()
    }
  }

  const changePasswordFn = async () => {
    const body = {
      c_new_pass: password,
      c_confirm_pass: cfpassword
    }

    let results = await changePasswordApi(body, tokenPath)

    if (results) {
      toast.success('Password Changed Successfully', {
                                  autoClose: 500, // 1 second la close
                                  position: 'bottom-center',
                                  hideProgressBar: true, // progress bar venam na
                                  closeOnClick: true,
                                  pauseOnHover: false,
                                  draggable: false,
                                  progress: undefined
                                })

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      toast.error('Password not changed')
    }
  }

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Change Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Enter new your password & confirm password here!</Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              {/* <form noValidate autoComplete='off' className='flex flex-col gap-5'> */}
                <TextField
                  autoFocus
                  fullWidth
                  type={isPasswordShown ? 'text' : 'password'}
                  label='New Password'
                  defaultValue={password}
                  onChange={event => {
                    setPassword(event.target.value)
                    setError({ ...error, password: false, cfpassword: false })
                    setToastFlag(false)
                  }}
                  error={error.password}
                  helperText={error.password && (password !== ""? error.password && "Please enter atleast min 8 letters with one special character, one Uppercase and one Lowercase" : "Please Enter New Password")}
                  placeholder='eg: Test@123'
                  InputProps={{
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
                />
               

                <TextField
                  fullWidth
                  type={isConfirmPasswordShown ? 'text' : 'password'}
                  label='Confirm Password'
                  defaultValue={cfpassword}
                  onChange={event => {
                    setCfpassword(event.target.value)
                    setError({ ...error, password: false, cfpassword: false })
                    setToastFlag(false)
                  }}
                  error={error.cfpassword}
                  helperText={error.cfpassword && (cfpassword !== ""? error.cfpassword && "Password and Conform password should be the same" : "Please Enter confirm Password")}
                  
                  placeholder='eg: Test@123'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={e => e.preventDefault()}
                          aria-label='toggle confirm password visibility'
                        >
                          <i className={isConfirmPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <Button fullWidth variant='contained' type='submit' onClick={formSubmitHandle}>
                  Change Password
                </Button>
                <Typography className='flex justify-center items-center' color='primary'>
                  <Link href='/login' className='flex items-center'>
                    <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                    <span>Back to Login</span>
                  </Link>
                </Typography>
              {/* </form> */}
            </Form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
      <ToastContainer />
    </div>
  )
}

export default ChangePassword
