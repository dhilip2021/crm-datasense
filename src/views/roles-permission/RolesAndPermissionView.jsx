'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import {
  getHierarchyUserListApi,
  postRolesAndPermissionAddApi,
  postRolesAndPermissionListApi
} from '@/apiFunctions/ApiAction'
import { Box, CardHeader, Checkbox, IconButton, MenuItem, TextField, Typography } from '@mui/material'
import Form from '@components/Form'
import tableStyles from '@core/styles/table.module.css'
import { decrypCryptoRequest, maskEmail } from '@/helper/frontendHelper'
import EditIcon from '@mui/icons-material/Edit'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

const menu_privileges_status_array = [
  {
    menu_privileage_name: 'Dashboard',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Dashboard',
    sub_menu_privileage_name: 'Leads',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Dashboard',
    sub_menu_privileage_name: 'Opportunity',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'Territory',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'Campaign Type',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'Tax Master',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'UOM Master',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'Item Master',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Master',
    sub_menu_privileage_name: 'Reasons Master',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Leads',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Opportunity',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Contacts',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Notes',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Tasks',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Calls',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Organization',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Emails',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Comments',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Settings',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Settings',
    sub_menu_privileage_name: 'Profile Setting',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Settings',
    sub_menu_privileage_name: 'User List',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Settings',
    sub_menu_privileage_name: 'Roles & Permission',
    add_status: false,
    edit_status: false,
    view_status: false,
    delete_status: false
  },
  {
    menu_privileage_name: 'Setup',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  },
  {
    menu_privileage_name: 'Logout',
    sub_menu_privileage_name: '',
    add_status: true,
    edit_status: true,
    view_status: true,
    delete_status: true
  }
]

