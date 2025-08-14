import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import CryptoJS from "crypto-js"


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

export function formatDateShort(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit'
  })
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
export function encryptCryptoResponse(data) {
  const secretPassphrase = `${process.env.NEXT_PUBLIC_ENCY_DECY_SECRET}`;
  const encryptedResponse = CryptoJS.AES.encrypt(
    JSON.stringify(data), 
    secretPassphrase
  ).toString();

  return encryptedResponse;
}


export function decrypCryptoRequest(data) {
  const secretPassphrase = `${process.env.NEXT_PUBLIC_ENCY_DECY_SECRET}`;
  const decrypted = CryptoJS.AES.decrypt(
    data, 
    secretPassphrase
  ).toString(CryptoJS.enc.Utf8);

  const decryptedResponse = JSON.parse(decrypted);

  return decryptedResponse;
}

// Function to mask email
export function maskEmail(email) {
  const [name, domain] = email.split("@");
  if (!domain) return email; // If not a valid email
  const maskedName = name.length > 3
    ? name.slice(0, 3) + "*".repeat(name.length - 3)
    : name[0] + "*".repeat(name.length - 1);
  return `${maskedName}@${domain}`;
}