import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());


const AUTOMATIC1111_URL = "http://127.0.0.1:7860/sdapi/v1/img2img";


app.post("/api/generate", upload.single("image"), async (req, res) => {
  try {
    const { prompt, steps = 20, cfg_scale = 7, denoising_strength = 0.7 } = req.body;
    const filePath = req.file.path;

    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = req.file.mimetype;
    const init_images = [`data:${mimeType};base64,${base64Image}`];


    const payload = {
      prompt,
      init_images,
      steps: Number(steps),
      cfg_scale: Number(cfg_scale),
      denoising_strength: Number(denoising_strength),
    };


    const response = await fetch(AUTOMATIC1111_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();


    fs.unlinkSync(filePath);


    res.json({ images: result.images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Generation failed" });
  }
});


const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
