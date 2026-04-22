/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

type Message = {
  role: 'bot' | 'user';
  text: string;
  isError?: boolean;
};

const INITIAL_MESSAGE = "¡Cuidado donde pisas![Crujido metálico] Uff... soy la Viga Maestra del ala norte. Menos mal que aparece un Arquitecto de Guardia. Siento una vibración extraña en mis soportes... ¿Sabes cómo se llaman esos elementos verticales que deberían estar ayudándome a aguantar este peso o vas a dejar que me doble como un regaliz?";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: INITIAL_MESSAGE }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState([
     { role: 'model', parts: [{ text: INITIAL_MESSAGE }] }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      setHistory(prev => [
        ...prev, 
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: data.reply }] }
      ]);
    } catch (error: any) {
      console.error(error);
      const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('run.app');
      const details = error.message ? `\n\n[Detalles técnicos: ${error.message}]` : '';
      const errorNarrativo = `[ERROR DE SISTEMA: ALARMA SÍSMICA 🚨] \n¡Aaaah! ¡Hay un fallo de conexión en mis sensores! No consigo procesar tu informe arquitectónico. Revisa tus planos (conexión a internet) e inténtalo de nuevo antes de que nos derrumbemos.${isDev ? details : ''}`;
      setMessages(prev => [...prev, { role: 'bot', text: errorNarrativo, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    let formattedText = text.replace(/\n/g, '<br>');
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex flex-col overflow-hidden" 
         style={{ 
           backgroundImage: 'linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(245, 158, 11, 0.03) 1px, transparent 1px)',
           backgroundSize: '40px 40px' 
         }}>
      
      {/* TOP NAVIGATION / SYSTEM BAR */}
      <header className="h-16 sm:h-20 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-amber-500 rounded-md flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <span className="text-2xl sm:text-4xl font-black text-black">I</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-[0.2em] text-amber-500">V.I.G.A.</h1>
            <p className="hidden sm:block text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Virtual Intelligent Girder Assistant v2.0</p>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-8 items-center">
          <div className="text-right">
            <div className="text-[8px] sm:text-[10px] text-zinc-500 uppercase font-mono mb-1">Integridad Estructural</div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-1.5 sm:h-2 w-24 sm:w-48 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div id="health-bar" className="h-full bg-green-500 w-[88%] transition-all duration-500"></div>
              </div>
              <span id="health-text" className="text-[10px] sm:text-xs font-mono font-bold text-green-500">88% NOMINAL</span>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-[1px] bg-zinc-800"></div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Arquitecto de Guardia</span>
            <span className="text-sm font-bold text-zinc-300 tracking-tight">STU-2024-ESO</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: TELEMETRY */}
        <aside className="hidden md:flex w-64 lg:w-72 border-r border-zinc-800 bg-zinc-900/40 p-4 lg:p-6 flex-col gap-6 shrink-0 overflow-y-auto">
          <div>
            <h3 className="text-[11px] font-mono text-amber-500/70 uppercase mb-4 tracking-tighter">Sensores de Esfuerzo</h3>
            <div className="space-y-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex justify-between text-[10px] mb-2 font-mono uppercase"><span>Compresión</span><span className="text-amber-500">45%</span></div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[45%]"></div>
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex justify-between text-[10px] mb-2 font-mono uppercase"><span>Tracción</span><span className="text-blue-400">12%</span></div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[12%]"></div>
                </div>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <div className="flex justify-between text-[10px] mb-2 font-mono uppercase"><span>Torsión</span><span className="text-red-500">78%</span></div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[78%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span className="text-xs font-bold uppercase font-mono">Alerta de Carga</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Vibración detectada en el ala norte. El Arquitecto debe identificar el tipo de cizalladura antes del colapso del nodo B-12.
            </p>
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-col relative min-w-0">
          <div 
            id="chat-container" 
            ref={scrollRef}
            className="flex-1 p-4 sm:p-8 space-y-6 overflow-y-auto"
          >
            {messages.map((msg, index) => {
              const isBot = msg.role === 'bot';
              
              if (isBot) {
                return (
                  <div key={index} className="flex flex-col items-start max-w-[90%] sm:max-w-[85%] animate-slideUp">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_rgba(245,158,11,0.8)] ${msg.isError ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`}></span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${msg.isError ? 'text-red-500' : 'text-amber-500'}`}>Unidad V.I.G.A.</span>
                    </div>
                    <div className={`p-4 sm:p-5 rounded-2xl rounded-tl-none shadow-xl border-l-4 ${msg.isError ? 'bg-red-950/20 border-red-500' : 'bg-zinc-900 border-amber-500'}`}>
                      {!msg.isError && <p className="text-amber-500 font-mono text-[10px] sm:text-[11px] mb-3">[Procesando Datos Estructurales...]</p>}
                      <div className="text-zinc-300 leading-relaxed text-sm sm:text-base">{formatText(msg.text)}</div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex flex-col items-end animate-slideUp self-end ml-auto">
                    <div className="p-4 sm:p-5 rounded-2xl rounded-tr-none bg-zinc-800 border-r-4 border-blue-500 max-w-[85%] sm:max-w-[70%] shadow-lg">
                      <div className="text-zinc-200 leading-relaxed font-medium text-sm sm:text-base">{formatText(msg.text)}</div>
                    </div>
                  </div>
                );
              }
            })}

            {isLoading && (
              <div className="flex flex-col items-start max-w-[85%] animate-slideUp">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_5px_rgba(245,158,11,0.8)]"></span>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest">Unidad V.I.G.A.</span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl rounded-tl-none bg-zinc-900 border-l-4 border-amber-500 shadow-xl flex items-center gap-3">
                  <span className="text-xs font-mono text-amber-500">Calculando tensiones...</span>
                  <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 sm:p-6 bg-zinc-900 border-t border-zinc-800 shrink-0 relative z-10 w-full">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text" 
                  placeholder="Escribe tu informe arquitectónico..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full bg-black border border-zinc-700 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors shadow-inner font-mono text-xs sm:text-sm"
                />
                <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 gap-2">
                  <span className="px-2 py-1 bg-zinc-800 rounded text-[9px] text-zinc-500 font-mono">ENTER</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold uppercase px-4 sm:px-8 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all transform active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:shadow-none"
              >
                <span className="hidden sm:inline">Reforzar</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
              </button>
            </form>
            <div className="mt-3 flex justify-center">
              <span className="text-[8px] sm:text-[9px] font-mono text-zinc-600 tracking-[0.2em] sm:tracking-[0.3em] uppercase text-center">Protocolo de Estabilidad Activo // Terminal 01-A</span>
            </div>
          </div>
        </main>
      </div>

      {/* DECORATIVE CORNER ACCENT */}
      <div className="fixed bottom-0 right-0 w-32 h-32 pointer-events-none overflow-hidden hidden sm:block z-0">
        <div className="absolute bottom-[-50px] right-[-50px] w-48 h-48 border-[20px] border-amber-500/5 rotate-45"></div>
      </div>

    </div>
  );
}
