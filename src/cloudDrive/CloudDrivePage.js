import React, {useState, useEffect} from 'react';
import { CloudDriveFileManager } from './CloudDriveFileManagerComponent';
import { Auth } from 'aws-amplify';

export default function CloudDrivePage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [userID, setUserID] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then((account) => {
        const accountRoles = account.signInUserSession.idToken.payload['cognito:groups'];
        if (accountRoles && accountRoles.includes('Admin')) {
          setIsAdmin(true);
        }
        if (account) {
          setUserID(account.username);
          setFirstName(account.attributes.given_name);
          setLastName(account.attributes.family_name);
        }
      });
  }, []);

  return userID && (
    <div>
      <header className="CloudDrive-header">
        {`${isAdmin ? "Admin Cloud Drive File Manager" : "Cloud Drive File Manager"}`}
      </header>
      <CloudDriveFileManager isAdmin={isAdmin} userID={userID} lastName={lastName} firstName={firstName}></CloudDriveFileManager>
    </div>
  );
}