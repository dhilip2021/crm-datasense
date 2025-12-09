'use client'
// React + MUI Imports
import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import Form from '@components/Form'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'

// Fetch Privileges API
const fetchPrivileges = async token => {
  const res = await fetch('/api/v1/admin/user_privileges/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  const data = await res.json()
  return data.payloadJson
}

// Save Privileges API
const savePrivileges = async (token, updatedRoles) => {
  const res = await fetch('/api/v1/admin/user_privileges/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ roles: updatedRoles }) // always send array
  })

  if (!res.ok) throw new Error(`Save Error: ${res.status}`)

  return await res.json()
}

const PermissionView = () => {
  const getToken = Cookies.get('_token')

  const [roles, setRoles] = useState([])
  const [loader, setLoader] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!getToken) {
          console.error('Token missing in cookies')
          return
        }

        const data = await fetchPrivileges(getToken)
        const sorted = [...data].sort((a, b) => a.c_role_priority - b.c_role_priority)
        console.log(sorted, '<<<< LISTTT VALUEEE')
        setRoles(sorted)
      } catch (err) {
        console.error('Error fetching privileges:', err)
      }
    }
    loadData()
  }, [getToken])

  // Toggle privilege status
  const handleCheckboxChange = (roleIndex, privilegeType) => {
    const updatedRoles = [...roles]
    updatedRoles[roleIndex].c_role_privileges = updatedRoles[roleIndex].c_role_privileges.map(p =>
      p.role_privileage === privilegeType ? { ...p, role_privileage_status: !p.role_privileage_status } : p
    )
    setRoles(updatedRoles)
  }

  // Toggle menu privilege status (inside modal)
  const handleMenuCheckboxChange = menuIndex => {
    const updatedRoles = [...roles]
    const roleIndex = roles.findIndex(r => r.c_role_id === selectedRole.c_role_id)
    updatedRoles[roleIndex].c_menu_privileges[menuIndex].menu_privileage_status =
      !updatedRoles[roleIndex].c_menu_privileges[menuIndex].menu_privileage_status
    setRoles(updatedRoles)
    setSelectedRole(updatedRoles[roleIndex]) // update modal data also
  }

  // Check if privilege is active
  const hasPrivilege = (privileges, type) => {
    return privileges?.some(p => p.role_privileage === type && p.role_privileage_status)
  }

  // Save all roles in one go
  const handleSaveChanges = async () => {
    setOpenModal(false)
    try {
      const payload = roles.map(role => ({
        Id: role._id,
        c_role_id: role.c_role_id,
        c_role_privileges: role.c_role_privileges,
        c_menu_list: role.c_menu_list,
        c_menu_privileges: role.c_menu_privileges,
        n_status: role.n_status
      }))
      setLoader(true)
      const response = await savePrivileges(getToken, payload)
      setLoader(false)

      toast.success(response.message, {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
    } catch (err) {
      setLoader(false)
      toast.error(err.message || 'Failed to save changes ❌', {
        autoClose: 500,
        position: 'bottom-center',
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined
      })
      console.error('Error saving privileges:', err)
    }
  }

  return (
    <Card>
      <CardHeader title='User Role Permission' subheader={<></>} />
      <Form>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>User Role Name</th>
                <th>Add</th>
                <th>Edit</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody className='border-be'>
              {roles.map((role, index) => (
                <tr key={index}>
                  <td
                    onClick={() => {
                      setSelectedRole(role)
                      setOpenModal(true)
                    }}
                  >
                    <Typography color='primary' sx={{ cursor: 'pointer' }}>
                      {role.c_role_name}
                    </Typography>
                  </td>
                  {['add', 'edit', 'view', 'delete'].map(type => (
                    <td key={type}>
                      <Checkbox
                        checked={hasPrivilege(role.c_role_privileges, type)}
                        onChange={() => handleCheckboxChange(index, type)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardContent>
          <Grid container spacing={6}>
            <Grid item xs={12} className='flex gap-4 flex-wrap'>
              <Button disabled={loader} variant='contained' onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button variant='outlined' color='secondary' type='reset'>
                Reset
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Form>

      {/* Modal for c_menu_privileges */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Menu Privileges - {selectedRole?.c_role_name}</DialogTitle>
        <DialogContent>
          <table className='w-full border mt-2'>
            <thead>
              <tr>
                <th className='p-2 border'>Menu Name</th>
                <th className='p-2 border'>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedRole?.c_menu_privileges?.map((menu, idx) => (
                <tr key={idx}>
                  <td className='p-2 border'>{menu.menu_privileage_name}</td>
                  <td className='p-2 border'>
                    <Checkbox checked={menu.menu_privileage_status} onChange={() => handleMenuCheckboxChange(idx)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DialogContent>
        <DialogActions>
          <Grid item xs={12} className='flex gap-4 flex-wrap'>
            <Button onClick={() => setOpenModal(false)} color='secondary'>
              Close
            </Button>
            <Button disabled={loader} variant='contained' onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Grid>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default PermissionView
