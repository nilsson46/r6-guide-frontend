import React, { useState, useRef } from "react";
import { Stage, Layer, Image, Line } from "react-konva";
import useImage from "use-image"; // Hook för att ladda bilder smidigt
import backgroundImage from "../assets/r6-maps-coastline-blueprint-1.jpg";

export default function CanvasKonva() {
  // Ladda in bakgrundsbilden
  const [image] = useImage(backgroundImage);

  // State för att spara alla ritade linjer (varje linje är en array av punkter)
  const [lines, setLines] = useState([]);

  // Ref för att hålla koll på om vi ritar just nu (musknapp nedtryckt)
  const isDrawing = useRef(false);

  // Starta ritning - lägg till en ny linje med startpunkt
  const handleMouseDown = (e) => {
    isDrawing.current = true;

    // Hämta muspositionen relativt canvas
    const pos = e.target.getStage().getPointerPosition();

    // Lägg till en ny linje som börjar på denna punkt
    setLines([...lines, { points: [pos.x, pos.y] }]);
  };

  // När musen flyttas - lägg till punkter till senaste linjen
  const handleMouseMove = (e) => {
    // Om vi inte ritar, gör inget
    if (!isDrawing.current) return;

    // Hämta muspositionen
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    // Hämta senaste linjen som vi ritade på
    let lastLine = lines[lines.length - 1];

    // Lägg till ny punkt till linjens punktlista
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Uppdatera linjer - ersätt sista linjen med nya punkter
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };

  // Sluta rita när musknappen släpps eller lämnar canvas
  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <div>
      <h2>Rita på bilden (React-Konva)</h2>
      <Stage
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: "1px solid black" }}
      >
        <Layer>
          {/* Visa bakgrundsbild */}
          <Image image={image} />

          {/* Visa alla ritade linjer */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="red"           // Linjefärg
              strokeWidth={3}        // Linjetjocklek
              tension={0.5}          // Gör linjer mjuka
              lineCap="round"        // Rund ändpunkt på linjer
              globalCompositeOperation="source-over"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}