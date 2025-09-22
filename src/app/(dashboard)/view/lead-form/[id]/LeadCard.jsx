import { Box, Typography, Chip, Divider } from '@mui/material'
import EditableField from './EditableField'

export default function LeadCard({ fields, leadId }) {

  console.log(fields,"<<< fieldssss")
  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 3,
        p: 3,
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
      mt={2}
      mb={4}
    >
      {/* Name Section */}
      <Box display={'flex'} justifyContent={'space-between'}>
        <Box>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
          {fields['First Name']}{'   '} {fields['Last Name']}
        </Typography>
        <Typography variant='body1'>
            <Chip
              label={fields['Lead Status']}
              color='primary'
              variant='outlined'
              size='small'
              sx={{ fontWeight: 'medium' }}
            />
          </Typography>
        </Box>
        
        <Typography variant='body1'>
          <strong>Score:</strong>{' '}
          <Chip
            label={fields['Score']}
            color={fields['Score'] >= 70 ? 'success' : 'warning'}
            sx={{ fontWeight: 'bold' }}
          />
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Details */}
      <Box display='flex' flexDirection='column' gap={1.2}>
       
        <Typography variant='body1' color={"#000"}>
         Lead Id:<span style={{ color: '#374151',fontWeight:600 }}> {' '}{leadId}</span>
        </Typography>
        <Typography variant='body1' color={"#000"}>
         Designation:<span style={{ color: '#374151',fontWeight:600 }}> {' '}{fields['Job Title']}</span>
        </Typography>
        <Typography variant='body1' color={"#000"}>

          Website:{' '}
            {fields['Website'] ? (
              <a
                href={fields['Website'].startsWith('http') ? fields['Website'] : `https://${fields['Website']}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#2563eb', fontWeight:600 ,textDecoration: 'underline' }}
              >
                {fields['Website']}
              </a>
            ) : (
              <span style={{ color: '#374151', fontWeight:600  }}>-</span>
            )}
        </Typography>
        <Typography variant='body1' color='#000'>
         Lead Source:<span style={{ color: "primary", fontWeight:600 }}> {' '}{fields['Lead Source']}</span>
        </Typography>
         

       
      </Box>
    </Box>
  )
}
