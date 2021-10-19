import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Redirect } from 'react-router-dom';

const BaseURL = 'https://cpmk6bswth.execute-api.us-west-2.amazonaws.com/dev'
const fileManagementAPI = axios.create({
    baseURL: 'https://cpmk6bswth.execute-api.us-west-2.amazonaws.com/dev'
})

function GetFile(userID, fileID) {
    const link = document.createElement('a')
    link.href = `${BaseURL}/${userID}/${fileID}`
    document.body.appendChild(link)
    link.click();
}

function PostFile(userID, fileRef) {
    console.log(fileRef.current.files[0])

    const fileName = fileRef.current.files[0].name
    const file = fileRef.current.files[0]
    fileManagementAPI.post(`/${userID}`, { FileName: fileName })
        .then((response) => {
            const fileID  = response.data.FileID
            const uploadURL = response.data.UploadURL
            // console.log(response.data.FileID);
            const formData = new FormData();
            formData.append('key', fileID)
            formData.append('file', file)
            
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }

            return fileManagementAPI.post(uploadURL, formData, config)
        }).catch((error) => {
            console.log(error);
        }).then((response) => {
            console.log(response)
        })

}

function DeleteFile(userID, fileID) {
    fileManagementAPI.delete(`/${userID}/${fileID}`)
        .then((response) => {
            console.log(response);
        })
}

function CloudDriveFileManager({ userID }) {
    const [files, setFiles] = useState([]);
    const fileRef = useRef(null);

    useEffect(() => {
        fileManagementAPI.get(`/${userID}`)
            .then(function (response) {
                console.log(response.data);
                setFiles(response.data);
            })
            .catch(function (error) {
                console.log(error);
            })
        
    }, [])



    return (
        <div className="CloudDrive-manager">
            <table>
                <thead>
                    <tr>
                        <th>FileName</th>
                        <th>UserID</th>
                        <th>Modified</th>
                    </tr>
                </thead>
                <tbody>
                { files && files.length !== 0 && files.map(file => (
                    <tr className="table-row" key={file.FileID}>
                        <td className="FileName" onClick={() => {GetFile(file.UserID, file.FileID)}}>{file.FileName}</td>
                        <td>{file.UserID}</td>
                        <td>{moment(file.Modified).format("MM-DD-YYYY hh:mm:ss")}</td>
                        <td><button onClick={() => {DeleteFile(file.UserID, file.FileID)}}>Delete</button></td>
                    </tr>
                ))}
                </tbody>
            </table>

            <form onSubmit={(event) => {
                event.preventDefault();
                PostFile(userID, fileRef);
                } }
            >
                <input type="file" ref={fileRef} />
                <input type="submit" value="Upload" />
            </form>
        </div>
    );
}

export {
    CloudDriveFileManager
};