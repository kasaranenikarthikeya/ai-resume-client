import React from "react";

function Resume({ resumeData }) {
    return (
        <div className="resume-container">
            <h2>Your AI-Generated Resume</h2>
            <pre>{resumeData}</pre>
        </div>
    );
}

export default Resume;
