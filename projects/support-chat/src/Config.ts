

// const BASE_URL = 'http://185.182.194.244:3000'
// const BASE_URL = 'http://10.10.0.22:3000'
const BASE_URL = 'https://buzzmehi.com'
const socketurl ='';
// const socketurl = 'ws://10.10.0.22:8080'
    
// const BASE_URL = ''


export const CONFIG = {
  SiteName : 'Chat',
  // socketurl : BASE_URL +'',
  socketurl : socketurl,
  userLogin: BASE_URL + "/api/webLogin",
  userLoginTime:1440,
  validateMe: BASE_URL + "/api/user/validateMe",
  getUserStatus: BASE_URL + "/api/user/get_user_status",
  uploadDocument: BASE_URL + "/api/file/upload_document",

}

