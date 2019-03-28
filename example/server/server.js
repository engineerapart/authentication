const express = require('express');
const next = require('next');
const cookieParser = require('cookie-parser');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dir: './client', dev });
const handle = app.getRequestHandler();

const cookieSession = require('cookie-session');

// Config for authentication
const authConfig = {
  google: {
    clientID: '',
    clientSecret: '',
    callbackURL: '/auth/google/callback',
  },
  facebook: {
    clientID: '', // this is the appId
    clientSecret: '',
    callbackURL: '/auth/facebook/callback',
  },
};

const nextAuthentication = require('@engineerapart/authentication').init(authConfig);

app.prepare()
  .then(() => {
    const server = express();

    // parses cookies
    server.use(cookieParser());

    // using cookie sessions
    server.use(cookieSession({
      name: 'session',
      secret: 'secret-encryption-key',
      httpOnly: false,
      secure: false,
    }));

    // middleware for next authentication
    server.use(nextAuthentication.middleware());

    // standard catch all handler
    server.get('*', (req, res) => (
      handle(req, res)
    ));

    server.listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port}`);
    });
  });
