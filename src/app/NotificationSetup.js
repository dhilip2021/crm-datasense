'use client'
import { addDeviceNotify, getDeviceId } from '@/apiFunctions/ApiAction'
import { messaging } from '@/utils/firebaseConfig'
import { getToken } from 'firebase/messaging'
import Cookies from 'js-cookie'
import { useEffect, useState } from 'react'

const NotificationSetup = () => {
  const user_id = Cookies.get('user_id')
const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const [device, setDevice] = useState('')
  const [fcmToken, setFcmToken] = useState('')

  // ---------------------------
  // 1. Generate Unique Device ID
  // ---------------------------
  const AddDevice = async () => {
    try {
      const results = await getDeviceId()
      if (results) {
        setDevice(results['device-tracker-id'])
      }
    } catch (err) {
      console.log(err)
    }
  }

  // ---------------------------
  // 2. Save token & device to DB
  // ---------------------------
  const SaveTokenToDB = async () => {
    try {
      const body = {
        c_fcm_device_id: device,
        c_fcm_device_type: baseUrl ==="http://localhost:3000"? 'web1' : 'web',
        c_fcm_device_token: fcmToken,
        c_user_id: user_id
      }
      if(user_id){
        await addDeviceNotify(body)
      }else{
        console.log("user Id very must")
      }

      
    } catch (err) {
      console.log(err)
    }
  }

  // When token + device ID ready → save to DB
  useEffect(() => {

    console.log(fcmToken,"<<< fcmToken")
    console.log(device,"<<< device")
    console.log(user_id,"<<< user_id")


    if (fcmToken && device) {
      SaveTokenToDB()
    }
  }, [fcmToken, device])

  // ---------------------------
  // 3. Request permission + Get Token
  // ---------------------------
  useEffect(() => {
    const initFCM = async () => {
      try {
        if (!('serviceWorker' in navigator)) {
          console.log('Service Worker not supported')
          return
        }

        // Ask permission
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          console.log('Notification permission denied')
          return
        }

        // Register SW
        await navigator.serviceWorker.register('/firebase-messaging-sw.js')

        // WAIT UNTIL READY (IMPORTANT FIX)
        const readySW = await navigator.serviceWorker.ready

        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey:
            'BDTMsl_O6Qvn779hn3l8RIkMTmerD4APec2sW8WG0jFTrd6BwXsrrjHsuqfgcr86KozsIR0gSl_6EaHBolGJri8',
          serviceWorkerRegistration: readySW
        })

        console.log('FCM Token:', token)
        setFcmToken(token)
      } catch (err) {
        console.log('Error generating FCM token:', err)
      }
    }

    initFCM()
    AddDevice()
  }, [])

  return null
}

export default NotificationSetup
