'use client';

import { Card, CardContent, Typography, Box, LinearProgress, Grid, Avatar, CardHeader } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
// Components Imports
import OptionsMenu from '@core/components/option-menu'

export default function ConversionFunnel() {
  // Example funnel data (replace with API)
  const funnelData = [
    { stage: 'Submitted', count: 120, color: 'info.main', icon: <SendIcon /> },
    { stage: 'Contacted', count: 90, color: 'primary.main', icon: <PhoneInTalkIcon /> },
    { stage: 'Demo', count: 45, color: 'warning.main', icon: <DesktopWindowsIcon /> },
    { stage: 'Won', count: 20, color: 'success.main', icon: <EmojiEventsIcon /> },
  ];

  const maxCount = funnelData[0].count; // Starting point for % calc

  return (
    <Card
      sx={{
        width: '100%',
        boxShadow: 2,
        borderRadius: 3,
        p: 2,
      }}
    >
        <CardHeader
        title='Conversion Funnel'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Refresh']} />}
      />
      <CardContent>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {funnelData.map((stage, index) => {
            const percentage = ((stage.count / maxCount) * 100).toFixed(1);
            return (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: stage.color, mr: 2 }}>
                    {stage.icon}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {stage.stage} ({stage.count})
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': { backgroundColor: stage.color },
                        mt: 0.5,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {percentage}%
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}
