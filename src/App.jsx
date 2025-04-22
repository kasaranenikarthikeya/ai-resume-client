import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { saveAs } from "file-saver";
import { FaBars, FaFileDownload, FaCopy, FaMoon, FaSun, FaInfoCircle } from "react-icons/fa";
import "./styles.css";

export default function App() {
    const [prompt, setPrompt] = useState("");
    const [resume, setResume] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("All");
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const API_URL = "https://ai-resume-maker-sapk.onrender.com";

    // Theme toggle
    useEffect(() => {
        document.body.className = isDarkMode ? "dark" : "light";
    }, [isDarkMode]);

    // Example prompts
    const examplePrompts = [
        "Create a resume for a software engineer with 5 years of experience in Python and JavaScript",
        "Generate a resume for a data scientist with expertise in machine learning",
        "Build a resume for a marketing manager with 3 years of experience",
    ];

    const formatResumeText = (text) => {
        console.log("Formatting resume text:", text);
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/•/g, "• ")
            .replace(/\n/g, "<br />");
    };

    const parseResume = (text) => {
        console.log("Parsing resume text:", text);
        const sections = {};
        let currentSection = null;
        const lines = text.split("\n");

        lines.forEach((line) => {
            line = line.trim();
            if (line.startsWith("**") && line.endsWith("**")) {
                currentSection = line.replace(/\*\*(.*?)\*\*/g, "$1");
                sections[currentSection] = [];
            } else if (line && currentSection) {
                sections[currentSection].push(line);
            }
        });

        console.log("Parsed sections:", sections);
        return sections;
    };

    const generateResume = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt to generate a resume.");
            return;
        }
        setLoading(true);
        setResume(null);
        setError(null);
        console.log("Sending prompt:", prompt);
        try {
            const response = await fetch(`${API_URL}/api/generate-resume`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt }),
            });
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            if (response.ok) {
                const formattedText = formatResumeText(data.resume);
                const parsedResume = parseResume(data.resume);
                setResume({ formatted: formattedText, parsed: parsedResume });
                setActiveSection("All");
            } else {
                setError(data.detail || "Failed to generate resume. Please try again.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError("Unable to connect to the server. Please check if the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const copyResume = () => {
        if (resume) {
            const text = resume.parsed
                ? Object.entries(resume.parsed)
                      .map(([section, content]) => `**${section}**\n${content.join("\n")}`)
                      .join("\n\n")
                : "";
            navigator.clipboard.writeText(text);
            alert("Resume copied to clipboard!");
        }
    };

    const downloadResume = () => {
        if (resume) {
            const blob = new Blob(
                [resume.parsed
                    ? Object.entries(resume.parsed)
                          .map(([section, content]) => `**${section}**\n${content.join("\n")}`)
                          .join("\n\n")
                    : ""],
                { type: "text/plain;charset=utf-8" }
            );
            saveAs(blob, "resume.txt");
        }
    };

    const downloadPDF = () => {
        if (resume) {
            const printWindow = window.open("", "_blank");
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Resume</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h2 { color: #2d3748; }
                            strong { font-weight: bold; }
                            .section { margin-bottom: 20px; }
                            p { margin: 5px 0; }
                        </style>
                    </head>
                    <body>
                        ${resume.formatted}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
            {/* Header */}
            <header className="p-4 bg-blue-600 text-white flex justify-between items-center">
                <h1 className="text-2xl font-bold">AI Resume Builder</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="p-2 rounded-full hover:bg-blue-700"
                        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-full hover:bg-blue-700 md:hidden"
                    >
                        <FaBars size={20} />
                    </button>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <AnimatePresence>
                    {(isSidebarOpen || window.innerWidth >= 768) && (
                        <motion.div
                            initial={{ x: -250 }}
                            animate={{ x: 0 }}
                            exit={{ x: -250 }}
                            transition={{ duration: 0.3 }}
                            className={`w-64 bg-gray-800 text-white p-6 h-screen sticky top-0 overflow-y-auto ${isSidebarOpen ? "fixed z-50" : "hidden md:block"}`}
                        >
                            <h2 className="text-xl font-bold mb-6 flex items-center">
                                <FaInfoCircle className="mr-2" /> Sections
                            </h2>
                            <ul>
                                <li
                                    className={`cursor-pointer p-2 rounded flex items-center ${activeSection === "All" ? "bg-gray-600" : "hover:bg-gray-700"}`}
                                    onClick={() => { setActiveSection("All"); setIsSidebarOpen(false); }}
                                >
                                    <FaInfoCircle className="mr-2" /> All
                                </li>
                                {resume?.parsed && Object.keys(resume.parsed).map((section) => (
                                    <li
                                        key={section}
                                        className={`cursor-pointer p-2 rounded flex items-center ${activeSection === section ? "bg-gray-600" : "hover:bg-gray-700"}`}
                                        onClick={() => { setActiveSection(section); setIsSidebarOpen(false); }}
                                    >
                                        <FaInfoCircle className="mr-2" /> {section}
                                    </li>
                                ))}
                            </ul>
                            {resume && (
                                <div className="mt-4 space-y-2">
                                    <button
                                        onClick={copyResume}
                                        className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                                    >
                                        <FaCopy className="mr-2" /> Copy Resume
                                    </button>
                                    <button
                                        onClick={downloadResume}
                                        className="w-full flex items-center justify-center bg-green-500 hover:bg-green-600 text-white py-2 rounded"
                                    >
                                        <FaFileDownload className="mr-2" /> Download TXT
                                    </button>
                                    <button
                                        onClick={downloadPDF}
                                        className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 rounded"
                                    >
                                        <FaFileDownload className="mr-2" /> Download PDF
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Prompt Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl font-bold mb-4">Enter Your Resume Prompt</h2>
                            <textarea
                                className={`w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}
                                rows="5"
                                placeholder={examplePrompts[0]}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {examplePrompts.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setPrompt(example)}
                                        className="px-3 py-1 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 text-sm"
                                    >
                                        {example.slice(0, 30)}...
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={generateResume}
                                disabled={loading}
                                className={`w-full mt-4 py-3 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                            >
                                {loading ? "Generating..." : "Generate Resume"}
                            </button>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 text-red-500 text-center flex items-center justify-center"
                                >
                                    <FaInfoCircle className="mr-2" /> {error}
                                </motion.p>
                            )}
                        </motion.div>

                        {/* Resume Preview */}
                        {prompt && !resume && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8"
                            >
                                <h2 className="text-xl font-bold mb-4">Live Preview</h2>
                                <div className="prose max-w-none">
                                    <strong>Personal</strong><br />
                                    Name: [Your Name]<br />
                                    Email: [Your Email]<br />
                                    Phone: [Your Phone]<br /><br />
                                    <strong>Summary</strong><br />
                                    • Based on: {prompt.slice(0, 100)}...<br />
                                    ...
                                </div>
                            </motion.div>
                        )}

                        {/* Generated Resume */}
                        {resume && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                            >
                                <h2 className="text-2xl font-bold mb-4">Generated Resume</h2>
                                {activeSection === "All" ? (
                                    <div
                                        className="prose max-w-none overflow-y-auto max-h-[70vh] dark:text-gray-200"
                                        dangerouslySetInnerHTML={{ __html: resume.formatted }}
                                    />
                                ) : (
                                    <div className="prose max-w-none overflow-y-auto max-h-[70vh] dark:text-gray-200">
                                        <h3>{activeSection}</h3>
                                        {resume.parsed[activeSection]?.map((line, index) => (
                                            <p key={index} dangerouslySetInnerHTML={{ __html: line.replace(/•/, "• ")}} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
