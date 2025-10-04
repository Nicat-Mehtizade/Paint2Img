import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import "dotenv/config";

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
app.use(express.json());

app.post("/api/generate", upload.single("image"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const form = new FormData();
    form.append("image", fs.createReadStream(filePath)); // <- "image"
    form.append(
      "prompt",
      "Convert this sketch into realistic 4k photo, photorealistic, cinematic lighting"
    );
    form.append("denoising_strength", 0.85);
    form.append("steps", 50);
    form.append("cfg_scale", 9);
    form.append("seed", Math.floor(Math.random() * 1000000));
    form.append("output_format", "png");

    const response = await axios.post(
      "https://api.stability.ai/v2beta/stable-image/img2img",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.STABILITY_KEY}`,
          Accept: "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    fs.unlinkSync(filePath);
    res.json({ image: Buffer.from(response.data).toString("base64") });
  } catch (err) {}
});
