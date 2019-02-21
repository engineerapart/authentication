import React from 'react';
import { UserCredentialsContext } from './withUserCredentials';
import { getUserCredentials, getToken } from './utils';
import cookie from 'js-cookie';

// Login function
const login = id_token => cookie.set('id_token', id_token);

export default App => (
  class WithAuth extends React.Component {
    static displayName = 'withAuth(App)';
    state = { 
      user: { name: undefined, email: undefined, picture: undefined },
    }

    static async getInitialProps({ Component, router, ctx }) {
      const { res } = ctx;

      // always prefer token from server res over cookie
      const { id_token } = res && res.id_token
        ? res // will be present when auth just performed by passport (only on server)
        : getToken(ctx); // get id_token from cookie (on client and server)

      const appProps = App.getInitialProps
        ? await App.getInitialProps({ Component, router, ctx }) // make id_token available to all getInitialProps
        : {};
      
      return { ...appProps, id_token };
    }

    constructor(props) {
      super(props);
      const { id_token } = this.props;

      this.state.user = getUserCredentials(id_token);
      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      const { id_token } = this.props;

      // Perform client based login
      if (id_token !== cookie.get('id_token')) {
        login(id_token);
      }

      window.addEventListener('logout', this.syncLogout);
      window.addEventListener('storage', this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener('logout', this.syncLogout);
      window.removeEventListener('storage', this.syncLogout);
      window.localStorage.removeItem('logout');
    }

    syncLogout (event) {
      if (event.type === 'logout' || event.key === 'logout') {
        this.setState({ user: {} });
      }
    }

    render() {
      const { id_token, ...rest } = this.props; // strip id_token out
      return (
        <UserCredentialsContext.Provider value={this.state.user}>
          <App {...rest} />
        </UserCredentialsContext.Provider>
      );
    }
  }
);
