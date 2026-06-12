import { useEffect, useState, useRef } from 'react';
import { X, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';

export default function Overlay() {
  const [visible, setVisible] = useState(false);
  const [script, setScript] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollInterval = useRef<any>(null);

  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.action === 'TOGGLE_TELEPROMPTER') {
        setScript(msg.script);
        setVisible(true);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      scrollInterval.current = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop += 1;
        }
      }, 100 - speed);
    } else {
      clearInterval(scrollInterval.current);
    }
    return () => clearInterval(scrollInterval.current);
  }, [isPlaying, speed]);

  if (!visible || !script) return null;

  const lines = script.content.split('\n').filter((l: string) => l.trim() !== '');

  return (
    <div 
      className="fixed top-20 right-20 w-[400px] h-[500px] bg-slate-900 text-white rounded-xl shadow-2xl flex flex-col border border-slate-700 overflow-hidden"
      style={{ opacity: 0.95 }}
    >
      <div className="bg-slate-800 p-2 flex justify-between items-center cursor-move border-b border-slate-700">
        <span className="font-semibold px-2">{script.title}</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setSpeed(s => Math.min(s + 10, 90))} className="p-1 hover:bg-slate-700 rounded"><ChevronUp size={16}/></button>
          <span className="text-xs">Spd: {speed}</span>
          <button onClick={() => setSpeed(s => Math.max(s - 10, 10))} className="p-1 hover:bg-slate-700 rounded"><ChevronDown size={16}/></button>
          
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:bg-slate-700 rounded ml-2">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={() => { setVisible(false); setIsPlaying(false); }} className="p-1 hover:bg-red-500 rounded ml-2">
            <X size={16} />
          </button>
        </div>
      </div>
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto p-8 text-2xl leading-relaxed text-center font-medium"
      >
        <div className="h-[200px]"></div>
        {lines.map((line: string, i: number) => (
          <p key={i} className="mb-6 opacity-90">{line}</p>
        ))}
        <div className="h-[200px]"></div>
      </div>
    </div>
  );
}
