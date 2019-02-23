import nextCookie from 'next-cookies';
import cookie from 'js-cookie';

// Logout function
export const logout = () => {
  cookie.remove('user');
  const logoutEvent = new CustomEvent('logout');
  window.dispatchEvent(logoutEvent);
  window.localStorage.setItem('logout', Date.now()); // why local storage? This will sync things in other tabs (see https://stackoverflow.com/questions/5370784/localstorage-eventlistener-is-not-called/6846158#answer-6846158)
}

// Obtains token, either from
export const getToken = (ctx) => {
  const user = ctx ? nextCookie(ctx) : cookie.get('user');
  return user ? user.token : undefined;
};