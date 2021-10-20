import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import * as Config from '../helpers/config';

const BaseURL = Config.API_BASE_URL;
const fileManagementAPI = axios.create({
    baseURL: BaseURL
});

function PatchFile(fileIDs, fileRef) {
  const fileID = fileIDs.fileID;
  const userID = fileIDs.userID;
  const fileName = fileRef.current.files[0].name
  const file = fileRef.current.files[0]
  fileManagementAPI.patch(`/${userID}/${fileID}`, {FileName: fileName})
    .then((response) => {
      const postURL = response.data.PostURL;
      const formData = new FormData();
      formData.append('key', fileID);
      formData.append('file', file);

      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }

      return fileManagementAPI.post(postURL, formData, config);
    })
    .then(() => {
      window.location.reload(false);
    });
}

function GetFile(userID, fileID) {
  const link = document.createElement('a')
  link.href = `${BaseURL}/${userID}/${fileID}`
  document.body.appendChild(link)
  link.click();
}

function PostFile(userID, lastName, firstName, fileRef) {
  const fileName = fileRef.current.files[0].name
  const file = fileRef.current.files[0]
  fileManagementAPI.post(`/${userID}`, { FileName: fileName, LastName: lastName, FirstName: firstName })
    .then((response) => {
      const fileID  = response.data.FileID
      const uploadURL = response.data.UploadURL
      // console.log(response.data.FileID);
      const formData = new FormData();
      formData.append('key', fileID);
      formData.append('file', file);
      
      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      }

      return fileManagementAPI.post(uploadURL, formData, config);
    }).catch((error) => {
      console.log(error);
    }).then(() => {
      window.location.reload();
    });
}

function DeleteFile(userID, fileID) { 
  fileManagementAPI.delete(`/${userID}/${fileID}`)
    .then((response) => {
      return fileManagementAPI.delete(response.data.DeleteURL);
    })
    .then(() => {
      window.location.reload();
    });
}

function CloudDriveFileManager({ userID, isAdmin, lastName, firstName }) {
  const [files, setFiles] = useState([]);
  const [updateFilePopup, setUpdateFile] = useState(false);
  const [fileToUpdate, setFileToUpdate] = useState({});
  const fileRef = useRef(null);

  useEffect(() => {
    fileManagementAPI.get(`/${isAdmin ? '': userID}`)
      .then(function (response) {
        console.log(response.data);
        setFiles(response.data);
      })
      .catch(function (error) {
        console.log(error);
    })
  }, [isAdmin, userID]);

  return (
    <div className="CloudDrive-manager">
      <form onSubmit={(event) => {
        console.log(fileRef.current.files);
        if (!fileRef) {
          return;
        }
        event.preventDefault();
        if (updateFilePopup) {
          PatchFile(fileToUpdate, fileRef)
          setUpdateFile(false);
        } else {
          PostFile(userID, lastName, firstName, fileRef);
        }
      }}>
        <input type="file" ref={fileRef} required={true} />
        { updateFilePopup ? 
          <input type="submit" value="Update" /> :
          <input type="submit" value="Upload" />
        }
      </form>
      <button onClick={() => {setUpdateFile(false)}}>Cancel Update</button>

      <table>
        <thead>
          <tr>
            <th>FileName</th>
            <th>UserID</th>
            <th>FirstName</th>
            <th>LastName</th>
            <th>Modified</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
        { files && files.length !== 0 && files.sort((a, b) => (moment(a.Modified).isAfter(b.Modified) ? -1 : 1 )).map(file => (
          <tr className="table-row" key={file.FileID}>
            <td className="FileName" onClick={() => {GetFile(file.UserID, file.FileID)}}>{file.FileName}</td>
            <td>{file.UserID}</td>
            <td>{file.FirstName}</td>
            <td>{file.LastName}</td>
            <td>{moment(file.Modified).format("MM-DD-YYYY hh:mm:ss")}</td>
            <td>{moment(file.Uploaded).format("MM-DD-YYYY hh:mm:ss")}</td>
            <td><button onClick={() => {DeleteFile(file.UserID, file.FileID)}}>Delete</button></td>
            <td>
              <button onClick={() => {
                setUpdateFile(true);
                setFileToUpdate({
                  userID: file.UserID,
                  fileID: file.FileID
                });
              }}>Update
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>


    </div>
  );
}

export {
    CloudDriveFileManager
};