import React, { useState } from "react"
import { Link, useParams } from "react-router-dom";
import { surveyListFromByteArray, dmpFromByteArray, ShotType, Survey, Direction } from 'mnemo-dmp';
import { Import, SurveyStorage } from "../common";
import { MiniMap } from "../components/minimap";

class EditSurvey {
    survey: Survey;
    importId: number;
    surveyId: number;
    comments: string[];
    constructor(importId: number, surveyId: number, survey: Survey, comments: string[]) {
        this.survey = survey;
        this.comments = comments;
        this.surveyId = surveyId;
        this.importId = importId;
    }
}

function RenderSurvey({ imp, surveyNum }: { imp: Import, surveyNum: number }): JSX.Element {
    //console.log(`RenderSurvey ${imp.id}/${surveyNum}`);

    const surveyList = surveyListFromByteArray(Uint8Array.from(imp.data));
    const s = surveyList[surveyNum];
    const [direction, setDirection] = useState(s.direction);
    const [survey, setSurvey] = useState(boom(imp, s, surveyNum));

    const updateComment = (i: number, s: string) => {
        setSurvey(old => {
            const newComments = [...old.comments];
            newComments[i] = s;
            const changed = { ...old, comments: newComments }
            //console.log(JSON.stringify(changed.comments, null, 2));
            SurveyStorage.setComments(survey.importId, survey.surveyId, changed.comments);
            return changed;
        })
    }

    return (<div className="list-group col-lg">
        <p>{survey.survey.date.toTimeString()}</p>
        <div className="text-center"  >
            <MiniMap survey={s} />
        </div>
        
        {/* <div className="text-center">
            <div className="btn-group col-2 btn-group-sm" role="group" aria-label="Basic example">
                <input
                    type="radio"
                    className="btn-check "
                    id="btnradio1"
                    onChange={() => { setDirection(Direction.In) }}
                    checked={direction === Direction.In} />
                <label className="btn btn-outline-primary" htmlFor="btnradio1">IN</label>
                <input
                    type="radio"
                    className="btn-check"
                    id="btnradio2"
                    readOnly={true}
                    onChange={() => { setDirection(Direction.Out) }}
                    checked={direction === Direction.Out}
                />
                <label className="btn btn-outline-primary" htmlFor="btnradio2">OUT</label>
            </div>
        </div> */}
        <br />

        {survey.survey.shots.filter(x => x.type !== ShotType.CSA).map((shot, i) => {
            // style={{ "border": "1px solid red" }}
            return (
                <div key={i}>
                    <li className="list-group-item" >
                        <div className="row align-items-stretch">
                            <div className="col-md-1 bg-primary">
                                <div className="row">
                                    <div className="col fw-bold" >#{i + 1}</div>
                                </div>
                            </div>
                            <textarea
                                className="form-control col-md"
                                style={{ "resize": "none", "borderRadius": "0px" }}
                                onChange={e => updateComment(i, e.target.value)}
                                rows={3}
                                value={survey.comments[i]}
                            />
                        </div>
                    </li>
                    {
                        shot.type !== ShotType.EOC &&
                        <li className="list-group-item list-group-item-secondary d-flex justify-content-between align-items-start">
                            <div className="container text-center">
                                <div className="row">
                                    {/* <div className="col-sm">Shot {i + 1} -&gt; {i + 2}</div> */}
                                    <div className="col-sm small">Heading {shot.head_in}/{shot.head_out}</div>
                                    <div className="col-sm small">Depth {shot.depth_in}/{shot.depth_out}</div>
                                    <div className="col-sm small">Length {shot.length}m</div>
                                </div>
                            </div>
                        </li>
                    }
                </div>
            )
        })}
    </div>)
}

function download(bb: Blob, filename: string) {
    var a = document.createElement('a');
    a.download = filename;
    a.href = window.URL.createObjectURL(bb);
    a.click();
}

function downloadComments(imp: Import) {
    let txt = '';
    const surveyList = surveyListFromByteArray(Uint8Array.from(imp.data));
    surveyList.forEach((x, idx) => {
        txt += `${x.name}${idx}\n`;
        const banan = SurveyStorage.getComments(imp.id, idx);
        banan.forEach((comment, station) => {
            if (comment === "") return;
            txt += `Station #${station + 1}: ${comment}\n`;
        });
        txt += '\n';
    });
    download(
        new Blob([txt], { type: 'text/plain' }),
        `${imp.date} ${imp.location} ${imp.surveryors}.txt`);
}

function downloadDmp(imp: Import) {
    const fileContent = dmpFromByteArray(Uint8Array.from(imp.data));
    download(
        new Blob([fileContent], { type: 'text/plain' }),
        `${imp?.date} ${imp?.location} ${imp?.surveryors}.dmp`);
}

function boom(imp: Import, survey: Survey, surveyNumber: number) {
    let comments = SurveyStorage.getComments(imp.id, surveyNumber);
    if (comments.length !== survey.shots.length) {
        comments = new Array(survey.shots.length).fill("");
    }
    return new EditSurvey(imp.id, surveyNumber, survey, comments);
}


export const MnemoDump = () => {
    const { id, surveyNumber } = useParams();
    const key = `${id}/${surveyNumber}`

    //const imp = imports.find(i => i.id === Number(id));
    const imp = SurveyStorage.getImports().find(i => i.id === Number(id));
    if (imp === undefined) {
        return (<h1>Dump {id} not found</h1>)
    }

    try {
        const surveyList = surveyListFromByteArray(Uint8Array.from(imp.data));
        const surveyNumberInt = Number(surveyNumber);

        return (
            <div className="text-center">
                <h1>Import #{id}</h1>
                <p>Imported {imp.date.toString()}</p>
                <p>Location {imp.location}</p>
                <p>Surveyors {imp.surveryors}</p>
                <div className="dropdown ">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                        Download
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                        <li><a className="dropdown-item" onClick={() => downloadDmp(imp)}>Download dmp</a></li>
                        <li><a className="dropdown-item" onClick={() => downloadComments(imp)}>Download comments (.txt)</a></li>
                    </ul>
                </div>
                <br/>
                {surveyList.length < 1 && <h2>No surveys found</h2>}
                <nav className="nav nav-pills justify-content-center">
                    {surveyList.map((survey, i) => (
                        <Link key={survey.date.toString()}
                            className={`nav-link ${i === surveyNumberInt ? "active" : ""}`}
                            aria-current="page" to={"/dump/" + id + "/" + i}>{survey.name}{i}</Link>),)}
                </nav>
                <br/>
                <RenderSurvey imp={imp} surveyNum={surveyNumberInt} key={key} />
            </div >
        )
    }
    catch (e) {
        console.error(e);
        return (
            <>
                <h1>Dump {id} is not a valid dmp file</h1>
                <div className="alert alert-danger" role="alert">
                    {JSON.stringify(e)}
                </div>
            </>)
    }
}