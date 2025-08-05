import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import './App.css';

export default function App() {

  const [faqVisible, setFaqVisible] = useState(false);
  const faqRef = useRef(null);
  const buttonRef = useRef(null);
  const fileInputRef = useRef(null);

  //----------------FAQ------------------

    const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/faq.md")
      .then((res) => res.text())
      .then(setContent)
      .catch(() => setContent("Ошибка загрузки FAQ"));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        faqVisible &&
        faqRef.current &&
        !faqRef.current.contains(event.target) &&
        buttonRef.current &&
        event.target !== buttonRef.current
      ) {
        setFaqVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [faqVisible]);
  
//-----------------Граф-------------------

  const containerRef = useRef(null);
  const networkInstance = useRef(null);
  const [showGraph, setShowGraph] = useState(false);
  const [graphJSON, setGraphJSON] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (showGraph && containerRef.current) {
      const nodes = new DataSet((graphJSON.nodes || []).map(node => ({
        id: node.id,
        label: node.label,
        color: "#45A29E",
        font: { color: "#C5C6C7" },
        ... (node.attrs || {})
      })));

      const edges = new DataSet((graphJSON.edges || []).map(edge => ({
        from: edge.source,
        to: edge.target,
        arrows: "to",
        label: edge.relation || "",
        font: { align: "middle", color: "#fff", strokeWidth: 0 },
        color: { color: "#45A29E" },
        ... (edge.attrs || {})
      })));

      const data = {
        nodes,
        edges
      };

      // Настройки сети vis.js
      const options = {
      interaction: {
        hover: true,
        multiselect: false,
        navigationButtons: true,
        keyboard: true,
      },
      nodes: {
        shape: "dot",
        size: 16,
        font: {
          size: 14,
          color: "#C5C6C7",
          face: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif"
        },
        borderWidth: 2,
        shadow: true,
      },
      edges: {
        smooth: {
          type: "cubicBezier",
          forceDirection: "horizontal",
          roundness: 0.4,
        },
        color: "#45A29E",
        width: 2,
        arrows: {
          to: { enabled: true, scaleFactor: 1, type: "triangle" }
        },
        font: {
          align: "middle",
          color: "#66FCF1",
          background: "none",
          size: 12,
        }
      },
      physics: {
        enabled: false,
        stabilization: { iterations: 100, updateInterval: 10 }
      },
      layout: {
        improvedLayout: true,
      },
    };

      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }

      networkInstance.current = new Network(containerRef.current, data, options);
    }
  }, [showGraph, graphJSON]);

  // Обработчик кнопки "обработать", включающий показ графа
  // const handleProcessClick = () => {
  //   if (!showGraph) setShowGraph(true);
  // };

//------------------Обработка файла-------------------

  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const bottomContainerRef = useRef(null);
  const [message, setMessage] = useState("");

  const handleFile = useCallback(async (file) => {
    setError(null);
    setMessage("");

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Пожалуйста, загрузите файл в формате PDF");
      setFileInfo(null);
      return;
    }

    setFileInfo({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("http://localhost:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`Файл загружен. ID: ${data.file_id}`);
      setFileId(data.file_id);
    } catch (error) {
      setMessage(`Ошибка: ${error.response?.data?.detail || error.message}`);
    }
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);

      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles.length === 0) {
        setError("Файл не найден");
        return;
      }

      const file = droppedFiles[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const onDragEnter = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(
    (event) => {
      if (!bottomContainerRef.current.contains(event.relatedTarget)) {
        setIsDragging(false);
      }
    },
    [bottomContainerRef]
  );

  const onFileInputChange = useCallback(
    (event) => {
      const selectedFiles = event.target.files;
      if (selectedFiles.length === 0) {
        return;
      }
      const file = selectedFiles[0];
      handleFile(file);
      event.target.value = null;
    },
    [handleFile]
  );

  const [fileId, setFileId] = useState(null);
  const [processingResult, setProcessingResult] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);

  const handleProcess = async () => {
    setError(null);
    setMessage("");
    setProcessingResult(null);

    if (!fileId) {
      setError("Нет ID файла для обработки");
      return;
    }

    try {
      setLoadingProcess(true);
      const response = await axios.post(`http://localhost:8000/extract/${fileId}`);
      console.log(response.data.kg);
      setProcessingResult(response.data);
      setGraphJSON(response.data.kg);
      setMessage("Обработка завершена");
    } catch (err) {
      setError(`Ошибка обработки: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoadingProcess(false);
    }



    if (!showGraph) setShowGraph(true);
  };

//----------------Body--------------------

  return (
    <div className="app-wraper">
      <div 
        ref={bottomContainerRef} 
        className={`bottom-container ${showGraph ? 'shifted' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        style={{
          border: isDragging ? "3px dashed #4caf50" : "3px solid transparent",
          transition: "border-color 0.3s ease",
          borderRadius: "8px",
          position: "relative",
        }}
        >
        <div className={`graph-container ${showGraph ? 'visible' : ''}`}>
        <div ref={containerRef} className="sigma-container" />
        </div>
        <div className={`text-field ${fileInfo ? "expanded" : ""}`}>
          {fileInfo ? (
          <>
        <div><b>Выбран файл:</b> {fileInfo.name}</div>
        <div><b>Размер:</b> {(fileInfo.size / 1024).toFixed(2)} KB</div>
          </>
        ) : (
        "Добавьте файл"
          )}
        </div>

        <div className="buttons">

          <button 
            id="add-file" 
            type="button"
            onClick={() => fileInputRef.current.click()}
          >
              Добавить файл
          </button>

          {message && <p>{message}</p>}

          <button 
            id="process" 
            type="button"
            onClick={handleProcess}
          >
            Обработать
          </button>

        </div>

        <div
          style={{
            marginTop: "12px",
            color: error ? "red" : "#333",
            minHeight: "36px",
            userSelect: "text",
          }}
          aria-live="polite"
        >
          {error && <span>{error}</span>}
        </div>

      </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onFileInputChange}
          accept=".pdf"
        />

        <button
          id="faq-button"
          type="button"
          onClick={() => setFaqVisible(!faqVisible)}
          ref={buttonRef}
        >
          FAQ
        </button>

        <div
          id="faq-popup"
          className={faqVisible ? 'show' : ''}
          ref={faqRef}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

    </div>
  );
}