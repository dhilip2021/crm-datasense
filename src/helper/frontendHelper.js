

import dayjs from "dayjs";


export function capitalizeWords(str) {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }


export function normalizeEmail(email) {
    return email.toLowerCase();
  }


export const converDayJsDate = (value) => {
  return dayjs(value).format("DD-MMM-YYYY hh:mm A");
};

export const converDayJsDatewithOutTime = (value) => {
  return dayjs(value).format("DD-MMM-YYYY");
};

export const converDayDate = (value) => {
  return dayjs(value).format("YYYY/MM");
};