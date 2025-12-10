// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
// import '@assets/iconify-icons/generated-icons.css'

import '@assets/iconify-icons/icon.css'
import 'remixicon/fonts/remixicon.css'

//react-toastify
import 'react-toastify/dist/ReactToastify.css';
import { ReduxProvider } from './providers';
import { ToastContainer } from 'react-toastify';
import ReminderAlert from './(dashboard)/view/lead-form/[id]/ReminderAlert';
import NotificationSetup from './NotificationSetup';
import NotificationPopup from '@/components/NotificationPopup/NotificationPopup';

export const metadata = {
  title: 'Lumivo CRM Admin - Datasense Technologies',
  description: 'Manage leads, tasks, and analytics with Lumivo CRM — a powerful admin dashboard by Datasense Technologies for smarter business insights and team performance.'
}

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <link
          href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ReduxProvider>
          
          {children}

          <ToastContainer
        position='bottom-center'
        autoClose={500} // all toasts auto close
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        draggable={false}
      />
      <ReminderAlert />
      <NotificationSetup />
      <NotificationPopup />
        </ReduxProvider>

      </body>
    </html>
  )
}

export default RootLayout
