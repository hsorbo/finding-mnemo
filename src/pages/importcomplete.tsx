import React, { useState } from "react"
import { Import, SurveyStorage } from "../common";
import { useNavigate, useParams } from "react-router-dom";

export const ImportComplete = ({ imports }: { imports: Import[] }) => {
    const { id } = useParams();
    
    const navigate = useNavigate();
    const imported = imports.filter(x => x.id === Number(id))[0];
    const [importInfo, setimportInfo] = useState(imported);

    const saveChanges = () => {
        SurveyStorage.updateImport(importInfo);
    }

    return (
        <>
        <h1>Import complete</h1>
        <form>
        <div className="form-group">
            <label>Comment</label>
                    <input
                        type="text"
                        className="form-control"
                        id="comment"
                        value={importInfo.comment}
                        onChange={e => {
                            setimportInfo({ ...importInfo, comment: e.target.value });
                        }}

                    />
            <label>Surveryors</label>
                    <input
                        type="text"
                        className="form-control"
                        id="surveryors"
                        value={importInfo.surveryors}
                        onChange={e => {
                            setimportInfo({ ...importInfo, surveryors: e.target.value });
                        }}

                    />
            <label>Location</label>
                    <input
                        type="text"
                        className="form-control"
                        id="locatiion"
                        value={importInfo.location}
                        onChange={e => {
                            setimportInfo({ ...importInfo, location: e.target.value });
                        }}

                    />
            {/* <small id="emailHelp" className="form-text text-muted">pikk</small> */}
        </div>
                <button onClick={() => {
                    saveChanges();
                    navigate(`/dump/${importInfo.id}/0`);
                }} className="btn btn-primary">Save and continue</button>
        </form>
</>
    );
}