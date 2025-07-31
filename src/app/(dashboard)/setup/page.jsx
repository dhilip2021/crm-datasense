// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Breadcrumbs } from '@mui/material'
import Link from 'next/link'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import 'remixicon/fonts/remixicon.css'


const sections = [
  {
    title: 'Security Control',
    icon: 'ri-shield-keyhole-line',
    links: [
      { label: 'Profiles', icon: 'ri-profile-line' },
      { label: 'Roles & Sharings', icon: 'ri-user-settings-line' },
      { label: 'Compliance Settings', icon: 'ri-verified-badge-line' },
      { label: 'Support Access', icon: 'ri-customer-service-2-line' }
    ]
  },
  {
    title: 'Channels',
    icon: 'ri-send-plane-line',
    links: [
      { label: 'Email', icon: 'ri-mail-line' },
      { label: 'Notification SMS', icon: 'ri-message-3-line' },
      { label: 'Webforms', icon: 'ri-global-line' },
      { label: 'Chat', icon: 'ri-chat-3-line' }
    ]
  },
  {
    title: 'Customization',
    icon: 'ri-paint-brush-line',
    links: [
      { label: 'Modules and Fields', icon: 'ri-slideshow-2-line' },
      { label: 'Customize Home Page', icon: 'ri-home-gear-line' }
    ]
  },
  {
    title: 'Automation',
    icon: 'ri-settings-6-line',
    links: [
      { label: 'Workflow Rules', icon: 'ri-loop-left-line' },
      { label: 'Actions', icon: 'ri-flashlight-line' }
    ]
  },
  {
    title: 'Data Administration',
    icon: 'ri-database-2-line',
    links: [
      { label: 'Import', icon: 'ri-upload-cloud-line' },
      { label: 'Export', icon: 'ri-download-cloud-line' },
      { label: 'Data Backup', icon: 'ri-database-line' }
    ]
  }
]

const Salutation = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link underline='hover' color='inherit' href='/'>
            Home
          </Link>
          <Typography sx={{ color: 'text.primary' }}>Setup</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid item xs={6}>
        <div>
          {sections.map((section, index) => (
            <Accordion
              key={index}
              defaultExpanded={index === 0}
              sx={{
                boxShadow: 2,
                borderRadius: 2,
                mb: 2,
                backgroundColor: '#f9fafb'
              }}
            >
              <AccordionSummary
                expandIcon={<ArrowDropDownIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{
                  bgcolor: '#e5e7eb',
                  borderRadius: 2,
                  px: 2,
                  py: 1.5
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
                  <i className={`${section.icon} text-lg mr-2`} />
                  {section.title}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 3 }}>
                {section.links.map((link, idx) => (
                  <Link
                    underline='hover'
                    color='inherit'
                    href='/'
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      lineHeight: 1.8,
                      py: '2px',
                      '& i': {
                        fontSize: '18px',
                        display: 'inline-block',
                        verticalAlign: 'middle'
                      },
                      '&:hover': {
                        color: '#3f51b5'
                      }
                    }}
                  >
                    <i className={`${link.icon} text-base`} />
                    {link.label}
                  </Link>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </Grid>
    </Grid>
  )
}

export default Salutation
