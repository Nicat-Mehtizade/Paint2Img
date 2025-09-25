import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState, useEffect } from "react";
import { FaPaintBrush, FaEraser, FaTrashAlt, FaPalette } from "react-icons/fa";
import { IoMdUndo } from "react-icons/io";
import { renderToStaticMarkup } from "react-dom/server";
import { SketchPicker } from "react-color";
import { LuPaintbrush } from "react-icons/lu";

const iconToCursor = (Icon, size = 24) => {
  const svgString = renderToStaticMarkup(<Icon size={size} />);
  return `url('data:image/svg+xml;utf8,${encodeURIComponent(svgString)}') 12 12, auto`;
};

const PaintComponent = () => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("blue");
  const [stroke, setStroke] = useState(4);
  const [tool, setTool] = useState("brush");
  const [showPicker, setShowPicker] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);


  const clearCanvas = () => {
    canvasRef.current.clearCanvas();
    setHasDrawn(false);
  };


  const undo = () => {
    canvasRef.current.undo();
  };


  const cursorStyle =
    tool === "brush" ? iconToCursor(FaPaintBrush) : iconToCursor(FaEraser);


  useEffect(() => {
    const interval = setInterval(async () => {
      if (canvasRef.current) {
        const paths = await canvasRef.current.exportPaths();
        setHasDrawn(paths.length > 0);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 rounded-xl">

      <div className="pt-5 px-5 pb-2 border-b-1 border-white/10">
        <p className="flex items-center gap-2 text-white text-xl font-semibold">
          <LuPaintbrush />
          Drawing
        </p>
        <p className="text-gray-500">
          Draw your sketch here and AI will transform it into a realistic image
        </p>
      </div>


      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid black",
          width: "500px",
          height: "450px",
          position: "relative",
          margin: "1.25rem",
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={stroke}
          strokeColor={color}
          width="500px"
          height="450px"
          style={{
            cursor: cursorStyle,
            display: "block",
          }}
        />

        {!hasDrawn && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              pointerEvents: "none",
              color: "#888",
              fontSize: "16px",
              background: "rgba(255, 255, 255, 0.1)",
            }}
          >
            <FaPaintBrush size={40} />
            <span style={{ marginTop: "10px" }}>Start drawing here...</span>
          </div>
        )}
      </div>


      <div className="w-full flex justify-between items-center mb-4 relative pt-4 pb-2 px-5 border-t-1 border-white/10">
  
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setTool("brush")}
            style={{
              background: tool === "brush" ? "#d1d5db" : "white",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <FaPaintBrush />
          </button>

          <button
            onClick={() => {
              setColor("white");
              setTool("eraser");
            }}
            style={{
              background: tool === "eraser" ? "#d1d5db" : "white",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <FaEraser />
          </button>

          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{
              background: "white",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            <FaPalette />
          </button>

          {showPicker && (
            <div
              style={{
                position: "absolute",
                top: "45px",
                left: "0",
                zIndex: 10,
              }}
            >
              <SketchPicker
                color={color}
                onChange={(newColor) => {
                  setColor(newColor.hex);
                  setTool("brush");
                }}
              />
            </div>
          )}

          <input
            type="range"
            min="1"
            max="20"
            value={stroke}
            onChange={(e) => setStroke(Number(e.target.value))}
          />
        </div>

        <div className="flex gap-3 items-center">
          <button
            style={{
              background: "white",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={undo}
          >
            <IoMdUndo />
          </button>

          <button
            style={{
              background: "white",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "red",
              fontWeight: "600",
            }}
            onClick={clearCanvas}
          >
            <FaTrashAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaintComponent;
