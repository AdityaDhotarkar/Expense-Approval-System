import "./App.css";

import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Header from "./pages/Header";
import { UserProvider } from "./firebase/UserProvider";
import PageRoute from "./route/PageRoute";
import Default from "./pages/Default";
import TestPage from "./pages/TestPage";
import { UserPrivilageProvider } from "./firebase/UserPrivilageProvider";
import PrivateDMSRoute from "./route/PrivateDMSRoute";
import PrivateAdmissionAdminRoute from "./route/PrivateAdmissionAdminRoute";
import PrivateManagementRoute from "./route/PrivateManagementRoute";
import PrivateParentRoute from "./route/PrivateParentRoute";
import PrivateStaffRoute from "./route/PrivateStaffRoute";
import PrivateEMSRoute from "./route/PrivateEMSRoute";
import SearchDonor from "./pages/SearchDonor";
import DonorDetails from "./pages/DonorDetails";
import AcceptDonation from "./pages/AcceptDonation";
import Sidebar from "./pages/Sidebar";
import AddANewDonor from "./pages/AddANewDonor";
import CreateParentUser from "./pages/ams/createParentUser";
import ParentDetails from "./pages/ams/ParentDetails";
import AdmissionPanel from "./pages/ams/AdmissionPanel";
import timeSlotsInternal from "./pages/ams/timeSlotsInternal";


import { useSession } from "./firebase/UserProvider";
import PrivateAdminRoute from "./route/PrivateAdminRoute";
import SearchUser from "./pages/SearchUser";
import UpdateStudentData from "./pages/ams/updateStudentData";
import ExpenseReport from "./pages/ems/ExpenseReport";
import AddNewItem from "./pages/ems/AddNewItem";

function App() {
  const user = useSession();
  // const [user] = useState(true);

  return (
    <>
      <UserProvider>
        <UserPrivilageProvider>
          <BrowserRouter>
            <Header />
            <Sidebar />
            <div className={user ? `float-right main` : ``}>
              <Switch>
                <PageRoute exact path="/home" component={Home} />
                <PrivateDMSRoute exact path="/test" component={TestPage} />
                <PrivateDMSRoute
                  exact
                  path="/donorsearch"
                  component={SearchDonor}
                />
                <PrivateDMSRoute
                  exact
                  path="/addnewdonor"
                  component={AddANewDonor}
                />
                <PrivateDMSRoute
                  exact
                  path="/donordetails/:donorId"
                  component={DonorDetails}
                />
                <PrivateDMSRoute
                  exact
                  path="/acceptdonation/:type/:donorId"
                  component={AcceptDonation}
                />

                
                <PrivateAdminRoute
                  exact
                  path="/searchuser"
                  component={SearchUser}
                />
               
                
                <PrivateStaffRoute
                  exact
                  path="/createparentuser"
                  component={CreateParentUser}
                />
                <PrivateParentRoute
                  exact
                  path="/updatestudentdata"
                  component={UpdateStudentData}
                />
                <PrivateParentRoute
                  exact
                  path="/parentdetails"
                  component={ParentDetails}
                />
                <PrivateParentRoute
                  exact
                  path="/admissionpanel"  
                  component={AdmissionPanel}
                />
                <PrivateParentRoute
                  exact
                  path="/timeslotsinternal"  
                  component={timeSlotsInternal}
                />
                <PrivateStaffRoute
                  exact
                  path="/timeslotsinternal"
                  component={timeSlotsInternal}
                />

                <PrivateEMSRoute 
                  exact
                  path="/expensereport"
                  component={ExpenseReport}
                />

                <PrivateEMSRoute 
                  exact
                  path="/expensereport/bill"
                  component={AddNewItem}
                />

                {/* <Route exact path="/test" component={TestPage}/> */}
                <Route exact path="/login" component={Login} />
                <Route exact path="/">
                  <Redirect to="/login" />
                </Route>
                <Default notfound />
              </Switch>
            </div>
          </BrowserRouter>
        </UserPrivilageProvider>
      </UserProvider>
    </>
  );
}

export default App;
