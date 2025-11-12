'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, Typography, Skeleton, Box } from '@mui/material'

const COLORS = ['#8b5cf6', '#facc15', '#f87171', '#60a5fa', '#f472b6', '#34d399', '#3b82f6', '#22c55e', '#9ca3af']

export default function LostLeadAnalysis({ dataFilter = [], loading }) {
  // 🧮 Build dynamic data from "Loss Reasons"
  const dynamicData = useMemo(() => {
    // Step 1: Filter Closed Lost leads
    const closedLostLeads = dataFilter.filter(lead => lead?.values?.['Lead Status'] === 'Closed Lost')

    // Step 2: Collect all "Loss Reasons" arrays into a single list
    const allReasons = closedLostLeads.flatMap(lead => lead?.values?.['Loss Reasons'] || [])

    // Step 3: Count occurrences of each reason
    const reasonCounts = allReasons.reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {})

    // Step 4: Convert to recharts format
    return Object.entries(reasonCounts).map(([name, value]) => ({
      name,
      value
    }))
  }, [dataFilter])

  return (
    <Card
      sx={{
        borderRadius: 3,
        BoxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        backgroundColor: '#fff'
      }}
    >
      <CardContent sx={{ height: 370, display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 3, color: '#111', letterSpacing: 0.5 }}>
          Lost Lead Analysis
        </Typography>

        {loading ? (
          <Skeleton variant='rectangular' width='100%' height={300} />
        ) : dynamicData.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 250
            }}
          >
            <Typography variant='h6' color='text.secondary'>
              No loss reasons found
            </Typography>
          </Box>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dynamicData}
                  dataKey='value'
                  nameKey='name'
                  cx='50%'
                  cy='50%'
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {dynamicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, name) => [`${value}`, `${name}`]}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                  }}
                />
                <Legend
                  verticalAlign='bottom'
                  align='center'
                  iconType='circle'
                  wrapperStyle={{ fontSize: 12, marginTop: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
