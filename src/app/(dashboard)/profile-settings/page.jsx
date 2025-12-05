'use client'
// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import AccountSettings from '@views/account-settings'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

const AccountTab = dynamic(() => import('@views/account-settings/account'))
const NotificationsTab = dynamic(() => import('@views/account-settings/notifications'))
const ConnectionsTab = dynamic(() => import('@views/account-settings/connections'))

// Vars
const tabContentList = () => ({
  account: <AccountTab />,
  notifications: <NotificationsTab />,
  connections: <ConnectionsTab />
})

const ProfileSettingsPage = () => {


 const router = useRouter()
    const { payloadJson } = useSelector(state => state.menu)
  
  const hasViewPermission = () => {
    if (!payloadJson || payloadJson.length === 0) return false;
  
    const found = payloadJson.find(
      m =>
        m.menu_privileage_name === 'Settings' &&
        m.sub_menu_privileage_name === 'Profile Setting'
    );
  
    return found?.view_status === true;
  };
  
    useEffect(() => {
    if (payloadJson.length > 0) {
      if (!hasViewPermission()) {
        router.push('/');
      }
    }
  }, [payloadJson]);


  return <AccountSettings tabContentList={tabContentList()} />
}

export default ProfileSettingsPage
