import React, { useState } from "react";

const App = () => {
    const [prompt, setPrompt] = useState("");
    const [resume, setResume] = useState("");
    const [loading, setLoading] = useState(false);

    const formatResumeText = (text) => {
        return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const generateResume = async () => {
        if (!prompt.trim()) {
            alert("Please enter a prompt.");
            return;
        }

        setLoading(true);
        setResume("");

        try {
            const response = await fetch(`${window.API_BASE_URL}/generate-resume`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (response.ok) {
                setResume(formatResumeText(data.resume));
            } else {
                alert("Error generating resume");
            }
        } catch (error) {
            alert("Failed to fetch resume");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = resume.replace(/<\/?strong>/g, "");
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        alert("Resume copied to clipboard!");
    };

    return (
        <div className="container">
            <h1>AI Resume Builder</h1>
            
            <textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-input"
            ></textarea>

            <div className="button-container">
                <button onClick={generateResume} className="generate-btn">Generate Resume</button>
                {loading && <span className="loader">Loading...</span>}
            </div>

            {resume && (
                <div className="resume-container">
                    <button className="copy-btn" onClick={copyToClipboard}>Copy Resume</button>
                    <div className="resume-content" dangerouslySetInnerHTML={{ __html: resume }}></div>
                </div>
            )}
        </div>
    );
};

export default App;
