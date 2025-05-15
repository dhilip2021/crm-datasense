'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

const EditLeadSetting = ({ tabContentList }) => {
  // States
  const [activeTab, setActiveTab] = useState('leaddata')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <TabList onChange={handleChange} variant='scrollable'>
            <Tab label='Lead Data' icon={<i className='ri-user-3-line' />} iconPosition='start' value='leaddata' />
            <Tab
              label='Notes'
              icon={<i className="ri-sticky-note-add-line"></i>}
              iconPosition='start'
              value='notesdata'
            />
            <Tab label='Tasks' icon={<i className="ri-list-check-3"></i>} iconPosition='start' value='tasksdata' />
            <Tab label='Calls' icon={<i className="ri-phone-line"></i>} iconPosition='start' value='callsdata' />
            <Tab label='Emails' icon={<i className="ri-mail-line"></i>} iconPosition='start' value='emailsdata' />
            <Tab label='Comments' icon={<i className="ri-chat-1-line"></i>} iconPosition='start' value='commentsdata' />
            <Tab label='Activity' icon={<i className='ri-pulse-line' />} iconPosition='start' value='activitydata' />
          </TabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default EditLeadSetting
