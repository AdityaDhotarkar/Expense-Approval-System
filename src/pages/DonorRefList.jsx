import React from "react";

function DonorRefList(props) {
  const donorRefQueryList = props.queryList;

  const donorRefList = donorRefQueryList.map((donorRef) => {
    return (
      <>
        <div className="list-group-item d-flex list-group-item-info">
          <button
            className="btn btn-link"
            onClick={(e) => {
              e.preventDefault();
              props.updateDonorRefValue(donorRef.donorId, donorRef.fullName);
            }}
            key={donorRef.donorId}
          >
            {donorRef.fullName}
          </button>
        </div>
      </>
    );
  });

  return <div>{donorRefList}</div>;
}

export default DonorRefList;