const RolesAndPermissionView = () => {
  const token = Cookies.get('_token')

  const [rolesData, setRolesData] = useState([])
  const [loader, setLoader] = useState(false)
  const [count, setCount] = useState(0)
  const [openModal, setOpenModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState([])
  const [user, setUser] = useState('')
  const [userId, setUserId] = useState('')
  const [userList, setUserList] = useState([])
  const [id, setId] = useState('')
  const [type, setType] = useState('Add')

  // ---------------- Fetch API ----------------

  const getUserListFn = async () => {
    try {
      const results = await getHierarchyUserListApi()
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setUserList(results.payloadJson)
      } else {
        setUserList([])
      }
    } catch (err) {
      console.error('User list error:', err)
      setUserList([])
    }
  }

  const fetchRolesPrevileges = async () => {
    setLoader(true)

    const body = {
      n_page: 1,
      n_limit: 10,
      c_search_term: ''
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }

    try {
      const result = await postRolesAndPermissionListApi(body, headers)

      setLoader(false)

      if (result.appStatusCode === 0) {
        setRolesData(result?.payloadJson[0]?.data || [])
        setCount(result?.payloadJson?.at(0)?.total_count?.at(0)?.count || 0)
      } else {
        setRolesData([])
        setCount(0)
        toast.error(result.error || 'Something went wrong!')
      }
    } catch (err) {
      console.error('API Error:', err)
      toast.error('Failed to load roles & permissions')
    }

    setLoader(false)
  }

  const handleEditClick = (menus, uName, uId, id) => {
    setSelectedRole([])
    setOpenModal(true)
    setUser(uName)
    setUserId(uId)
    setId(id)
    setType('Edit')
    setSelectedRole(menus)
  }

  const handleAddclick = () => {
    setSelectedRole([])
    getUserListFn()
    setType('Add')
    setOpenModal(true)
    setSelectedRole(menu_privileges_status_array)
  }

  const handleMenuCheckboxChange = (menuIndex, field) => {
    // 1. Clone selectedRole array (modal data)
    const updatedMenus = [...selectedRole]

    // 2. Toggle specific field (add/edit/view/delete)
    updatedMenus[menuIndex][field] = !updatedMenus[menuIndex][field]

    // 3. Update selectedRole state → Modal rerenders
    setSelectedRole(updatedMenus)

    // 4. Also update main rolesData
    const updatedRolesData = [...rolesData]
    const userIndex = updatedRolesData.findIndex(r => r.c_user_name === user)

    if (userIndex !== -1) {
      updatedRolesData[userIndex].menu_privileges_status = updatedMenus
    }

    setRolesData(updatedRolesData)
  }

  const handleSaveChanges = async () => {
    if (!selectedRole) return toast.error('No menu privileges selected')

    setLoader(true)

    const payload = {
      Id: id,
      c_user_id: userId,
      menu_privileges_status: selectedRole
    }

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }

    console.log(payload, '<<< update Payload')

    try {
      const result = await postRolesAndPermissionAddApi(payload, headers)

      if (result.appStatusCode === 0) {
        toast.success('Privileges updated successfully')

        // Refresh table data
        fetchRolesPrevileges()

        // Close modal
        setOpenModal(false)
      } else {
        toast.error(result.error || 'Failed to update privileges')
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }

    setLoader(false)
  }

  const handleCloseModel = () => {
    setOpenModal(false)
    setUser('')
    setUserId('')
    setId('')
  }

  useEffect(() => {
    if (!token) return console.error('Token missing')
    fetchRolesPrevileges()
  }, [token])

  return (
    <Card>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} gap={5}>
        <CardHeader title='User Role Permissions' />

        <Button
          variant='contained'
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            marginRight: '10px',
            bgcolor: '#009CDE',
            '&:hover': { bgcolor: '#009CDE' }
          }}
          onClick={e => handleAddclick()}
        >
          + Add
        </Button>
      </Box>

      <Form>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>User Name</th>
                <th>First Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {Array.isArray(rolesData) &&
                rolesData.map((role, index) => (
                  <tr key={role.c_user_id || index}>
                    {/* USERNAME CLICK → OPEN MODAL */}
                    <td
                      onClick={e =>
                        handleEditClick(role?.menu_privileges_status, role.c_user_name, role.c_user_id, role._id)
                      }
                    >
                      <Typography color='primary' sx={{ cursor: 'pointer' }}>
                        {role.c_user_name}
                      </Typography>
                    </td>
                    <td> {role?.userList[0]?.first_name}</td>
                    <td>
                      {' '}
                      {Array.isArray(role?.userList) && maskEmail(decrypCryptoRequest(role?.userList[0]?.email))}
                    </td>
                    <td> {Array.isArray(role?.userList) && decrypCryptoRequest(role?.userList[0]?.mobile)}</td>
                    <td>
                      <IconButton
                        color='primary'
                        size='small'
                        onClick={e =>
                          handleEditClick(role?.menu_privileges_status, role.c_user_name, role.c_user_id, role._id)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Form>
      {/* Modal for c_menu_privileges */}
      <Dialog open={openModal} onClose={() => handleCloseModel()} fullWidth maxWidth='xl'>
        <DialogTitle>Menu Privileges - {user}</DialogTitle>
        {type === 'Add' && (
          <Grid item xs={6} className='flex gap-4 flex-wrap'>
            <TextField
              select
              size='small'
              variant='outlined'
              label='Assigned To'
              value={userId}
              onChange={e => setUserId(e.target.value)}
              sx={{
                width: '260px', // 🔥 FIXED WIDTH — no more stretching
                mb: 2,
                ml: 5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: '#f9fafb',
                  height: '42px',
                  fontSize: '0.9rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  '& fieldset': { borderColor: '#d0d7de' },
                  '&:hover fieldset': { borderColor: '#b6c2c9' },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  top: '-2px'
                }
              }}
            >
              {userList.map(u => (
                <MenuItem key={u.user_id} value={u.user_id}>
                  {u.user_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        <DialogContent>
          <table className='w-full border mt-2'>
            <thead>
              <tr>
                <th className='p-2 border'>Menu Name</th>
                <th className='p-2 border'>Sub Menu Name</th>
                <th className='p-2 border'>Add</th>
                <th className='p-2 border'>Edit</th>
                <th className='p-2 border'>View</th>
                <th className='p-2 border'>Delete</th>
              </tr>
            </thead>
            <tbody>
              {selectedRole?.map((menu, idx) => (
                <tr key={idx}>
                  <td className='p-2 border'>{menu.menu_privileage_name}</td>
                  <td className='p-2 border'>{menu.sub_menu_privileage_name}</td>
                  <td className='p-2 border' align='center'>
                    <Checkbox checked={menu.add_status} onChange={() => handleMenuCheckboxChange(idx, 'add_status')} />
                  </td>
                  <td className='p-2 border' align='center'>
                    <Checkbox
                      checked={menu.edit_status}
                      onChange={() => handleMenuCheckboxChange(idx, 'edit_status')}
                    />
                  </td>
                  <td className='p-2 border' align='center'>
                    <Checkbox
                      checked={menu.view_status}
                      onChange={() => handleMenuCheckboxChange(idx, 'view_status')}
                    />
                  </td>
                  <td className='p-2 border' align='center'>
                    <Checkbox
                      checked={menu.delete_status}
                      onChange={() => handleMenuCheckboxChange(idx, 'delete_status')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          {/* <Grid item xs={12} className='flex gap-4 flex-wrap'> */}
          <Box display={'flex'} mt={'5'} justifyContent={'space-between'}>
            <Button onClick={() => handleCloseModel()} color='secondary'>
              Close
            </Button>
            <Button disabled={loader} variant='contained' onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Box>

          {/* </Grid> */}
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default RolesAndPermissionView
