// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

// Component Imports
import Link from '@components/Link'

// Vars
const depositData = [
  {
    leads: '128',
    title: 'WatsApp',
    subtitle: 'Watsapp leads',
    logo: '/images/social/whatsapp.png'
  },
  {
    leads: '186',
    title: 'Linked In',
    subtitle: 'LinedIn Leads',
    logo: '/images/social/linkedin.png'
  },
  {
    leads: '350',
    title: 'Employee Referal',
    subtitle: 'Employee Referal Leads',
    logo: '/images/social/employee_referel.png'
  },
  {
    leads: '837',
    title: 'Cold Call',
    subtitle: 'Cold Call Leads',
    logo: '/images/social/cold_call.png'
  },
  {
    leads: '446',
    title: 'Advertisement',
    subtitle: 'Advertisement Leads',
    logo: '/images/social/advertisement.png'
  }
]

const withdrawData = [
  {
    leads: '43',
    title: 'WatsApp',
    subtitle: 'Watsapp Opportunity',
    logo: '/images/social/whatsapp.png'
  },
  {
    leads: '27',
    title: 'Linked In',
    subtitle: 'LinedIn Opportunity',
    logo: '/images/social/linkedin.png'
  },
  {
    leads: '53',
    title: 'Employee Referal',
    subtitle: 'Employee Referal Opportunity',
    logo: '/images/social/employee_referel.png'
  },
  {
    leads: '18',
    title: 'Cold Call',
    subtitle: 'Cold Call Opportunity',
    logo: '/images/social/cold_call.png'
  },
  {
    leads: '45',
    title: 'Advertisement',
    subtitle: 'Advertisement Opportunity',
    logo: '/images/social/advertisement.png'
  }
]

const LeadBySource = () => {
  return (
    <Card>
      <Grid container>
        <Grid item xs={12} md={6} className='border-be md:border-be-0 md:border-ie'>
          <CardHeader
            title='Leads'
            action={
              <Typography component={Link} className='font-medium' color='primary'>
                View All
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-5'>
            {depositData.map((item, index) => (
              <div key={index} className='flex items-center gap-4'>
                <img src={item.logo} alt={item.title} width={30} />
                <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                  <div className='flex flex-col gap-0.5'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.title}
                    </Typography>
                    <Typography>{item.subtitle}</Typography>
                  </div>
                  <Typography color='success.main' className='font-medium'>
                    {item.leads}
                  </Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Grid>
        <Grid item xs={12} md={6}>
          <CardHeader
            title='Opportunity'
            action={
              <Typography component={Link} className='font-medium' color='primary'>
                View All
              </Typography>
            }
          />
          <CardContent className='flex flex-col gap-5'>
            {withdrawData.map((item, index) => (
              <div key={index} className='flex items-center gap-4'>
                <img src={item.logo} alt={item.title} width={30} />
                <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                  <div className='flex flex-col gap-0.5'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.title}
                    </Typography>
                    <Typography>{item.subtitle}</Typography>
                  </div>
                  <Typography color='error.main' className='font-medium'>
                    {item.leads}
                  </Typography>
                </div>
              </div>
            ))}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default LeadBySource
