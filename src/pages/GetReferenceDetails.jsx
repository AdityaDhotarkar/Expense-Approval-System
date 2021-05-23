import React, { memo, useEffect, useState } from "react";
import { firestore } from "../firebase/config";

export default memo(function GetReferenceDetails(props) {
  const [refDetails, setRefDetails] = useState("");
  useEffect(async () => {
    const refId = props.refId;

    if (!!firestore && refId !== null && refId.length > 0) {
      await firestore
        .collection("donors")
        .doc(refId)
        .onSnapshot((snapshot) => {
          if (snapshot.exists) {
            let refFullName = snapshot.data().fullName;

            setRefDetails(refFullName);
          }
        }); //End of await firestore.collection('donors').
    } //end of if(!!firestore)
  }, []); //End of useEffect

  return <>{refDetails}</>;
});
