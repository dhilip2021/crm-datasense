// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Typography from '@mui/material/Typography'

// Components Imports
import OptionMenu from '@core/components/option-menu'

// Vars
const data = [
  {
    progress: 75,
    color: 'primary',
    title: 'DS-00015',
    amount: '₹ 8,50,000.00',
    createdAt: '07-Aug-2025',
    imgSrc: '/images/cards/bitbank.png'
  },
  {
    progress: 50,
    color: 'info',
    title: 'DS-00007',
    amount: '₹ 6,12,000.00',
    createdAt: '06-Aug-2025',
    imgSrc: '/images/cards/bitbank.png'
  },
   {
    progress: 20,
    title: 'DS-00043',
    color: 'warning',
    amount: '₹ 5,70,000.00',
    createdAt: '08-Jul-2025',
    imgSrc: '/images/cards/bitbank.png'
  },
  {
    progress: 20,
    title: 'DS-00018',
    color: 'success',
    amount: '₹ 4,00,000.00',
    createdAt: '01-Aug-2025',
    imgSrc: '/images/cards/bitbank.png'
  },
  
   {
    progress: 20,
    title: 'DS-00047',
    color: 'secondary',
    amount: '₹ 1,50,000.00',
    createdAt: '13-Jul-2025',
    imgSrc: '/images/cards/bitbank.png'
  }
]

const HighValueLeads = () => {
  return (
    <Card>
      <CardHeader
        title='High-Value Leads'
        action={<OptionMenu iconClassName='text-textPrimary' options={['Last 28 Days', 'Last Month', 'Last Year']} />}
      ></CardHeader>
      <CardContent className='flex flex-col gap-11 md:mbs-2.5'>
        <div className='flex flex-col gap-6'>
          {data.map((item, index) => (
            <div key={index} className='flex items-center gap-3'>
              <Avatar src={item.imgSrc} variant='rounded' className='bg-actionHover' />
              <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-0.5'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.title}
                  </Typography>
                  <Typography>{item.createdAt}</Typography>
                </div>
                <div className='flex flex-col gap-2 items-center'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.amount}
                  </Typography>
                  <LinearProgress
                    variant='determinate'
                    value={item.progress}
                    className='is-20 bs-1'
                    color={item.color}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default HighValueLeads
