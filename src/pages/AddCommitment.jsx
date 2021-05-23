import React, { memo, useState } from "react";

export default memo(function AddCommitment() {
  const { register, setValue, errors, handleSubmit } = useForm();
  const privilages = GetUserPrivilages;
  const params = useParams();
  const history = useHistory();

  const [donorRef, setDonorRef] = useState(""); //Store donor ref's id
  const [isLoading, setisLoading] = useState(false);
  const [totalDonation, setTotalDonation] = useState(0); //Total Donation
  const [totalCommitment, setTotalCommitment] = useState(0);
  const [donorRefSearchQuery, setDonorRefSearchQuery] = useState(""); //To store the query string of other donor ref
  const [donorRefList, setDonorRefList] = useState(null); //To store the result of donor ref search
  const [donorRefOption, setDonorRefOption] = useState("selfDonor");
  const [donorRefError, setDonorRefError] = useState(false);
  const [donationMode, setDonationMode] = useState("Cheque");

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
    setDonorRefError(false);

    const query = firestore
      .collection(`donors`)
      .where("fullName", ">=", donorRefSearchQuery)
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
    const docRef = firestore.collection("donors").doc(donorId);
    docRef.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        const data = snapshot.data();
        // setDonorRef(data.reference);
        // setTotalDonation((data.totalDonation !== '' && data.totalDonation !== undefined )? data.totalDonation : 0);
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

  const acceptDonation = async (donationData) => {
    //If the donor ref is self
    let donorReference = "";
    //The other option is selected but ref is not selected yet
    if (donorRefOption === "otherDonor" && donorRef === "") {
      setDonorRefError(true);
      // donorReference = params.donorId;
    } else {
      if (donorRefOption === "otherDonor") {
        //If donor ref is other and selected a valid donor
        donorReference = donorRef;
      } else if (donorRefOption === "selfDonor")
        //If donor ref is self, set his id as ref
        donorReference = params.donorId;
      setisLoading(true);
      await firestore
        .collection("donors")
        .doc(params.donorId)
        .collection("donations")
        .add({
          amount: donationData.amount,
          bank: donationData.bank !== undefined ? donationData.bank : "",
          bankRef: donationData.bankRef !== undefined ? donationData.bank : "",
          bankRefDate:
            donationData.bankRefDate !== undefined
              ? new Date(donationData.bankRefDate)
              : "",
          collectedBy: donorReference,
          date: new Date(donationData.date),
          mode: donationData.mode,
          trust: donationData.trust,
          created: new Date(),
        })
        .then(async (res) => {
          //Update the total donation amount of the donor
          await firestore
            .collection("donors")
            .doc(params.donorId)
            .update({
              totalDonation:
                parseInt(totalDonation) + parseInt(donationData.amount),
            });

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
              //Update the total collection
              await firestore
                .collection("donors")
                .doc(donorReference)
                .update({
                  totalCollection:
                    parseInt(donorRefTotalCollection) +
                    parseInt(donationData.amount),
                });
            } //end of if(donorRefDoc.exists)
          } //end of if(donorRefOption === 'otherDonor' && donorReference !== params.donorId)
          setisLoading(false);

          history.push(`/donordetails/${params.donorId}`); //Navigate back to donor details
        });
    } //End of else if(donorRefOption === 'selfDonor')
  }; //End of acceptDonation
  const formClass = `${isLoading ? "ui form loading" : ""}`;
  return (
    <div>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Accpet Commitment</h2>
        </div>
        <form className={formClass} onSubmit={handleSubmit(acceptDonation)}>
          <label className="d-flex">
            <h4>Personal Details:</h4>
          </label>
          <div className="row">
            <div className="col">
              <label className="m-2">Donor Name:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="fullName"
                name="fullName"
                ref={register()}
                readOnly
              />
            </div>
            <div className="col">
              <label className="m-2">PAN:</label>
              <input
                type="input"
                className="form-control mr-2  p-2"
                ref={register()}
                readOnly
                name="pan"
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Communication Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Email:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="email"
                name="email"
                ref={register()}
                readOnly
              />
            </div>
            <div className="col">
              <label className="m-2">Phone:</label>
              <input
                type="text"
                className="form-control p-2"
                name="phone"
                readOnly
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Address:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Address Line1:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="addressLine1"
                name="addressLine1"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Address Line2:</label>
              <input
                type="text"
                className="form-control p-2"
                name="addressLine2"
                readOnly
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="m-2">City:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="city"
                name="city"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Pin Code:</label>
              <input
                type="text"
                className="form-control p-2"
                name="pin"
                readOnly
                ref={register()}
              />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="m-2">State:</label>
              <input
                type="text"
                className="form-control ml-2"
                id="state"
                name="state"
                readOnly
                ref={register()}
              />
            </div>
            <div className="col">
              <label className="m-2">Country:</label>
              <input
                type="text"
                className="form-control p-2"
                name="country"
                readOnly
                ref={register()}
              />
            </div>
          </div>
          <label className="d-flex">
            <h4>Commitment Details:</h4>
          </label>
          <div className="row mb-3">
            <div className="col">
              <label className="m-2">Amount:</label>
              <input
                type="number"
                className="form-control p-2"
                name="amount"
                ref={register({
                  required: "Please enter a Commitment amount",
                  min: {
                    value: 1,
                    message:
                      "Minimum Commitment amount should be more than zero",
                  },
                })}
              />

              <ErrorMessage
                errors={errors}
                name="amount"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col">
              <label className="m-2">Commitment Date:</label>
              <input
                type="date"
                className="form-control p-2"
                name="date"
                ref={register({
                  required: "Please enter commitment date.",
                })}
              />
              <ErrorMessage
                errors={errors}
                name="date"
                render={({ message }) => (
                  <p className="text-danger">{message}</p>
                )}
              />
            </div>
            <div className="col">
              <label className="m-2">Mode:</label>
              <br />
              <div className="row">
                <div className="col">
                  <input
                    type="radio"
                    id="Cheque"
                    name="mode"
                    value="Cheque"
                    ref={register({
                      required: "Please select donation mode.",
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Cheque"}
                  />{" "}
                  <label for="Cheque">Cheque</label>
                  <br />
                  <input
                    type="radio"
                    id="DD"
                    name="mode"
                    value="DD"
                    ref={register({
                      required: "Please select donation mode.",
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "DD"}
                  />{" "}
                  <label for="DD">DD</label>
                </div>
                <div className="col">
                  <input
                    type="radio"
                    id="NEFT"
                    name="mode"
                    value="NEFT"
                    ref={register({
                      required: "Please select donation mode",
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "NEFT"}
                  />{" "}
                  <label for="NEFT">NEFT</label>
                  <br />
                  <input
                    type="radio"
                    id="Other"
                    name="mode"
                    value="Other"
                    ref={register({
                      required: "Please select donation mode",
                    })}
                    onChange={handleModeChange}
                    checked={donationMode === "Other"}
                  />{" "}
                  <label for="Other">Other</label>
                  <br />
                  <ErrorMessage
                    errors={errors}
                    name="mode"
                    render={({ message }) => (
                      <p className="text-danger">{message}</p>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          {donationMode !== "Other" && (
            <div className="row mb-3">
              <div className="col">
                <label className="m-2">Bank Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="bank"
                  name="bank"
                  ref={register({
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
              <div className="col">
                <label className="m-2">{donationMode} Reference:</label>
                <input
                  type="text"
                  className="form-control ml-2"
                  id="bankRef"
                  name="bankRef"
                  ref={register({
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
              <div className="col">
                <label className="m-2">{donationMode} Date:</label>
                <input
                  type="date"
                  className="form-control ml-2"
                  id="bankRefDate"
                  name="bankRefDate"
                  ref={register({
                    required: `Please enter ${donationMode} date`,
                  })}
                />
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
            <div className="col">
              <label className="m-2">To Trust:</label>
              <br></br>
              <input
                type="radio"
                id="SCSS"
                name="trust"
                value="SCSS"
                ref={register({
                  required:
                    "Please select the trust to which the donation is made.",
                })}
              />{" "}
              <label for="SCSS">Sri Chaitanya Shikshan Sanstha</label>
              <br />
              <input
                type="radio"
                id="CREST"
                name="trust"
                value="CREST"
                ref={register({
                  required:
                    "Please select the trust to which the donation is made.",
                })}
              />{" "}
              <label for="CREST">
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
            <div className="col">
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
            <div className="col">
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
                    <AiOutlineSearch />
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
                  Please select a reference for the commitment
                </div>
              )}
            </div>
          </div>
          <div className="row mb-3 ">
            <div className="col justify-content-center d-flex">
              <button type="submit" className="btn btn-primary mr-2">
                Accept Commitment
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
