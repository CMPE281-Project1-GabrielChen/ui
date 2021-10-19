import React from 'react';
import { CloudDriveFileManager } from './CloudDriveFileManagerComponent';

export default function CloudDrivePage() {
    return (
        <div>
            <header className="CloudDrive-header">Cloud Drive File Manager</header>
            <CloudDriveFileManager userID="hotstuffdigitty"></CloudDriveFileManager>
        </div>
    );
}