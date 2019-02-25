export * from './client'; // include everything from client (necessary for isomorphic JS)
export { default as middleware } from './server/express-auth-middleware';

// init function, used for setting the config
export function init(config) {
  this.config = config;
  return this;
}
