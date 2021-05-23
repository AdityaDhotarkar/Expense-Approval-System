import React from "react";
import { Route, Redirect } from "react-router-dom";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";

const PrivateManagementRoute = ({ component: Component, ...rest }) => {
  const { user } = useSession();
  const privilages = GetUserPrivilages();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!user && privilages.isManagement) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
};

export default PrivateManagementRoute;
