import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from "react-markdown";
import { Network } from "vis-network";
import { DataSet } from "vis-data";
import './App.css';

const graphJSON = {
  "directed": true,
  "multigraph": false,
  "graph": {
    "name": "Industrial Process Extended Graph",
    "description": "Расширенный граф материалов, оборудования и процессов",
    "version": "1.0"
  },
  "nodes": [
    { "id": "steel", "label": "steel", "type": "MATERIAL", "conf": 0.95, "description": "Alloy of iron and carbon" },
    { "id": "furnace", "label": "furnace", "type": "EQUIPMENT", "conf": 0.8, "manufacturer": "FurnaceCo" },
    { "id": "stainless steel", "label": "stainless steel", "type": "MATERIAL", "conf": 0.85, "description": "Corrosion-resistant alloy" },
    { "id": "blast furnace", "label": "blast furnace", "type": "EQUIPMENT", "conf": 0.85, "manufacturer": "BlastFurnace Inc." },
    { "id": "iron ore", "label": "iron ore", "type": "RAW_MATERIAL", "conf": 0.9 },
    { "id": "carbon", "label": "carbon", "type": "MATERIAL", "conf": 0.9, "description": "Element for alloying" },
    { "id": "refinery", "label": "refinery", "type": "EQUIPMENT", "conf": 0.7 },
    { "id": "molding", "label": "molding", "type": "PROCESS", "conf": 0.8 },
    { "id": "inspection", "label": "inspection", "type": "PROCESS", "conf": 0.6 }
  ],
  "links": [
    {
      "source": "steel",
      "target": "furnace",
      "relation": "FUNCTIONAL",
      "verb": "processed in",
      "conf": 0.8,
      "description": "Steel is processed in furnace"
    },
    {
      "source": "stainless steel",
      "target": "steel",
      "relation": "HIERARCHICAL",
      "conf": 0.7,
      "description": "Stainless steel is subtype of steel"
    },
    {
      "source": "iron ore",
      "target": "blast furnace",
      "relation": "INPUT",
      "verb": "fed to",
      "conf": 0.9,
      "description": "Iron ore fed to blast furnace"
    },
    {
      "source": "carbon",
      "target": "steel",
      "relation": "COMPONENT",
      "verb": "alloyed with",
      "conf": 0.85
    },
    {
      "source": "blast furnace",
      "target": "refinery",
      "relation": "SEQUENTIAL",
      "verb": "flows to",
      "conf": 0.75
    },
    {
      "source": "refinery",
      "target": "molding",
      "relation": "SEQUENTIAL",
      "verb": "prepares for",
      "conf": 0.7
    },
    {
      "source": "molding",
      "target": "inspection",
      "relation": "SEQUENTIAL",
      "verb": "followed by",
      "conf": 0.65
    },
    {
      "source": "inspection",
      "target": "steel",
      "relation": "QUALITY_CONTROL",
      "verb": "verifies",
      "conf": 0.6
    },
    {
      "source": "furnace",
      "target": "refinery",
      "relation": "FUNCTIONAL",
      "verb": "connected to",
      "conf": 0.55
    }
  ]
}
;

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

  useEffect(() => {
    if (showGraph && containerRef.current) {
      // Преобразуем данные в формат vis.js
      const nodes = new DataSet(graphJSON.nodes.map(node => ({
        id: node.id,
        label: node.label,
        title: `Type: ${node.type}\nConfidence: ${node.conf}`,
        color: node.type === "MATERIAL" ? "#66FCF1" : "#45A29E", // Пример: материал — голубые, оборудование — зеленоватые
        font: { color: "#C5C6C7" }
      })));

      // Объекты edges: цель и источник, с направленными стрелками
      const edges = new DataSet(graphJSON.links.map(link => ({
        from: link.source,
        to: link.target,
        arrows: "to",
        label: link.verb || "",
        font: { align: "middle", color: "#fff", strokeWidth: 0 },
        color: { color: "#45A29E" }
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
          enabled: true,
          stabilization: { iterations: 100, updateInterval: 10 }
        },
        layout: {
          improvedLayout: true,
        },
        // Красивый темный фон в соответствии с цветовой схемой
        // (сам контейнер styled через CSS)
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }

      networkInstance.current = new Network(containerRef.current, data, options);
    }
  }, [showGraph]);

  // Обработчик кнопки "обработать", включающий показ графа
  const handleProcessClick = () => {
    if (!showGraph) setShowGraph(true);
  };

//------------------Обработка файла-------------------

  const [isDragging, setIsDragging] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const bottomContainerRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError(null);

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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка загрузки файла");
      }

      const data = await response.json();
      console.log("Upload успешен:", data);
    } catch (uploadError) {
      setError(uploadError.message);
      setFileInfo(null);
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

          <button 
            id="process" 
            type="button"
            onClick={handleProcessClick}
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