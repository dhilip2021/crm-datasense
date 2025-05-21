import dayjs from 'dayjs'
import Cookies from 'js-cookie'

export function capitalizeWords(str) {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function normalizeEmail(email) {
  return email.toLowerCase()
}

export const converDayJsDate = value => {
  return dayjs(value).format('DD-MMM-YYYY hh:mm A')
}

export const converDayJsDatewithOutTime = value => {
  return dayjs(value).format('DD-MMM-YYYY')
}

export const converDayDate = value => {
  return dayjs(value).format('YYYY/MM')
}

export const removeCredentials = () => {
  Cookies.remove('riho_token')
  Cookies.remove('_token')
  Cookies.remove('_token_expiry')
  Cookies.remove('privileges')
  Cookies.remove('role_id')
  Cookies.remove('role_name')
  Cookies.remove('user_name')
  Cookies.remove('organization_id')
  Cookies.remove('organization_name')
  Cookies.remove('user_id')
  Cookies.remove('c_version')
  Cookies.remove('endedAt')
}
