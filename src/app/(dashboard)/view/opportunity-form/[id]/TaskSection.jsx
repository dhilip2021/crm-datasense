'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, Typography, TextField, Button, Box, IconButton, Avatar } from '@mui/material'
import { FormatBold, AttachFile } from '@mui/icons-material'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Cookies from 'js-cookie'

function getIntial(name = '') {
  const reIntial = (name.match(/\p{L}+/gu) || []) // words with letters (Unicode-safe)
    .map(w => w[0].toUpperCase()) // take first letter of each
    .join('')

  return reIntial
}

const TaskSection = ({ leadId, leadData }) => {
  
 const getToken = Cookies.get('_token');

const leadArrayData = leadData?.values?.Tasks ? leadData.values.Tasks : []

// ✅ proper sorting
const sortedTasks = [...leadArrayData].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
)


  const [task, setTask] = useState('')
  const [title, setTitle] = useState('')
  const [tasks, setTasks] = useState(sortedTasks? sortedTasks : [])

  const [taskError, setTaskError] = useState(false)
  const [titleError, setTitleError] = useState(false)

  // 🔹 ref for auto-focus
  const titleRef = useRef(null)

  const handleChange = e => {
    const { name, value } = e.target

    if (name === 'task') {
      setTaskError(false)
      setTask(value)
    } else if (name === 'title') {
      setTitleError(false)
      setTitle(value)
    }
  }

  const handleClear = () => {
    setTask('')
    setTitle('')
  }

  // 🔹 Save new task
const handleSave = async () => {
  if (task === '') {
    setTaskError(true)
  } else if (title === '') {
    setTitleError(true)
  } else {
    setTaskError(false)
    setTitleError(false)

    try {
      const newTask = {
        title,
        task,
        createdAt: new Date().toISOString()
      }

     

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        
        },
        body: JSON.stringify({
          values: {
            Tasks: [newTask] // ✅ only send new task
          },
          lead_touch: 'touch'
        })
      })

      const result = await res.json()
      console.log('task saved:', result)

      if (result.success) {
        // ✅ update local state immutably
        setTasks(prev => [newTask, ...prev]) // put newest on top
      }

      setTitle('')
      setTask('')
    } catch (err) {
      console.error('Error saving task:', err)
    }
  }
}


  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls='panel3-content' id='panel3-header'>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Typography variant='h6' fontWeight='bold'>
              Task
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {/* List Tasks */}
          {Array.isArray(tasks) &&
            tasks.map((n, i) => (
              <Card key={i} sx={{ p: 2, mb: 2 }}>
                <Box display='flex' alignItems='flex-start' gap={2}>
                  <Avatar>{getIntial(`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`)}</Avatar>
                  <Box flex={1}>
                    <Typography fontWeight='bold'>{n.title}</Typography>
                    <Typography>{n.task}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Lead - <b>{`${leadData?.values?.['First Name']} ${leadData?.values?.['Last Name']}`}</b> •{' '}
                      {new Date(n.createdAt).toLocaleString()} by {n.createdBy}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}

          {/* Editor */}
          <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mt: 2 }}>
            <TextField
              placeholder='Title'
              variant='standard'
              fullWidth
              //   inputRef={titleRef}
              value={title}
              onChange={e => handleChange(e)}
              sx={{ mb: 1 }}
              name='title'
              error={titleError}
              helperText={titleError && 'Please enter title'}
            />
            <TextField
              placeholder="What's this task about?"
              multiline
              rows={4}
              fullWidth
              value={task}
              onChange={e => handleChange(e)}
              sx={{ mb: 2 }}
              name='task'
              error={taskError}
              helperText={taskError && 'Please enter tasks'}
            />

            <Box display='flex' justifyContent='space-between' alignItems='center'>
              <Box>
                <IconButton>
                  <FormatBold />
                </IconButton>
                <IconButton>
                  <AttachFile />
                </IconButton>
              </Box>
              <Box>
                <Button onClick={() => handleClear()}>Clear</Button>
                <Button variant='contained' onClick={()=>handleSave()}>
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </>
  )
}

export default TaskSection
