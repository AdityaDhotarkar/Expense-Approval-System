import React from "react";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";
import { Route, Redirect } from "react-router-dom";

export default function PrivateAdminRoute({ component: Component, ...rest }) {
  const { user } = useSession();
  const privilages = GetUserPrivilages();
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!!user && privilages.isAdmin) {
          return <Component {...props} />;
        } else {
          return <Redirect to="/login" />;
        }
      }}
    />
  );
}
