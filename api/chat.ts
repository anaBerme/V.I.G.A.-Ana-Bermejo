import { GoogleGenAI } from "@google/genai";

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, message } = req.body;
      
    let apiKeyRaw = process.env.GEMINI_API_KEY;

    
    // Saneamiento proactivo: Vercel a veces introduce comillas si el usuario las pega por error
    const apiKey = apiKeyRaw ? apiKeyRaw.trim().replace(/^["']|["']$/g, '') : undefined;
    
    if (!apiKey || apiKey === "undefined" || apiKey.includes('MY_GEMINI_API_KEY') || apiKey === '') {
      throw new Error("No se ha encontrado una API Key de Gemini válida. Entra en los Ajustes (Secrets) y añade tu clave real.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({
           role: h.role,
           parts: h.parts
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents,
      config: {
         systemInstruction: SYSTEM_PROMPT,
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
}
