import Link from 'next/link'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'


// Component Imports
import EditLeadSetting from '@/views/leads/edit-lead-setting'

const LeadDataTab = dynamic(() => import('@views/leads/edit-lead-setting/leadData'))
const NotesDataTab = dynamic(() => import('@views/leads/edit-lead-setting/notesData'))
const TasksDataTab = dynamic(() => import('@views/leads/edit-lead-setting/tasksData'))
const CallsDataTab = dynamic(() => import('@views/leads/edit-lead-setting/callsData'))
const EmailsDataTab = dynamic(() => import('@views/leads/edit-lead-setting/emailsData'))
const CommentsDataTab = dynamic(() => import('@views/leads/edit-lead-setting/commentsData'))
const ActivityDataTab = dynamic(() => import('@views/leads/edit-lead-setting/activityData'))

// Vars
const tabContentList = () => ({
  leaddata: <LeadDataTab />,
  notesdata: <NotesDataTab />,
  tasksdata: <TasksDataTab />,
  callsdata: <CallsDataTab />,
  emailsdata: <EmailsDataTab />,
  commentsdata: <CommentsDataTab />,
  activitydata: <ActivityDataTab />,


})

const EditLead = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Link underline='hover' color='inherit' href='/leads'>
            Leads
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Create Lead </Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={12}>
      <EditLeadSetting tabContentList={tabContentList()} />
      </Grid>

      
      
      
    </Grid>
  )
 
}

export default EditLead

