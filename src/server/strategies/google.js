import { encode, expiresToTimeStamp } from '../utils';

const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('@passport-next/passport-google-oauth2').Strategy;

// setup google strategy
export default function (config, handleSuccessfulLogin) {
  const {
    clientID, clientSecret, callbackURL, route,
  } = config;
  if (!clientID) throw new Error('clientId not defined for google strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for google strategy');
  if (!callbackURL) throw new Error('callbackURL not defined for google strategy');
  const routeURL = route || '/auth/google';

  passport.use(new GoogleStrategy({ clientID, clientSecret, callbackURL },
    // call back function after successfull auth
    ((accessToken, refreshToken, params, profile, done) => {
      const { email, picture, name } = profile._json; // eslint-disable-line no-underscore-dangle
      const { id_token: value, expires_in: expiresIn } = params;
      const { id: userId } = profile;
      const token = encode(value, 'id_token', 'google');

      // need to save the refresh token and associated with username here

      return done(null, {
        userId, email, picture, name, token, expires: expiresToTimeStamp(expiresIn),
      });
    })));

  const googleAuthRoute = express.Router();
  const googleAuthCallbackRoute = express.Router();
  // Google Auth Routes
  // NOTE: Very important to specify accessType offline, as without this
  // there will be no refresh token
  googleAuthRoute.get(routeURL, passport.authenticate('google', { accessType: 'offline', prompt: 'consent', scope: ['email profile'] }));
  googleAuthCallbackRoute.get(callbackURL, passport.authenticate('google', { session: false, failureRedirect: '/login' }), handleSuccessfulLogin);

  return [googleAuthRoute, googleAuthCallbackRoute];
}
