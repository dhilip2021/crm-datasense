import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function FollowUpsDueToday({ dueCount = 8 }) {
  return (
    <Card
      sx={{
        width: '100%',
        boxShadow: 2,
        borderRadius: 3,
        backgroundColor: '#ffffff',
      }}
    >
      <CardContent>
        {/* Title + Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: '#1976d2',
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            <EventAvailableIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Follow-ups Due Today
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Number of leads needing action/follow-up today
            </Typography>
          </Box>
        </Box>

        {/* Count */}
        <Typography
          variant="h2"
          fontWeight="bold"
          sx={{ color: dueCount > 0 ? 'error.main' : 'success.main', mb: 1 }}
        >
          {dueCount}
        </Typography>

        {/* Status */}
        <Typography
          variant="body2"
          sx={{
            color: dueCount > 0 ? 'error.main' : 'success.main',
            fontWeight: 'medium',
          }}
        >
          {dueCount > 0 ? 'Action Required' : 'All Caught Up'}
        </Typography>
      </CardContent>
    </Card>
  );
}
