import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import useImage from "use-image";
import { nanoid } from "nanoid";

import { fetchMapImage } from "../api/getMapImageFromDB";


import "./CanvasApp.css";
import {
  Pen,
  MousePointer,
  Trash2,
  Undo2,
  Type,
  Brush,
  Hand,
} from "lucide-react";

import chaletBasement from "../assets/ChaletRWBasement.jpg";

export default function CanvasApp() {
  const [chaletBasementImage] = useImage(chaletBasement);
  // Test to save a image
  const stageRef = useRef(null);

  const [imgUrl, setImgUrl] = useState(null);
  const [dbImage, setDbImage] = useState(null);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ff0000");
  const [selectedId, setSelectedId] = useState(null);
  const [lines, setLines] = useState([]);

  const isDrawing = useRef(false);

  // Image scaling
  
const imageToShow = dbImage || chaletBasementImage;
const canvasWidth = 1024;
const canvasHeight = 768;

const [fitScale, setFitScale] = useState(1);
const [imageOffsetX, setImageOffsetX] = useState(0);
const [imageOffsetY, setImageOffsetY] = useState(0);

console.log("lines i render:", lines);


useEffect(() => {
  if (imageToShow) {
    const scale = Math.min(
      canvasWidth / imageToShow.width,
      canvasHeight / imageToShow.height
    );
    setFitScale(scale);
    setImageOffsetX((canvasWidth - imageToShow.width * scale) / 2);
    setImageOffsetY((canvasHeight - imageToShow.height * scale) / 2);
  }
}, [imageToShow]);
  // Sidebar Tabs / Switch
  const [activeTab, setActiveTab] = useState("operators");
  const [team, setTeam] = useState("attack");

  // === Handlers ===
  const handleMouseDown = (e) => {
    if (tool !== "pen") return;

    isDrawing.current = true;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const point = {
      x: (pointer.x - imageOffsetX) / fitScale,
      y: (pointer.y - imageOffsetY) / fitScale,
    };

    const newLine = {
  id: nanoid(),
  points: [point.x, point.y],
  color,
  strokeWidth: 3, // eller vad du vill ha som standard
};

    /*const newLine = {
      id: nanoid(),
      points: [point.x, point.y],
      color,
    }; */
    setLines([...lines, newLine]);
    setSelectedId(newLine.id);
  };

  /*const handleMouseMove = (e) => {
    if (!isDrawing.current || tool !== "pen") return;

    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const point = {
      x: (pointer.x - imageOffsetX) / fitScale,
      y: (pointer.y - imageOffsetY) / fitScale,
    };

    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  }; */
  const handleMouseMove = (e) => {
  if (!isDrawing.current || tool !== "pen") return;

  const stage = e.target.getStage();
  const pointer = stage.getPointerPosition();

  const point = {
    x: (pointer.x - imageOffsetX) / fitScale,
    y: (pointer.y - imageOffsetY) / fitScale,
  };

  setLines(prevLines => {
    if (prevLines.length === 0) return prevLines;
    const lastLine = prevLines[prevLines.length - 1];
    const newPoints = [...lastLine.points, point.x, point.y];
    const updatedLine = { ...lastLine, points: newPoints };
    return [
      ...prevLines.slice(0, -1),
      updatedLine
    ];
  });
};

  const handleMouseUp = () => {
    if (tool !== "pen") return;
    isDrawing.current = false;
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setLines((prev) => prev.filter((line) => line.id !== selectedId));
    setSelectedId(null);
  };
  
const undo = () => {
  console.log("Lines före undo:", lines);
  setLines(prev => {
    const newLines = prev.slice(0, -1);
    console.log("Lines efter undo:", newLines);
    return newLines;
  });
};

  

  const clearAll = () => {
    const confirmed = window.confirm("Are you sure you want to clear all lines?");
    if (confirmed) {
      setLines([]);
      setSelectedId(null);
    }
  };


  //Kyrets 
  const handleSave = async () => {
  if (!stageRef.current) return;

  // 1. Skapa bild-blob
  const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
  const blob = await fetch(dataURL).then((res) => res.blob());

  // 2. Skapa JSON-data för linjer och övrig info
const payload = {
  name: "My s1trategi",
  description: "Beskrivning av st1rategi",
  userId: 1,
  lines: lines.map(({ points, color, strokeWidth }) => ({
    points: points.map(Number), // säkerställ att alla är numbers (Double)
    color,
    strokeWidth
  }))
};

  // 3. Skicka som FormData
  const formData = new FormData();
  formData.append("file", blob, "canvas.png");
  formData.append("data", JSON.stringify(payload));

  try {
    const response = await fetch("http://localhost:8090/api/maps/upload-image", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Image and data uploaded successfully!");
    } else {
      alert("Error uploading image and data.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Failed to upload image and data.");
  }
};





 /* const handleSave = async () => {
  if (!stageRef.current) return;

  const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
  const blob = await fetch(dataURL).then((res) => res.blob());
//TODO check if this is okey in the backend before a try. 



  const formData = new FormData();
  formData.append("file", blob, "canvas.png");
  formData.append("name", "My strategaa"); // Ändra till dynamiskt om du vill
  formData.append("description", "Beskrivinaaag av st");
  //formData.append("imageUrl", ""); // Ändra till dynamiskt om du vill
    // url for get http://localhost:8090/api/maps/<id>/image
  try {
    const response = await fetch("http://localhost:8090/api/maps/upload-image", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      alert("Image uploaded successfully!");
    } else {
      alert("Error uploading image.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert("Failed to upload image.");
  }
  console.log("Bredd:", imageToShow?.width, "Höjd:", imageToShow?.height);
}; */

 /* const payload = {
    userId: currentUserId, // <-- sätt detta från din inloggning/session
    name: "My strategi",
    description: "Beskrivning av strategi",
    lines: lines, // <-- din lines-array
    // imageId: ... // om du vill koppla till en bakgrundsbild
  }; */ 



const handleFetchImage = async () => {
  try {
    const response = await fetch(`http://localhost:8090/api/maps/1/All`);
    const data = await response.json();

    // Sätt bilden
    const imgUrl = `data:image/png;base64,${data.imageData}`;
    const imgObj = new window.Image();
    imgObj.crossOrigin = "Anonymous";
    imgObj.src = imgUrl;
    imgObj.onload = () => setDbImage(imgObj);

    // Tilldela id till varje line om det saknas
    const linesWithId = data.lines.map(line => ({
      ...line,
      id: nanoid()
    }));
    setLines(linesWithId);

  } catch (err) {
    setDbImage(null);
    setLines([]);
    console.error("Error fetching image and lines from database:", err);
  }
};

  


  return (
      <div className="app-wrapper">
        <h1>
          🏝️ Coastline <span className="text-sm">2F Hookah / 2F Billiard</span>
        </h1>

        <div className="main-layout">
          <div className="canvas-container">
            <Stage
                ref={stageRef}
                width={1024}
                height={768}
                draggable={false}
                scaleX={1}
                scaleY={1}
                x={0}
                y={0}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="canvas-stage"
            >
              <Layer key={lines.map(l => l.id).join("-")}>
                {imageToShow && (
                  <Image
                      image={imageToShow}
                      scaleX={fitScale}
                      scaleY={fitScale}
                      x={imageOffsetX}
                      y={imageOffsetY}
                  />  )}
                {lines.map((line) => (
                    <Line
                        key={line.id}
                        points={line.points}
                        stroke={line.color || "red"}
                        strokeWidth={selectedId === line.id ? 5 : 3}
                        tension={0.5}
                        lineCap="round"
                        onClick={() => {
                          if (tool === "select") {
                            setSelectedId(line.id);
                          }
                        }}
                        shadowEnabled={selectedId === line.id}
                        shadowColor="white"
                        shadowBlur={20}
                        shadowOpacity={0.8}
                        shadowOffset={{ x: 0, y: 0 }}
                        strokeScaleEnabled={false}
                        scaleX={fitScale}
                        scaleY={fitScale}
                        x={imageOffsetX}
                        y={imageOffsetY}
                    />
                ))}
              </Layer>
            </Stage>

            {/* Toolbar */}
            <div className="toolbar">
              <button
                  className={tool === "select" ? "active" : ""}
                  onClick={() => setTool("select")}
                  title="Select"
              >
                <MousePointer size={16} />
              </button>

              <button
                  className={tool === "pen" ? "active" : ""}
                  onClick={() => setTool("pen")}
                  title="Pen"
              >
                <Brush size={16} />
              </button>

              <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  title="Color"
              />

              <button onClick={undo} disabled={lines.length === 0} title="Undo">
                <Undo2 size={16} /> Undo
              </button>

              <button
                  onClick={deleteSelected}
                  disabled={!selectedId}
                  className="delete"
                  title="Delete"
              >
                <Trash2 size={16} /> Delete
              </button>

              <button onClick={clearAll} disabled={lines.length === 0} title="Clear All">
                Clear All
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-tabs">
              <button
                  className={activeTab === "operators" ? "active" : ""}
                  onClick={() => setActiveTab("operators")}
              >
                Operators
              </button>
              <button
                  className={activeTab === "utility" ? "active" : ""}
                  onClick={() => setActiveTab("utility")}
              >
                Utility
              </button>
            </div>

            <div className="sidebar-switch">
              <button
                  className={team === "attack" ? "active" : ""}
                  onClick={() => setTeam("attack")}
              >
                Attack
              </button>
              <button
                  className={team === "defense" ? "active" : ""}
                  onClick={() => setTeam("defense")}
              >
                Defense
              </button>
            </div>

            <p style={{ marginTop: "16px" }}>
              Drag and place icons onto the canvas 🙂 (coming SOON...!)
            </p>
          </div>
        </div>

        {/* Notes Panel */}
        <div className="notes-panel">
          <div>
            <h3>Notes</h3>
            <textarea placeholder="💬 Add further notes to your strategy..." />
          </div>
          <div className="note-buttons">
            <button className="export">Export strategy</button>
            <button className="save" onClick={handleSave}>Save</button> {/* 4. Anropa funktionen här */}
            <button className="delete">Delete</button>
          <div>
                <button onClick={handleFetchImage}>Hämta bild från databas</button>
                
               
          </div>
          </div>
        </div>
      </div>
  );
}



