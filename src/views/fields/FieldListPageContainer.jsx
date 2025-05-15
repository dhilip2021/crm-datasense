'use client'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'


import slugify from 'slugify'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify';
import { Box, Button, Card, CardContent, Container, InputAdornment, TextField } from '@mui/material'

import { getFieldListApi } from '@/apiFunctions/ApiAction'




import FieldListPage from './FieldListPage'

import LoaderGif from '@assets/gif/loader.gif'

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeEmail(email) {
  return email.toLowerCase()
}

function FieldListPageContainer() {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')

  const [loader, setLoader] = useState(false)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [editFlag, setEditFlag] = useState(false)
  const [search, setSearch] = useState('')

  const [inputs, setInputs] = useState({
    id: '',
    organization_id: organization_id,
    fields: []
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
  const [errors, setErrors] = useState([])

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

      updatedCredit[index] = { ...updatedCredit[index], [name]: capitalizeWords(value), ['slug_label']: slug_name }
    } else if (name === 'mandatory') {
      updatedCredit[index] = { ...updatedCredit[index], [name]: value }
    } else if (name === 'type') {
      let obj = {
        menu_value: ''
      }

      setMenusArr([obj])
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

  const getFieldList = async () => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setEditFlag(false)
    console.log(header, 'call1')
    const results = await getFieldListApi(organization_id, header)

    if (results?.appStatusCode === 0) {
      setInputs({ ...inputs, ['id']: results?.payloadJson[0]?._id })
      setFieldDataList(results?.payloadJson[0]?.fields)
    } else {
      setFieldDataList([])
    }
  }




  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setSearch(value)

  }

  const handleInputChange = e => {
    const { name, value } = e.target

    setInputs({ ...inputs, [name]: capitalizeWords(value) })
  }


  useEffect(() => {
    if (open === false) {
      setInputs({
        id: '',
        organization_id: organization_id,
        fields: []
      })

      setErrors([])
    }
  }, [open])

  useEffect(() => {
    getFieldList()
  }, [organization_id])

  useEffect(() => {
    setFieldArr(prev => prev.map((field, idx) => (idx === 0 ? { ...field, items: menusArr } : field)))
  }, [menusArr])

  return (
    <div>
        <Box>
          <Box display={'flex'} justifyContent={'space-between'}  alignItems={'center'} mb={3}>
             <TextField
                          autoComplete='off'
                          placeholder='Search'
                          name='search'
                          value={search}
                          onChange={e => handleOnChange(e)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position='start'>
                                <i className='ri-search-line'></i>
                              </InputAdornment>
                            ),
                            endAdornment: search?.length > 0 && (
                              <InputAdornment position='start' sx={{ cursor: 'pointer' }}>
                                <i className='ri-close-line' onClick={() => setSearch('')}></i>
                              </InputAdornment>
                            )
                          }}
                          size='small'
                        />
            {!editFlag && (
              <Link href={'/fields/add-field'}>
                <Button startIcon={<i className='ri-add-line'></i>} variant='contained' className='mis-4'>
                  Add Field
                </Button>
              </Link>
            )}
          </Box>
          <Card>
          <CardContent className='pt-0'>
          {loader && (
                              <Box textAlign={'center'} width={'100%'} mt={'200px'} mb={'100px'}>
                                <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
                              </Box>
                            )}
          {fieldDataList?.length === 0 && (
                <Box textAlign={'center'} width={'100%'} mt={'100px'} mb={'100px'}>
                <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Field Found</p>
              </Box>
              )}
            </CardContent>
            </Card>
         
          <Card>
          {Array.isArray(fieldDataList) && fieldDataList?.length > 0 && (
            <CardContent className='pt-0'>



              <FieldListPage fieldDataList={fieldDataList} editFlag={editFlag} handleDelete={handleDelete} />
            </CardContent>
          )}
          </Card>
        </Box>
     
      <ToastContainer />
    </div>
  )
}

export default FieldListPageContainer
