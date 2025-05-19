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
import { ToastContainer, toast } from 'react-toastify';

import Cookies from 'js-cookie'

import { Box } from '@mui/material'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { LoginApi } from '@/apiFunctions/ApiAction';


//react-toastify
import 'react-toastify/dist/ReactToastify.css';
// eslint-disable-next-line import/order
import { useDispatch } from 'react-redux'
import { loginData } from '@/app/store/loginSlice'


const isEmail = (email) => {
  var emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

  if (email !== "" && email.match(emailFormat)) {
    return true;
  }

  return false;
};

const Login = ({ mode }) => {

  const dispatch = useDispatch();

  const organization_id = Cookies.get('organization_id')

  const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;


  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [values, setValues] = useState({
    showPassword: false
  })

  const [error, setError] = useState({
    email: false,
    password: false,
  });


  // Vars
  const darkImg = '/images/pages/auth-v1-mask-dark.png'
  const lightImg = '/images/pages/auth-v1-mask-light.png'

  // Hooks
  const router = useRouter()
  const authBackground = useImageVariant(mode, lightImg, darkImg)




  // ** State

 

  const handleSubmit = e => {
    e.preventDefault()
    router.push('/')
  }

  

  const handleChange =(e)=>{
    const {name, value} = e.target;

    if(name === "email"){
      setEmail(value.toLowerCase())
      setError({ ...error, [name]: false });
    }else if(name === "password"){
      setPassword(value)
      setError({ ...error, [name]: false });
    }

  }

  const handleClickShowPassword = () => {
    setValues({ ...values, showPassword: !values.showPassword })
  }



  const LoginFunction = async () => {

    
    
    const body = {
      email: email,
      password: password,
    };

    setLoader(true);

    let results = await LoginApi(body);

    dispatch(loginData(results))

    if (results?.appStatusCode === 4) {
      setLoader(false);
      
      toast.error(results?.error);

      if(results.error !== "Invalid credential"){
        setEmail("");
        setPassword("");
      }


    } else if (results?.appStatusCode === 0) {
      

      if(isChecked){
        localStorage.setItem("user_checked", "1"); 
        localStorage.setItem("user_email", email);
        localStorage.setItem("user_password", password);
      }else{
        localStorage.setItem("user_checked", "");
        localStorage.setItem("user_email", "");
        localStorage.setItem("user_password", "");
      }

      let dummyArray =[];

      results?.payloadJson?.privileges.map((data) => 
        dummyArray.push(data?.role_privileage)
      )
     
      Cookies.set("_token", results?.payloadJson?.tokenAccess);
      Cookies.set("_token_expiry", results?.payloadJson?.tokenExpiry);
      Cookies.set("role_id", results?.payloadJson?.c_role_id);
      Cookies.set("user_id", results?.payloadJson?.user_id);
      Cookies.set("organization_id", results?.payloadJson?.organization_id);
      Cookies.set("organization_name", results?.payloadJson?.organization_name);
      Cookies.set("c_version", results?.payloadJson?.c_version);
      Cookies.set("endedAt", results?.payloadJson?.endedAt);
      Cookies.set("role_name", results?.payloadJson?.role);
      Cookies.set("user_name", results?.payloadJson?.user_name);
      Cookies.set("privileges", JSON.stringify(dummyArray));
      // router.push(`/`);
      toast.success("login successful",{
        autoClose: 1000, // closes in 2 seconds
      });
      setLoader(false);
      await router.push("/");


    } else {
      setLoader(false);
      toast.error("Something Went wrong, Please try after some time");
    }
  };

  const formSubmitHandle = (e) => {

    e.preventDefault()

    if (!isEmail(email)) {
      setError({ ...error, email: true });
    } else if (!password.match(passRegex)) {
      setError({ ...error, password: true });
    } else {
      setLoader(true);

      LoginFunction();
    }
  };

  

  
  useEffect(() => {
    // if(getToken){
    //   router.push("/")
    // }


    const userEmail  = localStorage.getItem("user_email")
    const userPassword  = localStorage.getItem("user_password")
    const userChecked  = localStorage.getItem("user_checked")
  
    if(userChecked === "1"){
    setEmail(userEmail);
    setPassword(userPassword);
    setIsChecked(true);
    }else{
    setEmail("");
    setPassword("");
    setIsChecked(false);
    }
  }, [])


  // if(organization_id !== undefined ){
  //   return (router.push("/"))
  // }



  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: "none" } : { opacity: 1 }}>
      
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
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField 
              autoFocus 
              fullWidth 
              label='Email'
              value={email}
              name="email"
              onChange={handleChange}
              error={error.email}
              helperText={error.email && "Please enter valid email"}
              />
              <TextField
                fullWidth
                label='Password'
                id='outlined-adornment-password'
                value={password}
                name="password"
                onChange={handleChange}
                error={error.password}
                helperText={error.password && "Please enter valid password"}
                type={values.showPassword ? 'text' : 'password'}
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
                <FormControlLabel control={<Checkbox   checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}/>} label='Remember me' />
                <Typography className='text-end' color='primary' component={Link} href='/forgot-password'>
                  Forgot password?
                </Typography>
              </div>
              <Button fullWidth variant='contained' type='submit' onClick={(e)=>formSubmitHandle(e)}>
                Log In
              </Button>

              <div className='flex justify-center items-center flex-wrap gap-2'>
                <Typography>New on our platform?</Typography>
                <Typography component={Link} href='/register' color='primary'>
                  Create your Organization
                </Typography>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
      <Illustrations maskImg={{ src: authBackground }} />
    </div>
    <ToastContainer />
    </Box>
    
  )
}

export default Login
