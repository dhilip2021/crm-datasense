'use client'

// Next Imports
import Link from 'next/link'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const FooterContent = () => {
  // Hooks
  const { isBreakpointReached } = useVerticalNav()

  return (
    <div
      className={classnames(verticalLayoutClasses.footerContent, 'flex items-center justify-between flex-wrap gap-4')}
    >
      <div style={{display:"flex", justifyContent:"center"}}>
        <p> <span>{`© ${new Date().getFullYear()} `}</span></p>
        <p>
        <span>{` Made with `}</span>
        <span>{`❤️`}</span>
        <span>{` by `}</span>
        <Link href='https://datasense.in/' target='_blank' className='text-primary'>
          WAM Datasense Technologies
        </Link>
      </p>
      </div>
   
      
    </div>
  )
}

export default FooterContent
