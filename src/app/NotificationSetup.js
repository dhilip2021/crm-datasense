'use client'
import { addDeviceNotify, getDeviceId } from '@/apiFunctions/ApiAction'
import { messaging } from '@/utils/firebaseConfig'
import { getToken } from 'firebase/messaging'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NotificationSetup = () => {
  const router = useRouter()
  const user_id = Cookies.get('user_id')
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  console.log(baseUrl, '<<< baseUrl')
  const [device, setDevice] = useState('')
  const [fcmToken, setFcmToken] = useState('')

  const AddDevice = async () => {
    try {
      const results = await getDeviceId()
      results && setDevice(results['device-tracker-id'])
    } catch (err) {
      console.log(err)
    }
  }



  const GetToken = async () => {
    try {
      const body = {
        c_fcm_device_id: device,
        c_fcm_device_type: 'web',
        c_fcm_device_token: fcmToken,
        c_user_id: user_id
      }
      const results = await addDeviceNotify(body)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    console.log(fcmToken, '<<<   fcmToken')
    console.log(device, '<<<   device')
    try {
      if (fcmToken !== '' && device !== '') {
        GetToken()
      }
    } catch (err) {
      console.log(err)
    }
  }, [fcmToken, device])

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const permission = await Notification.requestPermission()

          if (permission === 'granted') {
            // Register service worker BEFORE getToken()
            const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

            const token = await getToken(messaging, {
              vapidKey: 'BDTMsl_O6Qvn779hn3l8RIkMTmerD4APec2sW8WG0jFTrd6BwXsrrjHsuqfgcr86KozsIR0gSl_6EaHBolGJri8',
              serviceWorkerRegistration: swReg // IMPORTANT!
            })

            setFcmToken(token)
          }
        } catch (error) {
          console.error('Error requesting permission:', error)
        }
      }
    }

    requestPermission()
    AddDevice()
  }, [])


  return null
}

export default NotificationSetup
