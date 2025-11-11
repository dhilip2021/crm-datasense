'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, Typography } from '@mui/material'

const data = [
  { name: 'Already Using Competitor', value: 32 },
  { name: 'Invalid Number', value: 10 },
  { name: 'Wrong Contact Details', value: 8 },
  { name: 'Attempted', value: 15 },
  { name: 'Budget Constraints', value: 12 },
  { name: 'Needs Analysis', value: 9 },
  { name: 'Scheduled', value: 7 },
  { name: 'Not Interested', value: 6 },
  { name: 'Other', value: 5 },
]

const COLORS = [
  '#8b5cf6', // Already Using Competitor
  '#facc15', // Invalid Number
  '#f87171', // Wrong Contact Details
  '#60a5fa', // Attempted
  '#f472b6', // Budget Constraints
  '#34d399', // Needs Analysis
  '#3b82f6', // Scheduled
  '#22c55e', // Not Interested
  '#9ca3af', // Other
]

export default function LostLeadAnalysis({dataFilter, loading}) {

  console.log(dataFilter,"<<< dataFileeee")

  return (
    <Card className='shadow-sm border border-gray-100'>
      <CardContent>
        <Typography variant='h6' className='font-semibold mb-4'>
          Lost Lead Analysis
        </Typography>

        <div className='w-full h-[300px]'>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={70}
                outerRadius={100}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value, name) => [`${value}`, `${name}`]}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
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
      </CardContent>
    </Card>
  )
}
