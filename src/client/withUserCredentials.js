import React from 'react';

export const UserCredentialsContext = React.createContext({});

const withUserCredentials = (Component) => {
  const WithUserCredentials = props => (
    <UserCredentialsContext.Consumer>
      {user => <Component user={user} {...props} />}
    </UserCredentialsContext.Consumer>
  );

  WithUserCredentials.getInitialProps = async(ctx) => {
    const composedInitialProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};
    return composedInitialProps;
  }
  return WithUserCredentials;
};

export default withUserCredentials;