import { Grid, Card, CardContent, Typography, Box, Avatar, LinearProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useRouter } from 'next/navigation';

export default function DashboardWidgets() {
  const router = useRouter();

  // Example data
  const assignedLeads = 42;
  const unassignedLeads = 18;
  const avgHours = 2.5;
  const targetHours = 4;
  const followUpsToday = 8;

  return (
    <Grid container spacing={2}>
      {/* Assigned vs Unassigned */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{ height: '100%', cursor: 'pointer' }}
          onClick={() => router('/leads/assignment')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Assigned vs Unassigned
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Shows if auto-assignment is working
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5" color="success.main">
                {assignedLeads} Assigned
              </Typography>
              <Typography variant="h5" color="error.main">
                {unassignedLeads} Unassigned
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Response Time Tracker */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{ height: '100%', cursor: 'pointer' }}
          onClick={() => router('/leads/response-time')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                <AccessTimeIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Response Time Tracker
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Avg time taken to respond to new leads
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
              {avgHours} hrs
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min((avgHours / targetHours) * 100, 100)}
              sx={{
                height: 8,
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: avgHours <= targetHours ? 'success.main' : 'error.main',
                },
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Target: {targetHours} hours
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Follow-ups Due Today */}
      <Grid item xs={12} md={4}>
        <Card
          sx={{ height: '100%', cursor: 'pointer' }}
          onClick={() => router('/leads/follow-ups')}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                <EventAvailableIcon />
              </Avatar>
              <Typography variant="h6" fontWeight="bold">
                Follow-ups Due Today
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Number of leads needing action/follow-up today
            </Typography>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ color: followUpsToday > 0 ? 'error.main' : 'success.main' }}
            >
              {followUpsToday}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: followUpsToday > 0 ? 'error.main' : 'success.main' }}
            >
              {followUpsToday > 0 ? 'Action Required' : 'All Caught Up'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
