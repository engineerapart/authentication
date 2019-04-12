import React from 'react'; // eslint-disable-line import/no-unresolved
import { UserCredentialsContext } from './withUserCredentials';
import { getUser, removeSecurityHash } from './utils';

export default App => (
  class WithAuth extends React.Component {
    static displayName = 'withAuth(App)';

    state = { user: { } };

    static async getInitialProps({ Component, router, ctx }) {
      const user = getUser(ctx);
      const appProps = App.getInitialProps
        ? await App.getInitialProps({ Component, router, ctx: { ...ctx, user } })
        : { };

      return { ...appProps, user };
    }

    constructor(props) {
      super(props);
      const { user } = this.props;

      this.state.user = user;
      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      // function is a noop if facebook login not used
      removeSecurityHash();

      // Register events
      window.addEventListener('logout', this.syncLogout);
      window.addEventListener('storage', this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener('logout', this.syncLogout);
      window.removeEventListener('storage', this.syncLogout);
      window.localStorage.removeItem('logout');
    }

    syncLogout(event) {
      // When logging out, need to rerender, so state is changed
      if (event.type === 'logout' || event.key === 'logout') {
        this.setState({ user: { } });
      }
    }

    render() {
      const { user, ...props } = this.props;
      return ( // eslint-disable-next-line react/destructuring-assignment
        <UserCredentialsContext.Provider value={this.state.user}>
          <App {...props} />
        </UserCredentialsContext.Provider>
      );
    }
  }
);
