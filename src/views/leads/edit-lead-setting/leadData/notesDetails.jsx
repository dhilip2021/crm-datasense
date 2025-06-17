// ** React Imports
import React from 'react'

import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material'

import OptionsMenu from '@core/components/option-menu'
import NotesDataPopup from '../notesData/NotesDataPopup'
import { createLead } from '@/apiFunctions/ApiAction'
import { toast } from 'react-toastify'

function getHours(value) {
  const givenTimestamp = new Date(value)
  const currentTime = new Date()
  const timeDifferenceMs = currentTime - givenTimestamp

  const timeDifferenceMinutes = Math.floor(timeDifferenceMs / (1000 * 60))
  const timeDifferenceHours = Math.floor(timeDifferenceMinutes / 60)
  const timeDifferenceDays = Math.floor(timeDifferenceHours / 24)

  if (timeDifferenceDays >= 1) {
    return `${timeDifferenceDays} ${timeDifferenceDays < 2 ? 'day ago' : 'days ago'}`
  } else if (timeDifferenceHours >= 1) {
    const remainingMinutes = timeDifferenceMinutes % 60

    return `${timeDifferenceHours} ${
      timeDifferenceHours < 2 ? 'hr' : 'hrs'
    } ${remainingMinutes} ${remainingMinutes < 2 ? 'min ago' : 'mins ago'}`
  } else {
    return `${timeDifferenceMinutes} ${timeDifferenceMinutes < 2 ? 'min ago' : 'mins ago'}`
  }
}

const NotesDetails = ({ loader, setLoader, leadDatas, organization_id, getToken, getParticularLeadFn }) => {
  const [open, setOpen] = React.useState(false)
  const [titles, setTitles] = React.useState('Add your notes')
  const [search, setSearch] = React.useState('')
  const [inputs, setInputs] = React.useState({
    title: '',
    status: 1,
    comment: '',
    _id: ''
  })

  const [notesArr, setNotesArr] = React.useState([])

  const [errors, setErrors] = React.useState({
    title: false,
    status: false,
    comment: false,
    _id: false
  })

  const handleAction = (option, item) => {
    
    if (option === 'Edit') {
      setTitles('Edit your notes')
      setInputs({
        title: item.title,
        comment: item.comment,
        status: item.status,
        _id: item._id
      })
      setOpen(true)

      // navigateToEdit(item)
    } else if (option === 'Delete') {
      

      const obj = {
        title: item.title,
        comment: item.comment,
        status: 0,
        _id: item._id,
        createdAt: item.createdAt
      }

      setNotesArr(prev => prev.map(data => (data._id === obj._id ? { ...data, ...obj } : data)))

      const body = {
        Id: leadDatas[0]?._id,
        c_notes: obj,
        c_activities: `Notes deleted ${item?.title}`
      }

      leadNotesCreation(body)
    }
  }

  const handleChange = e => {
    e.preventDefault()
    const { name, value } = e.target

    setErrors(prev => ({ ...prev, [name]: false }))
    setInputs(prev => ({ ...prev, [name]: value }))
  }

  const handleClose = () => {
    setOpen(false)
    setErrors({ title: false, comment: false, status: false, _id: false })
    setInputs({ title: '', comment: '', status: 1, _id: '' })
  }

  const leadNotesCreation = async body => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const results = await createLead(body, header)

    if (results?.appStatusCode !== 0) {
      toast?.error(results?.error)
      setLoader(false)
      setOpen(false)
      toast?.success(results?.error)
      getParticularLeadFn(organization_id)
    } else {
      getParticularLeadFn(organization_id)
      setLoader(false)
      toast?.success(results?.message)
      setOpen(false)
    }
  }

  const handleBlur = () => {}

  const handleSubmit = () => {
    if (inputs?.title === '') {
      setErrors(prev => ({ ...prev, ['title']: true }))
    } else {
      if (inputs._id === '') {
        const body = {
          Id: leadDatas[0]?._id,
          c_notes: inputs,
          c_activities: `Notes created ${inputs?.title}`
        }

        leadNotesCreation(body)
        setOpen(false)
      } else {
        const body = {
          Id: leadDatas[0]?._id,
          c_notes: inputs,
          c_activities: `Notes updated ${inputs?.title}`
        }

        leadNotesCreation(body)
        setOpen(false)
      }
    }
  }

  React.useEffect(() => {
    if (Array.isArray(leadDatas)) {
      // Collect all notes across all leads
      const allNotes = leadDatas
        .flatMap(item => item?.c_notes || []) // Safely get c_notes or empty array
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date descending

      setNotesArr(allNotes)
    }
  }, [leadDatas])

  return (
    <Box style={loader ? { opacity: 0.3, pointerEvents: 'none' } : { opacity: 1 }}>
      <Box mt={5} mb={5} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Typography variant='h5'>Notes</Typography>
        <Button
          onClick={() => setOpen(true)}
          startIcon={<i className='ri-add-line'></i>}
          variant='contained'
          className='mis-4'
        >
          Create Note
        </Button>
      </Box>

      <Box display={'flex'} gap={4}>
        {Array.isArray(notesArr) &&
          notesArr.map(
            (item, index) =>
              item.status === 1 && (
                <Grid item xs={12} sm={12} md={4} key={index}>
                  <Card>
                    <CardHeader
                      title={`${item.title}`}
                      action={
                        <OptionsMenu
                          iconClassName='text-textPrimary'
                          options={['Edit', 'Delete']}
                          onOptionClick={(option, e) => handleAction(option, item)}
                        />
                      }
                    />
                    <CardContent>
                      <div className='flex flex-col items-start'>
                        <Typography>{item.comment}</Typography>
                      </div>
                      <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2 mbe-5 mbs-[30px]'>
                        <div className='flex justify-between items-center flex-wrap gap-x-4 gap-y-2'>
                          <Typography variant='subtitle2' color='text.disabled'>
                            {getHours(item.createdAt)}
                          </Typography>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              )
          )}
      </Box>
      <NotesDataPopup
        open={open}
        close={handleClose}
        titles={titles}
        inputs={inputs}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
        handleBlur={handleBlur}
        loader={loader}
      />
    </Box>
  )
}

export default NotesDetails
