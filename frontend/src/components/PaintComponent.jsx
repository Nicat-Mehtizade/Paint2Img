import { ReactSketchCanvas } from "react-sketch-canvas";
import { useRef, useState, useEffect } from "react";
import { FaPaintBrush, FaEraser, FaTrashAlt, FaPalette } from "react-icons/fa";
import { IoMdUndo } from "react-icons/io";
import { SketchPicker } from "react-color";
import { LuPaintbrush } from "react-icons/lu";
import { FaWandMagicSparkles } from "react-icons/fa6";
import { FiDownload } from "react-icons/fi";
import { renderToStaticMarkup } from "react-dom/server";

// Cursor üçün icon
const iconToCursor = (Icon, size = 24) => {
  const svgString = renderToStaticMarkup(<Icon size={size} />);
  return `url('data:image/svg+xml;utf8,${encodeURIComponent(
    svgString
  )}') 12 12, auto`;
};

// Base64 → File çevirmək
function base64ToFile(base64Data, filename) {
  const arr = base64Data.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

const PaintComponent = () => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("blue");
  const [stroke, setStroke] = useState(4);
  const [tool, setTool] = useState("brush");
  const [showPicker, setShowPicker] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");

  const clearCanvas = () => {
    canvasRef.current.clearCanvas();
    setHasDrawn(false);
    setGeneratedImage(null);
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

const generateAIImage = async () => {
  if (!canvasRef.current) return;
  setIsGenerating(true);
  setGeneratedImage(null);

  try {
    const base64Image = await canvasRef.current.exportImage("png");
    const file = base64ToFile(base64Image, "sketch.png");

    const formData = new FormData();
    formData.append("image", file); // Prompt artıq backend-də universal

    const response = await fetch("http://localhost:8000/api/generate", {
      method: "POST",
      body: formData,
    });

    if (!response.ok)
      throw new Error(`Backend error: ${response.statusText}`);

    const data = await response.json();
    if (data.image)
      setGeneratedImage(`data:image/png;base64,${data.image}`);
  } catch (error) {
    console.error("AI generation failed:", error);
  }

  setIsGenerating(false);
};


  return (
    <div className="max-w-[1300px] mx-auto flex flex-col lg:flex-row gap-10 items-stretch px-5">
      {/* Sol panel – Sketch */}
      <div className="bg-black/40 rounded-xl w-full lg:w-1/2 flex flex-col min-h-[500px]">
        <div className="pt-5 px-5 pb-2 border-b border-white/10 relative">
          <p className="flex items-center gap-2 text-white text-xl font-semibold">
            <LuPaintbrush /> Drawing
          </p>
          <p className="text-gray-500">
            Draw your sketch here and AI will transform it into a realistic
            image
          </p>
          <input
            type="text"
            placeholder="Describe what you want AI to generate"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="mt-3 w-full p-2 rounded text-white placeholder:text-white"
          />
        </div>

        <div className="flex-1 p-5">
          <div className="w-full h-full rounded-lg border border-black overflow-hidden relative min-h-[400px]">
            <ReactSketchCanvas
              ref={canvasRef}
              strokeWidth={stroke}
              strokeColor={color}
              width="100%"
              height="440px"
              style={{ cursor: cursorStyle, display: "block" }}
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none text-gray-400 text-center bg-transparent">
                <FaPaintBrush size={40} />
                <span className="mt-2">Start drawing here...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-5 border-t border-white/10">
          <div className="flex gap-1 md:gap-3 items-center">
            <button
              onClick={() => setTool("brush")}
              className={`p-2 rounded border ${
                tool === "brush" ? "bg-gray-300" : "bg-white"
              }`}
            >
              <FaPaintBrush />
            </button>
            <button
              onClick={() => {
                setColor("white");
                setTool("eraser");
              }}
              className={`p-2 rounded border ${
                tool === "eraser" ? "bg-gray-300" : "bg-white"
              }`}
            >
              <FaEraser />
            </button>
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="p-2 rounded border bg-white"
            >
              <FaPalette />
            </button>
            {showPicker && (
              <div className="absolute z-10 mt-2">
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
          <div className="flex gap-1 md:gap-3 items-center">
            <button onClick={undo} className="p-2 rounded border bg-white">
              <IoMdUndo />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded border bg-white flex items-center gap-1 text-red-600 font-semibold"
            >
              <FaTrashAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Sağ panel – AI Generated Image */}
      <div className="bg-black/40 rounded-xl w-full lg:w-1/2 flex flex-col">
        <div className="pt-5 px-5 pb-2 border-b border-white/10">
          <p className="flex items-center gap-2 text-white text-xl font-semibold">
            <FaWandMagicSparkles /> AI Generated Image
          </p>
          <p className="text-gray-500">
            Your sketch transformed by artificial intelligence
          </p>
        </div>
        <div className="flex-1 p-5">
          <div className="w-full h-full aspect-[10/7] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/10 flex items-center justify-center relative overflow-hidden">
            {!generatedImage ? (
              <div className="text-center text-gray-400">
                <FaWandMagicSparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">AI generated image will appear here</p>
              </div>
            ) : (
              <img
                src={generatedImage}
                alt="AI Generated"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">Generating image...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex justify-between items-center gap-4">
          <button
            onClick={generateAIImage}
            disabled={!hasDrawn || isGenerating}
            className="flex-1 bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaWandMagicSparkles /> Generate Image
          </button>
          <button className="p-2 border border-white/10 rounded text-gray-400">
            <FiDownload />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaintComponent;
