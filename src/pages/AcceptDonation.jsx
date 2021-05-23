import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { firestore } from "../firebase/config";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import * as AiReactIcon from "react-icons/ai";
// import * as Fa from "react-icons/ai";
import { ErrorMessage } from "@hookform/error-message";
import DonorRefList from "./DonorRefList";
export default memo(function AcceptDonation(props) {
  const {
    register,
    setValue,
    formState: { errors },
    handleSubmit,
  } = useForm();
  const privilages = GetUserPrivilages;
  const params = useParams();
  const history = useHistory();

  const [donorRef, setDonorRef] = useState(""); //Store donor ref's id
  const [isLoading, setisLoading] = useState(false);
  const [totalDonation, setTotalDonation] = useState(0); //Total Donation
  const [totalCommitment, setTotalCommitment] = useState(0); //Total Commitment
  const [donorRefSearchQuery, setDonorRefSearchQuery] = useState(""); //To store the query string of other donor ref
  const [donorRefList, setDonorRefList] = useState(null); //To store the result of donor ref search
  const [donorRefOption, setDonorRefOption] = useState("selfDonor");
  const [donorRefError, setDonorRefError] = useState(false);
  const [donationMode, setDonationMode] = useState("Cheque");
  const [type, setType] = useState(""); //To store donation type
  const [dateError, setDateError] = useState(false); //To stpre
  const [donationDate, setDonationDate] = useState(""); //To store donation date

  /*
    Checks if the bank referece date for donation is within 90 days of donation date.
    if not then return false
    else return true
   */
  const validBankRefDate = (value) => {
    let returnValue = true;

    if (
      type === "Donation" &&
      (donationMode === "Cheque" || donationMode === "DD") &&
      donationDate !== ""
    ) {
      let bankRefDate = new Date(value);
      let donationDDate = new Date(donationDate);
      let dateDiff = Math.round(
        (donationDDate - bankRefDate) / (1000 * 60 * 60 * 24)
      );

      dateDiff > 90 ? (returnValue = false) : (returnValue = true);
    }

    return returnValue;
  }; //End validBankRefDate

  /**
   * If dontaion
   *  if bank reference date is same or before donation date
   *     return true
   *  else return false
   * If commitment
   *    if bank reference date is same of after commitment date
   *      return true
   *    else
   *      return false
   * @param {value} e
   */
  const checkIfBankRefDateBeforeDonationDate = (value) => {
    if (donationDate !== "") {
      let dDonationDate = new Date(donationDate);
      let dBankRefDate = new Date(value);
      if (type === "Donation") {
        return (
          Math.round((dDonationDate - dBankRefDate) / (1000 * 60 * 60 * 24)) >=
          0
        );
      } //End of if(type === "Donation")
      else {
        //type === "Commitment"
        return (
          Math.round((dDonationDate - dBankRefDate) / (1000 * 60 * 60 * 24)) <=
          0
        );
      } //end of else
    } //End of f(donationDDate !== "")
    return true;
  }; //end of isBankRefDateBeforeDonationDate

  const handleModeChange = (e) => {
    setDonationMode(e.target.value);
  };

  const updateDonorRefValue = (donorRefId, donorRefFullName) => {
    setDonorRef(donorRefId);
    setDonorRefList(null);
    setDonorRefSearchQuery(donorRefFullName);
  };

  const handleCollectedByOptions = (e) => {
    setDonorRefOption(e.target.value);
  }; //End of handleCollectedByOptions function

  const handleDonorRefSearch = async (e) => {
    e.preventDefault();
    setDonorRefList(null);
    setDonorRefError(false);

    let searchString = donorRefSearchQuery.toUpperCase();

    const query = firestore
      .collection(`donors`)
      .where("fullName", ">=", searchString)
      .orderBy("fullName")
      .limit(3);

    const snapshot = await query
      .get({ source: "server" })
      .then((querySnapshot) => {
        let donorRefList = [];

        querySnapshot.forEach((donorRef) => {
          donorRefList.push({
            donorId: donorRef.id,
            fullName: donorRef.data().fullName,
          });
        }); //End of querySnapshot.forEach()
        setDonorRefList(donorRefList);
      }); //End of then(querySnapshot => {})
  }; //end of const handleDonorRefSearch

  useEffect(() => {
    const donorId = params.donorId;
    setType(params.type);
    const docRef = firestore.collection("donors").doc(donorId);
    docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        // setDonorRef(data.reference);
        setTotalDonation(
          data.totalDonation !== "" && data.totalDonation !== undefined
            ? data.totalDonation
            : 0
        );
        setTotalCommitment(
          data.totalCommitment !== "" && data.totalCommitment !== undefined
            ? data.totalCommitment
            : 0
        );
        setValue("fullName", data.fullName);
        setValue("pan", data.pan);
        setValue("spiritualName", data.spiritualName);

        setValue(
          "dob",
          data.dob !== "" && data.dob !== undefined ? data.dob.toDate() : ""
        );
        setValue("email", data.email);
        setValue("phone", data.phone);

        setValue(
          "addressLine1",
          data.address !== "" && data.address !== undefined
            ? data.address.addressLine1
            : ""
        );
        setValue(
          "addressLine2",
          data.address !== "" && data.address !== undefined
            ? data.address.addressLine2
            : ""
        );
        setValue(
          "city",
          data.address !== "" && data.address !== undefined
            ? data.address.city
            : ""
        );
        setValue(
          "pin",
          data.address !== "" && data.address !== undefined
            ? data.address.pin
            : ""
        );

        setValue(
          "state",
          data.address !== "" && data.address !== undefined
            ? data.address.state
            : ""
        );
        setValue(
          "country",
          data.address !== "" && data.address !== undefined
            ? data.address.country
            : ""
        );

        setValue("reference", data.reference);
      } //End of if(snapshot.exists)
    }); //End of const docRef ...
  }, []); //End of useEffect

  /*Creates the donation record */
  const acceptDonation = async (donationData) => {
    let canProcess = false;

    //If the donor ref is self
    let donorReference = "";
    //The other option is selected but ref is not selected yet
    if (donorRefOption === "otherDonor" && donorRef === "") {
      setDonorRefError(true);
      // donorReference = params.donorId;
    } else {
      //Check for valid donation date based on the type
      //if type = Donation, date should today or in past
      //else date should be in future
      let tDate = new Date();
      let dDate = new Date(donationData.date);
      if (type === "Donation" && dDate.getTime() <= tDate.getTime()) {
        canProcess = true;
      } else if (type === "Commitment" && dDate.getTime() > tDate.getTime()) {
        canProcess = true;
      } else {
        setDateError(true);
      }
    } //End of else if(donorRefOption === 'selfDonor')
    if (canProcess) {
      setisLoading(true);
      if (donorRefOption === "otherDonor") {
        //If donor ref is other and selected a valid donor
        donorReference = donorRef;
      } else if (donorRefOption === "selfDonor") {
        //If donor ref is self, set the value as self
        donorReference = "Self";
      }

      await firestore
        .collection("donors")
        .doc(params.donorId)
        .collection("donations")
        .add({
          amount: donationData.amount,
          bank: donationData.bank !== undefined ? donationData.bank : "",
          bankRef:
            donationData.bankRef !== undefined ? donationData.bankRef : "",
          bankRefDate:
            donationData.bankRefDate !== undefined
              ? new Date(donationData.bankRefDate)
              : "",
          collectedBy: donorReference,
          date: new Date(donationData.date),
          mode: donationData.mode,
          trust: donationData.trust,
          created: new Date(),
          type: type,
        })
        .then(async (res) => {
          //Update the total donation or commitment amount of the donor as per the type value
          if (type === "Donation") {
            await firestore
              .collection("donors")
              .doc(params.donorId)
              .update({
                totalDonation:
                  parseInt(totalDonation) + parseInt(donationData.amount),
              });
          } else {
            await firestore
              .collection("donors")
              .doc(params.donorId)
              .update({
                totalCommitment:
                  parseInt(totalCommitment) + parseInt(donationData.amount),
              });
          }

          //If the collected by other then update that other person's total collection
          if (
            donorRefOption === "otherDonor" &&
            donorReference !== params.donorId
          ) {
            //Get his total collection
            const donorRef = firestore.collection("donors").doc(donorReference);
            const donorRefDoc = await donorRef.get();
            if (donorRefDoc.exists) {
              let donorRefTotalCollection = donorRefDoc.data().totalCollection;
              let donorRefTotalCommitmentCollection = donorRefDoc.data()
                .totalCommitmentCollection;
              //Update the total collection
              if (type === "Donation") {
                await firestore
                  .collection("donors")
                  .doc(donorReference)
                  .update({
                    totalCollection:
                      parseInt(donorRefTotalCollection) +
                      parseInt(donationData.amount),
                  });
              } else {
                await firestore
                  .collection("donors")
                  .doc(donorReference)
                  .update({
                    totalCommitmentCollection:
                      parseInt(donorRefTotalCommitmentCollection) +
                      parseInt(donationData.amount),
                  });
              }
            } //end of if(donorRefDoc.exists)
          } //end of if(donorRefOption === 'otherDonor' && donorReference !== params.donorId)
          setisLoading(false);

          history.push(`/donordetails/${params.donorId}`); //Navigate back to donor details
        });
    } //End of if(canProcess)
  }; //End of acceptDonation
  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Accpet {type}</h2>
        </div>
      </div>
      <div className="card p-1">
        <form className={formClass} onSubmit={handleSubmit(acceptDonation)}>
          <label className="d-flex">
            <h4>Personal Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Donor Name:</label>
              <input
                type="text"
                className="form-control mr-2  p-2"
                id="fullName"
                name="fullName"
                {...register("fullName")}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">PAN:</label>
              <input
                type="input"
                className="form-control mr-2  p-2"
                {...register("pan")}
                readOnly
                name="pan"
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Email:</label>
              <input
                type="text"
                className="form-control mr-2  p-2"
                id="email"
                name="email"
                {...register("email")}
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Phone:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                name="phone"
                readOnly
                {...register("phone")}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Address:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Address Line1:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                id="addressLine1"
                name="addressLine1"
                readOnly
                {...register("addressLine1")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Address Line2:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                name="addressLine2"
                readOnly
                {...register("addressLine2")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">City:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                id="city"
                name="city"
                readOnly
                {...register("city")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Pin Code:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                name="pin"
                readOnly
                {...register("pin")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">State:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                id="state"
                name="state"
                readOnly
                {...register("state")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Country:</label>
              <input
                type="text"
                className="form-control mr-2 p-2"
                name="country"
                readOnly
                {...register("country")}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Donation Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="m-2">Amount:</label>
              <input
                type="number"
                className="form-control mr-2 p-2"
                name="amount"
                {...register("amount", {
                  required: `Please enter a ${type} amount`,
                  min: {
                    value: 1,
                    message: `Minimum ${type} amount should be more than zero`,
                  },
                  validate: {
                    cashValidation: (value) =>
                      donationMode === "Cash" ? value < 2001 : true,
                  },
                })}
              />
              {errors.amount?.type === "cashValidation" && (
                <p className="text-danger">
                  You cannot accept more than Rs 2000 as cash
                </p>
              )}
              <ErrorMessage
                errors={errors}
                name="amount"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col-md-4">
              <label className="m-2">{type} Date:</label>
              <input
                type="date"
                value={donationDate}
                className="form-control mr-2 p-2"
                name="date"
                {...register("date", {
                  required: `Please enter ${type} date.`,
                })}
                onChange={(e) => {
                  setDateError(false);
                  setDonationDate(e.target.value);
                }}
              />
              {dateError &&
                (type === "Donation" ? (
                  <p className="text-danger">
                    Donation cannot be acepted for future date.
                  </p>
                ) : (
                  <p className="text-danger">
                    Commitment cannot be taken of past date or today.
                  </p>
                ))}
              <ErrorMessage
                errors={errors}
                name="date"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col-md-4">
              <label className="m-2">Mode:</label>
              <br />
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="radio"
                    id="Cheque"
                    name="mode"
                    value="Cheque"
                    {...register("mode", {
                      required: `Please select ${type} mode.`,
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Cheque"}
                  />{" "}
                  <label htmlFor="Cheque">Cheque</label>
                  <br />
                  {type === "Donation" && (
                    <span>
                      <input
                        type="radio"
                        id="DD"
                        name="mode"
                        value="DD"
                        {...register("mode", {
                          required: `Please select ${type} mode.`,
                        })}
                        onChange={handleModeChange}
                        checked={donationMode === "DD"}
                      />{" "}
                      <label htmlFor="DD">DD</label>
                    </span>
                  )}
                </div>
                <div className="col-md-4">
                  {type === "Donation" && (
                    <span>
                      <input
                        type="radio"
                        id="NEFT"
                        name="mode"
                        value="NEFT"
                        {...register("mode", {
                          required: `Please select ${type} mode.`,
                        })}
                        onChange={handleModeChange}
                        checked={donationMode === "NEFT"}
                      />{" "}
                      <label htmlFor="NEFT">NEFT</label>
                      <br />
                    </span>
                  )}
                  <input
                    type="radio"
                    id="Cash"
                    name="mode"
                    value="Cash"
                    {...register("mode", {
                      required: `Please select ${type} mode.`,
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Cash"}
                  />{" "}
                  <label htmlFor="Cash">Cash</label>
                  <br />
                  <ErrorMessage
                    errors={errors}
                    name="mode"
                    render={({ message }) => (
                      <p className="text-danger">{message}</p>
                    )}
                  />
                </div>
                <div className="col-md-4">
                  {type === "Donation" && (
                    <span>
                      <input
                        type="radio"
                        id="UPI"
                        name="mode"
                        value="UPI"
                        {...register("mode", {
                          required: `Please select ${type} mode.`,
                        })}
                        onChange={handleModeChange}
                        checked={donationMode === "UPI"}
                      />{" "}
                      <label htmlFor="UPI">UPI</label>
                      <br />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {donationMode !== "Cash" && donationMode !== "Other" && (
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="m-2">Bank Name:</label>
                <input
                  type="text"
                  className="form-control mr-2 p-2"
                  id="bank"
                  name="bank"
                  {...register("bank", {
                    required: "Please enter bank name",
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="bank"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
              <div className="col-md-4">
                <label className="m-2">{donationMode} Reference:</label>
                <input
                  type="text"
                  className="form-control mr-2 p-2"
                  id="bankRef"
                  name="bankRef"
                  {...register("bankRef", {
                    required: `Please enter ${donationMode} reference.`,
                  })}
                />
                <ErrorMessage
                  errors={errors}
                  name="bankRef"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
              <div className="col-md-4">
                <label className="m-2">{donationMode} Date:</label>
                <input
                  type="date"
                  className="form-control mr-2 p-2"
                  id="bankRefDate"
                  name="bankRefDate"
                  {...register("bankRefDate", {
                    required: `Please enter ${donationMode} date`,
                    validate: {
                      validateBankRef: validBankRefDate,
                      isBankRefDateBeforeDonationDate: checkIfBankRefDateBeforeDonationDate,
                    },
                  })}
                />
                {errors.bankRefDate?.type === "validateBankRef" && (
                  <p className="text-danger">
                    {(donationMode === "Cheque" || donationMode === "DD") &&
                      `${donationMode} date cannot be 90 days before donation date`}
                  </p>
                )}
                {errors.bankRefDate?.type ===
                  "isBankRefDateBeforeDonationDate" && (
                  <p className="text-danger">
                    {type === "Donation"
                      ? `${donationMode} date cannot be after donation date`
                      : `${donationMode} date cannot be before commitment date`}
                  </p>
                )}
                <ErrorMessage
                  errors={errors}
                  name="bankRefDate"
                  render={({ message }) => (
                    <p className="text-danger">{message}</p>
                  )}
                />
              </div>
            </div>
          )}
          <label className="d-flex">
            <h4>Additional Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="m-2">To Trust:</label>
              <br></br>
              <input
                type="radio"
                id="SCSS"
                name="trust"
                value="SCSS"
                {...register("trust", {
                  required: `Please select the trust to which the ${type} is made.`,
                })}
              />{" "}
              <label htmlFor="SCSS">Sri Chaitanya Shikshan Sanstha</label>
              <br />
              <input
                type="radio"
                id="CREST"
                name="trust"
                value="CREST"
                {...register("trust", {
                  required: `Please select the trust to which the ${type} is made.`,
                })}
              />{" "}
              <label htmlFor="CREST">
                Chaitanya Research & Edcational Services Trust
              </label>{" "}
              <br />
              <ErrorMessage
                errors={errors}
                name="trust"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col-md-4">
              <label className="m-2">Collected By:</label>
              <br />
              <input
                type="radio"
                id="selfDonor"
                name="collectedBy"
                value="selfDonor"
                checked={donorRefOption === "selfDonor"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label for="selfDonor">Self</label>
              <br />
              <input
                type="radio"
                id="otherDonor"
                name="collectedBy"
                value="otherDonor"
                checked={donorRefOption === "otherDonor"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label for="otherDonor">Other</label>
            </div>
            <div className="col-md-4">
              {donorRefOption === "otherDonor" ? (
                <div>
                  <label className="m-2">
                    If collected by is "Other", please search the same here
                  </label>
                  <br />
                  <input
                    placeholder="Search Here"
                    name="searchRef"
                    value={donorRefSearchQuery}
                    onChange={(e) => setDonorRefSearchQuery(e.target.value)}
                  />
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={handleDonorRefSearch}
                  >
                    <AiReactIcon.AiOutlineSearch />
                    {/* <AiReactIcon.FaBars /> */}
                  </button>
                  <br />
                  {donorRefList && (
                    <DonorRefList
                      queryList={donorRefList}
                      updateDonorRefValue={updateDonorRefValue}
                    />
                  )}
                </div>
              ) : (
                ""
              )}
              {donorRefError && (
                <div className="text-danger">
                  Please select a reference for the {type}
                </div>
              )}
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary mr-2">
                Accept {type}
              </button>{" "}
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/donordetails/${params.donorId}`);
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
