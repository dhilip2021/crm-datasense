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
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import { ToastContainer, toast } from 'react-toastify'

// ** Icons Imports
import Google from 'mdi-material-ui/Google'
import Github from 'mdi-material-ui/Github'
import Twitter from 'mdi-material-ui/Twitter'
import Facebook from 'mdi-material-ui/Facebook'

import Cookies from 'js-cookie'

import { Box, Divider } from '@mui/material'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { addFieldFormApi, getFieldFormListApi, LoginApi } from '@/apiFunctions/ApiAction'

//react-toastify
import 'react-toastify/dist/ReactToastify.css'
// eslint-disable-next-line import/order
import { useDispatch } from 'react-redux'
import { loginData } from '@/app/store/loginSlice'
import ErrorPopup from './ErrorPopup'
import { decrypCryptoRequest, encryptCryptoResponse } from '@/helper/frontendHelper'

const isEmail = email => {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  if (email !== '' && email.match(emailFormat)) {
    return true
  }

  return false
}

const staticFiledForm = [
  {
    fields: {
      left: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'First Name',
          placeholder: 'Enter a First Name',
          required: true,
          minChars: 3,
          maxChars: 50,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Phone',
          label: 'Phone',
          placeholder: 'Enter a phone number',
          required: true,
          maxLength: 50,
          autoComplte: true,
          noDuplicates: false,
          isPublic: false,
          isEncrypted: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: [],
          countryCode: '+91',
          createFor: []
        }
      ],
      center: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'Last Name',
          placeholder: 'Enter a Last Name',
          required: false,
          minChars: 3,
          maxChars: 50,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Gender',
          placeholder: 'Select a Gender',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['Male', 'Female', 'Genderqueer', 'Non-Conforming', 'Transgender', 'Other'],
          defaultValue: 'Male',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        }
      ],
      right: [
        {
          id: crypto.randomUUID(),
          type: 'Email',
          label: 'Email',
          placeholder: 'Enter a Email',
          required: true,
          autoComplte: true,
          noDuplicates: false,
          isPublic: false,
          isEncrypted: false,
          showTooltip: false,
          options: [],
          createFor: []
        }
      ]
    },

    id: crypto.randomUUID(),
    title: 'Contact Information',
    layout: 'triple'
  },
  {
    fields: {
      left: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'Company',
          placeholder: 'Enter a Company',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Lead Status',
          placeholder: 'Select a Lead Status',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: [
            'New / Attempted Contact',
            'Contacted / Qualification',
            'Demo / Proposal Stage',
            'Negotiation / Ready to Close',
            'Closed Won',
            'Closed Lost',
            'Invalid / Junk / Wrong Contact',
            'Call Back'
          ],
          defaultValue: 'New / Attempted Contact',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Currency',
          label: 'Annual Revenue',
          placeholder: 'Currency',
          required: false,
          options: [],
          minDigits: '',
          maxDigits: '',
          decimalPlaces: '2',
          rounding: 'normal',
          createFor: []
        }
      ],
      center: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'Job Title',
          placeholder: 'Enter a Job Title',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Industry',
          placeholder: 'Select a Industry',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['Logistics', 'Manufacturing', 'FMCG', 'Education', 'Pharma', 'IT', 'Finance'],
          defaultValue: '',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Company Type',
          placeholder: 'Select a Company Type',
          required: false,
          options: ['product', 'service', 'license', 'warranty', 'subscription'],
          defaultValue: 'product',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          createFor: []
        }
      ],
      right: [
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Lead Source',
          placeholder: 'Select a Lead Source',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['Facebook', 'LinkedIn', 'Email Campaign', 'Referral', 'Trade Show', 'Cold Call'],
          defaultValue: '',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Company Size',
          placeholder: 'Select a Company Size',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['1 to 10', '11 to 50', '51 to 100', '100 +'],
          defaultValue: '1 to 10',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Product List',
          placeholder: 'Select a product',
          required: false,
          options: ['product 1', 'product 2'],
          defaultValue: '',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          createFor: []
        }
      ]
    },

    id: crypto.randomUUID(),
    title: 'Company Information',
    layout: 'triple'
  },
  {
    fields: {
      left: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'Country',
          placeholder: 'Enter a Country',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'Street',
          placeholder: 'Enter a Street',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        }
      ],
      center: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'State',
          placeholder: 'Enter a State',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        },
        {
          id: crypto.randomUUID(),
          type: 'Number',
          label: 'Pincode',
          placeholder: 'Enter a Pincode',
          required: false,
          options: [],
          minDigits: '',
          maxDigits: '',
          useSeparator: false,
          createFor: []
        }
      ],
      right: [
        {
          id: crypto.randomUUID(),
          type: 'Single Line',
          label: 'City',
          placeholder: 'Enter a City',
          required: false,
          minChars: 3,
          maxChars: 255,
          allowDuplicate: true,
          allowSplCharacter: false,
          autoComplte: true,
          isPublic: false,
          isEncrypted: false,
          isExternal: false,
          showTooltip: false,
          options: [],
          createFor: []
        }
      ]
    },
    id: crypto.randomUUID(),
    title: 'Address Information',
    layout: 'triple'
  },
  {
    fields: {
      left: [
        {
          id: crypto.randomUUID(),
          type: 'Date',
          label: 'Next Follow-up Date',
          placeholder: 'Enter a Follow-up Date',
          required: false,
          allowPastDate: true,
          noDuplicates: false,
          isPublic: false,
          isEncrypted: false,
          showTooltip: false,
          options: [],
          createFor: []
        }
      ],
      center: [
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Timeline to Buy',
          placeholder: 'Enter a Timeline to Buy',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['Immediately', '3–6 Months', '6+ Months'],
          defaultValue: '',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        }
      ],
      right: [
        {
          id: crypto.randomUUID(),
          type: 'Dropdown',
          label: 'Assigned To',
          placeholder: 'Enter a Assigned value',
          required: false,
          isPublic: false,
          showTooltip: false,
          tooltipMessage: '',
          tooltipType: 'icon',
          options: ['Option 1', 'Option 1'],
          defaultValue: '',
          sortOrder: 'entered',
          trackHistory: false,
          enableColor: false,
          createFor: []
        }
      ]
    },
    id: crypto.randomUUID(),
    title: 'Follow-Up Section',
    layout: 'triple'
  }
]

