import { useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableCard from './SortableCard'

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
  }, [fieldDataList, setFields])

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
                handleAction={handleAction}
                editFlag={editFlag}
              />
            ))}
          </Grid>
        </SortableContext>
      </DndContext>
    </Box>
  )
}
