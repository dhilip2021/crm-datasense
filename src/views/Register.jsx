/* eslint-disable react-hooks/exhaustive-deps */
'use client'

// React Imports
import { useEffect, useState } from 'react'
// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { ToastContainer, toast } from 'react-toastify'
// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import {
  addFieldApi,
  addOrganizationApi,
  checkMailApi,
  craeteUserApi,
  getOrganizationApi,
  sendOtpApi,
  verifyOtpApi
} from '@/apiFunctions/ApiAction'
import { Box, IconButton, InputAdornment } from '@mui/material'
import { encryptCryptoResponse } from '@/helper/frontendHelper'

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function isValidMobileNumberStrict(value) {
  if (value?.length > 10) {
    return false
  } else {
    if (!/^\d+$/.test(value)) return false

    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[6-9][0-9]*$/
    return regex.test(digitsOnly)
  }
}

function isValidOTPStrict(value) {
  if (value?.length > 10) {
    return false
  } else {
    if (!/^\d+$/.test(value)) return false

    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[0-9][0-9]*$/
    return regex.test(digitsOnly)
  }
}
function normalizeEmail(email) {
  return email.toLowerCase()
}

const Register = ({ mode }) => {
  const router = useRouter()

  // States
  const [inputs, setInputs] = useState({
    organaization_name: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    otp: ''
  })

  const [errorInputs, setErrorInputs] = useState({
    organaization_name: false,
    first_name: false,
    last_name: false,
    email: false,
    mobile: false,
    otp: false
  })

  const [loader, setLoader] = useState(false)

  const [errOrgName, setErrOrgName] = useState('')
  const [errFname, setErrFname] = useState('')
  const [errLname, setErrLname] = useState('')
  const [errMobile, setErrMobile] = useState('')
  const [errOtp, setErrOtp] = useState('')
  const [otpCheck, setOtpCheck] = useState(false)
  const [otpVerify, setOtpVerify] = useState(false)

  const [errEmail, setErrEmail] = useState('')
  const [errEmailCheck, setErrEmailCheck] = useState('')
  const [loaderEmail, setLoaderEmail] = useState(false)

  const isEmail = email => {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

    if (email !== '' && email.match(emailFormat)) {
      return true
    }

    return false
  }

  const isMobile = value => {
    const regex = /^[6-9]\d{9}$/ // Indian mobile format
    return regex.test(value)
  }

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const handleBlur = async e => {
    const { name, value } = e.target

    if (name === 'organaization_name') {
      if (value === '') {
        setErrorInputs({ ...errorInputs, [name]: true })
        setErrOrgName('Please enter Organization name')
      } else if (value.length < 3 || value.length > 120) {
        setErrorInputs(prev => ({ ...prev, [name]: true }))
        setErrOrgName('minimum 3 character and maximum 120')
      } else {
        const checkOrgName = await getOrganizationApi(value)

        if (checkOrgName.appStatusCode === 0) {
          setErrorInputs({ ...errorInputs, organaization_name: true })
          setErrOrgName('This Organization already created !!!')
        } else {
          setErrorInputs({ ...errorInputs, organaization_name: false })
          setErrOrgName('')
        }
      }
    } else if (name === 'first_name') {
      if (value.length < 3 || value.length > 40) {
        setErrorInputs(prev => ({ ...prev, [name]: true }))
        setErrFname('minimum 3 character and maximum 40')
      }
    } else if (name === 'last_name') {
      if (value.length !== '') {
        if (value.length > 40) {
          setErrorInputs(prev => ({ ...prev, [name]: true }))
          setErrLname('minimum 1 character and maximum 40')
        }
      }
    } else if (name === 'mobile') {
      if (value !== '') {
        if (value.length < 10) {
          setErrorInputs(prev => ({ ...prev, [name]: true }))
          setErrMobile('Please enter valid phone number')
        } else {
          isMobile(value)
        }
      }
    } else if (name === 'email') {
      if (!isEmail(value)) {
        setErrorInputs(prev => ({ ...prev, [name]: true }))
        setErrEmail('Please enter valid email')
      }
    } else if (name === 'otp') {
      if (value !== '') {
        if (value.length < 4) {
          setErrorInputs(prev => ({ ...prev, [name]: true }))
          setErrOtp('Please enter valid otp')
        }
      }
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'organaization_name') {
      setErrorInputs({ ...errorInputs, organaization_name: false })
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
    } else if (name === 'first_name') {
      setErrorInputs({ ...errorInputs, first_name: false })
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
    } else if (name === 'last_name') {
      setErrorInputs({ ...errorInputs, last_name: false })
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
    } else if (name === 'mobile') {
      const res = isValidMobileNumberStrict(value)
      if (value === '' || res) {
        setErrorInputs({ ...errorInputs, mobile: false })
        setInputs({ ...inputs, [name]: value })
      }
    } else if (name === 'email') {
      setOtpCheck(false)
      setErrEmailCheck('')
      setErrEmail('')
      setErrorInputs({ ...errorInputs, email: false })
      setInputs({ ...inputs, [name]: normalizeEmail(value.toLowerCase()) })
      // if (!isEmail(value)) {
      //   setErrorInputs({ ...errorInputs, email: true })
      //   setErrEmail('Please enter valid email')
      //   setInputs({ ...inputs, [name]: normalizeEmail(value.toLowerCase()) })
      // } else {
      //   setErrEmail('')
      //   setErrorInputs({ ...errorInputs, email: false })
      //   setInputs({ ...inputs, [name]: normalizeEmail(value.toLowerCase()) })
      // }
    } else if (name === 'otp') {
      const res = isValidOTPStrict(value)

      if (value === '' || res) {
        setErrorInputs({ ...errorInputs, otp: false })
        setInputs({ ...inputs, [name]: value })
      }
    }
  }

  const verrifyOtpfn = async (email, otp) => {
    const body = {
      email: email,
      otp: otp
    }
    const header = {
      'Content-Type': 'application/json'
    }
    setOtpVerify(true)
    const otpRes = await verifyOtpApi(body, header)
    if (otpRes?.appStatusCode === 0) {
      setOtpVerify(false)
      toast.success('OTP verified Successfully', {
        autoClose: 1500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    } else {
      setErrorInputs({ ...errorInputs, otp: true })
      toast.error(otpRes?.message, {
        autoClose: 1500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      setOtpVerify(false)
    }
  }

  const sendOtpfn = async email => {
    const body = {
      email: email
    }
    const header = {
      'Content-Type': 'application/json'
    }
    const otpRes = await sendOtpApi(body, header)
    if (otpRes?.appStatusCode === 0) {
      setOtpCheck(true)
      toast.success('OTP send your mail', {
        autoClose: 1500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    } else {
      setOtpCheck(false)
    }
  }

  const handleOTPSubmit = () => {
    sendOtpfn(inputs?.email)
  }

  const handleSubmit = async () => {
    const body = {
      organization_name: inputs?.organaization_name,
      c_version: 'Trial'
    }

    if (inputs?.email === '') {
      setErrorInputs({ ...errorInputs, email: true })
      setErrEmail('Please enter valid email')
    } else if (!isEmail(inputs?.email)) {
      setErrorInputs({ ...errorInputs, email: true })
      setErrEmail('Please enter valid email')
    } else {
      const result = await addOrganizationApi(body)

      if (result?.appStatusCode === 0) {
        const body1 = {
          first_name: inputs?.first_name,
          last_name: inputs?.last_name,
          c_about_user: 'Admin',
          email: inputs?.email,
          mobile: inputs?.mobile,
          role: '',
          c_role_id: '16f01165898b',
          c_user_img_url: ''
        }
        setLoader(true)

        const body = {
          organization_id: result?.payloadJson?.organization_id,
          first_name: inputs?.first_name,
          last_name: inputs?.last_name,
          c_about_user: 'Admin',
          email: inputs?.email,
          mobile: inputs?.mobile,
          role: '',
          c_user_img_url: '',
          c_role_id: '16f01165898b'
          // n_status: inputs?.n_status
        }

        const enycryptDAta = encryptCryptoResponse(body)

        const dataValue = {
          data: enycryptDAta
        }

        const resultData = await craeteUserApi(dataValue)

        if (resultData?.appStatusCode === 0) {
          toast.success('Please check your email.. your password send your mail!', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })
          router.push('/login')
          setLoader(false)
        } else {
          toast.error('Something Went wrong, Please try after some time', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })
          setLoader(false)
        }
      } else {
        toast.error('Something Went wrong, Please try after some time', {
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
  }

  const checkMail = async mail => {
    const body = {
      email: mail
    }

    setLoaderEmail(true)
    const checkEmail = await checkMailApi(body)

    if (checkEmail?.appStatusCode === 4) {
      setLoaderEmail(false)
      setErrorInputs({ ...errorInputs, email: true })
      setErrEmail('This email already exits')
      setErrEmailCheck('error')
    } else {
      setLoaderEmail(false)
      setErrorInputs({ ...errorInputs, email: false })
      setErrEmail('')
      setErrEmailCheck('success')
    }
  }

  useEffect(() => {
    if (inputs.otp.length === 4) {
      setOtpVerify(true)
      verrifyOtpfn(inputs.email, inputs.otp)
    }
  }, [inputs.otp])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (inputs?.email?.length > 0 && isEmail(inputs?.email)) {
        checkMail(inputs?.email)
      }
    }, 1000) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [inputs?.email])

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-6 sm:!p-12'>
            <Link href='/' className='flex justify-center items-start mbe-6'>
              <Logo />
            </Link>
            <Typography variant='h5'>Adventure starts here 🚀</Typography>

            {/* <div className='flex flex-col gap-5'>
              
            <Typography className='mbs-2'>{otpCheck ? ' Enter the One time password send to your email': 'Get started with your 14-day free trail'}</Typography>
            </div> */}

            <div className='flex flex-col gap-5'>
              <Typography className='mbs-1'>
                <span>{otpCheck ? 'Verify your sign-up' : 'Make your app management easy'}</span>
                <br />
                <span>
                  {otpCheck
                    ? ' Enter the One time password send to your email'
                    : 'Get started with your 14-day free trail'}
                </span>
              </Typography>

              <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
                {!otpCheck && (
                  <>
                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='Organaization Name *'
                      variant='outlined'
                      type='text'
                      name='organaization_name'
                      size='small'
                      rows={2}
                      value={inputs?.organaization_name}
                      onChange={handleChange}
                      error={errorInputs?.organaization_name}
                      helperText={errorInputs?.organaization_name && errOrgName}
                      sx={{
                        // Target the root of the input element
                        '& .MuiOutlinedInput-root': {
                          position: 'relative', // anchor for the ::before strip

                          // Red strip
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px', // thickness of the strip
                            backgroundColor: 'error.main',
                            borderTopLeftRadius: '4px', // match the TextField’s rounded corners
                            borderBottomLeftRadius: '4px'
                          }
                        }
                      }}
                    />

                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='First Name *'
                      variant='outlined'
                      type='text'
                      name='first_name'
                      size='small'
                      rows={2}
                      value={inputs?.first_name}
                      onChange={handleChange}
                      error={errorInputs?.first_name}
                      helperText={errorInputs?.first_name && errFname}
                      sx={{
                        // Target the root of the input element
                        '& .MuiOutlinedInput-root': {
                          position: 'relative', // anchor for the ::before strip

                          // Red strip
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px', // thickness of the strip
                            backgroundColor: 'error.main',
                            borderTopLeftRadius: '4px', // match the TextField’s rounded corners
                            borderBottomLeftRadius: '4px'
                          }
                        }
                      }}
                      inputProps={{
                        minLength: 3,
                        maxLength: 40
                      }}
                    />

                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='Last Name'
                      variant='outlined'
                      type='text'
                      name='last_name'
                      size='small'
                      rows={2}
                      value={inputs?.last_name}
                      onChange={handleChange}
                      error={errorInputs?.last_name}
                      helperText={errorInputs?.last_name && errLname}
                      sx={{
                        '.MuiFormHelperText-root': {
                          ml: 0
                        }
                      }}
                      inputProps={{
                        minLength: 1,
                        maxLength: 40
                      }}
                    />

                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='Mobile'
                      variant='outlined'
                      type='text'
                      name='mobile'
                      size='small'
                      rows={2}
                      value={inputs?.mobile}
                      onChange={handleChange}
                      error={errorInputs?.mobile}
                      helperText={errorInputs?.mobile ? errMobile : ''}
                      sx={{
                        '.MuiFormHelperText-root': {
                          ml: 0
                        }
                      }}
                      inputProps={{
                        minLength: 10,
                        maxLength: 10
                      }}
                    />

                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='Email *'
                      variant='outlined'
                      type='text'
                      name='email'
                      size='small'
                      rows={2}
                      value={inputs?.email}
                      onChange={handleChange}
                      error={errorInputs?.email}
                      helperText={errorInputs?.email ? errEmail : ''}
                      sx={{
                        // Target the root of the input element
                        '& .MuiOutlinedInput-root': {
                          position: 'relative', // anchor for the ::before strip

                          // Red strip
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px', // thickness of the strip
                            backgroundColor: 'error.main',
                            borderTopLeftRadius: '4px', // match the TextField’s rounded corners
                            borderBottomLeftRadius: '4px'
                          }
                        }
                      }}
                      InputProps={{
                        endAdornment:
                          errEmailCheck === 'success' ? (
                            <i className='ri-check-double-fill' style={{ color: '#4caf50' }}></i>
                          ) : (
                            ''
                          )
                      }}
                    />
                  </>
                )}

                {otpCheck && (
                  <>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography variant='body2' fontWeight='bold'>
                        {inputs.email}
                      </Typography>
                      <Typography sx={{ cursor: 'pointer' }} onClick={() => setOtpCheck(false)}>
                        Change
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      onBlur={handleBlur}
                      autoComplete='off'
                      id='outlined-basic'
                      label='OTP'
                      variant='outlined'
                      type='text'
                      name='otp'
                      size='small'
                      rows={2}
                      value={inputs?.otp}
                      onChange={handleChange}
                      error={errorInputs?.otp}
                      helperText={errorInputs?.otp ? errOtp : ''}
                      sx={{
                        '.MuiFormHelperText-root': {
                          ml: 0
                        }
                      }}
                      inputProps={{
                        minLength: 4,
                        maxLength: 4
                      }}
                    />
                  </>
                )}

                {otpCheck ? (
                  <>
                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      // disabled={
                      //   errorInputs?.organaization_name ||
                      //   errorInputs?.email ||
                      //   errorInputs?.first_name ||
                      //   errorInputs?.last_name ||
                      //   errorInputs?.mobile ||
                      //   errorInputs?.otp ||
                      //   inputs?.first_name === '' ||
                      //   errEmailCheck === 'success'
                      //     ? false
                      //     : true
                      // }
                      disabled={inputs.otp === '' || 
                        inputs.otp.length < 4 ||
                        otpVerify ||
                        errorInputs?.otp
                      
                      }
                      onClick={handleSubmit}
                    >
                      {otpVerify ? "Verifying" : "Register"}
                    </Button>
                    <Typography variant='body2' fontWeight='bold'>
                      OTP send to {inputs.email}
                    </Typography>
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant='contained'
                    type='submit'
                    // disabled={
                    //   inputs.organaization_name !== '' ||
                    //   errorInputs?.organaization_name ||
                    //   errorInputs?.email ||
                    //   errorInputs?.first_name ||
                    //   errorInputs?.last_name ||
                    //   errorInputs?.mobile ||
                    //   inputs?.first_name === ''
                    //   // errEmailCheck === 'success'
                    //     ? true
                    //     : false
                    // }
                    disabled={
                      inputs.organaization_name === '' ||
                      inputs.first_name === '' ||
                      inputs.email === '' ||
                      errorInputs?.organaization_name ||
                      errorInputs?.first_name ||
                      errorInputs?.last_name ||
                      errorInputs?.email ||
                      errorInputs?.mobile
                    }
                    onClick={handleOTPSubmit}
                  >
                    Get Started
                  </Button>
                )}

                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>Already have an account?</Typography>
                  <Typography component={Link} href='/login' color='primary'>
                    Sign in instead
                  </Typography>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
        <Illustrations maskImg={{ src: authBackground }} />
      </div>
    </Box>
  )
}

export default Register
