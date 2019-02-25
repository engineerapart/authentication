/* eslint-disable func-names */
import 'core-js/fn/array/flat-map'; // eslint-disable-line import/no-extraneous-dependencies
import setupGoogleStrategy from './strategies/google';
import setupFacebookStrategy from './strategies/facebook';

const passport = require('passport');

/* eslint-disable camelcase, consistent-return */
// Called when a user successfully auth's
const handleSuccessfulLogin = function (req, res) {
  const redirect_to = req.session.redirect_to
    ? req.session.redirect_to
    : '/'; // default is to redirect to /

  if (redirect_to) req.session.redirect_to = undefined; // remove redirect_to from session
  req.session.user = req.user;
  req.logout(); // logout from server- client will handle all identity from this point
  res.redirect(redirect_to); // TODO redirect to the correct URL, not just home page
};
/* eslint-enable camelcase, consistent-return */

const configurePassportStrategies = (config) => {
  if (!config) throw new Error('Config not present for nextAuthentication');
  return Object.keys(config).flatMap((strategy) => {
    const configStrategy = config[strategy];
    switch (strategy.toLowerCase()) {
      case 'google':
        return setupGoogleStrategy(configStrategy, handleSuccessfulLogin);
      case 'facebook':
        return setupFacebookStrategy(configStrategy, handleSuccessfulLogin);
      default:
        return [];
    }
  });
};

/* eslint-disable camelcase */
export default function middlware() {
  const passportAuthRoutes = configurePassportStrategies(this.config);

  // Middleware that removes user from cookie-session
  const authMiddleware = function (req, res, next) {
    // check redirect_to, and store it in session if present
    const { redirect_to } = req.query;
    if (redirect_to) {
      req.session.redirect_to = redirect_to;
    }

    // delete user from the session if it is present
    const user = req.session && req.session.user
      ? req.session.user
      : null;
    if (req.session.user) req.session.user = null;
    res.user = user;

    next();
  };

  return [
    passport.initialize(), authMiddleware, ...passportAuthRoutes,
  ];
}
/* eslint-enable camelcase, func-names */
