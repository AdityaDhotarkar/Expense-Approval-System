import React, { memo, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { firestore } from "../firebase/config";
import { GetUserPrivilages } from "../firebase/UserPrivilageProvider";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

import DonationDetails from "./DonationDetails";
import { useSession } from "../firebase/UserProvider";

export default memo(function DonorDetails(props) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [donations, setDonations] = useState(null);
  const [country, setCountry] = React.useState(""); //Country of the donor
  const [state, setState] = React.useState(""); //State of the donor
  const [donorRef, setDonorRef] = useState(""); //State to hold the donor referece
  const [doesDonationExist, DonationExists] = useState(false); //state to hold if there is any donation
  const [doesCommitmentExist, CommitmentExists] = useState(false); //state to hold if there is any commitment
  const [donorDetails, setDonorDetails] = useState({
    fullName: "",
    pan: "",
    email: "",
    phone: "",
    address: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      pin: "",
      state: "",
      country: "",
    },
  });
  const { user } = useSession();

  const privilages = GetUserPrivilages();
  const params = useParams();

  useEffect(async () => {
    const donorId = params.donorId;

    const docRef = firestore.collection("donors").doc(donorId);
    docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();

        let donorReference = "";
        setDonorRef(
          data.reference !== "" || data.reference !== undefined
            ? data.reference
            : ""
        );
        donorReference = data.reference;
        setValue("fullName", data.fullName);
        setValue("pan", data.pan);
        setValue("spiritualName", data.spiritualName);

        setValue("dob", data.dob !== undefined ? data.dob.toDate() : "");
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
        setState(
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

        setCountry(
          data.address !== "" && data.address !== undefined
            ? data.address.country
            : ""
        );
        setValue("totalDonation", data.totalDonation);
        setValue("totalCommitment", data.totalCommitment);

        setValue("totalCollection", data.totalCollection);
        setValue("reference", data.reference);
        setValue("totalCommitmentCollection", data.totalCommitmentCollection);
        //Update Donor Details in the context provider
        setDonorDetails({
          id: donorId,
          fullName: data.fullName,
          pan: data.pan,
          email: data.email,
          phone: data.phone,
          address: {
            addressLine1:
              data.address !== "" && data.address !== undefined
                ? data.address.addressLine1
                : "",
            addressLine2:
              data.address !== "" && data.address !== undefined
                ? data.address.addressLine2
                : "",
            city:
              data.address !== "" && data.address !== undefined
                ? data.address.city
                : "",
            pin:
              data.address !== "" && data.address !== undefined
                ? data.address.pin
                : "",
            state:
              data.address !== "" && data.address !== undefined
                ? data.address.state
                : "",
            country:
              data.address !== "" && data.address !== undefined
                ? data.address.country
                : "",
          },
          totalCollection: data.totalCollection,
          totalCommitment: data.totalCommitment,
          totalCommitmentCollection: data.totalCommitmentCollection,
          totalDonation: data.totalDonation,
        });

        //Get Donor Reference name

        if (
          donorReference !== "Self" &&
          donorReference !== "" &&
          donorReference !== null
        ) {
          firestore
            .collection("donors")
            .doc(donorReference)
            .onSnapshot((snapshot) => {
              if (snapshot.exists) {
                let refFullName = snapshot.data().fullName;
                setDonorRef(refFullName);
              }
            }); //End of await firestore.collection('donors').
        }
      } //End of if(snapshot.exists)
    }); //End of const docRef ...

    //Get donations
    await docRef
      .collection("donations")
      .orderBy("date")
      .onSnapshot((snapshot) => {
        if (!snapshot.empty) {
          let donationDataArray = [];
          snapshot.docs.map((donation) => {
            const donationData = donation.data();
            //Check the type of donation and set the type accordingly

            let bankRefDate = new Date(
              donationData.bankRefDate * 1000
            ).toString();

            donationDataArray.push({
              id: donation.id,
              amount: donationData.amount,
              bank: donationData.bank,
              bankRef: donationData.bankRef,
              bankRefDate:
                donationData.bankRefDate !== "" &&
                donationData.bankRefDate !== undefined
                  ? donationData.bankRefDate.toDate().toString()
                  : "",
              collectedBy: donationData.collectedBy,
              date:
                donationData.date !== "" && donationData.date !== undefined
                  ? donationData.date.toDate().toString()
                  : "",
              trust: donationData.trust,
              mode: donationData.mode,
              type: donationData.type,
            }); //End of donationDataArray.push

            //Check if type is a donation, if yes set doesDonationExist to true
            //else set doesCommitment to true
            donationData.type === "Donation"
              ? DonationExists(true)
              : CommitmentExists(true);
          }); //End of snapshot.docs.map
          setDonations(donationDataArray);
        }
      }); //end of await docRef.collection('donations').onSnapshot(snapshot => {
  }, []); //End of useEffect

  /*Function to updte the donor details */
  const updateDonorDetails = async (donorData) => {
    await firestore
      .collection("donors")
      .doc(params.donorId)
      .update({
        fullName: donorData.fullName.toUpperCase(),
        spiritualName: donorData.spiritualName.toUpperCase(),
        email: donorData.email.toUpperCase(),
        phone: donorData.phone,
        address: {
          addressLine1: donorData.addressLine1.toUpperCase(),
          addressLine2: donorData.addressLine2.toUpperCase(),
          city: donorData.city.toUpperCase(),
          pin: donorData.pin,
          state: state,
          country: country,
        },
        updatedBy: user.email,
        updatedAt: new Date(),
      })
      .then(() => {
        alert("Update successful");
      }); //End of update
  }; //End of updateDonorDetails

  return (
    <div style={{ position: "inherit" }}>
      <div className="card p-1 mb-1">
        <div className="justify-content-center d-flex">
          <h2>Donor Details</h2>
        </div>
      </div>
      <div className="card p-1">
        <form className="" onSubmit={handleSubmit(updateDonorDetails)}>
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
                className="form-control p-2"
                id="fullName"
                name="fullName"
                {...register("fullName", {
                  required: "Please enter donor name",
                  minLength: {
                    value: 3,
                    message: "Please enter at least 3 characters for name",
                  },
                })}
                {...(privilages.canUpdateDonor ? "" : "readOnly")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">PAN:</label>
              <input
                type="input"
                className="form-control p-2"
                readOnly
                name="pan"
                {...register("pan")}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Spiritual Name:</label>
              <input
                type="text"
                className="form-control p-2"
                id="dob"
                name="spiritualName"
                {...register("spiritualName", {
                  pattern: {
                    value: /\D/,
                    message: "Please enter a only characters",
                  },
                })}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Date of Birth:</label>
              <input
                type="date-time"
                className="form-control p-2"
                readOnly
                name="dob"
                {...register("dob")}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4 className="p-2">Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Email:</label>
              <input
                type="email"
                className="form-control p-2"
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
                className="form-control p-2"
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
                type="text"
                placeholder="Please enter address line 1 here"
                className="form-control p-2"
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
                className="form-control p-2"
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
                className="form-control p-2"
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
                type="number"
                placeholder="Please enter pin code here"
                className="form-control p-2"
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
                className="form-control p-2"
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
                className="form-control p-2"
              />
            </div>
          </div>

          <label className="d-flex">
            <h4 className="p-2">Total Donations:</h4>
          </label>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Total Individual Donation:</label>
              <input
                type="text"
                className="form-control p-2"
                id="totalDonation"
                name="totalDonation"
                readOnly
                {...register("totalDonation")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Total Individual Commitment:</label>
              <input
                type="text"
                className="form-control p-2"
                readOnly
                name="totalCommitment"
                {...register("totalCommitment")}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label className="m-2">Total Commitment from Others:</label>
              <input
                type="text"
                className="form-control p-2"
                readOnly
                name="totalCommitmentCollection"
                {...register("totalCommitmentCollection")}
              />
            </div>
            <div className="col-md-6">
              <label className="m-2">Total Collection from Others:</label>
              <input
                type="text"
                className="form-control p-2"
                id="totalCollection"
                name="totalCollection"
                readOnly
                {...register("totalCollection")}
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Reference:</label>

              <div>{donorRef}</div>
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary">
                Update Details
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-3">
        <div className="justify-content-center d-flex">
          <h2>Donation Details</h2>
        </div>
        <div className="justify-content-center d-flex">
          <Link to={`/acceptdonation/Donation/${params.donorId}`}>
            Accept New Donation
          </Link>
          {/* <button className="btn btn-link ">Accept New Donation</button> */}
        </div>
        {doesDonationExist && donations ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Donation Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Bank Reference</th>
                  <th>Bank Refence Date</th>
                  <th>Collected by</th>
                  <th>To Trust</th>
                  <th>Mode</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                <DonationDetails
                  donations={donations}
                  donorDetails={donorDetails}
                  donationType="Donation"
                />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="justify-content-center d-flex">
            <h3>No donations</h3>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="justify-content-center d-flex">
          <h2>Commitment Details</h2>
        </div>
        <div className="justify-content-center d-flex">
          <Link to={`/acceptdonation/Commitment/${params.donorId}`}>
            Accept New Commitments
          </Link>
          {/* <button className="btn btn-link ">Accept New Donation</button> */}
        </div>
        {doesCommitmentExist && donations ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Commitment Date</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Bank Reference</th>
                  <th>Bank Refence Date</th>
                  <th>Collected by</th>
                  <th>To Trust</th>
                  <th>Mode</th>
                  <th>Action</th>
                </tr>
              </thead>
              {/* <tbody>
                <CommitmentDetails commitments={commitments} />
              </tbody> */}
              <tbody>
                <DonationDetails
                  donations={donations}
                  donorDetails={donorDetails}
                  donationType="Commitment"
                />
              </tbody>
            </table>
          </div>
        ) : (
          <div className="justify-content-center d-flex">
            <h3>No commitments</h3>
          </div>
        )}
      </div>
    </div>
  );
});
