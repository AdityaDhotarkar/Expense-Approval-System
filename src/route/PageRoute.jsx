import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSession } from "../firebase/UserProvider";

const PageRoute = ({ component: Component, ...rest }) => {
  const { user } = useSession();

  // return(
  //     <Route {...rest} render = { (props) => {
  //         user ? <Component {...props} /> : <Redirect to={{
  //             pathname: "/login"
  //           }} />
  //         }} />
  // );
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!user) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default PageRoute;
