import React, { memo } from 'react'

export default memo(function CommitmentDetails({commitments}) {
    // const donationData = donations;

    const commitmentList = commitments.map(commitment => {
        return(
            <tr key={commitment.id}>
                <td>{commitment.amount}</td>
                <td>{commitment.targetDate}</td>

            </tr>
        );
    })
    return (
        <>
            {commitmentList}
        </>
    )
})
