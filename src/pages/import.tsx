import React from 'react';
import { useRef } from 'react';
import { useNavigate } from "react-router-dom";

import { mnemo_import, can_import } from '../mnemo';
import { dmpToByteArray } from 'mnemo-dmp';
import { Import, ImportType, SurveyStorage } from '../common';

const FileImport = ({ setImport }: { setImport: React.Dispatch<React.SetStateAction<Import[]>> }) => {
    const ref = useRef<HTMLInputElement>(null)
    const navigate = useNavigate();

    const handleClick = () => {
        ref!.current!.click()
    }
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            return;
        }
        try {
            const buf = await file.arrayBuffer();
            const arr = dmpToByteArray(new TextDecoder().decode(buf));
            const comment = `Imported from file ${file.name}`;
            const imported = SurveyStorage.addImportData(ImportType.Dmp, comment, Array.from(arr));
            setImport(SurveyStorage.getImports());
            navigate(`/imported/${imported.id}`);
        }
        catch (e) {
            alert(e);
        }
    }
    return (
        <>
            <button className="btn btn-primary btn-block" onClick={handleClick}>Import from dmp-file</button>
            <input ref={ref} type="file" accept=".dmp" style={{ display: 'none' }} onChange={handleFileChange} />
        </>
    )
}



export const DoImport = ({ setImport }: { setImport: React.Dispatch<React.SetStateAction<Import[]>> }) => {
    const navigate = useNavigate();

    const importer = async () => {
        try {
            const survey_data = await mnemo_import(s => { console.log(s); });
            if (survey_data.length === 0) {
                throw Error("No data received");
            }
            const comment = `Imported from MNemo ${new Date().toDateString()}`;
            const imported = SurveyStorage.addImportData(ImportType.Mnemo, comment, Array.from(survey_data));
            setImport(SurveyStorage.getImports());
            navigate(`/imported/${imported.id}`);
        }
        catch (e) {
            if (e instanceof Error) {
                //if (e instanceof NotFoundError) {
                if (e.name === 'NotFoundError') {
                    return;
                }
            }
            alert(e);
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center">
            <div className="card text-center">
                <div className="card-body">
                    <h5 className="card-title">Import survey data</h5>
                    <p className="card-text">Import data from dmp-file or MNemo if your browser supports it (Chrome)</p>
                    <div className="d-grid gap-2 col-6 mx-auto">
                        <a href="#" hidden={!can_import()} className="btn btn-primary btn-block" onClick={importer}>Import from MNemo</a>
                        <FileImport setImport={setImport} />
                    </div>
                </div>
            </div>
        </div>
    );
}

