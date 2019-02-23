import React from 'react';
import { UserCredentialsContext } from './withUserCredentials';
import { getToken } from './utils';
import cookie from 'js-cookie';

// Login function
const login = user => cookie.set('usre', user);

const noUser = { name: undefined, email: undefined, picture: undefined, token: undefined };

export default App => (
  class WithAuth extends React.Component {
    static displayName = 'withAuth(App)';
    state = { 
      user: { name: undefined, email: undefined, picture: undefined },
    }

    static async getInitialProps({ Component, router, ctx }) {
      const { res } = ctx;

      // always prefer user from server res over cookie
      const { user } = res && res.user
        ? res // will be present when auth just performed by passport (only on server)
        : getToken(ctx); // get user from cookie (on client and server)

      const appProps = App.getInitialProps
        ? await App.getInitialProps({ Component, router, ctx })
        : {};
      
      return { ...appProps, user };
    }

    constructor(props) {
      super(props);
      const user = this.props.user
        ? this.props.user
        : { ...noUser }; // deepcopy

      this.state.user = user
      this.syncLogout = this.syncLogout.bind(this);
    }

    componentDidMount() {
      const { user } = this.props;

      // Perform client based login
      if (user !== cookie.get('user')) {
        login(user);
      }

      // This is necessary for facebook oauth
      // see https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url
      if (window.location.hash == '#_=_'){
        // Check if the browser supports history.replaceState.
        if (history.replaceState) {
            // Keep the exact URL up to the hash.
            var cleanHref = window.location.href.split('#')[0];

            // Replace the URL in the address bar without messing with the back button.
            history.replaceState(null, null, cleanHref);
        } else {
            // Well, you're on an old browser, we can get rid of the _=_ but not the #.
            window.location.hash = '';
        }
      }

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
        this.setState({ user: {...noUser} });
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
