'use client'
import React, { useEffect, useState } from 'react'
import { Box, Card, Typography, CircularProgress, Chip, IconButton, Select, MenuItem } from '@mui/material'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import { encryptCryptoRes, formatCurrency } from '@/helper/frontendHelper'
import Link from 'next/link'
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material'

// 💰 Format currency (INR)
// const formatCurrency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)

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
  colorMap['Unassigned'] = { bg: '#f5f5f5', text: '#616161' }
  return colorMap
}

export default function KanbanView() {
  const organization_id = Cookies.get('organization_id')
  const user_id = Cookies.get('user_id')
  const getToken = Cookies.get('_token')
  const form_view = 'opportunities-form'
  const form_name = 'opportunity-form'

  const [kanbanData, setKanbanData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)
  const [values, setValues] = useState({})
  const [pagination, setPagination] = useState({})
  const [statusColors, setStatusColors] = useState({})
  const [globalPagination, setGlobalPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  })

  // 🧩 Step 1: Fetch form to get "Lead Status" options
  const fetchForm = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${form_view}`
      )
      const data = await res.json()

      console.log(data,"<<< DATAAAAA")
      setLoader(false)

      if (data?.success && data.data?.sections?.length > 0) {
        const sections = data.data.sections
        let leadStatusOptions = []

        sections.forEach(section => {
          const fields = [
            ...(section.fields.left || []),
            ...(section.fields.center || []),
            ...(section.fields.right || [])
          ]
          fields.forEach(field => {
            if (field.label === 'Lead Status' && Array.isArray(field.options)) {
              leadStatusOptions = field.options
            }
          })
        })

        if (!leadStatusOptions.length) {
          toast.error('Lead Status options missing', { autoClose: 1500 })
          return
        }

        setValues(prev => ({ ...prev, leadStatusOptions }))
        buildKanbanStructure(leadStatusOptions)
        fetchData(leadStatusOptions, globalPagination.page, globalPagination.limit)
      } else {
        toast.error('Form not found', { autoClose: 1500 })
      }
    } catch (err) {
      console.error('❌ Error fetching form:', err)
      toast.error('Error fetching form', { autoClose: 1500 })
      setLoader(false)
    }
  }

  // 🧩 Step 2: Initialize empty Kanban structure
  const buildKanbanStructure = leadStatusOptions => {
    const initialColumns = (leadStatusOptions || []).map(status => ({
      status,
      leads: []
    }))
    setKanbanData(initialColumns)
  }

  // 🧩 Step 3: Fetch leads
  const fetchData = async (leadStatusOptions, page, limit, singleStatus = null) => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        organization_id,
        form_name,
        page: page.toString(),
        limit: limit.toString(),
        ...(singleStatus ? { status: singleStatus } : {})
      })

      const res = await fetch(`/api/v1/admin/lead-form/kanban-view?${query}`)
      const json = await res.json()

      if (json.success) {
        // ✅ Set global pagination from API
        setGlobalPagination(prev => ({
          ...prev,
          total: json.totalLeads || 0,
          totalPages: Math.ceil((json.totalLeads || 0) / prev.limit)
        }))

        // ✅ Existing code (distribute leads by status)
        if (!singleStatus) {
          const distributed = (leadStatusOptions || []).map(status => {
            const leads = json.kanban.flatMap(col => col.leads).filter(lead => lead.values['Lead Status'] === status)
            const kanbanItem = json.kanban.find(col => col.status === status)
            const totalCountForStatus = kanbanItem ? kanbanItem.totalCount : 0
            const total = totalCountForStatus
            const totalPages = Math.ceil(total / limit)
            return { status, leads, total, totalPages, page, limit }
          })

          const newPagination = {}
          distributed.forEach(col => {
            newPagination[col.status] = {
              page,
              limit,
              total: col.total,
              totalPages: col.totalPages
            }
          })
          setPagination(newPagination)
          setKanbanData(distributed)
        }
      }
    } catch (err) {
      console.error('❌ Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }

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
  // const handleDragEnd = result => {
  //   const { source, destination } = result
  //   if (!destination) return

  //   const newKanban = [...kanbanData]
  //   const sourceIndex = parseInt(source.droppableId, 10)
  //   const destIndex = parseInt(destination.droppableId, 10)

  //   const [movedLead] = newKanban[sourceIndex].leads.splice(source.index, 1)
  //   newKanban[destIndex].leads.splice(destination.index, 0, movedLead)
  //   setKanbanData(newKanban)
  // }

  // 🎯 Handle drag & drop
  const handleDragEnd = async result => {
    const { source, destination } = result
    if (!destination) return

    const newKanban = [...kanbanData]
    const sourceIndex = parseInt(source.droppableId, 10)
    const destIndex = parseInt(destination.droppableId, 10)

    // 🔹 Move lead locally
    const [movedLead] = newKanban[sourceIndex].leads.splice(source.index, 1)
    newKanban[destIndex].leads.splice(destination.index, 0, movedLead)

    // 🔹 Update the lead status locally
    movedLead.values['Lead Status'] = newKanban[destIndex].status
    setKanbanData(newKanban)
    const leadId = movedLead.lead_id;

    try {
      setLoading(true)
      // 🔹 Persist to API
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(movedLead)
      })

      const result = await res.json()
      setLoading(false)

      if (!result.success) {
        console.log(result, '<< result result result')

        fetchForm() // rollback to latest DB values
      } else {
        toast.success('Successfully Updated', {
          autoClose: 1000,
          position: 'bottom-center',
          hideProgressBar: true
        })
        fetchForm()
      }
    } catch (err) {
      toast.error('Error saving field')
    }
  }

  // 🌀 Loader
  if (loader || loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' height='70vh'>
        <CircularProgress />
      </Box>
    )
  }

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
            return (
              <Box p={2}>
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
                      {/* 🔹 Column Header */}
                      <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
                        <Typography variant='subtitle1' fontWeight='600' color={colors.text}>
                          {column.status}
                        </Typography>
                        <Chip label={column.total} size='small' sx={{ bgcolor: colors.text, color: '#fff' }} />
                      </Box>

                      {/* 🔹 Scrollable Leads */}
                      <Box display='flex' flexDirection='column' height='70vh'>
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
                                      ? lead.items.map(order => (
                                          <Box key={order.item_id} sx={{ mb: 0.5 }}>
                                            <strong>{order.item_id}:</strong> <br />
                                            {order.item_ref.map(i => i.product_name).join(', ')}
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
                      </Box>
                    </Box>
                  )}
                </Droppable>
              </Box>
            )
          })}
        </Box>
      </DragDropContext>
      {/* 🧭 Global Pagination (outside Kanban) */}
      <Box
        mt={2}
        display='flex'
        alignItems='center'
        width={'25%'}
        justifyContent='space-between'
        p={1}
        sx={{
          bgcolor: '#fff',
          borderRadius: 1,
          borderTop: '1px solid #eee',
          position: 'sticky',
          bottom: 0
        }}
      >
        <Box display='flex' alignItems='center' gap={0.5}>
          <IconButton
            size='small'
            disabled={globalPagination.page <= 1}
            onClick={() => {
              const newPage = globalPagination.page - 1
              setGlobalPagination(prev => ({ ...prev, page: newPage }))
              fetchData(values.leadStatusOptions, newPage, globalPagination.limit)
            }}
          >
            <ArrowBackIosNew sx={{ fontSize: 14 }} />
          </IconButton>
          <Select
            size='small'
            value={globalPagination.limit}
            onChange={e => {
              const newLimit = parseInt(e.target.value)
              setGlobalPagination(prev => ({ ...prev, page: 1, limit: newLimit }))
              fetchData(values.leadStatusOptions, 1, newLimit)
            }}
          >
            {[5, 10, 50, 100].map(size => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>

          <IconButton
            size='small'
            disabled={globalPagination.page >= globalPagination.totalPages}
            onClick={() => {
              const newPage = globalPagination.page + 1
              setGlobalPagination(prev => ({ ...prev, page: newPage }))
              fetchData(values.leadStatusOptions, newPage, globalPagination.limit)
            }}
          >
            <ArrowForwardIos sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        <Typography variant='caption' sx={{ mr: 2 }}>
          {(() => {
            const start = (globalPagination.page - 1) * globalPagination.limit + 1
            const end = Math.min(globalPagination.page * globalPagination.limit, globalPagination.total)
            return `${start}-${end} of ${globalPagination.total}`
          })()}
        </Typography>
      </Box>
    </Box>
  )
}
