/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import slugify from 'slugify'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { Box, Button, Card, CardContent, Container, InputAdornment, TextField } from '@mui/material'

import { addFieldApi, getFieldListApi } from '@/apiFunctions/ApiAction'

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
  const isFetched = useRef(false)
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const sensors = useSensors(useSensor(PointerSensor));
  const [loader, setLoader] = useState(false)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [editFlag, setEditFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [callFlag, setCallFlag] = useState(true)
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
  const [fields, setFields] = useState([])
  const [shouldSubmit, setShouldSubmit] = useState(false)
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

 



 


  const getFieldList = async () => {
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

  const handleAction = (option, item, index) => {
    console.log(option,"<<< OPTIONSSS")
    if (option === 'Edit') {
      console.log('Edit clicked for:', item)

      // navigateToEdit(item)
    } else if (option === 'Delete') {
      console.log('Delete clicked for:', item)

      let arr = [...fieldDataList]
      arr.splice(index, 1)
      setFieldDataList(arr)
      handleEditSubmit(arr)
    }
  }



  const handleEditSubmit = async arr => {
    try {
      const body = {
        organization_id: organization_id,
        fields: arr?.length > 0 ? arr : []
      }
      if (inputs?.id !== '') {
        body['Id'] = inputs?.id
      }
      setLoader(true)
      
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const results = await addFieldApi(body, header)
     

      if (results?.appStatusCode !== 0) {
        setOpen(false)
        toast?.error(results?.error)
        getFieldList()
        setLoader(false)
        setShouldSubmit(false)
      } else {
        setLoader(false)
        toast?.success(results?.message)
        setOpen(false)
        setErrors([])
        getFieldList()
        setShouldSubmit(false)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleOnChange = e => {
    const { name, value } = e.target

    setSearch(value)
  }


  
    const handleDragEnd = (event) => {
      const { active, over } = event;
  
      if (active.id !== over.id) {
        const oldIndex = fields.findIndex((item) => item.slug_label === active.id);
        const newIndex = fields.findIndex((item) => item.slug_label === over.id);
  
        const newFields = arrayMove(fields, oldIndex, newIndex).map((item, idx) => ({
          ...item,
          position: idx + 1
        }));
  
        setFields(newFields);
        setShouldSubmit(true)
        // optionally call props.onReorder(newFields)
      }
    };

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
    setFieldArr(prev => prev.map((field, idx) => (idx === 0 ? { ...field, items: menusArr } : field)))
  }, [menusArr])

  useEffect(() => {
    if (!isFetched.current && callFlag && organization_id) {
      getFieldList()
      isFetched.current = true
      setCallFlag(false)
    }
  }, [callFlag])

  useEffect(() => {
    if(fields?.length > 0 && shouldSubmit){
      handleEditSubmit(fields)
    }
   
  }, [shouldSubmit])

  return (
    <div>
      <Box>
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={3}>
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
        <Box>
          {loader && (
            <Box textAlign={'center'} width={'100%'}>
              <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  <Box p={40}>
                    <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
          {fieldDataList?.length === 0 && (
            <Box textAlign={'center'} width={'100%'}>
              <Card className='w-full shadow-md rounded-lg'>
                <CardContent className='text-center'>
                  <Box p={40}>
                    <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Field Found</p>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        <Card>
          {!loader && Array.isArray(fieldDataList) && fieldDataList?.length > 0 && (
            <CardContent className='pt-0'>
              <FieldListPage
                fieldDataList={fieldDataList}
                editFlag={editFlag}
                handleAction={handleAction}
                fields={fields}
                setFields={setFields}
                handleDragEnd={handleDragEnd}
                sensors={sensors}
              />
            </CardContent>
          )}
        </Card>
      </Box>

      <ToastContainer />
    </div>
  )
}

export default FieldListPageContainer
