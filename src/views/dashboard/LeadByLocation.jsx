import { useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import CustomAvatar from '@core/components/mui/Avatar'
import Skeleton from '@mui/material/Skeleton'
import classnames from 'classnames'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'

const LeadByLocation = ({ viewType, dataFilter, loading }) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState([])
  const [selectedState, setSelectedState] = useState('')

  // 1️⃣ Aggregate leads by State with normalization
  const leadsByState = dataFilter.reduce((acc, lead) => {
    let state = lead.values?.State || 'Unknown'
    state = state.trim()
    state = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()

    if (!acc[state]) acc[state] = { count: 0, leads: [] }
    acc[state].count += 1
    acc[state].leads.push(lead)
    return acc
  }, {})

  // 2️⃣ Transform into array for rendering
  const data = Object.entries(leadsByState).map(([state, info]) => ({
    avatarLabel: state.slice(0, 2).toUpperCase(),
    avatarColor: 'primary',
    title: `${info.count} Leads`,
    subtitle: state,
    sales: info.count,
    leads: info.leads, // save leads for click
    trend: 'up',
    trendPercentage: '0%'
  }))

  const handleOpenDialog = (state, leads) => {
    console.log(leads, '<<< LLLLLL')
    setSelectedState(state)
    setSelectedLeads(leads)
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedLeads([])
    setSelectedState('')
  }

  return (
    <>
      <Card sx={{borderRadius: 3}}>
        <CardHeader title={`Lead By Location (${viewType})`} />

        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxHeight: 350,
            overflowY: 'auto',
            height: 360,
            
          }}
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className='flex items-center gap-4'>
                <Skeleton variant='circular' width={40} height={40} />
                <div className='flex flex-col flex-1 gap-1'>
                  <Skeleton variant='text' width='50%' height={20} />
                  <Skeleton variant='text' width='30%' height={16} />
                </div>
                <div className='flex flex-col gap-1'>
                  <Skeleton variant='text' width={40} height={20} />
                  <Skeleton variant='text' width={50} height={16} />
                </div>
              </div>
            ))
          ) : data.length === 0 ? (
            <Typography color='text.secondary'>No leads found.</Typography>
          ) : (
            data.map((item, index) => (
              <div
                key={index}
                className='flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-1 rounded'
                onClick={() => handleOpenDialog(item.subtitle, item.leads)}
              >
                <CustomAvatar skin='light' color={item.avatarColor}>
                  {item.avatarLabel}
                </CustomAvatar>
                <div className='flex items-center justify-between flex-1 flex-wrap gap-x-4 gap-y-2'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <div className='flex items-center gap-1'>
                        <i
                          className={classnames(
                            item.trend === 'up' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line',
                            item.trend === 'up' ? 'text-success' : 'text-error'
                          )}
                        ></i>
                        <Typography color={item.trend === 'up' ? 'success.main' : 'error.main'}>
                          {item.trendPercentage}
                        </Typography>
                      </div>
                    </div>
                    <Typography>{item.subtitle}</Typography>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.sales}
                    </Typography>
                    <Typography variant='body2' color='text.disabled'>
                      Leads
                    </Typography>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog for selected leads */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {selectedState} Leads ({selectedLeads.length})
          </span>
          <IconButton onClick={handleCloseDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {selectedLeads.map((lead, idx) => (
            <Link
              href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(lead.lead_id))}`}
              style={{ textDecoration: 'none' }}
            >
              <div key={idx} className='border-b border-gray-200 py-2'>
                <Typography variant='subtitle2'>{lead.values?.Company || 'Unnamed Company'}</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {lead.values?.City ? `City: ${lead.values.City}` : ''}
                </Typography>
              </div>
            </Link>
          ))}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LeadByLocation
