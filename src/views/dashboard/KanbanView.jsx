'use client'
import React, { useEffect, useState } from 'react'
import { Box, Card, Typography, Avatar, CircularProgress, Chip, Divider, IconButton } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { encryptCryptoRes } from '@/helper/frontendHelper'
import Link from 'next/link'
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'

const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

// 🎨 Generate consistent colors dynamically for statuses
const generateStatusColors = statuses => {
  const palette = [
    { bg: '#e3f2fd', text: '#1976d2' }, // Blue
    { bg: '#fff9c4', text: '#f9a825' }, // Yellow
    { bg: '#f3e5f5', text: '#8e24aa' }, // Purple
    { bg: '#ffe0b2', text: '#ef6c00' }, // Orange
    { bg: '#c8e6c9', text: '#388e3c' }, // Green
    { bg: '#f5f5f5', text: '#616161' }, // Grey
    { bg: '#ffcdd2', text: '#c62828' }, // Red
    { bg: '#b3e5fc', text: '#0288d1' }, // Light Blue
    { bg: '#d1c4e9', text: '#5e35b1' }, // Deep Purple
    { bg: '#dcedc8', text: '#689f38' }, // Lime
    { bg: '#ffecb3', text: '#ffa000' }, // Amber
    { bg: '#f8bbd0', text: '#ad1457' } // Pink
  ]

  const colorMap = {}
  statuses.forEach((status, index) => {
    colorMap[status] = palette[index % palette.length]
  })

  // Fallback color
  colorMap['Unassigned'] = { bg: '#f5f5f5', text: '#616161' }

  return colorMap
}

