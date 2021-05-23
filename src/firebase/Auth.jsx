import firebase from "./config";
import "firebase/auth";

export const signupWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account", hd: "bmspune.org" });

  return firebase.auth().signInWithPopup(provider);
};
