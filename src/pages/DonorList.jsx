import React, { memo } from "react";
import { Link } from "react-router-dom";

export default memo(function DonorList({ queryResult, entity }) {
  const donorList = queryResult.map((donor) => {
    return (
      <div
        className="list-group-item d-flex list-group-item-info"
        key={entity === "donor" ? donor.donorId : donor.userId}
      >
        {entity === "donor" ? (
          <>
            <section className="btn-group align-self-center pr-1" role="group">
              <Link className="" to={`/donordetails/${donor.donorId}`}>
                {" "}
                {donor.fullName}
              </Link>
            </section>{" "}
            <section className="btn-group align-self-center pl-1" role="group">
              {donor.pan}
            </section>
          </>
        ) : (
          <>
            <section className="btn-group align-self-center pr-1" role="group">
              <Link className="" to={`/userdetails/${donor.userId}`}>
                {" "}
                {donor.name}
              </Link>
            </section>{" "}
            <section className="btn-group align-self-center pl-1" role="group">
              {donor.email}
            </section>
          </>
        )}
      </div>
    );
  });
  return <div>{donorList}</div>;
});
