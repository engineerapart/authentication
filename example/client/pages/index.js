import React from 'react';
import { logout, withUserCredentials } from '@engineerapart/nextauthentication';


const LoginLinks = () => (
  <React.Fragment>
    <br />
    <a href="/auth/google">Google Login</a> <br />
    <a href="/auth/facebook">Facebook Login</a>
  </React.Fragment>
);

class homePage extends React.Component {
  static async getInitialProps(ctx) {
    console.log("CTX User ---> ", ctx.user);
  }

  render () {
    const { user } = this.props;
    return (
      <div>
        {user.name ? `Welcome ${user.name}` : 'You are not logged in'}
        {user.name ? <button onClick={(event) => logout()}>Logout</button> : <LoginLinks /> }
      </div>
    )
  }
};

export default withUserCredentials(homePage);