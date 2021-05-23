import React, { memo, useState } from "react";
import { firestore } from "../firebase/config";
import DonorList from "./DonorList";
// import DonorList from './DonorList';

export default memo(function SearchDonor() {
  const [pan, setPan] = useState(""); //State to store the pan to be searched
  const [queryResult, setQueryResult] = useState(null); //State to store the search result
  const [isPanEntered, PanEntered] = useState(true);
  return (
    <div>
      <div className="card">
        <div className="justify-content-center d-flex">
          <h2>Search Donor</h2>
        </div>
      </div>
      <div className="row justify-content-center d-flex">
        <form
          className="form-inline "
          onSubmit={async (e) => {
            e.preventDefault();
            setQueryResult(null);
            if (pan !== null && pan !== "") {
              const query = firestore
                .collection(`donors`)
                .where("pan", ">=", pan);
              await query.get({ source: "server" }).then((QuerySnapshot) => {
                let donorList = [];
                QuerySnapshot.forEach((donor) => {
                  donorList.push({
                    donorId: donor.id,
                    fullName: donor.data().fullName,
                    pan: donor.data().pan,
                  });
                }); //End of QuerySnapshot.forEach
                setQueryResult(donorList);
                setPan("");
              });
            } //End of if (pan !== null && pan !== "")
            else {
              PanEntered(false);
            }
          }}
        >
          <label className="ml-2">PAN No:</label>
          <input
            type="text"
            className="form-control m-2"
            id="pan"
            placeholder="Enter PAN"
            name="pan"
            value={pan}
            onChange={(e) => {
              setPan(e.target.value.toUpperCase());
              PanEntered(true);
            }}
          />

          <button type="submit" className="btn btn-primary m-2">
            Search
          </button>
        </form>
      </div>
      <div
        className="card border-top-0 rounded-0"
        style={{ position: "inherit" }}
      >
        <div className="card-body py-2 justify-content-center d-flex">
          <div className="card-title font-weight-bold m-0">Result</div>
        </div>
      </div>

      <div
        className="card border-top-0 rounded-0"
        style={{ position: "inherit" }}
      >
        <div className="card-body py-2 justify-content-center d-flex">
          <div className="card-title font-weight-bold m-0">
            {queryResult != null && (
              <>
                Query Results here..
                {queryResult.length > 0 ? (
                  <DonorList queryResult={queryResult} entity="donor" />
                ) : (
                  <div>No donor found</div>
                )}
              </>
            )}
            {!isPanEntered ? <div>Please enter a search criteria</div> : ""}
          </div>
        </div>
      </div>
    </div>
  );
});
