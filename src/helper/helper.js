const { headers } = require("next/headers");

const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const  CryptoJS  = require("crypto-js");

const { urlEncoder, urlDecoder } = require("encryptdecrypt-everytime/src");

const { accessTokenKey, forgetToken } = require("./access");




export function create_UUID(){
  var dt = new Date().getTime();
  var uuid = `xxxxxxxxxxxx`.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;

    dt = Math.floor(dt / 16);

    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });

  return uuid;
}

export function generateAccessToken(user){
  const expirationTime = Math.floor(Date.now() / 1000) + 15 * 60; 

  return jwt.sign(user, accessTokenKey, { expiresIn: "10d" });
}

export function generateAccessTokenForget(user){
  return jwt.sign(user, forgetToken, { expiresIn: "1h" });
}

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "polimertv2012@gmail.com",
    pass: "qqbleftjomqsihxi",
  },
  secure: true,
})

export function getRandomNumber(){
  return Math.random().toFixed(16).split(".")[1];
}

export function generatePassword(length = 10){
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+{}[]<>?/|";

  let password = "";

  // Ensure at least one special character and one number
  password += specialChars[Math.floor(Math.random() * specialChars.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];

  // Fill the rest with random letters
  while (password.length < length) {
    password += letters[Math.floor(Math.random() * letters.length)];
  }

  // Shuffle the result to mix special/number in the middle
  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  return password;
}




export function encryptResponse(data){
  const secretKey = "NEWSPRODUCT";
  const encryptedResults = urlEncoder(secretKey, JSON.stringify(data));

  return encryptedResults;
}

export function decryptRequest(data){
  const secretKey = "NEWSPRODUCT";
  const decryptedResults = urlDecoder(secretKey, data);

  return decryptedResults;
}

export function dateToTimestamp(data){
  let timestamp = Date.parse(data) / 1000;

  return parseInt(timestamp);
}

export function convertDate(value){
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  let date_value = new Date(value);
  let date, month, year;

  date = date_value.getDate();

  month = date_value.getMonth();

  year = date_value.getFullYear();

  return `${date}-${monthNames[month]}-${year}`;
}

export function getDateTime(){
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  if (month.toString().length == 1) {
    month = "0" + month;
  }

  if (day.toString().length == 1) {
    day = "0" + day;
  }

  if (hour.toString().length == 1) {
    hour = "0" + hour;
  }

  if (minute.toString().length == 1) {
    minute = "0" + minute;
  }

  if (second.toString().length == 1) {
    second = "0" + second;
  }

  var dateTime =
    year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;

  return dateTime;
}

export function verifyAccessToken() {
  const headersList = headers();
  const authToken = headersList.get("authorization");

  try {
    if (authToken === null) {
      return { success: false, error: "Auth token null" };
    } else if (authToken === "") {
      return { success: false, error: "Authetication token empty!" };
    } else if (authToken.length <= 6) {
      return { success: false, error: "token is empty!" };
    } else {
      const secretKey = process.env.NEXT_PUBLIC_ENCY_DECY_SECRET;

      const token = (headersList.get("authorization") || "")
        .split("Bearer ")
        .at(1);

      const decryptedResults = urlDecoder(secretKey, token);
      const tokenlist = JSON.parse(decryptedResults).toString();
      const verified = jwt.verify(tokenlist, process.env.NEXT_PUBLIC_JWT_SECRET);

      return { success: true, data: verified };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function mobilePagination(data, n_page, n_limit) {
  let dummyArray = [];
  let paginationCount = n_page / n_limit;
  let n_page_limit = 0;

  if (paginationCount < 1) {
    n_page_limit = n_limit;
  } else {
    n_page_limit = (paginationCount + 1) * n_page;
  }

  data.map((item) => {
    let datas = {
      datavalue: item,
      pagination: {
        n_page: n_page_limit,
        n_limit: n_limit,
      },
    };

    dummyArray.push(datas);
  });

  return dummyArray;
}


export function mobilePaginations(n_page, n_limit) {

  let data = {
    n_page : ((n_page) + 1),
    n_limit : n_limit
  }

  return data;

}

export function getNormalSize({ width, height, orientation }) {
  return (orientation || 0) >= 5
    ? { width: height, height: width }
    : { width, height };
}


export function imageTowebp(file) {

  return file;
}

export function encryptCryptoResponse(data) {
  const secretPassphrase = `${process.env.NEXT_PUBLIC_ENCY_DECY_SECRET}`;
  const encryptedResponse = CryptoJS.AES.encrypt(JSON.stringify(data),secretPassphrase).toString();

  return encryptedResponse;
}

export function decrypCryptoRequest(data) {
  const secretPassphrase = `${process.env.NEXT_PUBLIC_ENCY_DECY_SECRET}`;
  const decrypted = CryptoJS.AES.decrypt(data, secretPassphrase).toString(CryptoJS.enc.Utf8);
  const decryptedResponse = JSON.parse(decrypted);

  return decryptedResponse;
}

export function checkFileType(fileType) {

  if(fileType ==="image/png"){
    return true
  }else if(fileType ==="image/jpg"){
    return true
  }else if(fileType ==="image/jpeg"){
    return true
  }else if(fileType ==="image/webp"){
    return true
  }else{
    return false;
  }
}

export function getBase64(file) {
  let reader = new FileReader();

  if (file !== undefined) {
    reader.onloadend = () => {
     return reader.result
    };

    return reader.readAsDataURL(file);
  }
}
