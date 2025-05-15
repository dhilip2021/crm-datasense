// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Style Imports
import styles from './styles.module.css'

const TooltipContent = () => {
  return (
    <Card>
      <CardHeader title={`${themeConfig.templateName} - MUI Next.js Admin Template`} />
      <CardContent>
        <Typography color='textSecondary' className='mbe-4'>
          {`${themeConfig.templateName} Admin is the most developer friendly & highly customizable Admin Dashboard Template based on MUI and Next.js.`}
        </Typography>
        <Typography color='textSecondary'>Click on below button to explore the PRO version.</Typography>
      </CardContent>
      <CardActions>
      </CardActions>
    </Card>
  )
}

const UpgradeToProButton = () => {
  return (
    <div className={classnames(styles.wrapper, 'mui-fixed')}>
      <Tooltip
        title={<TooltipContent />}
        placement='top-end'
        slotProps={{ tooltip: { style: { padding: 0, backgroundColor: 'transparent', maxInlineSize: 400 } } }}
      ></Tooltip>
    </div>
  )
}

export default UpgradeToProButton
