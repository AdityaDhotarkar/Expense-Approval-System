import React from "react";
import { useEffect,useState, memo } from "react";
import { useHistory } from "react-router";
import { firestore, storage } from "../../firebase/config";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
import { useSession } from "../../firebase/UserProvider";
import { eID } from "./ExpenseReport";

// import { ErrorMessage } from "@hookform/error-message";
import { BillUpload } from "./BillUpload";
 
export default memo(function AddNewItem() {
    const { register, setValue, errors, handleSubmit } = useForm();
    const [isLoading, setisLoading] = useState(false);
    const params = useParams();
    const history = useHistory();
    const user = useSession();
  
    const acceptBill = async (billData) => {
      await firestore
        .collection("expenses")
        .doc(params.expenseData)
        .collection("expenseLineItems")
        .add({
          amount: billData.amount,
          expenseDate: billData.expenseDate,
          billNo: billData.billNo,
          vendor: billData.vendor,
          description: billData.description,
          billURL: billData.billURL,
        })
        .then((docRef) => {
          alert("The Bill Report has been added Suceessfully.");
          history.push(`/expensereport`);
          setisLoading(false);
        });

      };
      useEffect(()=>{
        
        const docRef = firestore.collection('expenses').doc(params.id);
      }, [user.uid, params.id]);

    
    const formClass = `${isLoading ? "ui form loading" : ""}`;
    return (
      <div>
        <div className="card">
          <div className="justify-content-center d-flex">
            <h2>Add a New Expense Line Item</h2>
          </div>
          <form className="formClass" onSubmit={handleSubmit(acceptBill)}>
            <div className="row">
              <div className="col">
                <label className="m-2">Expense Date:</label>
                <input
                  type="date"
                  className="form-control ml-2"
                  id="expenseDate"
                  name="expenseDate"
                  {...register("amount")}
                />
              </div>
              <div className="col">
                <label className="m-2">Bill/Invoice No.:</label>
                <input
                  type="input"
                  className="form-control mr-2  p-2"
                  id="billNo"
                  name="billNo"
                  {...register("billNo")}
                />
              </div>
            </div>
  
            <div className="row mb-3">
              <div className="col">
                <label className="m-2">Vendor:</label>
                <input
                  type="text"
                  className="form-control ml-2"
                  id="vendor"
                  name="vendor"
                  {...register("vendor")}
                />
              </div>
              <div className="col">
                <label className="m-2">Amount:</label>
                <input
                  type="text"
                  className="form-control p-2"
                  name="amount"
                  {...register("amount",
                      {
                          required: "Please enter a Bill amount",
                          min: {
                            value: 1,
                            message:
                              "Minimum Bill amount should be more than zero",
                          },
                        }
                  )}
                />
  
                {/* <ErrorMessage 
                  errors={errors}
                  name="amount"
                  render={({ message }) => (
                      <p className="text-danger">{message}</p>
                    )}
                /> */}
              </div>
            </div>
  
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="m-2">Description:</label>
                <input
                  type="text"
                  className="form-control ml-2"
                  id="description"
                  name="description"
                  {...register("description")}
                />
              </div>
            </div>
  
            <div className="row-mb-3">
              <BillUpload id={params.id}/>
            </div>
  
            <div className="row mb-3 ">
              <div className="col justify-content-center d-flex">
                <button type="submit" className="btn btn-primary mr-2">
                  Save
                </button>{" "}
                <button
                  type="button"
                  className="btn btn-secondary ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    history.push();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
  
          </form>
        </div>
      </div>
    );
  });
  