import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as FaIcons from "react-icons/fa";

import "../styles/Sidebar.css";

import { useSession } from "../firebase/UserProvider";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";

function Sidebar() {
  const [navbar, setNavBar] = useState(false);
  // const [profileNavMenuDropdown, setProfileMenuDropdown] = useState(false);
  const [donorNavMenuDropdown, setDonorNavMenuDropdown] = useState(false);
  const [admissionNavMenuDropdown, setAdmissionNavMenuDropdown] = useState(false);
  const [parentsNavMenuDropdown, setParentsNavMenuDropdown] = useState(false);


  const showSidebar = () => setNavBar(!navbar);
  // const history = useHistory();
  const { user } = useSession();
  const privilages = GetUserPrivilages();
  const toggleNavigation = () => {
    setNavBar(!navbar);
  };

  const toggleDonorNavMenuDropdown = () => {
    setDonorNavMenuDropdown(!donorNavMenuDropdown);
  };

  const toggleAdmissionNavMenuDropdown = () => {
    setAdmissionNavMenuDropdown(!admissionNavMenuDropdown);
  };

  const toggleParentsNavMenuDropdown = () => {
    setParentsNavMenuDropdown(!parentsNavMenuDropdown);
  };
  return (
    <>
      {user && (
        <>
          <button
            type="button"
            aria-label="Toggle Navigation"
            className="navbar-toggler position-absolute d-md-none collapsed pb-2"
            onClick={toggleNavigation}
          >
            <FaIcons.FaBars onClick={showSidebar} />
          </button>
          <div className="float-left sidebar pt-4">
            <nav
              id="sideMenu"
              className={`d-md-block bg-light collapse ${navbar ? "show" : ""}`}
            >
              <div className="sidebar-sticky pt-3">
                <ul className="nav flex-column">
                  <li className="nav-item text-center">
                    <Link className="sidebar-menu-item " to="/">
                      Home
                    </Link>
                  </li>
                  {privilages.canAccessDMS && (
                    <li className="nav-item text-center">
                      <button
                        className="btn btn-link sidebar-menu-item"
                        onClick={toggleDonorNavMenuDropdown}
                      >
                        Donor Management System
                      </button>
                      {/* <div className="row"> */}
                      <nav
                        className={`col bg-light ${
                          donorNavMenuDropdown ? "showMenu" : "hideMenu"
                        }`}
                      >
                        {/* <div className="sidebar-sticky pt-3"> */}
                        <ul className="nav flex-column pl-2">
                          <li className="nav-item pb-4">
                            <Link className="" to="/donorsearch">
                              - Search a Donor
                            </Link>
                          </li>
                          <li className="nav-item pb-4">
                            <Link className="" to="/addnewdonor">
                              - Add a New Donor
                            </Link>
                          </li>
                          <li className="nav-item pb-4">
                            <Link className="" to="/">
                              - Donor Report
                            </Link>
                          </li>
                        </ul>
                        {/* </div> */}
                      </nav>
                      {/* </div> */}
                    </li>
                  )}





                  {/* Below privilage is for Staff members */}
                  {privilages.isStaff && (
                    <li className="nav-item text-center">
                      <button
                        className="btn btn-link sidebar-menu-item"
                        onClick={toggleAdmissionNavMenuDropdown}
                      >
                      Admission Management System
                      </button>
                      {/* <div className="row"> */}
                      <nav
                        className={`col bg-light ${
                          admissionNavMenuDropdown ? "showMenu" : "hideMenu"
                        }`}
                      >
                        {/* <div className="sidebar-sticky pt-3"> */}
                        <ul className="nav flex-column pl-2">
                          <li className="nav-item pb-4">
                            <Link className="" to="/createparentuser">
                              - Create Parent User
                            </Link>
                          </li>
                          <li className="nav-item pb-4">
                            <Link className="" to="/timeslotsinternal">
                              - Create Time Slots
                            </Link>
                          </li>
                          <li className="nav-item pb-4">
                            <Link className="" to="/">
                              - Booked Time Slots 
                            </Link>
                          </li>
                        </ul>
                        {/* </div> */}
                      </nav>
                      {/* </div> */}
                    </li>
                  )}



                  {/* Below privilage is for parents */}
                  {privilages.isParent && (
                    <li className="nav-item text-center">
                      <li className="nav-item pb-4">
                        <Link className="" to="/parentdetails">
                          Parent's Details
                        </Link>
                      </li>

                      <li className="nav-item pb-4">
                        <Link className="" to="/admissionpanel">
                          Admission Panel
                        </Link>
                      </li>
                      <li className="nav-item pb-4">
                        <Link className="" to="/adm">
                          Admission Time Slots
                        </Link>
                      </li>
                  
                    </li>
                  )}







                  {privilages.isAdmin && (
                    <li className="nav-item pb-4 text-center">
                      <Link className="sidebar-menu-item" to="/searchuser">
                        User Management
                      </Link>
                    </li>
                  )}

                  {(privilages.isExpenseStaff || privilages.isExpenseAuditor || privilages.isExpenseApproverL1 || privilages.isExpenseApproverL2) &&( 
                    <li className="nav-item pb-4 text-center">
                      <Link className="sidebar-menu-item" to="/expensereport">
                        Expense Management System
                      </Link>
                    </li>
                  )}
                </ul>
              </div>``
            </nav>
          </div>
        </>
      )}
    </>
    // <>
    //   <IconContext.Provider value={{ color: "#fff" }}>
    //     <div className="navbar">
    //       <div className="row w-100">
    //         <div className="col-3 pt-3">
    //           {user && (
    //             <Link to="#" className="menu-bars pt-3">
    //               <FaIcons.FaBars onClick={showSidebar} />
    //             </Link>
    //           )}
    //         </div>
    //         <div className="col-6 text-center display-1">
    //           <h1 className="text-white">The Title here</h1>
    //         </div>
    //         <div className="col-3 text-right text-white">
    //           {user && (
    //             <>
    //               <button
    //                 className="btn brn-link"
    //                 type="button"
    //                 data-toggle="collapse"
    //                 data-target="user-menu"
    //               >
    //                 <img
    //                   src={user ? user.photoURL : ""}
    //                   className="rounded-circle"
    //                   style={{ height: "32px" }}
    //                 />
    //               </button>
    //               <div id="user-menu" className="">
    //                 <button
    //                   className="btn btn-link text-white"
    //                   onClick={signOutUser}
    //                 >
    //                   Logout
    //                 </button>
    //               </div>
    //             </>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //     {user && (
    //       <div className={navbar ? "nav-menu active" : "nav-menu"}>
    //         <ul className="nav-menu-items" onClick={showSidebar}>
    //           <li className="navbar-toggle">
    //             <Link to="#" className="menu-bars">
    //               <AiIcons.AiOutlineClose />
    //             </Link>
    //           </li>
    //           {SidebarData.map((item, index) => {
    //             return (
    //               <li key={index} className={item.cName}>
    //                 <Link to={item.path}>
    //                   {item.icon}
    //                   <span>{item.title}</span>
    //                 </Link>
    //               </li>
    //             );
    //           })}
    //         </ul>
    //       </div>
    //     )}
    //   </IconContext.Provider>
    // </>
  );
}

export default Sidebar;
