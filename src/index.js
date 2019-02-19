export {default as middleware} from './express-auth-middleware.js';

export function init(config) {
  this.config = config;
  return this;
}