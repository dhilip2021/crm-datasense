/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { useRouter } from 'next/navigation'

import Link from 'next/link'
import Image from 'next/image'

import { Box, Button, Grid, InputAdornment, MenuItem, TextField } from '@mui/material'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify';
import slugify from 'slugify'

import { addFieldApi, getFieldListApi } from '@/apiFunctions/ApiAction'




import LoaderGif1 from '@assets/gif/loader1.gif'
import LoaderGif from '@assets/gif/loader.gif'





const menuList = ['text', 'text-multiline', 'select', 'check']

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const AddFieldPage = () => {
   const isFetched = useRef(false);
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')

  const router = useRouter();

  const [loader, setLoader] = useState(false)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [editFlag, setEditFlag] = useState(false)
  const [callFlag, setCallFlag] = useState(true)
  const [inputs, setInputs] = useState({
    id: '',
    organization_id: organization_id,
    fields: []
  })

  const [errors, setErrors] = useState({
    label: false,
    type: false,
  })

  const [menusArr, setMenusArr] = useState([
    {
      menu_value: ''
    }
  ])

  const [fieldArr, setFieldArr] = useState([
    {
      label: '',
      slug_label: '',
      type: '',
      items: menusArr,
      mandatory: 'no'
    }
  ])

  const [fieldDataList, setFieldDataList] = useState([])

  const handleDescription = (e, index) => {
    let { name, value } = e.target
    const updatedCredit = [...fieldArr]

    if (name === 'label') {
      const slugString = value.replace(/[^\w\s]|_/g, '')

      const slug_name = slugify(slugString, {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'vi',
        trim: true
      })

      setErrors({...errors, [name] : false})

      updatedCredit[index] = { ...updatedCredit[index], [name]: capitalizeWords(value), ['slug_label']: slug_name }
    } else if (name === 'mandatory') {
      updatedCredit[index] = { ...updatedCredit[index], [name]: value }
    } else if (name === 'type') {
      let obj = {
        menu_value: ''
      }

      setMenusArr([obj])
      setErrors({...errors, [name] : false})
      updatedCredit[index] = { ...updatedCredit[index], [name]: value }
    }

    setFieldArr(updatedCredit)
  }

  const handleMenuDescription = (e, index) => {
    let { name, value } = e.target
    const updatedCredit = [...menusArr]

    if (name === 'menu_value') {
      updatedCredit[index] = { ...updatedCredit[index], [name]: capitalizeWords(value) }
    }
    
    setMenusArr(updatedCredit)
    setFieldArr(prev => prev.map((field, idx) => (idx === 0 ? { ...field, items: updatedCredit } : field)))
  }

  const handleDelete = index => {
    let arr = [...fieldDataList]

    arr.splice(index, 1)
    setFieldDataList(arr)
  }

  const addSection = () => {
    let obj = {
      label: '',
      slug_label: '',
      type: '',
      mandatory: 'no',
      items: menusArr
    }

    setFieldArr(prev => [...prev, obj])
  }

  const addMenuData = () => {
    let obj = {
      menu_value: ''
    }

    setMenusArr(prev => [...prev, obj])
  }

  const removeMenuData = index => {
    let arr = [...menusArr]

    arr.splice(index, 1)
    setMenusArr(arr)
  }


  const getFieldList = async() => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setEditFlag(false)

    const results = await getFieldListApi(organization_id, header)

    if (results?.appStatusCode === 0) {
      setInputs({ ...inputs, ['id']: results?.payloadJson[0]?._id })
      setFieldDataList(results?.payloadJson[0]?.fields)
    } else {
      setFieldDataList([])
    }
  }

   

  const handleSubmit = async () => {


    if(fieldArr[0]?.label === ""){
      setErrors({ ...errors, label: true })
    }else if(fieldArr[0]?.type === ""){
      setErrors({ ...errors, type: true })
    }else{
      try {
        const header = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        }

        const body = {
          organization_id: organization_id,
          fields: fieldArr
        }
  
        setLoader(true)
        const results = await addFieldApi(body, header)
  
        if (results?.appStatusCode !== 0) {
          toast?.error(results?.error)
          setLoader(false)
          
        } else {
          toast?.success(results?.message)
          setErrors()
          setLoader(false)
          router.push("/fields/list-fields")
        }
      } catch (err) {
        console.log(err)
      }
    }
   
  }


  useEffect(() => {
    if(menusArr?.length > 0){
      setFieldArr(prev => prev.map((field, idx) => (idx === 0 ? { ...field, items: menusArr } : field)))
    }
    
  }, [menusArr])

  useEffect(() => {
    if(!isFetched.current && callFlag && organization_id){
      getFieldList();
      isFetched.current = true;
      setCallFlag(false)
    }
  }, [callFlag]);

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: "none" } : { opacity: 1 }}>
         <Card >
      <CardContent>
        <Grid container spacing={6}>
         
          {Array.isArray(fieldArr) && fieldArr?.map((data, index) => (
            <>
              <Grid item xs={12} md={4}>
                <TextField
                  autoComplete='off'
                  fullWidth
                  id='outlined-basic'
                  label='Label Name'
                  variant='outlined'
                  type='text'
                  name='label'
                  size='small'
                  value={data?.label}
                  onChange={e => handleDescription(e, index)}
                  error={errors?.label}
                  helperText={errors?.label && 'Please enter label'}
                  sx={{
                    '.MuiFormHelperText-root': {
                      ml: 0
                    }
                  }}
                ></TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  autoComplete='off'
                  fullWidth
                  id='outlined-basic'
                  label='mandatory'
                  variant='outlined'
                  type='text'
                  name='mandatory'
                  size='small'
                  value={data?.mandatory}
                  onChange={e => handleDescription(e, index)}
                  
                  sx={{
                    '.MuiFormHelperText-root': {
                      ml: 0
                    }
                  }}
                >
                  {['yes', 'no']?.map(list => (
                    <MenuItem value={list} key={list}>
                      {list}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  autoComplete='off'
                  fullWidth
                  id='outlined-basic'
                  label='Select Type'
                  variant='outlined'
                  type='text'
                  name='type'
                  size='small'
                  value={data?.type}
                  onChange={e => handleDescription(e, index)}
                  error={errors?.type}
                  helperText={errors?.type && 'Please select type'}
                  sx={{
                    '.MuiFormHelperText-root': {
                      ml: 0
                    }
                  }}
                >
                  {menuList?.map(list => (
                    <MenuItem value={list} key={list}>
                      {list?.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {data?.type === 'select' && (
                <>
                  {/* <Grid item xs={4}></Grid>
                   <Grid item xs={4}></Grid> */}
                  <Grid item xs={4} pb={1}>
                    {menusArr.map((listData, index) => (
                      <Box display={'flex'} gap={2} pb={2} key={index}>
                        <TextField
                          autoComplete='off'
                          fullWidth
                          id='outlined-basic'
                          label='Menu Data'
                          variant='outlined'
                          type='text'
                          name='menu_value'
                          size='small'
                          value={listData?.menu_value}
                          onChange={e => handleMenuDescription(e, index)}
                          
                          sx={{
                            '.MuiFormHelperText-root': {
                              ml: 0
                            }
                          }}
                        ></TextField>

                        <Button
                          disabled={menusArr?.length === 1}
                          variant='contained'
                          sx={{
                            bgcolor: '#fff',
                            color: '#000',
                            mr: 0,
                            p: 0,
                            textTransform: 'capitalize',
                            '&:hover': {
                              bgcolor: '#000',
                              color: '#fff'
                            }
                          }}
                          onClick={() => removeMenuData(index)}
                        >
                          X
                        </Button>
                      </Box>
                    ))}
                    <Button
                      variant='contained'
                      sx={{
                        bgcolor: '#ff5267',
                        color: '#fff',
                        mr: 0,
                        p: 1,
                        textTransform: 'capitalize',
                        '&:hover': {
                          bgcolor: '#ff5267'
                        }
                      }}
                      onClick={() => addMenuData()}
                    >
                      Add
                    </Button>
                  </Grid>
                </>
              )}
            </>
          ))}

          <Grid item xs={12}>
            <Box display={'flex'} justifyContent={'space-between'} width={'100%'} pl={2} pr={2} mt={4}>
                <Link href={"/fields/list-fields"}>
                <Button color='primary' variant='outlined'>
                Cancel
              </Button>
                </Link>
             
              <Button
                onClick={handleSubmit}
                color='primary'
                variant='contained'
                sx={{ color: '#fff', ml: 2 }}
                type='submit'
                endIcon={ loader && <Image src={LoaderGif1} width={30} height={30} alt='loader'/>}
                disabled={loader}
              >
                {!loader && "Submit" }
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
    </Box>
   
  )
}

export default AddFieldPage
