import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import {
  CountryDropdown,
  RegionDropdown,
  CountryRegionData,
} from "react-country-region-selector";
import { firestore } from "../firebase/config";
import * as AiReactIcon from "react-icons/ai";
import DonorRefList from "./DonorRefList";
import { useSession } from "../firebase/UserProvider";

function AddANewDonor() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [country, setCountry] = React.useState("");
  const [state, setState] = React.useState("");
  const [donorRefOption, setDonorRefOption] = useState("Self");
  const [donorRefSearchQuery, setDonorRefSearchQuery] = useState(""); //To store the query string of other donor ref
  const [donorRefError, setDonorRefError] = useState(false);
  const [donorRefList, setDonorRefList] = useState(null); //To store the result of donor ref search
  const [donorRef, setDonorRef] = useState("Self"); //Store donor ref's id
  const [panError, setPanError] = useState(false); //pan error for uniquenes
  const [isLoading, setisLoading] = useState(false);
  const history = useHistory();
  const { user } = useSession();
  /*
  
   */
  const addDonorDetails = async (donorData) => {
    /*
    Check if Donor Ref is Other and donorRef ==  null
    if yes then throw error
    else check if there is any record with PAN no
    if yes, then show error saying the donor with provided PAN exists
    else, save the record to database
     */
    setisLoading(true);

    //If donor reference is selected as 'Other' but no referece is selected, then show error
    donorRef === null ? setDonorRefError(true) : setDonorRefError(false);

    //Check if the pan provided is unique or not
    let sPan = donorData.pan.toUpperCase();

    const panQuery = firestore.collection(`donors`).where("pan", "==", sPan);
    const snapshot = await panQuery
      .get({ source: "server" })
      .then(async (QuerySnapshot) => {
        //If there is no donor with PAN then add a new donor
        //else throw error that donor with pan exists
        if (QuerySnapshot.empty) {
          //add the new donor

          await firestore
            .collection("donors")
            .add({
              fullName: donorData.fullName.toUpperCase(),
              pan: sPan,
              phone: donorData.phone,
              spiritualName: donorData.spiritualName.toUpperCase(),
              email: donorData.email.toUpperCase(),
              dob: new Date(donorData.dob),
              address: {
                addressLine1: donorData.addressLine1.toUpperCase(),
                addressLine2: donorData.addressLine2.toUpperCase(),
                city: donorData.city.toUpperCase(),
                pin: donorData.pin,
                state: state,
                country: country,
              },
              totalCollection: 0,
              totalCommitment: 0,
              totalCommitmentCollection: 0,
              totalDonation: 0,
              reference: donorRef,
              updatedBy: user.email,
              updatedAt: new Date(),
              createdBy: user.email,
              createdAt: new Date(),
            })
            .then((docRef) => {
              //Id donor record is addded successfully then
              //show the success message and
              //navigate the user to the new donor record
              alert("The record has been added successfully");
              setisLoading(false);
              history.push(`/donordetails/${docRef.id}`);
            });
        } else {
          //throw error as Pan exists
          setPanError(true);
        }
      });
    setisLoading(false);
  }; //End of addDonorDetails

  /*
  This function is called from DonorRefList sub components
  It sets the ref id of the selected reference
   */
  const updateDonorRefValue = (donorRefId, donorRefFullName) => {
    setDonorRef(donorRefId);
    setDonorRefList(null);

    setDonorRefSearchQuery(donorRefFullName);
  };

  /*
  Handles Donor Reference radio button click.
  sets the value of selected option of Donor Reference to 'donorRefOption' state
   */
  const handleCollectedByOptions = (e) => {
    // donorRefList !== null ? setDonorRefList(null) : "";
    if (donorRefList !== null) setDonorRefList(null);
    setDonorRefSearchQuery("");
    e.target.value === "Self" ? setDonorRef("Self") : setDonorRef(null);
    // donorRefError === true ? setDonorRefError(false) : " ";
    setDonorRefOption(e.target.value);

    //If error message is displayed and the Donor Reference option changes, hide the error message
    if (donorRefError) setDonorRefError(false);
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
    const snapshot = await query.get().then((querySnapshot) => {
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

  /*Function to update the pan error */
  const panChanged = (val) => {
    if (panError) setPanError(false);
  };
  /*
The function returns true if the date passed through value is less than 18 years 
as of today */
  const checkDate = (value) => {
    //If date value is before 18 years, then return true

    let dValue = new Date(value);
    let eighteenYearsAgo = new Date();
    eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18); //Get date 18 years ago

    if (dValue.getTime() <= eighteenYearsAgo.getTime()) {
      return true;
    } else {
      return false;
    }
  }; //End of checkDate
  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card p-1 mb-1">
        <div className="justify-content-center d-flex">
          <h2>Add a New Donor</h2>
        </div>
      </div>
      <div className="card p-1">
        <form className={formClass} onSubmit={handleSubmit(addDonorDetails)}>
          <label className="d-flex">
            <p className="text-danger">Fields marked * are mandatory</p>
          </label>
          <label className="d-flex">
            <h4 className="p-2">Personal Details:</h4>
          </label>
          <div className="row">
            <div className="col-md-6">
              <label className="m-2">
                Donor Name:<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Please enter donor legal name here"
                className="form-control ml-2"
                id="fullName"
                name="fullName"
                {...register("fullName", {
                  required: "Please enter donor name",
                  minLength: {
                    value: 3,
                    message: "Please enter at least 3 characters for name",
                  },
                })}
              />
              {errors.fullName?.message && (
                <p className="text-danger">{errors.fullName?.message}</p>
              )}
            </div>
            <div className="col-md-6">
              <label className="m-2">
                PAN:<span className="text-danger">*</span>
              </label>
              <input
                placeholder="Please enter PAN in capital letter"
                type="input"
                className="form-control ml-2"
                name="pan"
                {...register("pan", {
                  required: "Please enter PAN of the donor",
                  pattern: {
                    value: /[A-Z]{5}[0-9]{4}[A-Z]{1}/g,
                    message:
                      "Please enter a valid PAN number in capital letters",
                  },
                  maxLength: {
                    value: 10,
                    message: "PAN cannot be more than 10 characters",
                  },
                })}
                onChange={(val) => panChanged(val)}
              />
              {errors.pan?.message && (
                <p className="text-danger">{errors.pan?.message}</p>
              )}
              {panError && (
                <p className="text-danger">
                  The PAN entered is already used. Please use unique PAN or
                  search for the donor.
                </p>
              )}
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Spiritual Name:</label>
              <input
                type="text"
                placeholder="Please enter spiritual name here"
                className="form-control ml-2"
                id="dob"
                name="spiritualName"
                {...register("spiritualName", {
                  pattern: {
                    value: /\D/,
                    message: "Please enter a only characters",
                  },
                })}
              />
              {errors.spiritualName?.message && (
                <p className="text-danger">{errors.spiritualName?.message}</p>
              )}
            </div>
            <div className="col-md-6">
              <label className="m-2">
                Date of Birth:<span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control ml-2"
                name="dob"
                {...register("dob", {
                  required: "Please enter date of birth",
                  validate: { validDate: (value) => checkDate(value) },
                })}
              />
              {errors.dob?.message && (
                <p className="text-danger">{errors.dob?.message}</p>
              )}
              {errors.dob?.type === "validDate" && (
                <p className="text-danger">
                  The donor should be at least 18 years old
                </p>
              )}
            </div>
          </div>
          <label className="d-flex">
            <h4 className="p-2">Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Email:</label>
              <input
                placeholder="Please enter email here"
                type="email"
                className="form-control ml-2"
                id="email"
                name="email"
                {...register("email")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Phone:</label>
              <input
                placeholder="Please enter phone number in 3-3-4 format"
                type="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                className="form-control ml-2"
                name="phone"
                {...register("phone")}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4 className="p-2">Address:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">
                Address Line1:<span className="text-danger">*</span>
              </label>
              <input
                placeholder="Please enter address line 1 here"
                type="text"
                className="form-control ml-2"
                id="addressLine1"
                name="addressLine1"
                {...register("addressLine1", {
                  required: "Please enter address line 1",
                  minLength: {
                    value: 4,
                    message:
                      "The address line 1 should have at least 4 characers",
                  },
                })}
              />
              {errors.addressLine1?.message && (
                <p className="text-danger">{errors.addressLine1?.message}</p>
              )}
            </div>
            <div className="col-md-6">
              <label className="m-2">
                Address Line2:<span className="text-danger">*</span>
              </label>
              <input
                placeholder="Please enter address line 2 here"
                type="text"
                className="form-control ml-2"
                name="addressLine2"
                {...register("addressLine2", {
                  required: "Please enter address line 2",
                  minLength: {
                    value: 4,
                    message:
                      "The address line 2 should have at least 4 characers",
                  },
                })}
              />
              {errors.addressLine2?.message && (
                <p className="text-danger">{errors.addressLine2?.message}</p>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">
                City:<span className="text-danger">*</span>
              </label>
              <input
                placeholder="Please enter city here"
                type="text"
                className="form-control ml-2"
                id="city"
                name="city"
                {...register("city", {
                  required: "Please enter city",
                })}
              />
              {errors.city?.message && (
                <p className="text-danger">{errors.city?.message}</p>
              )}
            </div>
            <div className="col-md-6">
              <label className="m-2">
                Pin Code:<span className="text-danger">*</span>
              </label>
              <input
                placeholder="Please enter pin code here"
                type="number"
                className="form-control ml-2"
                name="pin"
                {...register("pin", {
                  required: "Please enter Pin code",
                  minLength: {
                    value: 6,
                    message: "Pin code should be at least 6 digits",
                  },
                  maxLength: {
                    value: 6,
                    message: "Pin code should not be more than 6 digits",
                  },
                })}
              />
              {errors.pin?.message && (
                <p className="text-danger">{errors.pin?.message}</p>
              )}
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">
                Country:<span className="text-danger">*</span>
              </label>
              <br />
              <CountryDropdown
                defaultOptionLabel="Select a country"
                value={country}
                required
                onChange={(val) => setCountry(val)}
                className="form-control ml-2 mr-4"
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">
                State:<span className="text-danger">*</span>
              </label>
              <br />
              <RegionDropdown
                country={country}
                required
                blankOptionLabel="No country selected"
                defaultOptionLabel="Now select a state/region"
                value={state}
                onChange={(val) => setState(val)}
                className="form-control ml-2"
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">
                Donor Reference:<span className="text-danger">*</span>
              </label>
              <br />
              <input
                type="radio"
                id="selfDonor"
                name="collectedBy"
                value="Self"
                checked={donorRefOption === "Self"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="selfDonor">Self</label>
              <br />
              <input
                type="radio"
                id="otherDonor"
                name="collectedBy"
                value="otherDonor"
                checked={donorRefOption === "otherDonor"}
                onChange={handleCollectedByOptions}
              />{" "}
              <label htmlFor="otherDonor">Other</label>
            </div>
            <div className="col">
              {donorRefOption === "otherDonor" ? (
                <div>
                  <label className="m-2">
                    If donor reference is "Other", please search the same here
                  </label>
                  <br />
                  <div className="input-group input-group-lg">
                    <input
                      placeholder="Search Here"
                      className="form-control"
                      name="searchRef"
                      value={donorRefSearchQuery}
                      onChange={(e) => setDonorRefSearchQuery(e.target.value)}
                    />
                    <div className="input-group-append">
                      <button
                        className="btn btn-outline"
                        type="button"
                        onClick={handleDonorRefSearch}
                      >
                        <AiReactIcon.AiOutlineSearch />
                      </button>
                    </div>
                  </div>
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
                  Please select a reference for the donor
                </div>
              )}
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button
                type="button"
                className="btn btn-secondary ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  history.push(`/`);
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
}

export default AddANewDonor;
