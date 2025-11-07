import React from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, Switch, TextField, Tooltip, Typography } from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'

function TaskDialog({
    handleTaskChange,
    openTaskDialog,
    handleTaskClose,
    editingTask,
    setErrorTaskData,
    errorTaskData,
    loaderTask,
    taskData, 
    user_name,
    setReminderTimeTaskError,
    reminderTimeTaskError,
    saveTask
 }) {
  return (
    <div>
       {/* Task Dialog */}
        <Dialog
          open={openTaskDialog}
          onClose={handleTaskClose}
          maxWidth='sm'
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle
            sx={{
              fontWeight: 'bold',
              fontSize: '1.3rem',
              textAlign: 'center',
              borderBottom: '1px solid #f0f0f0',
              pb: 2
            }}
          >
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              ✨ {editingTask ? 'Update Task' : 'Create Task'}
              <Tooltip title='Close' arrow>
                <IconButton onClick={handleTaskClose}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  fullWidth
                  label={
                    <span>
                      Subject <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  value={taskData.subject}
                  onChange={e => {
                    handleTaskChange('subject', e.target.value)
                    setErrorTaskData(prev => ({ ...prev, subject: false }))
                  }}
                  placeholder='Enter Task'
                  error={errorTaskData.subject}
                  helperText={errorTaskData.subject ? 'Subject is required' : ''}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={
                    <span>
                      Due Date <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  format="DD/MM/YYYY"
                  disablePast
                  value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
                  onChange={newValue => {
                    handleTaskChange('dueDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                    setErrorTaskData(prev => ({ ...prev, dueDate: false }))
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: errorTaskData.dueDate,
                      helperText: errorTaskData.dueDate ? 'Invalid due date' : ''
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={taskData.priority} onChange={e => handleTaskChange('priority', e.target.value)}>
                    <MenuItem value='Low'>Low</MenuItem>
                    <MenuItem value='Medium'>Medium</MenuItem>
                    <MenuItem value='High'>High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={taskData.status} onChange={e => handleTaskChange('status', e.target.value)}>
                    <MenuItem value='Not Started'>Not Started</MenuItem>
                    <MenuItem value='Deferred'>Deferred</MenuItem>
                    <MenuItem value='In Progress'>In Progress</MenuItem>
                    <MenuItem value='Completed'>Completed</MenuItem>
                    <MenuItem value='Waiting for input'>Waiting for input</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  disabled
                  label='Created By'
                  defaultValue={user_name}
                  fullWidth
                  sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ border: '1px solid #eee', p: 2.5, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                  <Typography fontWeight='bold' mb={2}>
                    ⏰ Reminder
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={taskData.reminderEnabled}
                        onChange={e => handleTaskChange('reminderEnabled', e.target.checked)}
                      />
                    }
                    label='Set Reminder'
                  />

                  {taskData.reminderEnabled && (
                    <Grid container spacing={2} mt={1}>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label='Reminder Date'
                          format="DD/MM/YYYY"
                          disablePast
                          value={taskData.reminderDate ? dayjs(taskData.reminderDate) : null}
                          onChange={newValue => {
                            handleTaskChange('reminderDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                            setErrorTaskData(prev => ({ ...prev, reminderDate: false }))
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: errorTaskData.reminderDate,
                              helperText: errorTaskData.reminderDate ? 'Reminder Date required' : ''
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TimePicker
                          label='Reminder Time'
                          value={
                            taskData.reminderTime ? dayjs(taskData.reminderTime, 'HH:mm') : dayjs().add(5, 'minute')
                          }
                          onChange={newValue => {
                            const time = newValue ? newValue.format('HH:mm') : ''
                            handleTaskChange('reminderTime', time)
                            setReminderTimeTaskError(!validateReminderTime())
                          }}
                          minTime={
                            taskData.reminderDate && dayjs(taskData.reminderDate).isSame(dayjs(), 'day')
                              ? dayjs()
                              : null
                          }
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: reminderTimeTaskError,
                              helperText: reminderTimeTaskError ? 'Cannot be in the past' : ''
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Alert Type</InputLabel>
                          <Select
                            value={taskData.alertType || 'Both'}
                            onChange={e => handleTaskChange('alertType', e.target.value)}
                          >
                            <MenuItem value='Email'>Email</MenuItem>
                            <MenuItem value='Popup'>Pop-up</MenuItem>
                            <MenuItem value='Both'>Both</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0', mt: 2 }}>
            <Box display='flex' justifyContent='space-between' width='100%'>
              <Button
                onClick={handleTaskClose}
                variant='outlined'
                sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#ccc' }}
              >
                Close
              </Button>
              <Button
                variant='contained'
                disabled={
                  loaderTask || 
                  reminderTimeTaskError || 
                  !taskData.subject || 
                  !taskData.dueDate|| 
                  (taskData.reminderEnabled && !taskData.reminderDate)
                }
                onClick={saveTask}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
              >
                {loaderTask ? 'Saving...' : editingTask ? 'Update' : 'Save'}
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
    </div>
  )
}

export default TaskDialog
