/* eslint-disable react-hooks/exhaustive-deps */
'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
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
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import {
  addOrganizationApi,
  checkMailApi,
  craeteUserApi,
  getOrganizationByNameApi,
  sendOtpApi,
  verifyOtpApi
} from '@/apiFunctions/ApiAction'
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack
} from '@mui/material'
import { encryptCryptoResponse } from '@/helper/frontendHelper'

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/
function isValidMobileNumberStrict(value) {
  if (!/^\d+$/.test(value)) return false
  const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
  const regex = /^[0-9][0-9]*$/
  return regex.test(digitsOnly)
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
  const fileInputRef = useRef(null)
  const inputsRef = useRef([])

  // States
  const [inputs, setInputs] = useState({
    organaization_name: '',
    organization_logo: '',
    organization_address: '',
    organization_emp_count: '',
    organization_currency: '',
    companyType: [],
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    c_password: '',
    countryCode: '',
    mobile: '',
    otp: ''
    
  })

  const [errorInputs, setErrorInputs] = useState({
    organaization_name: false,
    organization_logo: false,
    organization_address: false,
    organization_emp_count: false,
    organization_currency: false,
    companyType: false,
    first_name: false,
    last_name: false,
    email: false,
    password: false,
    c_password: false,
    countryCode: false,
    mobile: false,
    otp: false,
  })

  const [userInfo, setUserInfo] = useState(true)
  const [otpInfo, setOtpInfo] = useState(false)
  const [orgInfo, setOrgInfo] = useState(false)

  const [edit, setEdit] = useState(false)
  const [loader, setLoader] = useState(false)
  const [errOrgName, setErrOrgName] = useState('')
  const [errOrgEmpCount, setErrOrgEmpCount] = useState('')
  const [errFname, setErrFname] = useState('')
  const [errLname, setErrLname] = useState('')
  const [errMobile, setErrMobile] = useState('')
  const [errOtp, setErrOtp] = useState('')
  const [otpCheck, setOtpCheck] = useState(false)
  const [otpVerify, setOtpVerify] = useState(false)
  const [errEmail, setErrEmail] = useState('')
  const [errEmailCheck, setErrEmailCheck] = useState('')
  const [loaderEmail, setLoaderEmail] = useState(false)

  const [errPasswordCheck, setErrPasswordCheck] = useState('')
  const [errCPasswordCheck, setErrCPasswordCheck] = useState('')

  const [countryCodes, setCountryCodes] = useState([])
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isCPasswordShown, setIsCPasswordShown] = useState(false)

  const [logoPreview, setLogoPreview] = useState(null)

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)
  const handleClickShowCPassword = () => setIsCPasswordShown(show => !show)

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
        const checkOrgName = await getOrganizationByNameApi(value)

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
      } else if (value === '') {
        setErrorInputs(prev => ({ ...prev, [name]: true }))
        setErrMobile('Please enter valid phone number')
      }
    } else if (name === 'email') {
      if (!isEmail(value)) {
        setErrorInputs(prev => ({ ...prev, [name]: true }))
        setErrEmail('Please enter valid email')
      }
    } else if (name === 'password') {
      if (inputs?.password === '') {
        setErrPasswordCheck('Please enter valid password')
        setErrorInputs({ ...errorInputs, password: true })
        toast.error('Please enter  Password', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      } else if (inputs?.c_password?.length > 0) {
        if (inputs?.password !== inputs?.c_password) {
          setErrorInputs({ ...errorInputs, password: true })
          setErrPasswordCheck('Mis Match Password and Confirm Password')
          toast.error('Mis Match Password and Confirm Password', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })
        } else if (inputs?.password === inputs?.c_password) {
          setErrorInputs({ ...errorInputs, password: false })
          setErrorInputs({ ...errorInputs, c_password: false })
        }
      } else if (!inputs?.password.match(passRegex) && !edit) {
        setErrorInputs({ ...errorInputs, password: true })
        setErrPasswordCheck(
          'Password must be at least 8 characters long and include letters, numbers, symbols, and one capital letter'
        )
        toast.error(
          'Password must be at least 8 characters long and include letters, numbers, symbols, and one capital letter',
          {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          }
        )

        return
      }
    } else if (name === 'c_password') {
      if (inputs?.c_password === '') {
        setErrCPasswordCheck('Please enter valid confirm password')
        setErrorInputs({ ...errorInputs, c_password: true })
        toast.error('Please enter Confirm Password', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })
      } else if (inputs?.password !== inputs?.c_password) {
        setErrCPasswordCheck('Mis Match Password and Confirm Password')
        setErrorInputs({ ...errorInputs, c_password: true })
        toast.error('Mis Match Password and Confirm Password', {
          autoClose: 500, // 1 second la close
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        return
      } else if (!inputs?.c_password.match(passRegex) && !edit) {
        setErrCPasswordCheck(
          'Password must be at least 8 characters long and include letters, numbers, symbols, and one capital letter'
        )
        setErrorInputs({ ...errorInputs, c_password: true })
        toast.error(
          'Password must be at least 8 characters long and include letters, numbers, symbols, and one capital letter',
          {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          }
        )

        return
      } else if (inputs?.password === inputs?.c_password) {
        setErrorInputs({ ...errorInputs, password: false })
        setErrorInputs({ ...errorInputs, c_password: false })
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

  const handleOTPChange = (e, index) => {
    const val = e.target.value
    if (!/^\d*$/.test(val)) return // Only digits

    const otpArr = inputs.otp.split('') // Use current otp state
    otpArr[index] = val

    setInputs(prev => ({ ...prev, otp: otpArr.join('') }))

    // Move focus
    if (val && index < 3) {
      inputsRef.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !inputs.otp[index] && index > 0) {
      inputsRef.current[index - 1].focus()
    }
  }

  const handleChange = e => {
    const { name, value, checked } = e.target

    if (name === 'organaization_name') {
      setErrorInputs({ ...errorInputs, organaization_name: false })
      setInputs({ ...inputs, [name]: capitalizeWords(value) })
    } else if (name === 'organization_emp_count') {
      const res = isValidMobileNumberStrict(value)

      if (value.startsWith('0')) return // Prevent typing 0 at start
      if (!/^\d*$/.test(value)) return // Only digits allowed

      if (value === '' || res) {
        setErrorInputs({ ...errorInputs, organization_emp_count: false })
        setInputs({ ...inputs, [name]: value })
      }
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
    } else if (name === 'password') {
      setErrorInputs({ ...errorInputs, password: false })
      setInputs({ ...inputs, [name]: value })
    } else if (name === 'c_password') {
      setErrorInputs({ ...errorInputs, c_password: false })
      setInputs({ ...inputs, [name]: value })
    } else if (name === 'otp') {
      const res = isValidOTPStrict(value)

      if (value === '' || res) {
        setErrorInputs({ ...errorInputs, otp: false })
        setInputs({ ...inputs, [name]: value })
      }
    } else if (
      name === 'product' ||
      name === 'service' ||
      name === 'license' ||
      name === 'warranty' ||
      name === 'subscription'
    ) {
      setErrorInputs({ ...errorInputs, companyType: false })

      // Add or remove from array
      let updated = [...inputs.companyType]
      if (checked) {
        updated.push(name)
      } else {
        updated = updated.filter(item => item !== name)
      }

      setInputs({ ...inputs, companyType: updated })
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

    setOtpVerify(false)
    if (otpRes?.appStatusCode === 0) {
      setErrorInputs({ ...errorInputs, otp: false })
      toast.success('OTP verified Successfully', {
        autoClose: 1500, // 1 second la close
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      setUserInfo(false)
      setOtpInfo(false)
      setOrgInfo(true)
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

  // Logo Upload Handler
  const handleLogoUpload = async file => {
    if (!file) return

    // Show preview immediately
    setLogoPreview(URL.createObjectURL(file))

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/v1/admin/upload-logo', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Logo uploaded successfully!')
        // Save the uploaded file path in your inputs (server URL)
        setInputs(prev => ({ ...prev, organization_logo: data.filePath }))
        // Optional: Update preview with server URL
        setLogoPreview(data.filePath)
      } else {
        toast.error('Failed to upload logo')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  const handleLogoDelete = async () => {
    if (!inputs.organization_logo) return

    try {
      const res = await fetch('/api/v1/admin/delete-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: inputs.organization_logo }) // send server path
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Logo deleted successfully!')
        setInputs(prev => ({ ...prev, organization_logo: '' }))
        setLogoPreview(null)
      } else {
        toast.error('Failed to delete logo')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  const onChangeFunction = () => {
    setOtpCheck(false)
    setUserInfo(true)
    setOtpInfo(false)
    setOrgInfo(false)
  }

  const handleOTPSubmit = () => {
    if (!inputs?.password.match(passRegex) && !edit) {
      setErrorInputs({ ...errorInputs, password: true })
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
    } else {
      setUserInfo(false)
      setOtpInfo(true)
      setOrgInfo(false)
      sendOtpfn(inputs?.email)
    }
  }

  const handleOTPVerify = () => {
    if (inputs.otp.length === 4) {
      verrifyOtpfn(inputs.email, inputs.otp)
    }
  }

  const handleSubmit = async () => {
    console.log(inputs, '<< inputsss')

    const body = {
      organization_name: inputs?.organaization_name,
      organization_logo: inputs?.organization_logo,
      organization_address: inputs?.organization_address,
      organization_emp_count: inputs?.organization_emp_count,
      organization_currency: inputs?.organization_currency,
      companyType: inputs?.companyType,
      c_version: 'Trial'
    }

    if (inputs?.email === '') {
      setErrorInputs({ ...errorInputs, email: true })
      setErrEmail('Please enter valid email')
    } else if (!isEmail(inputs?.email)) {
      setErrorInputs({ ...errorInputs, email: true })
      setErrEmail('Please enter valid email')
    } else if (inputs.companyType === '') {
      setErrorInputs(prev => ({ ...prev, companyType: true }))
      return toast.error('Please select company type')
    } else {
      const result = await addOrganizationApi(body)

      if (result?.appStatusCode === 0) {
        setLoader(true)

        const body2 = {
          organization_id: result?.payloadJson?.organization_id,
          first_name: inputs?.first_name,
          last_name: inputs?.last_name,
          c_about_user: 'Admin',
          email: inputs?.email,
          password: inputs?.password,
          mobile: `${inputs?.countryCode}${inputs?.mobile}`,
          role: '',
          c_user_img_url: '',
          c_role_id: '16f01165898b'
        }

        const enycryptDAta = encryptCryptoResponse(body2)

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

  useEffect(() => {}, [inputs.otp])

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (inputs?.email?.length > 0 && isEmail(inputs?.email)) {
        checkMail(inputs?.email)
      }
    }, 1000) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [inputs?.email])

  useEffect(() => {
    fetch('/json/country.json')
      .then(res => res.json())
      .then(data => setCountryCodes(data))
      .catch(() => setCountryCodes([]))
  }, [])

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
                {userInfo && (
                  <>
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
                      label='Mobile *'
                      variant='outlined'
                      type='text'
                      name='mobile'
                      size='small'
                      value={inputs.mobile}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errorInputs.mobile}
                      helperText={errorInputs.mobile ? errMobile : ''}
                      // inputProps={{ maxLength: 15 }}

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
                        startAdornment: (
                          <InputAdornment position='start' sx={{ paddingRight: '1px' }}>
                            <Select
                              value={inputs.countryCode || '+91'}
                              onChange={e => setInputs({ ...inputs, countryCode: e.target.value })}
                              variant='standard'
                              disableUnderline
                              IconComponent={ArrowDropDownIcon} // Keeps arrow but adjusts position
                              sx={{
                                width: '100px', // ⬅️ Sets proper width for flag, code & arrow
                                minWidth: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0px 0px 0px 0px', // ⬅️ Padding-right reserves space for arrow
                                '& .MuiSelect-select': {
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  padding: '0px 0px'
                                }
                              }}
                            >
                              {countryCodes.map(country => (
                                <MenuItem key={country.code} value={country.dial_code}>
                                  <img
                                    src={country.flag}
                                    alt={country.code}
                                    width='22'
                                    height='16'
                                    style={{ marginRight: 5, borderRadius: '3px' }}
                                  />
                                  {country.dial_code}
                                </MenuItem>
                              ))}
                            </Select>
                          </InputAdornment>
                        )
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
                        endAdornment: loaderEmail ? (
                          <CircularProgress size={20} /> // MUI loader
                        ) : errEmailCheck === 'success' ? (
                          <i className='ri-check-double-fill' style={{ color: '#4caf50' }}></i>
                        ) : errEmailCheck === 'error' ? (
                          <i className='ri-close-circle-fill' style={{ color: '#f44336' }}></i>
                        ) : null
                      }}
                    />

                    <TextField
                      onBlur={handleBlur}
                      disabled={edit}
                      autoComplete='new-password'
                      fullWidth
                      label='Password *'
                      placeholder='············'
                      id='form-layout-basic-password'
                      name='password'
                      value={inputs.password}
                      onChange={handleChange}
                      error={errorInputs?.password}
                      helperText={errorInputs?.password && errPasswordCheck}
                      type={isPasswordShown ? 'text' : 'password'}
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
                    <TextField
                      onBlur={handleBlur}
                      disabled={edit}
                      autoComplete='new-password'
                      fullWidth
                      label='Confirm Password *'
                      placeholder='············'
                      id='form-layout-basic-password'
                      name='c_password'
                      value={inputs.c_password}
                      onChange={handleChange}
                      error={errorInputs?.c_password}
                      helperText={errorInputs?.c_password && errCPasswordCheck}
                      type={isCPasswordShown ? 'text' : 'password'}
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
                              onClick={handleClickShowCPassword}
                              onMouseDown={e => e.preventDefault()}
                              aria-label='toggle password visibility'
                            >
                              <i className={isCPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      size='small'
                    />

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={
                        inputs.first_name === '' ||
                        inputs.email === '' ||
                        inputs.mobile === '' ||
                        inputs.password === '' ||
                        inputs.c_password === '' ||
                        errorInputs?.first_name ||
                        errorInputs?.last_name ||
                        errorInputs?.email ||
                        errorInputs?.mobile ||
                        errorInputs?.password ||
                        errorInputs?.c_password
                      }
                      onClick={handleOTPSubmit}
                    >
                      Get Started
                    </Button>
                  </>
                )}

                {otpInfo && (
                  <>
                    <Box display={'flex'} justifyContent={'space-between'}>
                      <Typography variant='body2' fontWeight='bold'>
                        {inputs.email}
                      </Typography>
                      <Typography sx={{ cursor: 'pointer' }} onClick={onChangeFunction}>
                        Change
                      </Typography>
                    </Box>
                    {/* <TextField
                      disabled={!otpCheck}
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
                    /> */}
                    <Stack direction='row' spacing={10}>
                      {[0, 1, 2, 3].map(i => (
                        <TextField
                          key={i}
                          inputRef={el => (inputsRef.current[i] = el)}
                          value={inputs.otp[i] || ''}
                          onChange={e => handleOTPChange(e, i)}
                          onKeyDown={e => handleKeyDown(e, i)}
                          error={errorInputs.otp}
                          variant='outlined'
                          size='small'
                          inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.5rem' } }}
                          sx={{
                            width: '60px',
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-error': {
                                borderColor: 'error.main'
                              }
                            }
                          }}
                        />
                      ))}
                    </Stack>

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={inputs.otp === '' || inputs.otp.length < 4 || otpVerify || errorInputs?.otp}
                      onClick={handleOTPVerify}
                    >
                      {otpVerify ? 'Verifying' : 'Verify'}
                    </Button>
                    <Typography variant='body2' fontWeight='bold'>
                      OTP send to {inputs.email}
                    </Typography>
                  </>
                )}

                {orgInfo && (
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
                      label='Employee Count'
                      variant='outlined'
                      type='text'
                      name='organization_emp_count'
                      size='small'
                      rows={2}
                      value={inputs?.organization_emp_count}
                      onChange={handleChange}
                      error={errorInputs?.organization_emp_count}
                      helperText={errorInputs?.organization_emp_count && errOrgEmpCount}
                      inputProps={{
                        minLength: 1,
                        maxLength: 3
                      }}
                    />

                    {/* Organization Logo Upload Field */}

                    <Button variant='outlined' component='label' fullWidth size='small' sx={{ height: '40px' }}>
                      Upload Organization Logo
                      <input
                        type='file'
                        hidden
                        accept='image/*'
                        ref={fileInputRef}
                        onChange={e => {
                          const file = e.target.files[0]
                          if (file) {
                            handleLogoUpload(file) // upload & set preview
                          }
                        }}
                      />
                    </Button>

                    {logoPreview && (
                      <Box mt={1} display='flex' alignItems='center' gap={1}>
                        <img
                          src={logoPreview}
                          alt='logo'
                          style={{ width: 50, height: 50, borderRadius: 5, objectFit: 'cover' }}
                        />
                        <Typography variant='body2'>
                          {inputs.organization_logo instanceof File ? inputs.organization_logo.name : 'Uploaded'}
                        </Typography>
                        <Button
                          size='small'
                          color='error'
                          variant='outlined'
                          onClick={() => {
                            setInputs(prev => ({ ...prev, organization_logo: '' }))
                            setLogoPreview(null)
                            handleLogoDelete()
                            if (fileInputRef.current) fileInputRef.current.value = '' // reset input
                          }}
                          sx={{ minWidth: '30px', padding: '2px 6px' }}
                        >
                          Delete
                        </Button>
                      </Box>
                    )}

                    <Box mt={1}>
                      <FormControl component='fieldset' error={errorInputs.companyType}>
                        <Typography>Company Type *</Typography>
                        <FormGroup row>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={inputs.companyType.includes('product')}
                                onChange={handleChange}
                                name='product'
                              />
                            }
                            label='Product'
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={inputs.companyType.includes('service')}
                                onChange={handleChange}
                                name='service'
                              />
                            }
                            label='Service'
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={inputs.companyType.includes('license')}
                                onChange={handleChange}
                                name='license'
                              />
                            }
                            label='License'
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={inputs.companyType.includes('warranty')}
                                onChange={handleChange}
                                name='warranty'
                              />
                            }
                            label='Warranty'
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={inputs.companyType.includes('subscription')}
                                onChange={handleChange}
                                name='subscription'
                              />
                            }
                            label='Subscription'
                          />
                        </FormGroup>
                        {errorInputs.companyType && (
                          <FormHelperText>Please select at least one company type</FormHelperText>
                        )}
                      </FormControl>
                    </Box>

                    <Button
                      fullWidth
                      variant='contained'
                      type='submit'
                      disabled={
                        inputs.organaization_name === '' ||
                        errorInputs?.organaization_name ||
                        inputs.companyType.length === 0 ||
                        errorInputs?.companyType
                      }
                      onClick={handleSubmit}
                    >
                      Register
                    </Button>
                  </>
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
