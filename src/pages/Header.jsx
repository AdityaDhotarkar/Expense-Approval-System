import React, { memo } from "react";
import { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import firebase from "../firebase/config";
// import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { useSession } from "../firebase/UserProvider";
import logo from "../img/BMSLogo.jpg";
import "../styles/Sidebar.css";

// import {resetPrivilages} from '../firebase/UserProvider';
export default memo(function Header(props) {
  const [menu, setMenu] = useState(false);
  const history = useHistory();
  const [profileNavMenuDropdown, setProfileMenuDropdown] = useState(false);
  //   const toggleMenu = () => {
  //     setMenu(!menu);
  //   };

  const { user } = useSession();

  // const privilages = GetUserPrivilages();

  const signOutUser = () => {
    firebase.auth().signOut();
    setProfileMenuDropdown(false);
    history.push("/login");
  };

  const toggleProfileNavMenuDropdown = () => {
    setProfileMenuDropdown(!profileNavMenuDropdown);
  };

  //   const toggleDonorNavMenuDropdown = () => {
  //     setDonorNavMenuDropdown(!donorNavMenuDropdown);
  //   };
  const showMenu = `collapse navbar-collapse ml-5 ${menu ? "show" : ""}`;

  useEffect(() => {
    if (profileNavMenuDropdown) {
      setProfileMenuDropdown(false);
    }
    return () => {
      if (profileNavMenuDropdown) {
        setProfileMenuDropdown(false);
      }
    };
  }, []);
  return (
    <>
      <nav className="navbar navbar-dark sticky-top bg-white flex-md-nowrap p-0 mb-2 row">
        <div className="col-md-3 col-sm-3">
          <Link className="" to="\">
            <img src={logo} alt="logo" className="" />
          </Link>
        </div>
        <div className="col-md-6 col-sm-6">
          <div>
            <h1 class="w-100 text-dark text-center">
              {process.env.REACT_APP_APP_TITLE}
            </h1>
          </div>
        </div>
        <div className="col-md-3 col-sm-3">
          {user && (
            <div
              className={`float-right ${profileNavMenuDropdown ? "show" : ""}`}
            >
              <button
                className="btn brn-link pr-3 dropdown-toggle"
                type="button"
                onClick={toggleProfileNavMenuDropdown}
                aria-expanded={profileNavMenuDropdown}
              >
                <img
                  src={user ? user.photoURL : ""}
                  className="rounded-circle"
                  style={{ height: "32px" }}
                />
              </button>

              <div
                className={`bg-white dropdown-menu dropdown-menu-right ${
                  profileNavMenuDropdown ? "show" : ""
                }`}
              >
                <ul class="navbar-nav">
                  <li class={`nav-item text-nowrap dropdown-item `}>
                    <button class="btn btn-link " onClick={signOutUser}>
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* <button
          type="button"
          aria-label="Toggle Navigation"
          className="navbar-toggler position-absolute d-md-none collapsed"
          onClick={toggleNavigation}
        >
          <FaIcons.FaBars onClick={showSidebar} />
        </button> */}
      </nav>
    </>
  );
});
