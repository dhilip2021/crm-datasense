// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
// import '@assets/iconify-icons/generated-icons.css'

import '@assets/iconify-icons/icon.css'

//react-toastify
import 'react-toastify/dist/ReactToastify.css';
import { ReduxProvider } from './providers';

export const metadata = {
  title: 'CRM Admin - Datasense Technologies',
  description:
    'CRM admin dashboard'
}

const RootLayout = ({ children }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

export default RootLayout