export default function KanbanView() {
  const organization_id = Cookies.get('organization_id')
  const user_id = Cookies.get('user_id')
  const form_name = 'lead-form'
  const [pagination, setPagination] = useState({})

  const [kanbanData, setKanbanData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [sections, setSections] = useState([])
  const [values, setValues] = useState({})
  const [statusColors, setStatusColors] = useState({})

  // 🧩 Step 1: Fetch form to get "Lead Status" options
  const fetchForm = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${form_name}`
      )
      const data = await res.json()
      setLoader(false)

      if (data?.success && data.data?.sections?.length > 0) {
        setSections(data.data.sections)
        const defaultValues = {}
        let leadStatusOptions = []

        data.data.sections.forEach(section => {
          const fields = [
            ...(section.fields.left || []),
            ...(section.fields.center || []),
            ...(section.fields.right || [])
          ]
          fields.forEach(field => {
            if (field.defaultValue) defaultValues[field.id] = field.defaultValue
            if ((field.label === 'Assigned To' || field.label === 'Sales Executive') && user_id) {
              defaultValues[field.id] = user_id
            }
            if (field.label === 'Lead Status' && Array.isArray(field.options)) {
              leadStatusOptions = field.options
            }
          })
        })

        // ✅ Save Lead Status options
        setValues(prev => ({
          ...prev,
          leadStatusOptions,
          ...defaultValues
        }))

        // 👉 After fetching form, build empty Kanban columns and fetch leads
        buildKanbanStructure(leadStatusOptions)
        fetchData(leadStatusOptions, 1, 5)
      } else {
        toast.error('Form not found', { autoClose: 1500, position: 'bottom-center' })
      }
    } catch (err) {
      console.error('❌ Error fetching form:', err)
      setLoader(false)
      toast.error('Error fetching form', { autoClose: 1500, position: 'bottom-center' })
    }
  }

  // 🧩 Step 2: Initialize empty Kanban structure based on Lead Status
  const buildKanbanStructure = leadStatusOptions => {
    const initialColumns = (leadStatusOptions || []).map(status => ({
      status,
      leads: []
    }))

    setKanbanData(initialColumns)
  }

  const fetchData = async (leadStatusOptions, page = 1, limit = 5, singleStatus = null) => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        organization_id,
        form_name,
        page: page.toString(),
        limit: limit.toString(),
        ...(singleStatus ? { status: singleStatus } : {}) // 👈 new param
      })

      const res = await fetch(`/api/v1/admin/lead-form/kanban-view?${query}`)
      const json = await res.json()
      console.log(json,"<<<JSONNN")
      if (json.success) {
        // If we fetched for all statuses
        if (!singleStatus) {
          const distributed = (leadStatusOptions || []).map(status => ({
            status,
            leads: json.kanban.flatMap(col => col.leads).filter(lead => lead.values['Lead Status'] === status),
            total: json.total || 0
          }))

          const newPagination = {}
          distributed.forEach(col => {
            const totalPages = Math.ceil((col.total || col.leads.length) / limit)
            newPagination[col.status] = { page, limit, total: col.total, totalPages }
          })

          setPagination(newPagination)
          setKanbanData(distributed)
        } else {
          // 👇 Update only one column
          const updated = [...kanbanData]
          const columnIndex = updated.findIndex(c => c.status === singleStatus)
          if (columnIndex !== -1) {
            const leads = json.kanban
              .flatMap(col => col.leads)
              .filter(lead => lead.values['Lead Status'] === singleStatus)
            const total = json.total || leads.length
            updated[columnIndex] = { ...updated[columnIndex], leads, total }

            const totalPages = Math.ceil(total / limit)
            setPagination(prev => ({
              ...prev,
              [singleStatus]: { page, limit, total, totalPages }
            }))

            setKanbanData(updated)
          }
        }
      } else {
        setKanbanData([])
      }
    } catch (err) {
      console.error('❌ Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Initial load — first fetch form, then Kanban data automatically handled
  useEffect(() => {
    fetchForm()
  }, [])

  useEffect(() => {
    if (values.leadStatusOptions?.length) {
      const dynamicColors = generateStatusColors(values.leadStatusOptions)
      setStatusColors(dynamicColors)
    }
  }, [values.leadStatusOptions])

  // 🎯 Handle drag & drop
  const handleDragEnd = result => {
    const { source, destination } = result
    if (!destination) return

    const newKanban = [...kanbanData]

    const sourceIndex = parseInt(source.droppableId, 10)
    const destIndex = parseInt(destination.droppableId, 10)

    const [movedLead] = newKanban[sourceIndex].leads.splice(source.index, 1)
    newKanban[destIndex].leads.splice(destination.index, 0, movedLead)

    setKanbanData(newKanban)
  }

  // 🌀 Loader UI
  if (loader || loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='70vh'>
        <CircularProgress />
      </Box>
    )
  }

  // 🎨 Render Kanban columns
  return (
    <Box p={2}>
      <Typography variant='h6' fontWeight='600' mb={1}>
        Pipeline View
      </Typography>
      <Typography variant='body2' color='text.secondary' mb={2}>
        Drag and drop deals between stages
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Box display='flex' gap={2} overflow='auto' p={1}>
          {kanbanData.map((column, colIndex) => {
            const colors = statusColors[column.status] || statusColors.Unassigned
            const pag = pagination[column.status] || { page: 1, limit: 5, total: column.leads.length }
            return (
              <Droppable droppableId={colIndex.toString()} key={column.status}>
                {provided => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      minWidth: 320,
                      bgcolor: colors.bg,
                      p: 2,
                      borderRadius: 2,
                      boxShadow: '0 0 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
                      <Typography variant='subtitle1' fontWeight='600' color={colors.text}>
                        {column.status}
                      </Typography>
                      <Chip label={column.leads.length} size='small' sx={{ bgcolor: colors.text, color: '#fff' }} />
                    </Box>
                    <Box
                      display='flex'
                      flexDirection='column'
                      height='70vh' // fixed height for scroll area
                    >
                      {/* 🔹 Scrollable leads list */}
                      <Box
                        flex='1'
                        overflow='auto'
                        pr={1}
                        sx={{
                          '&::-webkit-scrollbar': { width: 6 },
                          '&::-webkit-scrollbar-thumb': { bgcolor: '#ccc', borderRadius: 3 }
                        }}
                      >
                        {column.leads.map((lead, index) => (
                          <Draggable draggableId={lead._id} index={index} key={lead._id}>
                            {provided => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                                  '&:hover': { boxShadow: '0 3px 8px rgba(0,0,0,0.15)' },
                                  transition: '0.2s'
                                }}
                              >
                                <Typography fontWeight='bold'>
                                  <Link
                                    href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(lead.lead_id))}`}
                                    style={{ textDecoration: 'none' }}
                                  >
                                    {lead.values.Company || '-'}
                                  </Link>
                                </Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  {lead.items?.length > 0
                                    ? lead.items?.map(order => (
                                        <Box key={order.order_id} sx={{ mb: 0.5 }}>
                                          <strong>{order.order_id}:</strong> <br />{' '}
                                          {order.item_ref.map(i => i.item_name).join(', ')}
                                        </Box>
                                      ))
                                    : lead.lead_name}
                                </Typography>

                                <Box display='flex' justifyContent='space-between' mt={1}>
                                  <Typography variant='body2' color='success.main' fontWeight='600'>
                                    {lead.items
                                      ? formatCurrency(
                                          lead.items.reduce((total, order) => {
                                            const itemTotal =
                                              order.item_ref?.reduce((sum, i) => sum + (i.finalPrice || 0), 0) || 0
                                            return total + itemTotal
                                          }, 0)
                                        )
                                      : formatCurrency(0)}
                                  </Typography>
                                  <Typography variant='body2' color='text.secondary'>
                                    {lead.values.Score || '—'}%
                                  </Typography>
                                </Box>

                                <Box display='flex' justifyContent='space-between' alignItems='center'>
                                  <Typography variant='caption' color='text.secondary'>
                                    {lead.values['Next Follow-up Date'] || '-'}
                                  </Typography>
                                  <Box display='flex' alignItems='center' gap={0.5}>
                                    <img loading='lazy' width='20' src='/images/icons/user.svg' alt='User Icon' />
                                    <Typography variant='caption'>{lead.user_name || '-'}</Typography>
                                  </Box>
                                </Box>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>

                      {/* 🔹 Fixed bottom pagination bar */}
                      <Box
                        display='flex'
                        alignItems='center'
                        justifyContent='space-between'
                        p={1}
                        mt={1}
                        sx={{
                          bgcolor: '#fff',
                          borderRadius: 1,
                          borderTop: '1px solid #eee',
                          position: 'sticky',
                          bottom: 0
                        }}
                      >
                        <Typography variant='caption'>
                          {(() => {
                            const start = (pag.page - 1) * pag.limit + 1
                            const end = Math.min(pag.page * pag.limit, pag.total)
                            return `${start}-${end} of ${pag.total}`
                          })()}
                        </Typography>

                        <Box display='flex' alignItems='center' gap={0.5}>
                          <IconButton
                            size='small'
                            disabled={pag.page <= 1}
                            onClick={() => {
                              fetchData(values.leadStatusOptions, pag.page - 1, pag.limit, column.status)
                            }}
                          >
                            <ArrowBackIosNew sx={{ fontSize: 14 }} />
                          </IconButton>

                          <Typography variant='caption'>{pag.page || 1}</Typography>

                          <IconButton
                            size='small'
                            disabled={pag.page >= pag.totalPages}
                            onClick={() => {
                              fetchData(values.leadStatusOptions, pag.page + 1, pag.limit, column.status)
                            }}
                          >
                            <ArrowForwardIos sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Droppable>
            )
          })}
        </Box>
      </DragDropContext>
    </Box>
  )
}
