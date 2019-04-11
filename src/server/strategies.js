/* eslint-disable func-names */
import { encode, expiresToTimeStamp } from './utils';

const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// setup facebook strategy
const facebook = function (config) {
  const { clientID, clientSecret } = config;
  if (!clientID) throw new Error('clientId not defined for facebook strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for facebook strategy');
  const callbackURL = '/auth?authResponse=facebook';

  // requested profile fields
  const profileFields = ['id', 'displayName', 'photos', 'email'];

  passport.use(new FacebookStrategy({
    clientID, clientSecret, callbackURL, profileFields,
  },
  // call back function after successfull auth
  ((accessToken, refreshToken, params, profile, done) => {
    const { email, name } = profile._json; // eslint-disable-line no-underscore-dangle
    const { expires_in: expiresIn } = params;
    const picture = profile.photos.length && profile.photos[0].value;
    const { id: userId } = profile;
    const token = encode(accessToken, 'accessToken', 'facebook', expiresToTimeStamp(expiresIn));

    return done(null, {
      userId, email, picture, name, token, expires: expiresToTimeStamp(expiresIn),
    });
  })));
};

// setup google strategy
const google = function (config) {
  const { clientID, clientSecret } = config;
  if (!clientID) throw new Error('clientId not defined for google strategy');
  if (!clientSecret) throw new Error('clientSecret not defined for google strategy');
  const callbackURL = '/auth?authResponse=google';

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
};

export default {
  google,
  facebook,
};
/* eslint-enable func-names */
