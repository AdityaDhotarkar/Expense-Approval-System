import React,{memo, useState} from 'react';

export default memo(function BillDetails({
    expenseLineItems, 
    expenseBillDetails,
}){
    const [auditorApprovedAmount, setAuditorApprovedAmount] = useState("");
    const [auditorComment, setAuditorComment] = useState("");
    const [approverApprovedAmount, setApproverApprovedAmount] = useState("");
    const [approverComment, setApproverComment] = useState("");

    const billList = expenseBillDetails.map((bill) => {
        return (
            <>
                <tr key={bill.id}>
                    <td>{bill.expenseDate}</td>
                    <td>{bill.billNo}</td>
                    <td>{bill.amount}</td>
                    <td>{bill.vendor}</td>
                    <td>{bill.description}</td>
                    <td>{auditorApprovedAmount}</td>
                    <td>{auditorComment}</td>
                    <td>{approverApprovedAmount}</td>
                    <td>{approverComment}</td>
                    <td>{}</td>
                    <td>{}</td>
                </tr>
            </>
        )
    })
})