import { Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ResponseTimeTracker({ avgHours = 2.5 }) {
  const targetHours = 4; // Example SLA target
  const progress = Math.min((avgHours / targetHours) * 100, 100);

  return (
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        {/* Title */}
        <Typography variant="h6" gutterBottom>
          Response Time Tracker
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Avg time taken to respond to new leads
        </Typography>

        {/* Icon + Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTimeIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              {avgHours} hrs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average response time
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#ffeaea',
            '& .MuiLinearProgress-bar': {
              backgroundColor: progress <= 50 ? '#4caf50' : '#ff9800',
            },
          }}
        />

        {/* Target Info */}
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1 }}
          color="text.secondary"
        >
          Target: Respond within {targetHours} hours
        </Typography>
      </CardContent>
    </Card>
  );
}
