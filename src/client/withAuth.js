import React from 'react';
import { UserCredentialsContext } from './withUserCredentials';
import { getUser, removeHashForFacbookLogin } from './utils';
import cookie from 'js-cookie';

// Login function
const login = user => cookie.set('user', user);

export default App => (
  class WithAuth extends React.Component {
    static displayName = 'withAuth(App)';
    state = { user: { } };

    static async getInitialProps({ Component, router, ctx }) {
      const { res } = ctx;

      // always prefer user from server res over cookie
      const user = res && res.user
        ? res.user // will be present when auth recently performed by passport (only on server)
        : getUser(ctx); // get user from cookie (on client and server)

      const appProps = App.getInitialProps
        ? await App.getInitialProps({ Component, router, ctx: { ...ctx, user } })
        : { };
      
      return { ...appProps, user };
    }

    constructor(props) {
      super(props);
      const user = this.props.user
        ? this.props.user
        : { };

      this.state.user = user;
      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      const { user } = this.props;
      login(user);

      // function is a noop if facebook login not used
      removeHashForFacbookLogin();

      // Register events
      window.addEventListener('logout', this.syncLogout);
      window.addEventListener('storage', this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener('logout', this.syncLogout);
      window.removeEventListener('storage', this.syncLogout);
      window.localStorage.removeItem('logout');
    }

    syncLogout (event) {
      // When logging out, need to rerender, so state is changed
      if (event.type === 'logout' || event.key === 'logout') {
        this.setState({ user: { } });
      }
    }

    render() {
      const { user, ...rest } = this.props; // strip user out
      return (
        <UserCredentialsContext.Provider value={this.state.user}>
          <App {...rest} />
        </UserCredentialsContext.Provider>
      );
    }
  }
);
