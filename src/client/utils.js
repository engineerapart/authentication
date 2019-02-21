import atob from 'atob';
import nextCookie from 'next-cookies';
import cookie from 'js-cookie';

// Parses JWT token and to obtain relevant information
const parseIdToken = token => process.browser
  ? JSON.parse(window.atob(token.split('.')[1]).replace(/-/g, '+').replace(/_/g, '/'))
  : JSON.parse(atob(token.split('.')[1]).replace(/-/g, '+').replace(/_/g, '/'));

// Logout function
export const logout = () => {
  cookie.remove('id_token');
  const logoutEvent = new CustomEvent('logout');
  window.dispatchEvent(logoutEvent);
  window.localStorage.setItem('logout', Date.now()); // why local storage? This will sync things in other tabs (see https://stackoverflow.com/questions/5370784/localstorage-eventlistener-is-not-called/6846158#answer-6846158)
}

// Obtains token, either from
export const getToken = (ctx) => (
  ctx ? nextCookie(ctx) : cookie.get('id_token')
);

// Obtains user credentials by parsing JWT id_token
export const getUserCredentials = (id_token) => {
  if (!id_token) return { }; // empty object to denote no auth

  try {
    const { name, email, picture } = parseIdToken(id_token);
    return { name, email, picture };
  } catch (error) {
    // TODO log error
    return { };
  }
}