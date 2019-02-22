const passport = require('passport');
const express = require('express');
const FacebookStrategy = require('passport-facebook').Strategy;

// setup facebook strategy
export default function(config, handleSuccessfulLogin) {
  console.log("")
  const { clientID, clientSecret, callbackURL, route } = config;
  if (!clientID) throw new Error('clientId not defined for facebook strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for facebook strategy');
  if (!callbackURL) throw new Error('callbackURL not defined for facebook strategy')
  const routeURL = route || '/auth/facebook'

  passport.use(new FacebookStrategy({ clientID, clientSecret, callbackURL },
    // call back function after successfull auth
    function(accessToken, refreshToken, params, profile, done) {
      console.log(params);
      const token = accessToken;
      // need to save the refresh token and associated with username here
      return done(null, token);
    }
  ));

  const facebookAuthRoute = express.Router();
  const facebookAuthCallbackRoute = express.Router();
  // Facebook Auth Routes
  // NOTE: Very important to specify accessType offline, as without this, there will be no refresh token
  facebookAuthRoute.get(routeURL, passport.authenticate('facebook'));
  facebookAuthCallbackRoute.get(callbackURL, passport.authenticate('facebook', { session: false, failureRedirect: '/'}), handleSuccessfulLogin);

  return [facebookAuthRoute, facebookAuthCallbackRoute];
}