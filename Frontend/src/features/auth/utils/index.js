import { useSelector } from "react-redux"

export function IsLogin(){
  const isLogin =  useSelector(state => state.auth.loggedIn ? state.auth.loggedIn : false );    
  return isLogin; 
}

export function GetCurrentUser(){
    const currentUser =  useSelector(state => state.auth.currentUser ? state.auth.currentUser : null );    
    return currentUser; 
}
  