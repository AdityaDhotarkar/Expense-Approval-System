import React from "react";
import { useState, useContext } from "react";
import { useEffect } from "react";
import { firestore } from "./config";
import { useSession } from "./UserProvider";

export const UserPrivilageContext = React.createContext();

export const UserPrivilageProvider = (props) => {
  const [privilages, setPrivilages] = useState({
    canAccessDMS: false,
    canAccessFMS: false,
    canCreateDMS: false,
    canReadDMS: false,
    canUpdateDMS: false,
    isAdmin: false,
    language: "English",
    loading: false,
    isStaff: false,
    isManagement: false,
    isAdmissionAdmin: false,
    isParent: false,
    isExpenseStaff: false,
    isExpenseAuditor: false,
    isExpenseApproverL1 : false,
    isExpenseApproverL2: false,
  });
  const { user } = useSession();

  useEffect(() => {
    if (user) {
      firestore
        .collection(`users`)
        .doc(user.uid)
        .onSnapshot((doc) => {
          let userData = doc.data();

          if (userData !== undefined) {
            setPrivilages({
              canAccessDMS:
                userData.dms !== undefined ? userData.dms.canAccess : false,
              canAcceptDonation:
                userData.dms !== undefined
                  ? userData.dms.canAcceptDonation
                  : false,
              canUpdateDonor:
                userData.dms !== undefined
                  ? userData.dms.canUpdateDonor
                  : false,
              canCreateDonor:
                userData.dms !== undefined
                  ? userData.dms.canCreateDonor
                  : false,
              canAccessFMS:
                userData.canAccessFMS !== undefined
                  ? userData.canAccessFMS
                  : false,
              isAdmin:
                userData.isAdmin !== undefined ? userData.isAdmin : false,
              language:
                userData.language !== undefined ? userData.language : "",
              isStaff:
                userData.ams !== undefined
                  ? userData.ams.isStaff
                  : false,
              isManagement:
                userData.ams !== undefined
                  ? userData.ams.isManagement
                  : false,
              isAdmissionAdmin:
                userData.ams !== undefined
                  ? userData.ams.isAdmissionAdmin
                  : false,
              isParent:
                userData.ams !== undefined
                  ? userData.ams.isParent
                  : false,
              isExpenseStaff:
                userData.ems !== undefined 
                  ? userData.ems.isExpenseStaff 
                  : false,
              isExpenseAuditor:
                userData.ems !== undefined 
                  ? userData.ems.isExpenseAuditor 
                  : false,
              isExpenseApproverL1:
                userData.ems !== undefined 
                  ? userData.ems.isExpenseApproverL1 
                  : false,
              isExpenseApproverL2:
                userData.ems !== undefined 
                  ? userData.ems.isExpenseApproverL2 
                  : false,
            });
          }
        });
    }
  }, [user]);

  return (
    <UserPrivilageContext.Provider value={privilages}>
      {!privilages.loading && props.children}
    </UserPrivilageContext.Provider>
  );
};

export const resetUserPrivilages = () => {};
export const GetUserPrivilages = () => {
  return useContext(UserPrivilageContext);
};
