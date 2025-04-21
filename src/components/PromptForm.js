import React, { useState } from "react";
import axios from "axios";

const PromptForm = () => {
  const [prompt, setPrompt] = useState("");
  const [resume, setResume] = useState("");
  const [error, setError] = useState(null);

  const handlePromptChange = (e) => setPrompt(e.target.value);

  const generateResume = async () => {
    try {
      const response = await axios.post(`${window.API_BASE_URL}/api/generate-resume`, { userPrompt: prompt });
      if (response.data.resume) {
        setResume(formatResume(response.data.resume));
      } else {
        setError("Error generating resume");
      }
    } catch (err) {
      setError("Error generating resume");
      console.error(err);
    }
  };

  // Function to format the resume into proper sections
  const formatResume = (resumeText) => {
    return resumeText
      .replace(/(Summary|Skills|Experience|Education|Projects|Certifications)/g, (match) => `<h2>${match}</h2>`)
      .replace(/\n/g, "<br/>")
      .replace(/•/g, "<ul><li>")
      .replace(/<br\/>$/, "</ul>");
  };

  return (
    <div className="container">
      <div className="prompt-form">
        <textarea 
          value={prompt} 
          onChange={handlePromptChange} 
          placeholder="Enter your resume prompt here..." 
        />
        <button onClick={generateResume}>Generate Resume</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {resume && (
        <div className="resume-container">
          <header>
            <h1>AI-Generated Resume</h1>
            <p><strong>Location:</strong> {prompt.location || 'Not specified'}</p>
          </header>

          <div className="content" dangerouslySetInnerHTML={{ __html: resume }} />
        </div>
      )}
    </div>
  );
};

export default PromptForm;
