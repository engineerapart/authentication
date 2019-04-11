/* eslint-disable no-restricted-globals */

import nextCookie from 'next-cookies';
import cookie from 'js-cookie';

// given a timestamp, determines how many milliseconds are still left, with a negation offset
// const intervalExpiryTime = (timeStamp, negation = 0) =>
//  timeStamp.getTime() - Date.now() - negation * 1000;

// Logout function
export const logout = () => {
  cookie.remove('user');
  const logoutEvent = new CustomEvent('logout');
  window.dispatchEvent(logoutEvent);
  window.localStorage.setItem('logout', Date.now()); // why local storage? This will sync things in other tabs (see https://stackoverflow.com/questions/5370784/localstorage-eventlistener-is-not-called/6846158#answer-6846158)
};

// Obtains user (only used in withAuth, purposefully not exposed)
export const getUser = (ctx) => {
  const user = ctx ? nextCookie(ctx).user : cookie.get('user');
  if (user === 'undefined' || !user) return { };

  return process.browser
    ? JSON.parse(window.atob(user))
    : JSON.parse(Buffer.from(user, 'base64').toString('ascii'));
};

// This is necessary for facebook oauth
// see https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
export const removeSecurityHash = () => {
  if (!process.browser) return; // should not be run on server

  if (window.location.hash === '#_=_' || window.location.hash === '#') {
    // Check if the browser supports history.replaceState.
    if (history.replaceState) {
      // Keep the exact URL up to the hash.
      const cleanHref = window.location.href.split('#')[0];

      // Replace the URL in the address bar without messing with the back button.
      history.replaceState(null, null, cleanHref);
    } else {
      // Well, you're on an old browser, we can get rid of the _=_ but not the #.
      window.location.hash = '';
    }
  }
};

/* eslint-enable no-restricted-globals */
