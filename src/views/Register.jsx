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

import { ToastContainer, toast } from 'react-toastify';

// Component Imports
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { addOrganizationApi, checkMailApi, craeteUserApi, getOrganizationApi } from '@/apiFunctions/ApiAction'



function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeEmail(email) {
  return email.toLowerCase();
}

const Register = ({ mode }) => {

  const router = useRouter();

  // States
  const [inputs, setInputs] = useState({
    organaization_name: '',
    first_name: '',
    last_name: '',
    email: ''
  })

  const [errorInputs, setErrorInputs] = useState({
    organaization_name: false,
    first_name: false,
    last_name: false,
    email: false
  })

  const [loader, setLoader] = useState(false)
  const [loaderEmail, setLoaderEmail] = useState(false)


  
  const isEmail = (email) => {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (email !== "" && email.match(emailFormat)) {
      return true;
    }

    return false;
  };

  

  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)







  const handleBlur = async e => {
    const { name, value } = e.target

    if (name === 'organaization_name') {
      const checkOrgName = await getOrganizationApi(value)

      if (checkOrgName.appStatusCode === 0) {
        setErrorInputs({ ...errorInputs, organaization_name: true })
      } else {
        setErrorInputs({ ...errorInputs, organaization_name: false })
      }
    } else if (name === 'email') {
      if (!isEmail(value)) {
        setErrorInputs({ ...errorInputs, email: true })
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
    } else if (name === 'email') {
      if (!isEmail(value)) {
        setErrorInputs({ ...errorInputs, email: true })
        setInputs({ ...inputs, [name]: normalizeEmail(value) })
      } else {
        setErrorInputs({ ...errorInputs, email: false })
        setInputs({ ...inputs, [name]: normalizeEmail(value) })
      }
    }
  }

  const handleSubmit = async () => {
    const body = {
      organization_name: inputs?.organaization_name,
      c_version:"Trial"
    }

    if(inputs?.email === ""){
      setErrorInputs({ ...errorInputs, email: true })
    }else if(!isEmail(inputs?.email)){
      setErrorInputs({ ...errorInputs, email: true })
    }

    const result = await addOrganizationApi(body)

    if (result?.appStatusCode === 0) {
      const body1 = {
        first_name: inputs?.first_name,
        last_name: inputs?.last_name,
        c_about_user: 'Super Admin',
        email: inputs?.email,
        role: '',
        c_role_id: '16f01165898b',
        c_user_img_url: '',
        organization_id: result?.payloadJson?.organization_id
      }

      const resultData = await craeteUserApi(body1)

      if (resultData?.appStatusCode === 0) {
        toast.success('Organization successfully created!')
        toast.success('Please check your email.. your password send your mail!')
        router.push("/login")
      } else {
        toast.error('Something Went wrong, Please try after some time')
      }
    } else {
      toast.error('Something Went wrong, Please try after some time')
    }
  }

const checkMail =async (mail)=>{
  const body = {
    email: mail
  }

  setLoaderEmail(true)
  const checkEmail = await checkMailApi(body)

  if (checkEmail?.appStatusCode === 4) {
    setLoaderEmail(false)
    setErrorInputs({ ...errorInputs, email: true })
  } else {
    setLoaderEmail(false)
    setErrorInputs({ ...errorInputs, email: false })
  }
}
  
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (inputs?.email?.length> 0) {
        checkMail(inputs?.email)
      } 
    }, 1000) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke

  }, [inputs?.email])

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-start mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>Make your app management easy and fun!</Typography>
            <form noValidate autoComplete='off' onSubmit={e => e.preventDefault()} className='flex flex-col gap-5'>
              <TextField
                autoFocus
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
                helperText={
                  errorInputs?.organaization_name
                    ? inputs?.organaization_name === ''
                      ? 'Please enter Organization'
                      : 'This Organization already there!'
                    : ''
                }
                sx={{
                  '.MuiFormHelperText-root': {
                    ml: 0
                  }
                }}
              />

              <TextField
                fullWidth
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
                helperText={errorInputs?.first_name && 'Please enter your first name'}
                sx={{
                  '.MuiFormHelperText-root': {
                    ml: 0
                  }
                }}
              />

              <TextField
                fullWidth
                autoComplete='off'
                id='outlined-basic'
                label='Last Name *'
                variant='outlined'
                type='text'
                name='last_name'
                size='small'
                rows={2}
                value={inputs?.last_name}
                onChange={handleChange}
                error={errorInputs?.last_name}
                helperText={errorInputs?.last_name && 'Please enter your last name'}
                sx={{
                  '.MuiFormHelperText-root': {
                    ml: 0
                  }
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
                helperText={
                  inputs?.email === ''
                    ? 'Please enter valid email'
                    : loaderEmail ? "check email" :
                    errorInputs?.email
                      ? ''
                      : ''
                }
                sx={{
                  '.MuiFormHelperText-root': {
                    ml: 0
                  }
                }}
              />

              
              <Button
                fullWidth
                variant='contained'
                type='submit'
                disabled={
                  errorInputs?.organaization_name ||
                  errorInputs?.email ||
                  inputs?.first_name === '' ||
                  inputs?.last_name === ''
                }
                onClick={handleSubmit}
              >
                Register
              </Button>
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
      <ToastContainer />
    </div>
  )
}

export default Register
