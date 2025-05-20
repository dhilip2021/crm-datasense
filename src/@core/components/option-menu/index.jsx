'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  Tooltip, Box, Popper, MenuItem, MenuList, ClickAwayListener,
  Fade, Paper, IconButton, Divider
} from '@mui/material'
import classnames from 'classnames'

const IconButtonWrapper = ({ tooltipProps, children }) => (
  tooltipProps?.title ? <Tooltip {...tooltipProps}>{children}</Tooltip> : children
)

const MenuItemWrapper = ({ children, option }) =>
  option.href ? (
    <Box component={Link} href={option.href} {...option.linkProps}>
      {children}
    </Box>
  ) : <>{children}</>

const OptionMenu = ({ tooltipProps, icon, iconClassName, options, leftAlignMenu, iconButtonProps, onOptionClick }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const handleToggle = () => setOpen(prev => !prev)
  const handleClose = (event) => {
    if (anchorRef.current?.contains(event.target)) return
    setOpen(false)
  }

  return (
    <>
      <IconButtonWrapper tooltipProps={tooltipProps}>
        <IconButton ref={anchorRef} size="small" onClick={handleToggle} {...iconButtonProps}>
          {typeof icon === 'string' ? (
            <i className={classnames(icon, iconClassName)} />
          ) : icon ? icon : (
            <i className={classnames('ri-more-2-line', iconClassName)} />
          )}
        </IconButton>
      </IconButtonWrapper>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement={leftAlignMenu ? 'bottom-start' : 'bottom-end'}
        transition
        disablePortal
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <Paper className="shadow-lg">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>
                  {options.map((option, index) => {
                    if (typeof option === 'string') {
                      return (
                        <MenuItem
                          key={index}
                          onClick={(e) => {
                            handleClose(e)
                            requestAnimationFrame(() => onOptionClick?.(option, e))
                          }}
                        >
                          {option}
                        </MenuItem>
                      )
                    } else if ('divider' in option) {
                      return option.divider && <Divider key={index} {...option.dividerProps} />
                    } else {
                      return (
                        <MenuItem
                          key={index}
                          {...option.menuItemProps}
                          {...(option.href && { className: 'p-0' })}
                          onClick={(e) => {
                            handleClose(e)
                            option.menuItemProps?.onClick?.(e)
                          }}
                        >
                          <MenuItemWrapper option={option}>
                            {(typeof option.icon === 'string' ? <i className={option.icon} /> : option.icon) || null}
                            {option.text}
                          </MenuItemWrapper>
                        </MenuItem>
                      )
                    }
                  })}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default OptionMenu
