import React, { useState } from "react";
import { firestore } from "../firebase/config";
import DonorList from "./DonorList";
function SearchUser() {
  const [email, setEmail] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  return (
    <div>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Search User</h2>
        </div>
      </div>
      <div className="row justify-content-center d-flex">
        <form
          className="form-inline "
          onSubmit={async (e) => {
            e.preventDefault();

            const query = firestore
              .collection(`users`)
              .where("email", ">=", email);
            await query.get({ source: "server" }).then((QuerySnapshot) => {
              let userList = [];
              QuerySnapshot.forEach((user) => {
                userList.push({
                  userId: user.id,
                  name: user.data().name,
                  email: user.data().email,
                });
              }); //End of QuerySnapshot.forEach

              setQueryResult(userList);
            });
          }}
        >
          <label className="ml-2">User Email:</label>
          <input
            type="text"
            className="form-control m-2"
            id="email"
            placeholder="Enter User Email"
            name="email"
            onChange={(e) => setEmail(e.target.value.toUpperCase())}
          />

          <button type="submit" className="btn btn-primary m-2">
            Search
          </button>
        </form>
      </div>
      <div
        className="card border-top-0 rounded-0"
        style={{ position: "inherit" }}
      >
        <div className="card-body py-2 justify-content-center d-flex">
          <div className="card-title font-weight-bold m-0">Result</div>
        </div>
      </div>
      {queryResult != null && (
        <div
          className="card border-top-0 rounded-0"
          style={{ position: "inherit" }}
        >
          <div className="card-body py-2 justify-content-center d-flex">
            <div className="card-title font-weight-bold m-0">
              {/* <DonorList queryResult={queryResult} /> */}
              Query Results here..
              {queryResult.length > 0 ? (
                <DonorList queryResult={queryResult} />
              ) : (
                <div>No user found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchUser;
