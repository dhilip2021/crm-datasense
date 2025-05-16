/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'

// Next Imports
import Link from 'next/link'

import Image from 'next/image'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import { FormGroup, IconButton, InputAdornment } from '@mui/material'
import { ToastContainer, toast } from 'react-toastify';

// Component Imports
import Form from '@components/Form'
import DirectionalIcon from '@components/DirectionalIcon'
import Illustrations from '@components/Illustrations'
import Logo from '@components/layout/shared/Logo'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { checkMailApi, forgotPasswordApi } from '@/apiFunctions/ApiAction'

import LoaderGif2 from '@assets/gif/loader2.gif'

const ForgotPassword = ({ mode }) => {

  const [toastFlag, setToastFlag] = useState(false);
  const [email, setEmail] = useState("");
  const [statusCode, setstatusCode] = useState();
  const [loader, setLoader] = useState(false);
  const [loaderEmail, setLoaderEmail] = useState(false);
  const [successFlag, setSuccessFlag] = useState(false);
  const [checkFlag, setCheckFlag] = useState(false);

  const [error, setError] = useState({
    email: false,
    password: false,
  });


  const isEmail = (email) => {
    var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    if (email !== "" && email.match(emailFormat)) {
      return true;
    }

    return false;
  };

  
  const formSubmitHandle = () => {
    // window.location.reload();
    if (!isEmail(email)) {
      setError({ ...error, email: true });
    } else {
      setLoader(true);
      forgetPasswordFn();
    }
  };

  const forgetPasswordFn = async () => {
    const body = {
      email: email,
      c_redirect: `${window.location.origin}/change-password`,
    };

    let results = await forgotPasswordApi(body);

    if (results.appStatusCode !== 0) {
      setLoader(false);
      toast.error(results?.error);
    } else {
      setLoader(false);
      setstatusCode(results.appStatusCode);
      toast.success(results?.message);
      setSuccessFlag(true);
    }
  };

  const checkMailFn = async () => {
    const body = {
      email: email,
    };
    
    setLoaderEmail(true);

    let results = await checkMailApi(body);

    if (results?.appStatusCode !== 4) {
      setLoaderEmail(false)
      setCheckFlag(false);
      toast.error("This email is not registered with us");
      setToastFlag(true);
      setstatusCode(results?.appStatusCode);
    } else {
      setLoaderEmail(false)
      setCheckFlag(false);
      setstatusCode(results?.appStatusCode);
    }
  };

  const handleBlur = () => {
    if (!error?.email && isEmail(email) && !toastFlag) {
      setCheckFlag(true);
      
    }
  };




  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if(email?.length > 0){
        checkMailFn();
      }
    }, 1000) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [email])


  

  return (
    <div className='flex flex-col justify-center items-center min-bs-[100dvh] relative p-6'>
      <Card className='flex flex-col sm:is-[450px]'>
        <CardContent className='p-6 sm:!p-12'>
          <Link href='/' className='flex justify-center items-center mbe-6'>
            <Logo />
          </Link>
          <Typography variant='h4'>Forgot Password 🔒</Typography>
          <div className='flex flex-col gap-5'>
            <Typography className='mbs-1'>
              Enter your email and we&#39;ll send you instructions to reset your password
            </Typography>
            <Form noValidate autoComplete='off' className='flex flex-col gap-5'>
              {/* <TextField autoFocus fullWidth label='Email' /> */}

              <FormGroup>
              <TextField
                autoFocus
                fullWidth
                type="email"
                defaultValue={email}
                disabled={successFlag}
                onBlur={() => handleBlur()}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError({ ...error, email: false, password: false });
                  setToastFlag(false);
                }}
                label="Enter your email"
                placeholder="eg: test123@gmail.com"
                error={error.email}
                helperText={error.email && email !== "" ?  "Please enter valid email" :( error.email &&  email === "" && "Please check this email")}
                InputProps={{
                                    endAdornment: (
                                      <InputAdornment position='end'>
                                        <IconButton
                                          size='small'
                                          edge='end'
                                          aria-label='toggle password visibility'
                                        >
                                         { loaderEmail && <Image src={LoaderGif2} width={30} height={30} alt='loader'/>}
                                        </IconButton>
                                      </InputAdornment>
                                    )
                                  }}
              />
             

              
          </FormGroup>


              <Button 
              disabled={loaderEmail}
              fullWidth 
              variant='contained' 
              type='submit'  
              onClick={formSubmitHandle}>
                Send reset link
              </Button>
              <Typography className='flex justify-center items-center' color='primary'>
                <Link href='/login' className='flex items-center'>
                  <DirectionalIcon ltrIconClass='ri-arrow-left-s-line' rtlIconClass='ri-arrow-right-s-line' />
                  <span>Back to Login</span>
                </Link>
              </Typography>
            </Form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
      <ToastContainer />
    </div>
  )
}

export default ForgotPassword
