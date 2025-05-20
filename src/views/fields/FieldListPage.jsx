import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Grid, Card, CardHeader, CardContent, TextField, Typography, Box } from '@mui/material'
import { useState, useEffect } from 'react'
import OptionsMenu from '@core/components/option-menu'

function SortableCard({ data, index, handleAct, handleDelete, editFlag }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: data.slug_label
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    zIndex: transform ? 1500 : 'auto', // <-- Fix for zIndex
    position: transform ? 'relative' : 'static' // <-- ensures correct stacking
  }

  return (
    <Grid item xs={3} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card>
        {/* <CardHeader
          title={
            <Typography variant='h5' sx={{ fontSize: '14px' }}>
              {data.label}
            </Typography>
          }
          action={
            <OptionsMenu
              iconClassName='text-textPrimary'
              options={['Edit', 'Delete']}
              onOptionClick={option => {
                console.log('Option clicked:', option, data)
                // handleAct(option, data, index)
              }}
            />
          }
        /> */}
        <CardContent>
          {editFlag && (
            <Box sx={{ float: 'inline-end' }}>
              <i className='ri-close-line' onClick={() => handleDelete(index)}></i>
            </Box>
          )}

          {data.type === 'text' && (
            <TextField
              fullWidth
              label={`${data.label} ${data.mandatory === 'yes' ? '*' : ''}`}
              size='small'
              autoComplete='off'
            />
          )}

          {data.type === 'select' && (
            <TextField select fullWidth label={data.label} size='small'>
              {data.items.map((item, id) => (
                <option key={id} value={item.menu_value}>
                  {item.menu_value}
                </option>
              ))}
            </TextField>
          )}

          <Typography mt={1} variant='body2' color='text.secondary'>
            slug-name : {data?.slug_label}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default function FieldListPage({
  fields,
  setFields,
  fieldDataList,
  editFlag,
  handleDelete,
  handleAction,
  handleDragEnd,
  sensors
}) {
  useEffect(() => {
    if (Array.isArray(fieldDataList)) {
      const sorted = [...fieldDataList].sort((a, b) => a.position - b.position)
      setFields(sorted)
    }
  }, [fieldDataList])

  return (
    <Box mt={4}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map(f => f.slug_label)} strategy={verticalListSortingStrategy}>
          <Grid container spacing={2}>
            {fields.map((field, index) => (
              <SortableCard
                key={field.slug_label}
                data={field}
                index={index}
                handleDelete={handleDelete}
                handleAct={handleAction}
                editFlag={editFlag}
              />
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </Box>
  )
}
