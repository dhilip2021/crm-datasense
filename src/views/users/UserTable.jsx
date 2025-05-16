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
import { Box, FormControl, IconButton, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material'


//3rd Party api
import { ToastContainer, toast } from 'react-toastify';

// Component Imports
import Form from '@components/Form'
import { capitalizeWords, normalizeEmail } from '@/helper/frontendHelper'
import { craeteUserApi, userPrivilegeApi } from '@/apiFunctions/ApiAction'






const UserTable = () => {
const organization_id = Cookies.get("organization_id");
const router = useRouter()

// States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [menuList, setMenuList] = useState([]);
  const [loader, setLoader] = useState(false)

  const [inputs, setInputs] = useState({
    first_name:"",
    last_name:"",
    email:"",
    password: "",
    c_role_id:"",
    c_about_user:""
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

const handleOnChange =(e)=>{
const {name, value}= e.target;

if(name === "first_name" || name === "last_name"){
  setInputs({ ...inputs, [name]: capitalizeWords(value)}); 
}else if(name === "email"){
  setInputs({ ...inputs, [name]: normalizeEmail(value)}); 
}else {
  setInputs({ ...inputs, [name]: value}); 
}

}

const handleSubmit =async() =>{

  const body  = {
    organization_id: organization_id,
    first_name: inputs?.first_name,
    last_name: inputs?.last_name,
    c_about_user: inputs?.c_about_user,
    email: inputs?.email,
    role: "",
    c_role_id: inputs?.c_role_id,
    password: inputs?.password,
    c_user_img_url: "",
  };

  if (inputs?.id !== "") {
    body["Id"] = inputs?.id;
  }

  const results = await craeteUserApi(body);
    setLoader(true)
  if (results?.appStatusCode !== 0) {
    setLoader(false)
    toast?.error(results?.message);
    
  } else {
    setLoader(false)
    toast?.success(results?.message);
    router.push("/users-list")
  }


}

const GetAllRoleList = async () => {

  try {
    setLoader(true)
    const results = await userPrivilegeApi({
      role: "",
    });
    setLoader(false)
    setMenuList(results?.payloadJson);

  } catch (err) {
    console.log(err);
  }
};


useEffect(() => {
  GetAllRoleList()
}, [])


  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: "none" } : { opacity: 1 }}>
       <Card>
      {/* <CardHeader title='Add user details' /> */}
      <CardContent>
        <Form>
          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <TextField
                autoFocus
                autoComplete='off'
                fullWidth
                label='First Name'
                placeholder='John'
                name="first_name"
                value={inputs.first_name}
                onChange={handleOnChange}
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
                label='Last Name'
                placeholder='Doe'
                name="last_name"
                value={inputs.last_name}
                onChange={handleOnChange}
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
                type='email'
                label='Email'
                name="email"
                value={inputs.email}
                onChange={handleOnChange}
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
                autoComplete='off'
                fullWidth
                label='Password'
                placeholder='············'
                id='form-layout-basic-password'
                name="password"
                value={inputs.password}
                onChange={handleOnChange}
                type={isPasswordShown ? 'text' : 'password'}
                helperText='Use 8 or more characters with a mix of letters, numbers & symbols'
                InputProps={{
                    startAdornment: (
                        <InputAdornment position='start'>
                          <i className="ri-lock-line"></i>
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
                <InputLabel id='form-layouts-separator-multiple-select-label'>Select Role</InputLabel>
                <Select
                  name='c_role_id'
                  value={inputs.c_role_id}
                  onChange={handleOnChange}
                  id='form-layouts-separator-multiple-select'
                  labelId='form-layouts-separator-multiple-select-label'
                  input={<OutlinedInput label='Language' id='select-multiple-language' />}
                  size='small'
                >
                  {
                    Array.isArray(menuList) && menuList?.map((data, index) => 
                      <MenuItem value={data?.c_role_id} key={index}>{data?.c_role_name}</MenuItem>
                    )
                  }
                 

                  
                </Select>
              </FormControl>
            </Grid>
           
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                rows={4}
                multiline
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
            <Grid item xs={12}>
              <Button variant='contained' type='submit' onClick={handleSubmit}>
                Submit
              </Button>
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
