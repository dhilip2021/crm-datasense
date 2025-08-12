'use client'

import { Card, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Avatar, Box } from '@mui/material'
import OptionsMenu from '@core/components/option-menu'

// Vars
const stages = [
  { title: 'New', count: 25, color: 'primary', icon: 'ri-add-line' },
  { title: 'Contacted', count: 15, color: 'info', icon: 'ri-phone-line' },
  { title: 'Qualified', count: 8, color: 'success', icon: 'ri-check-double-line' },
  { title: 'Lost', count: 5, color: 'error', icon: 'ri-close-line' },
  { title: 'Converted', count: 12, color: 'warning', icon: 'ri-exchange-dollar-line' }
]

export default function LeadStatusSummary() {
  const totalLeads = stages.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        title="Leads By Summary"
        action={<OptionsMenu iconClassName="text-textPrimary" options={['Refresh']} />}
        sx={{ pb: 0 }}
      />

      <TableContainer sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Stage</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Lead Count</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Percentage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stages.map((stage, index) => (
              <TableRow key={index}>
                {/* Stage Name with Icon */}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${stage.color}.main`,
                        width: 40,
                        height: 40,
                        fontSize: 20,
                        boxShadow: 2
                      }}
                      variant="rounded"
                    >
                      <i className={stage.icon}></i>
                    </Avatar>
                    <Typography fontWeight="medium">{stage.title}</Typography>
                  </Box>
                </TableCell>

                {/* Lead Count */}
                <TableCell>
                  <Typography>{stage.count}</Typography>
                </TableCell>

                {/* Percentage */}
                <TableCell>
                  <Chip
                    label={`${((stage.count / totalLeads) * 100).toFixed(1)}%`}
                    color={stage.color}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
