import React from "react";
import { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";

const PrivateEMSRoute = ({ component:Component, ...rest }) => {
    const { user } = useSession();
    const privilages = GetUserPrivilages();

    return (
        <Route
        {...rest} 
        render = {(props) => {
            if(!!user &&( privilages.isExpenseStaff || privilages.isExpenseAuditor || privilages.isExpenseApproverL1 || privilages.isExpenseApproverL2)) {
                return <Component {...props} />;
            }else{
                return <Redirect to="/login" />
            }
        }}
        />
    );
};

export default PrivateEMSRoute;