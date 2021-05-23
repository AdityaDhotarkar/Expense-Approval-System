import React from "react";
import firebase from "firebase/app";
import { useState, useContext } from "react";
import { useEffect } from "react";
import { firestore } from "./config";

export const UserContext = React.createContext();

export const UserProvider = (props) => {
  const [session, setSession] = useState({ user: null, loading: false });

  useEffect(() => {
    const unsubsribe = firebase
      .auth()
      .onAuthStateChanged(async (loggedInUser) => {
        if (loggedInUser) {
          let userEmail = loggedInUser.email;
          if (userEmail.split("@")[1] === "bmspune.org") {
            setSession({ user: loggedInUser, loading: false });
          }
        } else {
          setSession({ user: null, loading: false });
        }
      });
    return () => unsubsribe();
  }, []);

  return (
    <UserContext.Provider value={session}>
      {!session.loading && props.children}
    </UserContext.Provider>
  );
};

export const useSession = () => {
  return useContext(UserContext);
};
