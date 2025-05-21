import { Grid, Card, CardHeader, CardContent, TextField, Typography, Box, MenuItem } from '@mui/material'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import OptionMenu from '@core/components/option-menu' // assuming this is your customized one

function SortableCard({ data, index, handleAction, editFlag }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: data.slug_label
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    zIndex: transform ? 1500 : 'auto',
    position: transform ? 'relative' : 'static'
  }

  return (
    <Grid item xs={3}>
      <Box sx={{ mt: 0, mr: 0, float: 'right', position: 'relative', display: 'flex', alignItems: 'end' }}>
        <OptionMenu
          iconClassName='text-textPrimary'
          options={['Edit', 'Delete']}
          onOptionClick={option => handleAction(option, data, index)}
        />
      </Box>
      <Card
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <CardContent sx={{ flexGrow: 2 }}>
          <Box>
            {data.type === 'text' && (
              <TextField
                fullWidth
                label={`${data.label}${data.mandatory === 'yes' ? ' *' : ''}`}
                size='small'
                autoComplete='off'
              />
            )}

            {data.type === 'select' && Array.isArray(data.items) && (
              <TextField select fullWidth label={data.label} size='small' defaultValue=''>
                {data.items.map((item, id) => (
                  <MenuItem key={id} value={item.menu_value}>
                    {item.menu_value}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {data.type === 'text-multiline' && (
              <TextField
                fullWidth
                label={`${data.label}${data.mandatory === 'yes' ? ' *' : ''}`}
                size='small'
                autoComplete='off'
                multiline
                rows={2}
              />
            )}

            <Typography mt={1} variant='body2' color='text.secondary'>
              slug-name : {data?.slug_label}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  )
}

export default SortableCard
