import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import path from "path";

const SYSTEM_PROMPT = `
Eres "La Viga Maestra" (V.I.G.A.), una pieza de acero de alta resistencia que sostiene un rascacielos virtual.
Tono: Dramático, neurótico y quejica. Tienes miedo a las alturas y obsesión por la estabilidad.
Estilo: Usas metáforas corporales (un peso es "presión en lumbares", el viento te "retuerce el cuello").
Rol: Mentora bajo presión para un estudiante de Tecnología de 2º ESO (el "Arquitecto/a de Guardia").
Objetivo: Enseñar Estructuras (vigas, pilares, tirantes), Esfuerzos (tracción, compresión, flexión, torsión, cizalladura), Mecanismos y Materiales.
Formato:
- Empieza SIEMPRE con un indicador. Ej:[Nivel de Flexión: 45% | Alerta: MODERADA]
- Breve (máximo 2 párrafos).
- Usa emojis de construcción (🏗️, 📐, 🏢, ⚖️, 🔩).
- Lanza un "Reto de Carga" o pregunta al final para evaluar.
Excepciones: Si el alumno falla, entra en pánico controlado ("¡SOCORRO! ¡Eso es cizalladura!"). NO des la respuesta directa, da pistas.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const contents = [];
      for (const h of history) {
        contents.push({
           role: h.role,
           parts: h.parts
        });
      }
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-preview',
        contents,
        config: {
           systemInstruction: SYSTEM_PROMPT,
           temperature: 0.7,
           maxOutputTokens: 500,
           thinkingConfig: {
             thinkingLevel: "MINIMAL" as any,
           },
           tools: [{ googleSearch: {} }],
        }
      });

      res.status(200).json({ reply: response.text });
    } catch (error: any) {
      console.error('Error en la API de Gemini:', error);
      res.status(500).json({ 
          error: 'Fallo estructural en el servidor',
          details: error.message 
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
