/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import { useEffect, useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import Cookies from 'js-cookie'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import { Box, Button, CardContent, InputAdornment, TablePagination, TextField } from '@mui/material'

// Components Imports
import CustomAvatar from '@core/components/mui/Avatar'

// Styles Imports
import tableStyles from '@core/styles/table.module.css'
import { allUserListApi, deleteUserApi } from '@/apiFunctions/ApiAction'
import LoaderGif from '@assets/gif/loader.gif'
import DeleteConformPopup from '../leads/DeleteConformPopup'
import { toast, ToastContainer } from 'react-toastify'

const UsersListTable = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')

  const [isClient, setIsClient] = useState(false)
  const [usersList, setUsersList] = useState([])
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loader, setLoader] = useState(false)
  const [search, setSearch] = useState('')
  const [count, setCount] = useState(0)
  const [callFlag, setCallFlag] = useState(false)

    const [delOpen, setDelOpen] = useState(false)
    const [delId, setDelId] = useState('')
    const [delTitle, setDelTitle] = useState('')

  const handleOnChange = e => {
    const { name, value } = e.target

    setSearch(value)
  }




  const delClose = () => {
    setDelOpen(false)
    setDelId('')
    setDelTitle('')
  }
  const deleteFn = (id) => {
    setDelOpen(true)
    setDelId(id)
    setDelTitle('Are you sure you want to delete this?')
  }

  const deleteConfirm = () => {
    setDelOpen(false)
    deleteUserFn(delId)
  }



  const deleteUserFn = async(id)=>{
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    setLoader(false)
    const deleteRes = await deleteUserApi(id,header)
     if (deleteRes?.appStatusCode !== 0) {
          setLoader(false)
          toast.success(deleteRes?.error)
          GetAllUserList()
        } else {
          setLoader(false)
          GetAllUserList()
          toast.success(deleteRes?.message)
        }

  }
  const GetAllUserList = async () => {
    setLoader(true)

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      setUsersList([])

      const body = {
        n_page: page + 1,
        n_limit: rowsPerPage,
        c_search_term: search ? search : '',
        organization_id: organization_id
      }

      const results = await allUserListApi(body, header)

      setLoader(false)

      if (results.payloadJson.length > 0) {
        setUsersList(results?.payloadJson[0]?.data)
        setCount(results?.payloadJson?.at(0)?.total_count?.at(0)?.count)
      } else {
        setUsersList([])
        setCount(0)
      }
    } catch (err) {
      setLoader(false)
      console.log(err)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search?.length > 0) {
        GetAllUserList()
      } else if (search?.length == 0) {
        setCallFlag(true)
        GetAllUserList()
      }
    }, 500) // waits 500ms after typing stops

    return () => clearTimeout(delayDebounce) // clean up on new keystroke
  }, [search])

  useEffect(() => {
    if (callFlag) {
      GetAllUserList()
    }
  }, [page])

  useEffect(() => {
    if (callFlag) {
      GetAllUserList()
    }
  }, [rowsPerPage])

  return (
    <Box>
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
            // sx={{
            //   width: { xs: '50%', sm: 'auto' },
            //   fontSize: { xs: '0.85rem', sm: '1rem' }
            // }}
        />
        <Link href={'/add-user'}>
          <Button startIcon={<i className='ri-add-line'></i>} variant='contained' className='mis-4'
          //  sx={{
          //   fontSize: { xs: '1.25rem', sm: '0.875rem' },
          //   padding: { xs: '4px 8px', sm: '6px 16px' },
          //   minWidth: { xs: 'unset', sm: 'auto' }
          // }}
          >
            Add user 
          </Button>
        </Link>
      </Box>

      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        {loader && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
                <Box p={40}>
                  <Image src={LoaderGif} alt='My GIF' width={200} height={100} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {!loader && usersList?.length === 0 && (
          <Box textAlign={'center'} width={'100%'}>
            <Card className='w-full shadow-md rounded-lg'>
              <CardContent className='text-center'>
                <Box p={40}>
                  <p style={{ fontSize: '18px', borderBottom: '0px', textAlign: 'center' }}>No Users Found</p>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <Card>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            {Array.isArray(usersList) && usersList?.length > 0 && (
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
            )}

            <tbody>
              {Array.isArray(usersList) &&
                usersList?.map((row, index) => (
                  <tr key={index}>
                    <td className='!plb-1'>
                      <div className='flex items-center gap-3'>
                        {/* <CustomAvatar src={row.avatarSrc} size={34} /> */}
                        <CustomAvatar skin='light' color='primary'>
                          {row.user_name
                            .split(' ')
                            .map(n => n[0])
                            .join(' ')
                            .toUpperCase()}
                        </CustomAvatar>
                        <div className='flex flex-col'>
                          <Typography color='text.primary' className='font-medium'>
                            {row.first_name}
                          </Typography>
                          <Typography variant='body2'>{row.user_name}</Typography>
                        </div>
                      </div>
                    </td>
                    <td className='!plb-1'>
                      <Typography>{row.email}</Typography>
                    </td>
                    <td className='!plb-1'>
                      <div className='flex gap-2'>
                        <Typography color='text.primary'>{row.c_role_name}</Typography>
                      </div>
                    </td>
                    <td className='!pb-1'>
                      <Chip
                        className='capitalize'
                        variant='tonal'
                        color={row.n_status === 1 ? 'success' : 'error'}
                        label={row.n_status === 1 ? 'active' : 'in-active'}
                        size='small'
                      />
                    </td>
                    <td className='!pb-1'>
                    <Box display={'flex'}>
                            {' '}
                            <Link href={`/edit-user/${row?.user_id}`}>
                              <i className='ri-edit-box-line'></i>
                            </Link>{' '}
                            <Box>
                              <i
                                className='ri-delete-bin-3-fill'
                                style={{ color: '#ff5555', cursor: 'pointer' }}
                                onClick={() => deleteFn(row?._id)}
                              ></i>
                            </Box>
                          </Box>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {Array.isArray(usersList) && usersList?.length > 0 && (
            <TablePagination
              component='div'
              count={count}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={event => {
                setRowsPerPage(parseInt(event.target.value, 10))
                setPage(0) // reset to first page
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </div>
      </Card>
      <ToastContainer />
       <DeleteConformPopup open={delOpen} title={delTitle} close={delClose} deleteConfirm={deleteConfirm} />
    </Box>
  )
}

export default UsersListTable
