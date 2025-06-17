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
import { addFieldApi, getFieldListApi, LoginApi } from '@/apiFunctions/ApiAction'

//react-toastify
import 'react-toastify/dist/ReactToastify.css'
// eslint-disable-next-line import/order
import { useDispatch } from 'react-redux'
import { loginData } from '@/app/store/loginSlice'
import ErrorPopup from './ErrorPopup'

const isEmail = email => {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

  if (email !== '' && email.match(emailFormat)) {
    return true
  }

  return false
}

 const staticFields= [
        {
            "position": 1,
            "label": "Salutation",
            "slug_label": "salutation",
            "type": "select",
            "items": [
                {
                    "menu_value": "Mr"
                },
                {
                    "menu_value": "Mrs"
                },
                {
                    "menu_value": "Miss"
                },
                {
                    "menu_value": "Madam"
                },
                {
                    "menu_value": "Dr"
                },
                {
                    "menu_value": "Proff"
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 2,
            "label": "First Name",
            "slug_label": "first-name",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "yes"
        },
        {
            "position": 3,
            "label": "Last Name",
            "slug_label": "last-name",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 4,
            "label": "Email",
            "slug_label": "email",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 5,
            "label": "Mobile",
            "slug_label": "mobile",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
         {
            "position": 6,
            "label": "Phone",
            "slug_label": "phone",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 7,
            "label": "Gender",
            "slug_label": "gender",
            "type": "select",
            "items": [
                {
                    "menu_value": "Female"
                },
                {
                    "menu_value": "Genderqueer"
                },
                {
                    "menu_value": "Male"
                },
                {
                    "menu_value": "Non-Conforming"
                },
                {
                    "menu_value": "Other"
                },
                {
                    "menu_value": "Prefer Not To Say"
                },
                {
                    "menu_value": "Transgender"
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 8,
            "label": "Organization",
            "slug_label": "organization",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 9,
            "label": "Website",
            "slug_label": "website",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 10,
            "label": "No Of Employees",
            "slug_label": "no-of-employees",
            "type": "select",
            "items": [
                {
                    "menu_value": "1-10"
                },
                {
                    "menu_value": "11-50"
                },
                {
                    "menu_value": "51-200"
                },
                {
                    "menu_value": "201-500"
                },
                {
                    "menu_value": "501-1000"
                },
                {
                    "menu_value": "1000+"
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 11,
            "label": "Annual Revenue",
            "slug_label": "annual-revenue",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 12,
            "label": "Industry",
            "slug_label": "industry",
            "type": "select",
            "items": [
                {
                    "menu_value": "Securities & Commodity Exchanges"
                },
                {
                    "menu_value": "Service"
                },
                {
                    "menu_value": "Soap & Detergent"
                },
                {
                    "menu_value": "Software"
                },
                {
                    "menu_value": "Sports"
                },
                {
                    "menu_value": "Technology"
                },
                {
                    "menu_value": "Telecommunications"
                },
                {
                    "menu_value": "Television"
                },
                {
                    "menu_value": "Transportation"
                },
                {
                    "menu_value": "Venture Capital"
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 13,
            "label": "Job Title",
            "slug_label": "job-title",
            "type": "text",
            "items": [
                {
                    "menu_value": ""
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 14,
            "label": "Lead Source",
            "slug_label": "lead-source",
            "type": "select",
            "items": [
                {
                    "menu_value": "Advertisement"
                },
                {
                    "menu_value": "Campaign"
                },
                {
                    "menu_value": "Cold Calling"
                },
                {
                    "menu_value": "Customer's Vendor"
                },
                {
                    "menu_value": "Exhibition"
                },
                {
                    "menu_value": "Existing Customer"
                },
                {
                    "menu_value": "Mass Mailing"
                },
                {
                    "menu_value": "Reference"
                },
                {
                    "menu_value": "Supplier Reference"
                },
                {
                    "menu_value": "Walk In"
                }
            ],
            "mandatory": "no"
        },
        {
            "position": 15,
            "label": "Status",
            "slug_label": "status",
            "type": "select",
            "items": [
                {
                    "menu_value": "New"
                },
                {
                    "menu_value": "Contacted"
                },
                {
                    "menu_value": "Nurture"
                },
                {
                    "menu_value": "Qualified"
                },
                {
                    "menu_value": "Unqualified"
                },
                {
                    "menu_value": "Junk"
                },
                {
                    "menu_value": "Qualification"
                },
                {
                    "menu_value": "Demo/Making"
                },
                {
                    "menu_value": "Proposal/Quotation"
                },
                {
                    "menu_value": "Negotiation"
                },
                {
                    "menu_value": "Ready To Close"
                },
                {
                    "menu_value": "Won"
                },
                {
                    "menu_value": "Lost"
                }
            ],
            "mandatory": "no"
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
  const [title, setTitle] = useState("")
  const [trailVal, setTrailVal] = useState("")
  

  const [values, setValues] = useState({
    showPassword: false
  })

  const [error, setError] = useState({
    email: false,
    password: false
  })

  const handlePopupClose=(val)=>{
    setOpen(false)
    setLoader(false)
    setTitle("")
    
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

    let results = await LoginApi(body)

    dispatch(loginData(results))

    if (results?.appStatusCode === 4) {
      setLoader(false)

      toast.error(results?.error)

      if (results.error !== 'Invalid credential') {
        setEmail('')
        setPassword('')
        setIsChecked(false)
      }
    } else if (results?.appStatusCode === 0) {

        
         const header = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${results?.payloadJson?.tokenAccess}`
            }
        
         
        
            const fieldResponse = await getFieldListApi(results?.payloadJson?.organization_id, header)

            

            if(fieldResponse?.payloadJson?.length === 0){
              const body2= {
                organization_id: results?.payloadJson?.organization_id,
                fields: staticFields,
            }

             const header = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${results?.payloadJson?.tokenAccess}`
        }

        const resultFields = await addFieldApi(body2,header)


            }


      if (results?.payloadJson?.c_version === 'Trial') {



        const localDateStr = new Date()
        const isoUtc = new Date(localDateStr).toISOString()
        const today = new Date(isoUtc)
        const endDate = new Date(results?.payloadJson?.endedAt)

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
  
          results?.payloadJson?.privileges.map(data => dummyArray.push(data?.role_privileage))
  
          Cookies.set('_token', results?.payloadJson?.tokenAccess)
          Cookies.set('_token_expiry', results?.payloadJson?.tokenExpiry)
          Cookies.set('role_id', results?.payloadJson?.c_role_id)
          Cookies.set('user_id', results?.payloadJson?.user_id)
          Cookies.set('organization_id', results?.payloadJson?.organization_id)
          Cookies.set('organization_name', results?.payloadJson?.organization_name)
          Cookies.set('c_version', results?.payloadJson?.c_version)
          Cookies.set('endedAt', results?.payloadJson?.endedAt)
          Cookies.set('role_name', results?.payloadJson?.role)
          Cookies.set('user_name', results?.payloadJson?.user_name)
          Cookies.set('privileges', JSON.stringify(dummyArray))
  
          router.push('/')
          router.refresh()
          handleSuccess()
  
          toast.success('login successful', {
            autoClose: 1000
          })
          setLoader(false)
        } else if (today > endDate) {
          
          setTitle("Sorry ! Your trial period has ended. Please get in touch with your administrator.")
          setOpen(true)
          setTrailVal("1")
        } else {
          setTitle("Today is the last day of your trial period. Contacting your administrator is necessary.")
          setOpen(true)
          setTrailVal("2")
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

        results?.payloadJson?.privileges.map(data => dummyArray.push(data?.role_privileage))

        Cookies.set('_token', results?.payloadJson?.tokenAccess)
        Cookies.set('_token_expiry', results?.payloadJson?.tokenExpiry)
        Cookies.set('role_id', results?.payloadJson?.c_role_id)
        Cookies.set('user_id', results?.payloadJson?.user_id)
        Cookies.set('organization_id', results?.payloadJson?.organization_id)
        Cookies.set('organization_name', results?.payloadJson?.organization_name)
        Cookies.set('c_version', results?.payloadJson?.c_version)
        Cookies.set('endedAt', results?.payloadJson?.endedAt)
        Cookies.set('role_name', results?.payloadJson?.role)
        Cookies.set('user_name', results?.payloadJson?.user_name)
        Cookies.set('privileges', JSON.stringify(dummyArray))

        router.push('/')
        router.refresh()
        handleSuccess()

        toast.success('login successful', {
          autoClose: 1000
        })
        setLoader(false)
      }
    } else {
      setLoader(false)
      toast.error('Something Went wrong, Please try after some time')
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
          <CardContent className='p-6 sm:!p-12'>
            <Link href='/' className='flex justify-center items-center mbe-6'>
              <Logo />
            </Link>
            <div className='flex flex-col gap-5'>
              <div>
                <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}!`}</Typography>
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

                {/* <div className='flex justify-center items-center flex-wrap gap-2'>
                  <Typography>New on our platform?</Typography>
                  <Typography component={Link} href='/register' color='primary'>
                    Create your Organization
                  </Typography>
                </div> */}
                <Divider sx={{ my: 5 }}>or</Divider>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            </Box>
              </form>
            </div>
          </CardContent>
        </Card>
        <Illustrations maskImg={{ src: authBackground }} />
      </div>
      <ToastContainer />
      <ErrorPopup 
      open={open}
      close={handlePopupClose}
      title={title}
      trailVal={trailVal}
      />
    </Box>
  )
}

export default Login
