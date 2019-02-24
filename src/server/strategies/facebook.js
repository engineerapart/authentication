const passport = require('passport');
const express = require('express');
const FacebookStrategy = require('passport-facebook').Strategy;

// requested profile fields
const profileFields = ['id', 'displayName', 'photos', 'email'];

// setup facebook strategy
export default function(config, handleSuccessfulLogin) {
  const { clientID, clientSecret, callbackURL, route } = config;
  if (!clientID) throw new Error('clientId not defined for facebook strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for facebook strategy');
  if (!callbackURL) throw new Error('callbackURL not defined for facebook strategy')
  const routeURL = route || '/auth/facebook'

  passport.use(new FacebookStrategy({ clientID, clientSecret, callbackURL, profileFields },
    // call back function after successfull auth
    function(accessToken, refreshToken, params, profile, done) {
      const { email, name } = profile._json;
      const picture = profile.photos[0].value;
      const token = accessToken;
      // need to save the refresh token and associated with username here
      return done(null, { email, picture, name, token });
    }
  ));

  const facebookAuthRoute = express.Router();
  const facebookAuthCallbackRoute = express.Router();
  // Facebook Auth Routes
  // NOTE: Very important to specify accessType offline, as without this, there will be no refresh token
  facebookAuthRoute.get(routeURL, passport.authenticate('facebook', { scope : ['email'] }));
  facebookAuthCallbackRoute.get(callbackURL, passport.authenticate('facebook', { session: false, scope: ['email'], failureRedirect: '/'}), handleSuccessfulLogin);

  return [facebookAuthRoute, facebookAuthCallbackRoute];
}