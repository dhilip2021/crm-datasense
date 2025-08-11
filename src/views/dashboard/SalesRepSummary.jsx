'use client'

import { Card, CardHeader, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Avatar, Box } from '@mui/material'
import OptionsMenu from '@core/components/option-menu'

// Sample Data
const salesReps = [
  {
    name: 'Ramesh Kumar',
    avatar: '/images/avatars/1.png',
    new: 12,
    active: 8,
    converted: 5,
    missed: 3
  },
  {
    name: 'Priya Sharma',
    avatar: '/images/avatars/2.png',
    new: 10,
    active: 7,
    converted: 8,
    missed: 2
  },
  {
    name: 'John Doe',
    avatar: '/images/avatars/3.png',
    new: 15,
    active: 10,
    converted: 6,
    missed: 4
  }
]

export default function SalesRepSummary() {
  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        title="Sales Rep-wise Lead Summary"
        action={<OptionsMenu iconClassName="text-textPrimary" options={['Refresh']} />}
        sx={{ pb: 0 }}
      />

      <TableContainer sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Sales Rep</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>New</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Converted</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Missed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salesReps.map((rep, index) => (
              <TableRow key={index}>
                {/* Rep Name with Avatar */}
                <TableCell>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={rep.avatar} alt={rep.name} sx={{ width: 40, height: 40 }} />
                    <Typography fontWeight="medium">{rep.name}</Typography>
                  </Box>
                </TableCell>

                {/* New Leads */}
                <TableCell align="center">
                  <Chip label={rep.new} color="primary" variant="outlined" />
                </TableCell>

                {/* Active Leads */}
                <TableCell align="center">
                  <Chip label={rep.active} color="info" variant="outlined" />
                </TableCell>

                {/* Converted Leads */}
                <TableCell align="center">
                  <Chip label={rep.converted} color="success" variant="outlined" />
                </TableCell>

                {/* Missed Leads */}
                <TableCell align="center">
                  <Chip label={rep.missed} color="error" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
