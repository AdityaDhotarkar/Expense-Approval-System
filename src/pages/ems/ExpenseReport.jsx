import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { firestore } from "../../firebase/config";
import { useSession } from "../../firebase/UserProvider";
import { Link, useParams } from "react-router-dom";
import { GetUserPrivilages } from "../../firebase/UserPrivilageProvider";
import BillDetails from "./BillDetails";

export default memo(function ExpenseReport(props) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const[expenseLineItems, setExpenseLineItems] = useState(null);
  const[doesItemExist, itemExists] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [error, setError] = useState(false);
  const [staffDate, setStaffDate] = useState("");
  const [auditorDate, setAuditorDate] = useState("");
  const [approverDate, setApproverDate] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [auditorEmail, setAuditorEmail] = useState("");
  const [approverEmail, setApproverEmail] = useState("");
  const [selectTrust, setSelectTrust] = useState("");
  const [financialYear, setFinancialYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState("New");
  const [costCenter, setCostCenter] = useState("");
  const [mode, setMode] = useState("");
  const [eId, setEId] = useState();
  const { user } = useSession();
  const history = useHistory();
  const privilages = GetUserPrivilages();
  const params = useParams();
  const [expenses, setExpenses] = useState(null);
  const [expenseBillDetails, setExpenseBillDetails] = useState({
    auditorApprovedAmount : "",
    auditorComment : "",
    approverApprovedAmount : "",
    approverComment : "",
  });

  function generateSerial() {
    var chars = "1234567890",
      serialLength = 4,
      randomSerial = "",
      i,
      randomNumber;

    for (i = 0; i < serialLength; i = i + 1) {
      randomNumber = Math.floor(Math.random() * chars.length);
      randomSerial += chars.substring(randomNumber, randomNumber + 1);
    }
    return randomSerial;
  }

  const expenseReport = async (expenseData) => {
    setisLoading(true);

    let enumber = expenseData.expenseNo;
    const equery = firestore
      .collection(`expenses`)
      .where("expenseNo", "==", "enumber");

    const snapshot = await equery
      .get({ source: "server" })
      .then(async (QuerySnapshot) => {
        // If there is no staff with expense number then can raise request
        // else throw error that expense no already exist
        if (QuerySnapshot.empty) {
          // add the expense report

          await firestore
            .collection("expenses")
            .add({
              expenseNo: enumber,
              status: status,
              generatedBy: staffEmail,
              financialYear: financialYear,
              createdDate: staffDate,
              approvedDate: approverDate,
              auditedDate: auditorDate,
              auditedBy: auditorEmail,
              approvedBy: approverEmail,
              commentByStaff: expenseData.commentByStaff,
              costCategory: expenseData.costCategory,
              trust: selectTrust,
              costCenter: costCenter,
              debitAccount: expenseData.debitAccount,
              paymentDate: expenseData.paymentDate,
              mode: mode,
              ledger: expenseData.ledger,
              commentByAuditor: expenseData.commentByAuditor,
              cashAdvancesApplied: expenseData.cashAdvancesApplied,
              auditorApprovedAmount: expenseData.auditorApprovedAmount,
              commentByApprover: expenseData.commentByApprover,
              approverApprovedAmount: expenseData.auditorApprovedAmount,
            })
            .then((docRef) => {
              let eId = docRef.id;
              alert("The Expense request raised Successfully.");
              setisLoading(false);
              history.pushState(`/expensedetails/${docRef.id}`);
            });
        } else {
          // throw error
          setError(true);
        }
      });
    setisLoading(false);
  };
  
  useEffect(async () => {
    const expenseReportId = params.reportId;
    const docRef = firestore.collection("expenses").doc(expenseReportId);
    docRef.onSnapshot((snapshot)=> {
      if (snapshot.exists){
        const data = snapshot.data();

        setValue("auditorApprovedAmount",data.auditorApprovedAmount);
        setValue("auditorComment",data.auditorComment);
        setValue("approverApprovedAmount",data.approverApprovedAmount);
        setValue("approverComment",data.approverComment);
        
        setExpenseBillDetails({
          auditorApprovedAmount : data.auditorApprovedAmount,
          auditorComment : data.auditorComment,
          approverApprovedAmount : data.approverApprovedAmount,
          approverComment : data.approverComment,
        })

      }

    })
  })

  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card p-1 mb-1">
        <div className="justify-content-center d-flex">
          <h2>Expense Report</h2>
        </div>
      </div>
      <div className="card p-1">
        <form className={formClass} onSubmit={handleSubmit(expenseReport)}>
          <label className="d-flex">
            <h4 className="p-2">Expense Header Details:</h4>
          </label>
          <div className="row">
            <div className="col-md-6">
              <label className="m-2">Expense Number:</label>
              <input
                type="text"
                placeholder="3312"
                className="form-control ml-2"
                id="expenseNo"
                name="expenseNo"
                readOnly
                {...register("expenseNo")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Status:</label>
              <select
                name="status"
                className="form-control ml-2"
                disabled="true"
                onSubmit={()=>{
                  if(privilages.isExpenseStaff)
                  {
                    setStatus("Submitted");
                  }
                  else if(privilages.isExpenseAuditor)
                  {
                    setStatus("Audited")
                  }
                  else if(privilages.isExpenseApproverL1 || privilages.isExpenseApproverL2)
                  {
                    setStatus("Approved");
                  }
                }}
                {...register("status")}
              >
                <option value="new">New</option>
                <option value="submitted">Submitted</option>
                <option value="audited">Audited</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejectedByAuditor">Rejected By Auditor</option>
                <option value="rejectedByApprover">Rejected By Approver</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Generated By:</label>
              <input
                type="text"
                onSubmit={() => {
                  if(privilages.isExpenseStaff)
                  {
                    setStaffEmail(user.email);
                  }
                }}
                className="form-control ml-2"
                id="generatedBy"
                name="generatedBy"
                readOnly
                {...register("generatedBy")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Financial Year:</label>
              <select
                name="fyear"
                id="fyear"
                className="form-control ml-2"
                onChange={(e)=>{
                  setFinancialYear(e.target.value);
                }}
                {...register("financialYear")}
              >
                <option value="21-22">2021-22</option>
                <option value="22-23">2022-23</option>
                <option value="23-24">2023-24</option>
              </select>
            </div>
          </div>

          {(privilages.isExpenseApproverL1 ||
            privilages.isExpenseApproverL2 ||
            privilages.isExpenseAuditor) && (
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="m-2">Cost Center:</label>
                <select
                  className="form-control ml-2"
                  name="costCenter"
                  id="costCenter"
                  onChange={(e)=>{
                    setCostCenter(e.target.value);
                  }}
                  {...register("costCenter")}
                  // {...(privilages.isExpenseAuditor ? "" : "disabled")}
                >
                  <option selected value="default"></option>
                  <option value="booksntoys">Books & Toys</option>
                  <option value="salary">Salary</option>
                  <option value="transport">Transport</option>
                  <option value="newInitiativeTechnology">New Initiative/Technology</option>
                  <option value="stationary">Stationary</option>
                  <option value="trustExpenses">Trust Expenses</option>
                  <option value="annualEducationalTrips">Annual Educational Trips</option>
                  <option value="teachersTraining">Teachers Training</option>
                  <option value="rent">Rent</option>
                  <option value="dyaCsfs">DYA / CSFS</option>
                  <option value="annualDay">Annual Day</option>
                  <option value="sportsDay">Sports Day</option>
                  <option value="prasadam">Prasadam</option>
                  <option value="wellWisherCultivations">Well Wisher Cultivation</option>
                  <option value="furnitureElectronics">Furniture & Electronics</option>
                  <option value="otherEvents">All Other Events</option>
                  <option value="chaityanaAcademy">Chaitynya Academy</option>
                  <option value="other">Others/Miscellenous</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="m-2">
                  Debit Account:<span className="text-danger">*</span>
                </label>
                <select
                  className="form-control ml-2"
                  name="debitAccount"
                  id="debitAccount"
                  {...register("debitAccount")}
                  // readOnly={
                  //   privilages.isExpenseApproverL1 ||
                  //   privilages.isExpenseApproverL2
                  //     ? "true"
                  //     : "false"
                  // }
                >
                  <option selected value="default"></option>
                  <option value="debitAcc1"> Debit Account 1 </option>
                  <option value="debitAcc2"> Debit Account 2 </option>
                  <option value="debitAcc3"> Debit Account 3 </option>
                </select>
              </div>
            </div>
          )}

          {(privilages.isExpenseApproverL1 ||
            privilages.isExpenseApproverL2 ||
            privilages.isExpenseAuditor) && (
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="m-2">Cost Category:</label>
                <select
                  name="costCategory"
                  id="coseCategory"
                  className="form-control ml-2"
                  {...register("costCategory")}
                  // readOnly={
                  //   privilages.isExpenseApproverL1 ||
                  //   privilages.isExpenseApproverL2
                  //     ? "true"
                  //     : "false"
                  // }
                >
                  <option selected value="default"></option>
                  <option value="costCategory1">Cost Category 1</option>
                  <option value="costCategory2">Cost Category 2</option>
                  <option value="costCategory3">Cost Category 3</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="m-2">Ledger:</label>
                <select
                  name="ledger"
                  id="ledger"
                  className="form-control ml-2"
                  // readOnly={
                  //   privilages.isExpenseApproverL1 ||
                  //   privilages.isExpenseApproverL2
                  //     ? "true"
                  //     : "false"
                  // }
                  {...register("ledger")}
                >
                  <option selected value="default"></option>
                  <option value="ledger1">Ledger 1</option>
                  <option value="ledger2">Ledger 2</option>
                  <option value="ledger3">Ledger 3</option>
                </select>
              </div>
            </div>
          )}

          {(privilages.isExpenseApproverL1 ||
            privilages.isExpenseApproverL2 ||
            privilages.isExpenseAuditor) && (
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="m-2">Trust:</label>
                <select 
                  name="trust" 
                  id="trust" 
                  className="form-control ml-2"
                  {...register("trust")}
                  onChange={(e)=> {
                      setSelectTrust(e.target.value)
                  }}
                  // {...(privilages.isExpenseAuditor ? "" : "disabled")}
                >
                  <option selected value="default"></option>
                  <option value="scss">SCSS</option>
                  <option value="crest">CREST</option>
                </select>
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Created Date:</label>
              <input
                type="date"
                placeholder=""
                onSubmit={(e)=>{
                  if(privilages.isExpenseStaff)
                  {
                    setStaffDate(new Date(e.target.value));
                  }
                }}
                className="form-control ml-2"
                id="createdDate"
                name="createdDate"
                readOnly
                {...register("createdDate")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Audited Date:</label>
              <input
                type="date"
                className="form-control ml-2"
                onSubmit={(e)=>{
                  if(privilages.isExpenseAuditor)
                  {
                    setAuditorDate(new Date(e.target.value));
                  }
                }}
                name="auditedDate"
                readonly
                {...register("auditedDate")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Approved Date:</label>
              <input
                type="date"
                placeholder=""
                onSubmit={(e) => {
                  if(privilages.isExpenseApproverL1 || privilages.isExpenseApproverL2)
                  {
                    setApproverDate(new Date(e.target.value));
                  }
                }}
                className="form-control ml-2"
                id="dob"
                name="approvedDate"
                readonly
                {...register("approvedDate")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Payment Date:</label>
              <input
                type="date"
                className="form-control ml-2"
                name="paymentDate"
                {...register("paymentDate")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Audited By:</label>
              <input
                type="text"
                onSubmit={()=>{
                  if(privilages.isExpenseAuditor)
                  {
                    setAuditorEmail(user.email);
                  }
                }}
                className="form-control ml-2"
                id="auditedBy"
                name="auditedBy"
                readonly
                {...register("auditedBy")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Approved By:</label>
              <input
                type="text"
                className="form-control ml-2"
                onSubmit={()=>{
                  if(privilages.isExpenseApproverL1 || privilages.isExpenseApproverL2)
                  {
                    setApproverEmail(user.email);
                  }
                }}
                name="approvedBy"
                readOnly
                {...register("approvedBy")}
              />
            </div>
          </div>

          <label className="d-flex">
            <h4 className="p-2">Comments:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Comment By Staff:</label>
              <input
                placeholder="Books for Review"
                type="text"
                className="form-control ml-2"
                id="commentByStaff"
                name="commentByStaff"
                // readOnly={
                //   privilages.isExpenseApproverL1 ||
                //   privilages.isExpenseApproverL2 ||
                //   privilages.isExpenseAuditor
                //     ? "true"
                //     : "false"
                // }
                {...register("commentByStaff")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Comment By Auditor:</label>
              <input
                placeholder="All Bill looks good"
                type="text"
                className="form-control ml-2"
                name="commentByAuditor"
                // readOnly={
                //   privilages.isExpenseApproverL1 ||
                //   privilages.isExpenseApproverL2 ||
                //   privilages.isExpenseStaff
                //     ? "true"
                //     : "false"
                // }
                {...register("commentByAuditor")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Comment By Approver:</label>
              <input
                type="text"
                placeholder="Approved"
                className="form-control ml-2"
                id="commentByApprover"
                name="commentByApprover"
                // readOnly={
                //   privilages.isExpenseStaff || privilages.isExpenseAuditor
                //     ? "true"
                //     : "false"
                // }
                {...register("commentByApprover")}
              />
            </div>
          </div>

          <label className="d-flex">
            <h4 className="p-2">Totals:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Claimed By Employee:</label>
              <input
                placeholder="Rs. 700"
                type="text"
                className="form-control ml-2"
                id="email"
                name="email"
                readOnly
                {...register("email")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Non-Reimbursable Expenses:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                name="phone"
                readOnly
                {...register("phone")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Cash Advances Applied:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                id="cashAdvancesApplied"
                name="cashAdvancesApplied"
                // readOnly={
                //   privilages.isExpenseApproverL1 ||
                //   privilages.isExpenseApproverL2 ||
                //   privilages.isExpenseStaff
                //     ? "true"
                //     : "false"
                // }
                {...register("cashAdvancesApplied")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Auditor Approved Amount:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                name="auditorApprovedAmount"
                {...register("auditorApprovedAmount")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Amount Due to Staff:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                id="email"
                name="email"
                readOnly
                {...register("email")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Approver Approved Amount:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                name="approverApprovedAmount"
                {...register("approverApprovedAmount")}
              />
            </div>
          </div>

          <label className="d-flex">
            <h4 className="p-2">Payment Details(TBD):</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Mode:</label>
              <select
                className="form-control ml-2"
                name="mode"
                id="mode"
                onChange={(e)=>{
                  setMode(e.target.value);
                }}
                {...register("mode")}
              >
                <option selected value="default"></option>
                <option value="enet">ENET</option>
                <option value="cheque">Cheque</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="m-2">Bank Account:</label>
              <select
                className="form-control ml-2"
                name="bankAccount"
                id="bankAccount"
              >
                <option selected value="default"></option>
                <option value="bankacc1">Bank Account 1</option>
                <option value="bankacc2">Bank Account 2</option>
                <option value="bankacc3">Bank Account 3</option>
              </select>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Bank Referance:</label>
              <input
                placeholder=""
                type="text"
                className="form-control ml-2"
                id="email"
                name="email"
                {...register("email")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Bank Transaction Date:</label>
              <input
                placeholder=""
                type="date"
                className="form-control ml-2"
                name="phone"
                {...register("phone")}
              />
            </div>
          </div>

          {(privilages.isExpenseApproverL1 ||
            privilages.isExpenseApproverL2 ||
            privilages.isExpenseAuditor) && (
            <>
              <label className="d-flex">
                <h4 className="p-2">Budget:</h4>
              </label>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="m-2">
                    Allocated Budget for this Cost Center:
                  </label>
                  <input
                    placeholder="Rs. 30000"
                    type="text"
                    className="form-control ml-2"
                    id="email"
                    name="email"
                    readOnly
                    {...register("email")}
                  />
                </div>
                <div className="col-md-6">
                  <label className="m-2">Already Spent on Cost Center:</label>
                  <input
                    placeholder="Rs. 17540"
                    type="text"
                    className="form-control ml-2"
                    name="phone"
                    readonly
                    {...register("phone")}
                  />
                </div>
              </div>
            </>
          )}

          
          {(privilages.isExpenseApproverL1 ||
            privilages.isExpenseApproverL2) && (
            <div className="row-mb-3">
              <div className="col-md-12">
                <input type="radio" id="" name="" value="" />
                {""}
                <label htmlFor="">
                  I certify the expenses submitted are accurate and as per the
                  expense policy.
                </label>
              </div>
            </div>
          )}

          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button
                type="button"
                className="btn btn-primary mr-2"
                onClick={(e) => {
                  history.push(`/expensereport/${params.id}}`);
                }}
              >
                Save
              </button>
              <button type="submit" className="btn btn-primary mr-2">
                Submit
              </button>{" "}
              <button type="submit" className="btn btn-primary mr-2">
                Approve All
              </button>{" "}
            </div>
          </div>
        </form>
      </div>

      <div className="mt-3">
        <div className="justify-content-center d-flex">
          <h2>Bill Details</h2>
        </div>
        {privilages.isExpenseStaff && (
          <div className="row-mb-3">
            <div className="col justify-content-center d-flex">
              <Link to={`/expensereport/bill`}>Add Expense Line Item</Link> 
              {/*<button
                type="button"
                className="btn btn-primary mr-2 text-white"
                onClick = {() => {
                  history.push(`/expensereport/bill`)
                }
              > 
                Add Expense Line Item
              </button>*/}
            </div>
          </div>
        )}

        {doesItemExist && expenseLineItems ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Expense Date</th>
                  <th>Bill No.</th>
                  <th>Claimed Amount</th>
                  <th>Vendor</th>
                  <th>Description</th>
                  <th>Auditor Approved Amount</th>
                  <th>Auditor Comment</th>
                  <th>Approver Approved Amount</th>
                  <th>Approver Comment</th>
                  <th>Bill/Invoice</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/*<BillDetails
                  expenseLineItems = {expense-line-items}
                  expenseBillDetails = {expenseBillDetails}
                />*/}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="justify-content-center d-flex">
            <h3></h3>
          </div>      
        )}
      </div>
    </div>
  );
});
