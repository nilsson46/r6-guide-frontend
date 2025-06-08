import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import useImage from "use-image";
import { nanoid } from "nanoid";
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
  const [image] = useImage(chaletBasement);
  // Test to save a image
  const stageRef = useRef(null);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ff0000");
  const [selectedId, setSelectedId] = useState(null);
  const [lines, setLines] = useState([]);

  const isDrawing = useRef(false);

  // Image scaling
  const stageWidth = 1024;
  const stageHeight = 768;

  const scaleX = stageWidth / (image?.width || 1);
  const scaleY = stageHeight / (image?.height || 1);
  const fitScale = Math.min(scaleX, scaleY);

  const imageOffsetX = (stageWidth - (image?.width || 0) * fitScale) / 2;
  const imageOffsetY = (stageHeight - (image?.height || 0) * fitScale) / 2;

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
    };
    setLines([...lines, newLine]);
    setSelectedId(newLine.id);
  };

  const handleMouseMove = (e) => {
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
    setLines((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    const confirmed = window.confirm("Are you sure you want to clear all lines?");
    if (confirmed) {
      setLines([]);
      setSelectedId(null);
    }
  };

  const handleSave = async () => {
    if (!stageRef.current) return;
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
  }


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
              <Layer>
                <Image
                    image={image}
                    scaleX={fitScale}
                    scaleY={fitScale}
                    x={imageOffsetX}
                    y={imageOffsetY}
                />
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
          </div>
        </div>
      </div>
  );
}



