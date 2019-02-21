export {default as middleware} from './server/express-auth-middleware.js';
export {default as withAuth} from './client/withAuth.js';
export {default as withUserCredentials} from './client/withUserCredentials.js';
export { getToken } from './client/utils.js';
export { logout } from './client/utils.js';

// init function, used for setting the config
export function init(config) {
  this.config = config;
  return this;
}
