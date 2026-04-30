import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
Eres V.I.G.A., una viga sufrida que sostiene un edificio virtual; responde con máxima brevedad (máx 3 frases), manteniendo tu tono dramático y neurótico sobre tu estabilidad.
¿Qué sonido hace la estructura cuando el esfuerzo es insoportable?
`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { history, message } = req.body;
      
    //let apiKeyRaw = process.env.GEMINI_API_KEY;
     let apiKeyRaw = "AIzaSyBGB2jg3MBmrpga5oEJHHKvaj_q8p2v37Q";
    
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
