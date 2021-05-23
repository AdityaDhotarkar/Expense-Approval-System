import React, { memo,  useState, useEffect} from 'react'
// import { signupWithGoogle } from '../firebase/Auth';
import firebase from "../firebase/config";
import 'firebase/auth';
import { useSession } from '../firebase/UserProvider';
import { createUserDocument } from '../firebase/Users';

// test

export default memo(function Login(props) {

    const [invalidEmail, setInvalidEmail] = useState(false);
    const {user} = useSession();


   const signIn = () => {
       const provider = new firebase.auth.GoogleAuthProvider();
    //    provider.setCustomParameters({hd: 'bmspune.org',prompt: 'select_account'});
        provider.setCustomParameters({hd: 'bmspune.org'});
    //    const signInResult = signupWithGoogle();
         firebase.auth().signInWithPopup(provider).then(async (result) => {
            var loggedInUser = result.user;
            console.log("user email");console.log(user);
            const userEmail = loggedInUser.email;
            if(userEmail.split('@')[1] !== 'bmspune.org') {
                setInvalidEmail(true);
                loggedInUser.delete();
            }else{
                createUserDocument(loggedInUser);
                props.history.push("/home");
            } 
            
        }).catch((error) => {
            console.log(error);
        });
       
   }

   const signInExt = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
         firebase.auth().signInWithPopup(provider).then(async (result) => {
            var loggedInUser = result.user;
            console.log("user email");
            console.log(user);
            createUserDocument(loggedInUser);
            props.history.push("/home");    
        }).catch((error) => {
            console.log(error);
        });

   }

   useEffect(() => {
       if(user){
        props.history.push("/home");
       }
   }, [user])
    return (
    <>
        <div id="login">
                { 
                // !window.location.href.match(int) ? (
                (window.location.href.indexOf('int') === 7) ? (
                    
                <>
                        <h2 className="text-center text-blue pt-5">Welcome to BMS Parent Protal</h2>
                        
                        {/* <h2>{window.location.href}</h2> */}
                        <div id="login-row" className="row justify-content-center d-flex">
                            {
                            !user ? (
                                <div id="login-box" className="col-md-12 justify-content-center d-flex">
                                <div><button className="btn btn-primary text-center"
                                onClick={signInExt}>Sign in with your login details</button></div>
                            </div>)
                            :
                            (
                                <div>You have already logged in as {user.displayName} with email as {user.email}</div>
                            )
                            }
                            
                    </div>
                    </>
                ) 
                
                :

                ( 
                <>
                    <h2 className="text-center text-blue pt-5">Welcome to BMS Intranet</h2>
                
                    <div id="login-row" className="row justify-content-center d-flex">
                            {
                            !user ? (
                                <div id="login-box" className="col-md-12 justify-content-center d-flex">
                                <div><button className="btn btn-primary text-center"
                                onClick={signIn}>Sign in with bmspune.org account</button></div>
                            </div>)
                            :
                            (
                                <div>You have already logged in as {user.displayName} with email as {user.email}</div>
                            )
                            }
                            
                            {(invalidEmail) && <div>The email id is not allowed</div>}
                    </div>
                </> )
                    }   
            
        </div>
        
    </>
    );
})
