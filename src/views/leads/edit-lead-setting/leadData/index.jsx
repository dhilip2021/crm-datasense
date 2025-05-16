/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { useDispatch, useSelector } from 'react-redux'

// MUI Imports
import Grid from '@mui/material/Grid'

import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify'
import slugify from 'slugify'
import { Box } from '@mui/material'

import { createLead, getFieldListApi, getLeadListApi } from '@/apiFunctions/ApiAction'

import { organizationData } from '@/app/store/organizationSlice'

// Component Imports

import LeadDetails from './leadDetails'

import LeadSingleDetails from './leadSingleDetails'

import LoaderGif from '@assets/gif/loader.gif'
import NotesDetails from './notesDetails'

const keys = [
  'organization_id',
  'salutation',
  'lead_name',
  'lead_id',
  'lead_slug_name',
  'first_name',
  'last_name',
  'email',
  'mobile',
  'phone',
  'gender',
  'organization',
  'website',
  'no_of_employees',
  'annual_revenue',
  'industry',
  'job_title',
  'lead_source',
  'status',
  'live_status'
]

const getMatchedKey = slugLabel => {
  const snakeKey = slugLabel.replace(/-/g, '_')

  return keys.find(key => snakeKey.includes(key)) || snakeKey
}

function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeEmail(email) {
  return email.toLowerCase()
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  return regex.test(email)
}

function isValidNumberStrict(value) {
  const regex = /^[1-9][0-9]*$/

  return regex.test(value)
}

function isValidMobileNumberStrict(value) {
  if (value?.length > 10) {
    return false
  } else {
    const digitsOnly = String(value).replace(/\D/g, '') // removes all non-digit characters
    const regex = /^[6-9][0-9]*$/

    return regex.test(digitsOnly)
  }
}

function formatIndianNumber(number) {
  return new Intl.NumberFormat('en-IN').format(Number(number))
}

function formatURL(url) {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }

  return url
}

function getFirstLetter(str) {
  if (!str) return '' // handle empty/null/undefined

  return str.charAt(0)
}

function removeDuplicatesByKey(data) {
  const map = new Map()

  data.forEach(item => {
    map.set(item.key, item) // overwrite if key already exists
  })

  return Array.from(map.values())
}

