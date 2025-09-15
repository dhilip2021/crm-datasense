import { Box, Typography, Chip, Divider } from '@mui/material'
import EditableField from './EditableField'

export default function LeadCard({ fields }) {
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
        <Typography variant='h5' fontWeight='bold' gutterBottom>
          {fields['First Name']}
          {'   '} {fields['Last Name']}
        </Typography>
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
        <Typography variant='body1'>
          <strong>Job Title:</strong> <span style={{ color: '#374151' }}>{fields['Job Title']}</span>
        </Typography>

        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography variant='body1'>
            <strong>Website:</strong>{' '}
            {fields['Website'] ? (
              <a
                href={fields['Website'].startsWith('http') ? fields['Website'] : `https://${fields['Website']}`}
                target='_blank'
                rel='noopener noreferrer'
                style={{ color: '#2563eb', textDecoration: 'underline' }}
              >
                {fields['Website']}
              </a>
            ) : (
              <span style={{ color: '#374151' }}>-</span>
            )}
          </Typography>

          <Typography variant='body1'>
            <strong>Lead Source:</strong>{' '}
            <Chip
              label={fields['Lead Source']}
              color='primary'
              variant='outlined'
              size='small'
              sx={{ fontWeight: 'medium' }}
            />
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
