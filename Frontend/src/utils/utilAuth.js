import { useSelector } from "react-redux"

export function IsLogin(){
  const isLogin =  useSelector(state => state.auth.loggedIn ? state.auth.loggedIn : false );
  if (isLogin) return true;
  // Fallback to token in localStorage to support immediate redirects and page refreshes
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return false;
  // Guard against string values like "null" / "undefined"
  if (token === "null" || token === "undefined") return false;
  return true;
}

export function GetCurrentUser(){
    const currentUser =  useSelector(state => state.auth.currentUser ? state.auth.currentUser : null );
    if (currentUser) return currentUser;
    // Fallback: try restore from localStorage if available
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
}
   