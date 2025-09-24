import { Box, Typography, Chip, Divider, Button, IconButton } from '@mui/material'
// import EditableField from './EditableField'
import FlagIcon from '@mui/icons-material/Flag' // ✅ MUI icon

export default function LeadCard({ fields, leadId, leadData, onToggleFlag }) {
  console.log(leadData?.lead_flag, '<<< leadData')
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
          {/* <Box display={'flex'} justifyContent={'space-between'}>
            <Typography variant='h5' fontWeight='bold' gutterBottom>
              {fields['First Name']}
              {'   '} {fields['Last Name']}
            </Typography>
            <Typography variant='h5' fontWeight='bold' gutterBottom onClick={() => onToggleFlag(leadData)}>
              {leadData.lead_flag === 0 ? (
                <FlagIcon sx={{ color: 'grey' }} /> // 0 -> orange flag
              ) : (
                <FlagIcon sx={{ color: 'orange' }} /> // 1 -> green flag
              )}
            </Typography>
          </Box> */}

          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            {/* Lead Name */}
            <Typography
              variant='h5'
              fontWeight='bold'
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              {fields['First Name']} {fields['Last Name']}
            </Typography>

            {/* Flag Toggle */}
            <IconButton
              onClick={() => onToggleFlag(leadData)}
              sx={{
                bgcolor: leadData.lead_flag === 0 ? 'grey.200' : 'orange.100',
                '&:hover': {
                  bgcolor: leadData.lead_flag === 0 ? 'grey.300' : 'orange.200'
                },
                borderRadius: '8px',
                transition: '0.3s'
              }}
            >
              <FlagIcon
                sx={{
                  color: leadData.lead_flag === 0 ? 'grey' : 'orange',
                  fontSize: 28
                }}
              />
            </IconButton>
          </Box>

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
        <Typography variant='body1' color={'#000'}>
          Lead Id:<span style={{ color: '#374151', fontWeight: 600 }}> {leadId}</span>
        </Typography>
        <Typography variant='body1' color={'#000'}>
          Designation:<span style={{ color: '#374151', fontWeight: 600 }}> {fields['Job Title']}</span>
        </Typography>
        <Typography variant='body1' color={'#000'}>
          Website:{' '}
          {fields['Website'] ? (
            <a
              href={fields['Website'].startsWith('http') ? fields['Website'] : `https://${fields['Website']}`}
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}
            >
              {fields['Website']}
            </a>
          ) : (
            <span style={{ color: '#374151', fontWeight: 600 }}>-</span>
          )}
        </Typography>
        <Typography variant='body1' color='#000'>
          Lead Source:<span style={{ color: 'primary', fontWeight: 600 }}> {fields['Lead Source']}</span>
        </Typography>
      </Box>
    </Box>
  )
}
