export * from './client'; // include everything from client (necessary for isomorphic JS)
export { default as middleware } from './server/middleware';

// init function, used for setting the config
export function init(config) {
  this.config = Object.keys(config) // set all keys to lowercase so comparisons will always work
    .reduce((accum, key) => Object.assign(accum, { [key.toLowerCase()]: config[key] }), { });

  if (!this.config.options) this.config.options = { session: false };

  return this;
}
