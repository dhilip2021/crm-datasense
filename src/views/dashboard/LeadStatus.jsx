// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Vars
const data = [
  {
    lead_count: '40',
    title: 'Today Leads',
    color: 'primary',
    icon: 'ri-calendar-todo-line' // Calendar for "Today"
  },
  {
    lead_count: '18',
    title: 'Hot Leads',
    color: 'error',
    icon: 'ri-fire-line' // Fire for "Hot"
  },
  {
    lead_count: '10',
    title: 'Warm Leads',
    color: 'warning',
    icon: 'ri-sun-line' // Sun for "Warm"
  },
  {
    lead_count: '12',
    title: 'Cold Leads',
    color: 'info',
    icon: 'ri-snowflake-line' // Snowflake for "Cold"
  }
]

// Styled Card with hover effect
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.08)'
  }
}))

const LeadStatus = () => {
  return (
    <Grid container spacing={3}>
      {data.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard>
            <CardContent className='flex items-center gap-4'>
              <CustomAvatar
                variant='rounded'
                color={item.color}
                className='shadow-md'
                sx={{ width: 60, height: 60, fontSize: 30 }}
              >
                <i className={item.icon}></i>
              </CustomAvatar>
              <div>
                <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                  {item.title}
                </Typography>
                <Typography variant='h3' sx={{ fontWeight: 600 }}>
                  {item.lead_count}
                </Typography>
              </div>
            </CardContent>
          </StatCard>
        </Grid>
      ))}
    </Grid>
  )
}

export default LeadStatus
