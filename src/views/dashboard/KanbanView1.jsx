'use client'
import React, { useState } from 'react'
import { Box, Card, Typography, Avatar } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const initialColumns = {
  prospecting: {
    name: 'Prospecting',
    color: '#e3f2fd',
    deals: [
      { id: '1', title: 'Enterprise Software License', company: 'TechCorp Solutions', value: '₹8.5L', probability: '20%', date: 'Dec 15, 2024', owner: 'Raj' },
      { id: '2', title: 'Cloud Migration Product', company: 'DataFlow Inc', value: '₹12.3L', probability: '15%', date: 'Jan 20, 2025', owner: 'Raj' },
      { id: '3', title: 'Enterprise Software License', company: 'TechCorp Solutions', value: '₹8.5L', probability: '20%', date: 'Dec 15, 2024', owner: 'Raj' },
    ]
  },
  qualification: {
    name: 'Qualification',
    color: '#fff9c4',
    deals: [
      { id: '4', title: 'CRM Software', company: 'RetailMax Ltd', value: '₹6.8L', probability: '40%', date: 'Dec 30, 2024', owner: 'Raj' }
    ]
  },
  proposal: {
    name: 'Proposal Sent',
    color: '#f3e5f5',
    deals: [
      { id: '5', title: 'Digital Marketing Tool', company: 'GrowthCo', value: '₹4.2L', probability: '60%', date: 'Nov 25, 2024', owner: 'Raj' }
    ]
  },
  negotiation: {
    name: 'Negotiation',
    color: '#ffe0b2',
    deals: [
      { id: '6', title: 'ERP System', company: 'Manufacturing Co', value: '₹15.6L', probability: '70%', date: 'Nov 30, 2024', owner: 'Raj' }
    ]
  }
}

export default function KanbanView() {
  const [columns, setColumns] = useState(initialColumns)

  const onDragEnd = (result) => {
    const { source, destination } = result
    if (!destination) return

    const sourceCol = columns[source.droppableId]
    const destCol = columns[destination.droppableId]
    const sourceDeals = Array.from(sourceCol.deals)
    const [movedDeal] = sourceDeals.splice(source.index, 1)

    if (source.droppableId === destination.droppableId) {
      sourceDeals.splice(destination.index, 0, movedDeal)
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          deals: sourceDeals
        }
      })
    } else {
      const destDeals = Array.from(destCol.deals)
      destDeals.splice(destination.index, 0, movedDeal)
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          deals: sourceDeals
        },
        [destination.droppableId]: {
          ...destCol,
          deals: destDeals
        }
      })
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex" gap={2} overflow="auto" padding={2}>
        {Object.entries(columns).map(([colId, col], colIndex) => (
          <Droppable key={colId} droppableId={colId}>
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                minWidth={250}
                bgcolor={col.color}
                borderRadius={2}
                p={2}
              >
                <Typography fontWeight="bold" mb={2}>
                  {col.name} ({col.deals.length})
                </Typography>
                {col.deals.map((deal, index) => (
                  <Draggable key={deal.id} draggableId={deal.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          p: 2,
                          mb: 2,
                          boxShadow: snapshot.isDragging ? 3 : 1,
                          cursor: 'grab',
                        }}
                      >
                        <Typography fontWeight="bold">{deal.title}</Typography>
                        <Typography variant="body2">{deal.company}</Typography>
                        <Typography color="green" fontWeight="bold">{deal.value}</Typography>
                        <Typography variant="body2">{deal.probability}</Typography>
                        <Typography variant="caption">{deal.date}</Typography>
                        <Box display="flex" alignItems="center" mt={1}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{deal.owner[0]}</Avatar>
                          <Typography variant="caption" ml={1}>{deal.owner}</Typography>
                        </Box>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        ))}
      </Box>
    </DragDropContext>
  )
}
