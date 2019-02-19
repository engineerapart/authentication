const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('@passport-next/passport-google-oauth2').Strategy;

// Called when a user successfully auth's
const handleSuccessfulLogin = function(req, res) {
  req.session.id_token = req.user;
  req.logout(); // logout from server- client will handle all identity from this point
  res.redirect('/'); // TODO redirect to the correct URL, not just home page
}

const setupGoogleStrategy = (config) => {
  const { clientID, clientSecret, callbackURL, route } = config;
  if (!clientID) throw new Error('clientId not defined for google strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for google strategy');
  if (!callbackURL) throw new Error('callbackURL not defined for google strategy')
  const routeURL = route || '/auth/google'

  passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL },
    // call back function after successfull auth
    function(accessToken, refreshToken, params, profile, done) {
      const { id_token } = params;
      // need to save the refresh token and associated with username here
      return done(null, id_token);
    }
  ));

  const googleAuthRoute = express.Router();
  const googleAuthCallbackRoute = express.Router();
  // Google Auth Routes
  // NOTE: Very important to specify accessType offline, as without this, there will be no refresh token
  googleAuthRoute.get(routeURL, passport.authenticate('google', { accessType: 'offline', prompt: 'consent', scope: ['email profile'] }));
  googleAuthCallbackRoute.get(callbackURL, passport.authenticate('google', { session: false, failureRedirect: '/login'}), handleSuccessfulLogin);

  return [googleAuthRoute, googleAuthCallbackRoute];
} 

const configurePassportStrategies = (config) => {
  if (!config) throw new Error('Config not present for nextAuthentication');
  const routes = [];
  Object.keys(config).forEach((strategy) => {
    switch(strategy.toLowerCase()) {
      case 'google':
        const googleAuthRoutes = setupGoogleStrategy(config.google);
        routes.push(...googleAuthRoutes);
        break;
    }
  });

  return routes;
}

export default function middlware() {
  const passportAuthRoutes = configurePassportStrategies(this.config);

  // Middleware that removes id_token from cookie-session
  const authCleanupMiddleware = function(req, res, next) {
    const id_token = req.session && req.session.id_token
      ? req.session.id_token
      : null;

    // delete id_token from the session if it is present
    if (req.session.id_token) req.session.id_token = null;
    res.id_token = id_token;
    next();   
  };

  return [
    passport.initialize(), authCleanupMiddleware, ...passportAuthRoutes
  ]
};
