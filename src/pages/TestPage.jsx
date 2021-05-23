import React, { memo } from 'react';
import { GetUserPrivilages } from '../firebase/UserPrivilageProvider';
// import { useSession } from '../firebase/UserProvider'

export default memo(function TestPage() {
    const privilages = GetUserPrivilages();
    return (
        <>
        {!!privilages && 
        <div>
            <div id="default">
                <h2 className="text-center text-blue pt-5">Test Page!</h2>
                <div className="text-center">
                    <div>Is Admin?: {privilages.isAdmin ? 'True' : 'False'}</div>
                    <div>Can Access FMS?: {privilages.canAccessFMS ? 'True' : 'False'}</div>
                    <div>Can Access DMS?: {privilages.canAccessDMS ? 'True' : 'False'}</div>
                    <div>Language: {privilages.language}</div>
                </div>
            </div>
        </div>}
        </>
    );
})