const Login = ({ mode }) => {
  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const dispatch = useDispatch()

  const organization_id = Cookies.get('organization_id')

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loader, setLoader] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [trailVal, setTrailVal] = useState('')

  const [values, setValues] = useState({
    showPassword: false
  })

  const [error, setError] = useState({
    email: false,
    password: false
  })

  const handlePopupClose = val => {
    setOpen(false)
    setLoader(false)
    setTitle('')
  }

  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'email') {
      setEmail(value.toLowerCase())
      setError({ ...error, [name]: false })
    } else if (name === 'password') {
      setPassword(value)
      setError({ ...error, [name]: false })
    }
  }

  const handleSuccess = () => {
    window.location.reload() // full reload
  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }

  const LoginFunction = async () => {
    const body = {
      email: email,
      password: password
    }

    setLoader(true)

    const enycryptDAta = encryptCryptoResponse(body)
    const dataValue = {
      data: enycryptDAta
    }

    let results = await LoginApi(dataValue)

    if (results?.appStatusCode === 4) {
      setLoader(false)
      toast.error(results?.error, {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })

      if (results.error !== 'Invalid credential') {
        setEmail('')
        setPassword('')
        setIsChecked(false)
      }
    } else if (results?.appStatusCode === 0) {
      const resultsPayloadJson = decrypCryptoRequest(results.payloadJson)

      console.log(resultsPayloadJson, '<<< resultsPayloadJson')

      const dispatchLogin = {
        appStatusCode: results?.appStatusCode,
        message: results?.message,
        payloadJson: resultsPayloadJson,
        error: results?.error
      }

      dispatch(loginData(dispatchLogin))

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resultsPayloadJson?.tokenAccess}`
      }

      const fieldFormResponse = await getFieldFormListApi(resultsPayloadJson?.organization_id, header)

      if (fieldFormResponse?.payloadJson?.length === 0) {
        const body2 = {
          organization_id: resultsPayloadJson?.organization_id,
          form_name: 'lead-form',
          version: 1,
          sections: staticFiledForm
        }

        const header1 = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resultsPayloadJson?.tokenAccess}`
        }

        const resultFields = await addFieldFormApi(body2, header1)
      }

      if (resultsPayloadJson?.c_version === 'Trial') {
        const localDateStr = new Date()
        const isoUtc = new Date(localDateStr).toISOString()
        const today = new Date(isoUtc)
        const endDate = new Date(resultsPayloadJson?.endedAt)

        if (today < endDate) {
          if (isChecked) {
            localStorage.setItem('user_checked', '1')
            localStorage.setItem('user_email', email)
            localStorage.setItem('user_password', password)
          } else {
            localStorage.setItem('user_checked', '')
            localStorage.setItem('user_email', '')
            localStorage.setItem('user_password', '')
          }

          let dummyArray = []

          resultsPayloadJson?.privileges.map(data => dummyArray.push(data?.role_privileage))

          Cookies.set('_token', resultsPayloadJson?.tokenAccess)
          Cookies.set('_token_expiry', resultsPayloadJson?.tokenExpiry)
          Cookies.set('role_id', resultsPayloadJson?.c_role_id)
          Cookies.set('email', resultsPayloadJson?.email)
          Cookies.set('mobile', resultsPayloadJson?.mobile)
          Cookies.set('user_id', resultsPayloadJson?.user_id)
          Cookies.set('organization_id', resultsPayloadJson?.organization_id)
          Cookies.set('organization_name', resultsPayloadJson?.organization_name)
          Cookies.set('organization_logo', resultsPayloadJson?.organization_logo)
          Cookies.set('organization_address', resultsPayloadJson?.organization_address)
          Cookies.set('organization_emp_count', resultsPayloadJson?.organization_emp_count)
          Cookies.set('organization_currency', resultsPayloadJson?.organization_currency)
          Cookies.set('c_version', resultsPayloadJson?.c_version)
          Cookies.set('endedAt', resultsPayloadJson?.endedAt)
          Cookies.set('role_name', resultsPayloadJson?.role)
          Cookies.set('user_name', resultsPayloadJson?.user_name)
          Cookies.set('privileges', JSON.stringify(dummyArray))

          router.push('/')
          router.refresh()
          handleSuccess()

          toast.success('login successful', {
            autoClose: 500,
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })

          setLoader(false)
        } else if (today > endDate) {
          setTitle('Sorry ! Your trial period has ended. Please get in touch with your administrator.')
          setOpen(true)
          setTrailVal('1')
        } else {
          setTitle('Today is the last day of your trial period. Contacting your administrator is necessary.')
          setOpen(true)
          setTrailVal('2')
        }
      } else {
        if (isChecked) {
          localStorage.setItem('user_checked', '1')
          localStorage.setItem('user_email', email)
          localStorage.setItem('user_password', password)
        } else {
          localStorage.setItem('user_checked', '')
          localStorage.setItem('user_email', '')
          localStorage.setItem('user_password', '')
        }

        let dummyArray = []

        resultsPayloadJson?.privileges.map(data => dummyArray.push(data?.role_privileage))

        Cookies.set('_token', resultsPayloadJson?.tokenAccess)
        Cookies.set('_token_expiry', resultsPayloadJson?.tokenExpiry)
        Cookies.set('role_id', resultsPayloadJson?.c_role_id)
        Cookies.set('email', resultsPayloadJson?.email)
        Cookies.set('mobile', resultsPayloadJson?.mobile)
        Cookies.set('user_id', resultsPayloadJson?.user_id)
        Cookies.set('organization_id', resultsPayloadJson?.organization_id)
        Cookies.set('organization_name', resultsPayloadJson?.organization_name)
        Cookies.set('organization_logo', resultsPayloadJson?.organization_logo)
        Cookies.set('organization_address', resultsPayloadJson?.organization_address)
        Cookies.set('organization_emp_count', resultsPayloadJson?.organization_emp_count)
        Cookies.set('organization_currency', resultsPayloadJson?.organization_currency)
        Cookies.set('c_version', resultsPayloadJson?.c_version)
        Cookies.set('endedAt', resultsPayloadJson?.endedAt)
        Cookies.set('role_name', resultsPayloadJson?.role)
        Cookies.set('user_name', resultsPayloadJson?.user_name)
        Cookies.set('privileges', JSON.stringify(dummyArray))

        console.log(resultsPayloadJson, '<<< resultsPayloadJson 11')

        if (resultsPayloadJson?.c_role_id === '27f01165688z') {
          router.push('/')
          router.refresh()
          handleSuccess()
        } else if (resultsPayloadJson?.c_role_id === '16f01165898b') {
          router.push('/')
          router.refresh()
          handleSuccess()
        } else {
          router.push('/app/leads')
          router.refresh()
          handleSuccess()
        }

        toast.success('login successful', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true, // progress bar venam na
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined
        })

        setLoader(false)
      }
      setLoader(false)
    } else {
      setLoader(false)

      toast.error('Something Went wrong, Please try after some time', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true, // progress bar venam na
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    }
  }

  const formSubmitHandle = e => {
    e.preventDefault()

    if (!isEmail(email)) {
      setError({ ...error, email: true })
    } else if (!password.match(passRegex)) {
      setError({ ...error, password: true })
    } else {
      setLoader(true)

      LoginFunction()
    }
  }

  useEffect(() => {
    const userEmail = localStorage.getItem('user_email')
    const userPassword = localStorage.getItem('user_password')
    const userChecked = localStorage.getItem('user_checked')

    if (userChecked === '1') {
      setEmail(userEmail)
      setPassword(userPassword)
      setIsChecked(true)
    } else {
      setEmail('')
      setPassword('')
      setIsChecked(false)
    }
  }, [])

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
        <Card className='flex flex-col sm:is-[450px]'>
          <CardContent className='p-2 sm:!p-12'>
            <Link href='/' className='flex  justify-center items-center mbe-6'>
              <Box display={'flex'} flexDirection={'column'}>
                <Box>
                  <Logo />
                </Box>

                <Box textAlign={'center'}>
                  <p>
                    Innovation Begins with Lumivo
                    {/* Illuminating Ideas, Inspiring Change */}
                  </p>
                </Box>
              </Box>
            </Link>

            <div className='flex flex-col gap-5'>
              <div>
                <Typography className='mbs-1'>Please sign-in to your account and start the adventure</Typography>
              </div>
              <form noValidate autoComplete='off' className='flex flex-col gap-5'>
                <TextField
                  autoFocus
                  fullWidth
                  label='Email'
                  value={email}
                  name='email'
                  onChange={handleChange}
                  error={error.email}
                  helperText={error.email && 'Please enter valid email'}
                />
                <TextField
                  fullWidth
                  label='Password'
                  id='outlined-adornment-password'
                  value={password}
                  name='password'
                  onChange={handleChange}
                  error={error.password}
                  helperText={error.password && 'Please enter valid password'}
                  type={values.showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={handleClickShowPassword}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={values.showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <div className='flex justify-between items-center gap-x-3 gap-y-1 flex-wrap'>
                  <FormControlLabel
                    control={<Checkbox checked={isChecked} onChange={() => setIsChecked(!isChecked)} />}
                    label='Remember me'
                  />
                  <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                    Forgot password?
                  </Typography>
                </div>
                <Button fullWidth variant='contained' type='submit' onClick={e => formSubmitHandle(e)}>
                  Log In
                </Button>

                <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>New on our platform?</Typography>
                  <Typography component={Link} href='/register' color='primary'>
                    Create your Organization
                  </Typography>
                </div>
                {/* <Divider sx={{ my: 5 }}>or</Divider> */}
                {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Link href='/' passHref>
                    <IconButton component='a' onClick={e => e.preventDefault()}>
                      <Facebook sx={{ color: '#497ce2' }} />
                    </IconButton>
                  </Link>
                  <Link href='/' passHref>
                    <IconButton component='a' onClick={e => e.preventDefault()}>
                      <Twitter sx={{ color: '#1da1f2' }} />
                    </IconButton>
                  </Link>
                  <Link href='/' passHref>
                    <IconButton component='a' onClick={e => e.preventDefault()}>
                      <Github
                        sx={{ color: theme => (theme.palette.mode === 'light' ? '#272727' : theme.palette.grey[300]) }}
                      />
                    </IconButton>
                  </Link>
                  <Link href='/' passHref>
                    <IconButton component='a' onClick={e => e.preventDefault()}>
                      <Google sx={{ color: '#db4437' }} />
                    </IconButton>
                  </Link>
                </Box> */}
              </form>
            </div>
          </CardContent>
        </Card>
        <Illustrations maskImg={{ src: authBackground }} />
      </div>
      <ErrorPopup open={open} close={handlePopupClose} title={title} trailVal={trailVal} />
      <ToastContainer
        position='bottom-center'
        autoClose={500} // all toasts auto close
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />
    </Box>
  )
}

export default Login
