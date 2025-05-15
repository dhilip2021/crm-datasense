/* eslint-disable react-hooks/exhaustive-deps */
// ** React Imports
'use client'
import { useCallback, useEffect, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Image from 'next/image'

import Cookies from 'js-cookie'



// ** MUI Imports
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'
import { Box, Button, Card, CardContent, InputAdornment, TextField } from '@mui/material'

import { postDealListApi } from '@/apiFunctions/ApiAction'

import LoaderGif from '@assets/gif/loader.gif'


function activeColor(value) {
  switch (value) {
    case 'New':
      return '#9c27b0'
    case 'Contacted':
      return '#e91e63'
    case 'Nurture':
      return '#009688'
    case 'Qualified':
      return '#1976d2'
    case 'Unqualified':
      return '#f44336'
    case 'Junk':
      return '#009688'
    case 'Qualification':
      return '#001f3f'
    case 'Demo/Making':
      return '#00bfff'
    case 'Proposal/Quotation':
      return '#ffeb3b'
    case 'Negotiation':
      return '#ff9800'
    case 'Ready to Close':
      return '#009688'
    case 'Won':
      return '#4caf50'
    case 'Lost':
      return '#8B0000'

    default:
      return 'info'
  }
}

const DealsTable = () => {
  const organization_id = Cookies.get('organization_id')
  const router = useRouter()

  const getToken = Cookies.get('_token')
  const [callFlag, setCallFlag] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [fieldDataList, setFieldDataList] = useState([])
  const [leadDataList, setLeadDataList] = useState([])

  const [inputs, setInputs] = useState([])
  const [errors, setErrors] = useState([])

  const [datas, setDatas] = useState([])
  const [columns, setColumns] = useState([])

  const handleOnChange = e => {
    const { name, value } = e.target
    
    setSearch(value)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const getLeadList = async () => {
    setLoader(true)

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    const body = {
      organization_id: organization_id,
      n_page: page + 1,
      n_limit: rowsPerPage,
      c_search_term: search
    }

    const results = await postDealListApi(body, header)

    setLoader(false)

    if (results?.appStatusCode === 0) {
      setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      setLeadDataList(results?.payloadJson[0]?.data)
    } else {
      setLeadDataList([])
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        setLoader(true)
        getLeadList()
      } else if (search?.length == 0) {
        setLoader(true)
        getLeadList()
        setCallFlag(true)
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if(callFlag){
      setLoader(true)
      getLeadList()
    }
      
  }, [page, rowsPerPage])

  return (
    <Box>
      <Card className='bs-full'>
        <CardContent>
          <Box display={'flex'} justifyContent={'space-between'} mb={4}>
            <TextField
              autoComplete='off'
              placeholder='Search'
              name='search'
              value={search}
              onChange={e => handleOnChange(e)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line'></i>
                  </InputAdornment>
                ),
                endAdornment: search?.length > 0 && (
                  <InputAdornment position='start' sx={{ cursor: 'pointer' }}>
                    <i className='ri-close-line' onClick={() => setSearch('')}></i>
                  </InputAdornment>
                )
              }}
              size='small'
            />
            <Link href={'/deals'}>
              <Button startIcon={<i className='ri-add-line'></i>} variant='contained' className='mis-4'>
                Create Deal
              </Button>
            </Link>
          </Box>

          <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            {loader && (
              <Box textAlign={'center'} width={'100%'} mt={'200px'} mb={'100px'}>
                <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
              </Box>
            )}

            {callFlag && !loader && leadDataList?.length === 0 && (
              <Box textAlign={'center'} width={'100%'} mt={'100px'} mb={'100px'}>
                <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Leads Found</p>
              </Box>
            )}
          </Box>
          
          {!loader && leadDataList?.length > 0 && (
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label='sticky table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>First Name </TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Created By</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {leadDataList.map(row => (
                    <TableRow hover role='checkbox' tabIndex={-1} key={row._id}>
                      <TableCell>{row?.organization}</TableCell>
                      <TableCell>{row?.first_name}</TableCell>
                      <TableCell>{row?.last_name}</TableCell>
                      <TableCell>{row?.email}</TableCell>
                      <TableCell>{row?.mobile}</TableCell>
                      <TableCell>{row?.phone}</TableCell>
                      <TableCell>{row?.gender}</TableCell>
                      <TableCell>{row?.c_createdName}</TableCell>
                      <TableCell>
                        <Button size='small' variant='contained' 
                         sx={{
                          backgroundColor: activeColor(row?.status),
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: activeColor(row?.status)
                          }
                        }}
                        >
                                  {' '}
                                  {row?.status}
                                </Button>
                    </TableCell>
                      <TableCell> <Link href={`/deals/edit-deal/${row?.lead_slug_name}`}><i className="ri-edit-box-line"></i></Link> </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component='div'
              count={count}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          )}
          
        </CardContent>
      </Card>
    </Box>
  )
}

export default DealsTable
