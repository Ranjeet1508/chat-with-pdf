import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI assistant. Upload a PDF document to get started, and I'll help you analyze its content.", sender: 'ai' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
  // Auto-scroll to bottom when new messages are added
  const chatMessagesContainer = document.querySelector('.chat-messages');
  if (chatMessagesContainer) {
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
  }
}, [messages, isAiTyping]); 

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      uploadPdf(file);
    } else {
      setUploadStatus('Please select a valid PDF file.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#a29bfe';
    event.currentTarget.style.backgroundColor = '#fafafa';
    
    if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        uploadPdf(file);
      } else {
        setUploadStatus('Please drop a valid PDF file.');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#6c5ce7';
    event.currentTarget.style.backgroundColor = '#f0f0ff';
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.style.borderColor = '#a29bfe';
    event.currentTarget.style.backgroundColor = '#fafafa';
  };

const uploadPdf = async (file) => {
  setIsUploading(true);
  setUploadStatus('Uploading PDF...');
  
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('pdf', file);
    
    // Make API call to upload PDF
    const response = await fetch('http://localhost:8080/pdf/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle successful upload
    setPdfFile(file);
    setUploadStatus('PDF uploaded successfully!');
    
    // Add welcome message to chat
    addMessage(`I've successfully processed "${file.name}". You can now ask me questions about this document.`, 'ai');
    
  } catch (error) {
    console.error('Upload error:', error);
    setUploadStatus(`Upload failed: ${error.message}`);
  } finally {
    setIsUploading(false);
  }
};

const removePdf = async () => {
  try {
    const response = await fetch("http://localhost:8080/pdf/delete", {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed with status: ${response.status}`);
    }
    
    setPdfFile(null);
    setUploadStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setMessages([
      { text: "Please upload a new document to continue chatting.", sender: "ai" }
    ]);
  } catch (error) {
    console.error('Delete error:', error);
    addMessage(
      "Sorry, I'm having trouble connecting to the server. Please try again.",
      "ai"
    );
  }
};

const sendMessage = async () => {
  if (!inputMessage.trim() || !pdfFile) return;
  
  // Add user message to chat
  addMessage(inputMessage, 'user');
  setInputMessage('');
  
  // Show AI is typing
  setIsAiTyping(true);
  
  try {
    // Make API call to your chat endpoint
    const response = await fetch('http://localhost:8080/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: inputMessage,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Chat API failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Add AI response to chat
    addMessage(result.answer, 'ai');
    
  } catch (error) {
    console.error('Chat error:', error);
    addMessage("Sorry, I'm having trouble connecting to the server. Please try again.", 'ai');
  } finally {
    setIsAiTyping(false);
  }
};

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && pdfFile) {
      sendMessage();
    }
  };

  const addMessage = (text, sender) => {
    setMessages(prev => [...prev, { text, sender }]);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="app">
      <div className="container">
        {/* Left Panel for PDF Upload */}
        <div className="left-panel">
          <h1>Chat with PDF</h1>
          
          <div className="upload-container">
            <div className="upload-icon">
              <i className="fas fa-file-pdf"></i>
            </div>
            <h2>Upload PDF Document</h2>
            
            <div 
              className="upload-area" 
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <p className="upload-text">Drag & drop your PDF file here</p>
              <p className="upload-text">OR</p>
              <div className="btn">
                <i className="fas fa-file-upload"></i> Browse Files
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".pdf" 
                onChange={handleFileSelect}
                style={{ display: 'none' }} 
              />
            </div>
            
            {uploadStatus && (
              <div className={`upload-status ${isUploading ? 'status-loading' : uploadStatus.includes('successfully') ? 'status-success' : 'status-error'}`}>
                {uploadStatus}
              </div>
            )}
            
            {pdfFile && (
              <div className="file-info">
                <h3>Uploaded Document</h3>
                <p>{pdfFile.name}</p>
                <p>{formatFileSize(pdfFile.size)}</p>
                <button className="btn btn-remove" onClick={removePdf}>
                  <i className="fas fa-trash"></i> Remove PDF
                </button>
              </div>
            )}
          </div>
          
          <div className="instructions">
            <h2>How it works</h2>
            <p>1. Upload a PDF document using the button above</p>
            <p>2. Wait for the document to be processed</p>
            <p>3. Start chatting with the AI about your document</p>
            <p>4. Ask questions, get summaries, find information</p>
          </div>
        </div>
        
        {/* Right Panel for Chat */}
        <div className="right-panel">
          <div className="chat-header">
            <h2>AI Assistant</h2>
            <p>Chat about your PDF document</p>
          </div>
          
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}-message`}>
                {message.text}
              </div>
            ))}
            {isAiTyping && (
              <div className="ai-typing">
                <span className="typing-dots"><span></span><span></span><span></span></span>
              </div>
            )}
          </div>
          
          <div className="chat-input">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={pdfFile ? "Ask a question about your PDF..." : "Upload a PDF to enable chatting..."}
              disabled={!pdfFile}
            />
            <button onClick={sendMessage} disabled={!pdfFile || !inputMessage.trim()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;