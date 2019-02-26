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
    clientID: '62128383038-iudal8l6dkb4emfdd4r5ls2qq59hpia9.apps.googleusercontent.com',
    clientSecret: 'xW-u3GGqGCztz4aNbWGuNxlR',
    callbackURL: '/auth/google/callback',
  },
  facebook: {
    clientID: '913779342346542',
    clientSecret: '0d0b30dd8e84f827b2ffe5aef649e872',
    callbackURL: '/auth/facebook/callback',
  },
};

const nextAuthentication = require('@engineerapart/nextauthentication').init(authConfig);

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