const LeadData = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const org = useSelector(state => state.organization)

  console.log(org,"<<< ORG")
  const organization_id = Cookies.get('organization_id')
  const organization_id1 = org?.payloadJson[0]?.organization_id
  const getToken = Cookies.get('_token')

  const [loader, setLoader] = useState(false)
  const [fieldDataList, setFieldDataList] = useState([])
  const [inputs, setInputs] = useState([])
  const [errors, setErrors] = useState([])
  const [leadDatas, setLeadDatas] = useState([])
  const [activeLogs, setActiveLogs] = useState([])
  const [callFlag, setCallFlag] = useState(true)

  const handleBlur = () => {
    const missingFields = inputs
      .filter(item => item.mandatory === 'yes' && !item.value?.trim())
      .map(item => item.slug_label)

    setErrors(missingFields)

    const emailField = inputs.find(item => item.slug_label === 'email')

    if (emailField && emailField.value.trim() !== '') {
      const emailCheck = isValidEmail(emailField.value)

      if (!emailCheck) {
        // Add "email" to the error state if it's not already included
        setErrors(prevErrors => (prevErrors.includes('email') ? prevErrors : [...prevErrors, 'email']))
      } else {
        // Remove "email" from errors if it's valid
        setErrors(prevErrors => prevErrors.filter(e => e !== 'email'))
      }
    }
  }

  const handleChange = e => {
    const { name, value } = e.target

    setActiveLogs(prev => [...new Set([...prev, { key: name, val: value }])])

    // Helper to remove error when field is valid
    const removeError = field => {
      setErrors(prevErrors => prevErrors.filter(err => err !== field))
    }

    if (name === 'email') {
      setInputs(prevInputs =>
        prevInputs.map(input => (input.slug_label === name ? { ...input, value: normalizeEmail(value) } : input))
      )
      if (normalizeEmail(value)) removeError(name)
    } else if (name === 'annual-revenue') {
      const cleanedValue = value.replace(/,/g, '') // remove commas
      const res = Number(cleanedValue)

      if (value === '' || !isNaN(res)) {
        const formattedValue = value === '' ? '' : formatIndianNumber(cleanedValue)

        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: formattedValue } : input))
        )

        if (value === '' || !isNaN(res)) removeError(name)
      }
    } else if (name === getMatchedKey('mobile-no')) {
      const res = isValidMobileNumberStrict(value)

      if (value === '' || res) {
        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: value } : input))
        )
        if (res || value === '') removeError(name)
      }
    } else if (name === getMatchedKey('phone-no')) {
      const res = isValidMobileNumberStrict(value)

      if (value === '' || res) {
        setInputs(prevInputs =>
          prevInputs.map(input => (input.slug_label === name ? { ...input, value: value } : input))
        )
        if (res || value === '') removeError(name)
      }
    } else if (name === 'website') {
      setInputs(prevInputs =>
        prevInputs.map(input =>
          input.slug_label === name ? { ...input, value: normalizeEmail(formatURL(value)) } : input
        )
      )
      if (normalizeEmail(value)) removeError(name)
    } else {
      console.log('check mobbbb')
      setInputs(prevInputs =>
        prevInputs.map(input => (input.slug_label === name ? { ...input, value: capitalizeWords(value) } : input))
      )
      if (value.trim() !== '') removeError(name)
    }
  }

  const getParticularLeadFn = async () => {
    const getId = window.location.pathname?.split('/')?.at(-1)

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await getLeadListApi(getId, header)

    dispatch(organizationData(results))

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setLeadDatas(results?.payloadJson)
    } else {
      setLeadDatas([])
    }
  }

  const fuctionConvertDeal = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createLead(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)

      router.push(`/leads`)
    } else {
      setLoader(false)
      toast?.success(results?.message)
      router.push(`/deals/edit-deal/${results?.payloadJson?.lead_slug_name}`)
    }
  }

  const convertDealFn = (id, lead_name, activity) => {
    const original = lead_name
    const nextLeadName = original.replace(/lead/i, 'DEAL')

    const slugLeadString = nextLeadName.replace(/[^\w\s]|_/g, '')

    const slug_lead_name = slugify(slugLeadString, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: false,
      locale: 'vi',
      trim: true
    })

    const body = {
      Id: id,
      live_status: 'deal',
      lead_name: nextLeadName,
      lead_slug_name: slug_lead_name,
      c_activities: activity
    }

    fuctionConvertDeal(body)
  }

  const getFieldList = async () => {
    const orgId = organization_id1 === undefined ? organization_id : organization_id1

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await getFieldListApi(orgId, header)

    setCallFlag(false)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      const resArr = results?.payloadJson[0]?.fields

      setFieldDataList(resArr)
      const dumArr = []

      resArr.map(data => {
        dumArr.push({
          label: data?.label,
          slug_label: data?.slug_label,
          mandatory: data?.mandatory,
          value: '',
          type: data?.type,
          items: data?.items
        })
      })

      setInputs(dumArr)

      getParticularLeadFn()
    } else {
      setFieldDataList([])
    }
  }

  const funcreateLead = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    setLoader(true)
    const results = await createLead(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
    } else {
      setLoader(false)
      toast?.success(results?.message)

      // router.push('/leads/edit-lead/')
    }
  }

  const handleSubmit = () => {
    const inputObject = inputs.reduce((acc, curr) => {
      const matchedKey = getMatchedKey(curr.slug_label)

      acc[matchedKey] = curr.value

      return acc
    }, {})

    // Get all mandatory fields that are empty
    const missingFields = inputs
      .filter(item => item.mandatory === 'yes' && !item.value?.trim())
      .map(item => item.slug_label)

    let newErrors = [...missingFields]

    const emailField = inputs.find(item => item.slug_label === 'email')

    if (emailField && emailField.value.trim() !== '') {
      const emailCheck = isValidEmail(emailField.value)

      if (!emailCheck) {
        newErrors.push('email')
      }
    }

    // Remove duplicates using Set and update the error state
    setErrors(Array.from(new Set(newErrors)))

    // If there are any missing required fields
    if (Array.from(new Set(newErrors)).length > 0) {
      // setErrors([...errors, missingFields]);
      return false
    } else {
      // If all validations pass, prepare payload

      const cleanedArray = removeDuplicatesByKey(activeLogs)
      const activeResponse = cleanedArray.map(item => `${item.key} : ${item.val}`).join(', ')

      const body = {
        organization_id,
        Id: inputs[0]?._id,

        c_activities: ` Changed to ${activeResponse}`,
        ...inputObject
      }

      // Submit the form (uncomment this in actual use)
      funcreateLead(body)
    }
  }

  const handleClick = () => {
    router.push('/leads')
  }

  useEffect(() => {
   

    const fallbackKeyMap = {
      no_of_employees: 'no-of-empoyees' // Fix typo
    }

    if (leadDatas?.length > 0 && inputs?.length > 0) {
      const convertSlugToKey = slug => fallbackKeyMap[slug] || slug.replace(/-/g, '_')

      const updatedInputs = inputs.map(input => {
        const key = convertSlugToKey(input.slug_label)
        const value = leadDatas[0]?.[key] ?? ''

        return {
          ...input,
          value: value,
          _id: leadDatas[0]._id
        }
      })

      setInputs(updatedInputs)
    }
  }, [leadDatas])

  useEffect(() => {
    if (callFlag) {
      getFieldList()
    }
  }, [organization_id])

  useEffect(() => {
    if (callFlag) {
      getFieldList()
    }
  }, [organization_id1])

  return (
    <Box>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {loader && (
          <Box textAlign={'center'} width={'100%'} mt={'200px'} mb={'100px'}>
            <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
          </Box>
        )}
      </Box>
      {
        !loader && inputs?.length >0 && 
        <Grid container spacing={6}>
        <Grid item xs={12} md={8} lg={8}>
          <LeadSingleDetails
            loader={loader}
            inputs={inputs}
            handleChange={handleChange}
            errors={errors}
            handleBlur={handleBlur}
            handleClick={handleClick}
            handleSubmit={handleSubmit}
          />
          <NotesDetails 
          loader={loader}
          leadDatas={leadDatas}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LeadDetails
            loader={loader}
            inputs={inputs}
            handleChange={handleChange}
            errors={errors}
            handleBlur={handleBlur}
            handleClick={handleClick}
            handleSubmit={handleSubmit}
            leadDatas={leadDatas}
            convertDealFn={convertDealFn}
          />
        </Grid>

        <ToastContainer />
      </Grid>
      }
      
    </Box>
  )
}

export default LeadData
