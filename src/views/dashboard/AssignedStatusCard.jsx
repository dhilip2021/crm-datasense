import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

export default function AssignedStatusCard({ assigned = 45, unassigned = 15 }) {
  const total = assigned + unassigned;
  const assignedPercent = total ? (assigned / total) * 100 : 0;

  return (
    <Card sx={{ width: '100%', boxShadow: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Assigned vs Unassigned Leads
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Shows if auto-assignment is working
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="primary">
            Assigned: {assigned}
          </Typography>
          <Typography variant="body2" color="error">
            Unassigned: {unassigned}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={assignedPercent}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: '#ffeaea',
            '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' },
          }}
        />

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {Math.round(assignedPercent)}% of leads are assigned
        </Typography>
      </CardContent>
    </Card>
  );
}
