import { Card, Typography } from '@mui/material'
import React from 'react'
import dayjs from 'dayjs'

function TaskViewList({ currentTasks, upcomingTasks, completedTasks, renderTaskCard }) {

console.log(currentTasks,"<<< currentTasks vvv")
console.log(upcomingTasks,"<<< upcomingTasks vvv")
console.log(completedTasks,"<<< completedTasks vvv")


  // Group tasks


  return (
    <div>
      {/* Current Tasks */}
      {currentTasks.length > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#1976d2', fontWeight: 600 }}>
            🟢 Today’s Tasks 🟢
          </Typography>
          {currentTasks.map(task => renderTaskCard(task))}
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#27ae60', fontWeight: 600 }}>
            🚀 Upcoming Tasks
          </Typography>
          {upcomingTasks.map(task => renderTaskCard(task))}
        </Card>
      )}

      {/* Completed / Past Tasks */}
      {completedTasks.length > 0 && (
        <Card sx={{ p: 2, mb: 2 }}>
          <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#c0392b', fontWeight: 600 }}>
            ✅ Completed / Past Tasks
          </Typography>
          {completedTasks.map(task => renderTaskCard(task))}
        </Card>
      )}
    </div>
  )
}

export default TaskViewList
