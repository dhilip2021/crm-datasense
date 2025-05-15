


// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Component Imports
import ChangePassword from '@/views/ChangePassword'

const ChangePasswordPage = () => {
  // Vars
  const mode = getServerMode()

  return <ChangePassword mode={mode} />
}

export default ChangePasswordPage
