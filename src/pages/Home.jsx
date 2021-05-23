import React, { memo } from "react";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";

export default memo(function Home() {
  const { user } = useSession();
  const privilages = GetUserPrivilages;
  return (
    <div>
      <div id="home">
        <h2 className="text-center text-blue pt-5">Welcome Home!</h2>
        <div className="container">
          <div
            id="login-row"
            className="row justify-content-center align-items-center"
          >
            <div id="login-column" className="col-md-6">
              <div
                id="login-box"
                className="col-md-12 justify-content-center d-flex"
              >
                {!!user && <div> Welcome {user.displayName}</div>}
              </div>
              <div className="justify-content-center d-flex">
                {!!user && (
                  <div>
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="rounded-circle img-thumbnail img-fluid"
                    />
                  </div>
                )}
              </div>
              {/* {!(
                privilages.canAccessDMS ||
                privilages.canAccessFMS ||
                privilages.isAdmin
              ) && (
                <div>
                  It seems you do not have any privilages. Please{" "}
                  <a href="#">Click here</a> and request the privilages you
                  need.
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
