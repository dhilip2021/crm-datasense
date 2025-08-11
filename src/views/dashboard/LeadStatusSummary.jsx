// LeadStatusTable.jsx

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'

// Vars
const stages = [
  { title: 'New', count: 25, color: 'primary', icon: 'ri-add-line' },
  { title: 'Contacted', count: 15, color: 'info', icon: 'ri-phone-line' },
  { title: 'Qualified', count: 8, color: 'success', icon: 'ri-check-double-line' },
  { title: 'Lost', count: 5, color: 'error', icon: 'ri-close-line' },
  { title: 'Converted', count: 12, color: 'warning', icon: 'ri-exchange-dollar-line' }
]

const LeadStatusTable = () => {
  const totalLeads = stages.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <Card>
      <div className='overflow-x-auto'>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Lead Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={index}>
                {/* Stage Name with Icon */}
                <td className='!plb-1'>
                  <div className='flex items-center gap-3'>
                    <CustomAvatar
                      variant='rounded'
                      color={stage.color}
                      className='shadow-md'
                      sx={{ width: 40, height: 40, fontSize: 20 }}
                    >
                      <i className={stage.icon}></i>
                    </CustomAvatar>
                    <Typography color='text.primary' className='font-medium'>
                      {stage.title}
                    </Typography>
                  </div>
                </td>

                {/* Lead Count */}
                <td className='!plb-1'>
                  <Typography>{stage.count}</Typography>
                </td>

                {/* Percentage */}
                <td className='!plb-1'>
                  <Chip
                    label={`${((stage.count / totalLeads) * 100).toFixed(1)}%`}
                    color={stage.color}
                    size='small'
                    variant='tonal'
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default LeadStatusTable
