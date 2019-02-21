const passport = require('passport');
import setupGoogleStrategy from './strategies/google';

// Called when a user successfully auth's
const handleSuccessfulLogin = function(req, res) {
  const redirect_to = req.session.redirect_to
    ? req.session.redirect_to
    : '/'; // default is to redirect to /

  if (redirect_to) req.session.redirect_to = undefined; // remove redirect_to from session
  req.session.id_token = req.user;
  req.logout(); // logout from server- client will handle all identity from this point
  res.redirect(redirect_to); // TODO redirect to the correct URL, not just home page
}

const configurePassportStrategies = (config) => {
  if (!config) throw new Error('Config not present for nextAuthentication');
  const authRoutes = [];
  Object.keys(config).forEach((strategy) => {
    let strategyRoutes = [];
    switch(strategy.toLowerCase()) {
      case 'google':
        strategyRoutes = setupGoogleStrategy(config.google, handleSuccessfulLogin);
        break;
    }
    authRoutes.push(...strategyRoutes);
  });

  return authRoutes;
}

export default function middlware() {
  const passportAuthRoutes = configurePassportStrategies(this.config);

  // Middleware that removes id_token from cookie-session
  const authMiddleware = function(req, res, next) {
    // check redirect_to, and store it in session if present
    const redirect_to = req.query.redirect_to;
    if (redirect_to) {
      req.session.redirect_to = redirect_to;
    }

    // delete id_token from the session if it is present
    const id_token = req.session && req.session.id_token
      ? req.session.id_token
      : null;
    if (req.session.id_token) req.session.id_token = null;
    res.id_token = id_token;

    next();
  };

  return [
    passport.initialize(), authMiddleware, ...passportAuthRoutes
  ];
};
