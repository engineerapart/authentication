/* eslint-disable func-names */
import strategies from './strategies';

const express = require('express');
const passport = require('passport');

/* eslint-disable camelcase, consistent-return */
const authResponseRedirectOnSuccess = function (req) {
  const redirect_to = req.session && req.session.redirect_to
    ? req.session.redirect_to
    : '/'; // default is to redirect to /

  // remove redirect_to from session
  if (req.session && req.session.redirect_to) req.session.redirect_to = undefined;
  return redirect_to;
};
/* eslint-enable camelcase, consistent-return */

const authResponseCleanup = function (options, req) {
  const { session } = options;
  if (!session) {
    req.logout(); // this may not be necessary -> test it
  }
};

const handleAuthCallBack = function (options, req, res, next) {
  const { session } = options;
  const secure = req.hostname !== 'localhost';
  // eslint-disable-next-line consistent-return
  return function (error, user) {
    if (error) return next(error);
    if (!user) return res.redirect('/'); // TODO: config value for redirect when auth fails

    req.logIn(user, { session }, (err) => {
      if (err) return next(err);
      if (!session) {
        res.cookie('user', Buffer.from(JSON.stringify(user)).toString('base64'), { secure });
      }
      return res.redirect(authResponseRedirectOnSuccess(req));
    });
  };
};

const configurePassportStrategies = function ({ options, ...config }) {
  Object.keys(config).forEach((strategy) => {
    const configStrategy = config[strategy];
    if (!strategies[strategy]) throw new Error(`strategy ${strategy} not defined`);
    strategies[strategy](configStrategy);
  });
};

const implementAuthStrategy = function (authStrategy, req, res, next) {
  switch (authStrategy) {
    case 'google':
      return passport.authenticate('google', { accessType: 'offline', prompt: 'consent', scope: ['email profile'] })(req, res, next);
    case 'facebook':
      return passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
    default:
      return res.status(400).send(`Unknown strategy: ${authStrategy}`);
  }
};

const implementAuthResponse = function ({ options, ...config }, authResponse, req, res, next) {
  authResponseCleanup(options, req);
  return (Object.keys(config).includes(authResponse))
    // eslint-disable-next-line max-len
    ? passport.authenticate(authResponse, handleAuthCallBack(options, req, res, next))(req, res, next)
    : res.status(400).send(`Unknown authResponse: ${authResponse}`);
};

const setupAuthRoute = function (config) {
  const authRoute = express.Router();
  // eslint-disable-next-line consistent-return
  authRoute.get('/auth', (req, res, next) => {
    const { query } = req;
    if (!query) return res.sendStatus(400);
    const { authStrategy, authResponse } = query;
    if (!authStrategy && !authResponse) return res.sendStatus(400);

    if (authStrategy) return implementAuthStrategy(authStrategy, req, res, next);
    if (authResponse) return implementAuthResponse(config, authResponse, req, res, next);

    res.sendStatus(400); // if somehow we got to this point, it's definitely a bad request
  });

  return authRoute;
};

/* eslint-disable camelcase */
export default function middlware() {
  configurePassportStrategies(this.config);
  const { session } = this.config.options;

  const authMiddleware = function (req, res, next) {
    if (session && !req.session) throw new Error('Sessions have not been enabled in the middleware');

    // check redirect_to, and store it in session if present
    const { redirect_to } = req.query;
    if (redirect_to) { // sessions need to be enabled for this to work
      res.cookie('redirect_to', redirect_to);
    }

    next();
  };

  return [
    passport.initialize(), authMiddleware, setupAuthRoute(this.config),
  ];
}
/* eslint-enable camelcase, func-names */
