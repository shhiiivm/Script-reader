import { useEffect, useState, useRef } from 'react';
import { api } from '../services/api';
import { Play, Pause, Square, Download, ChevronUp, ChevronDown, ArrowUpToLine, Minus, ArrowDownToLine } from 'lucide-react';

export default function Studio() {
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [position, setPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const scrollPosRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('scriptId');
    if (id) {
      api.getScriptById(id)
        .then(s => setScript(s))
        .catch(() => setError('Failed to load script'))
        .finally(() => setLoading(false));
    } else {
      setError('No script ID provided');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 }, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    setupCamera();
  }, []);
  
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (isPlaying) {
      let lastTime = performance.now();
      const scroll = (time: number) => {
        const delta = time - lastTime;
        lastTime = time;
        // speed ranges from 10 to 300. pixels per second.
        const pxPerSec = speedRef.current; 
        scrollPosRef.current += (pxPerSec * delta) / 1000;
        
        if (contentRef.current) {
          contentRef.current.scrollTop = Math.floor(scrollPosRef.current);
        }
        animationRef.current = requestAnimationFrame(scroll);
      };
      animationRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (contentRef.current) scrollPosRef.current = contentRef.current.scrollTop;
  }, []);

  const handleStartRecording = () => {
    setRecordingUrl(null);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      let chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPlaying(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPlaying(false);
    }
  };

  const handleDownload = () => {
    if (recordingUrl) {
      const a = document.createElement('a');
      a.href = recordingUrl;
      a.download = `${script?.title || 'recording'}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading studio...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const lines = script.content.split('\n').filter((l: string) => l.trim() !== '');

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex justify-center items-center">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute w-full h-full object-cover z-0"
        style={{ transform: 'scaleX(-1)' }}
      />

      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 bg-black/50 p-4 rounded-xl backdrop-blur-md">
        <h1 className="text-xl font-bold text-white mb-2">{script.title}</h1>
        
        {!isRecording ? (
          <button onClick={handleStartRecording} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition">
            <div className="w-3 h-3 bg-white rounded-full"></div> Record
          </button>
        ) : (
          <button onClick={handleStopRecording} className="bg-gray-800 border-2 border-red-500 hover:bg-gray-700 text-red-500 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 animate-pulse transition">
            <Square size={16} fill="currentColor" /> Stop Recording
          </button>
        )}

        {recordingUrl && !isRecording && (
          <button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 mt-2 transition">
            <Download size={16} /> Download .webm
          </button>
        )}

        <div className="mt-4 text-white text-sm">
          <p className="font-semibold mb-1">Teleprompter Settings</p>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setPosition('top')} className={`p-1 rounded transition ${position === 'top' ? 'bg-blue-600' : 'hover:bg-white/20'}`} title="Top"><ArrowUpToLine size={16}/></button>
            <button onClick={() => setPosition('middle')} className={`p-1 rounded transition ${position === 'middle' ? 'bg-blue-600' : 'hover:bg-white/20'}`} title="Middle"><Minus size={16}/></button>
            <button onClick={() => setPosition('bottom')} className={`p-1 rounded transition ${position === 'bottom' ? 'bg-blue-600' : 'hover:bg-white/20'}`} title="Bottom"><ArrowDownToLine size={16}/></button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSpeed(s => Math.min(s + 5, 150))} className="p-1 hover:bg-white/20 rounded transition"><ChevronUp size={16}/></button>
            <span>Speed: {speed}</span>
            <button onClick={() => setSpeed(s => Math.max(s - 5, 5))} className="p-1 hover:bg-white/20 rounded transition"><ChevronDown size={16}/></button>
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className={`mt-2 w-full py-2 rounded flex items-center justify-center gap-2 font-bold transition ${isPlaying ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />} {isPlaying ? 'Pause Scrolling' : 'Start Scrolling'}
          </button>
        </div>
      </div>

      <div className={`absolute left-1/2 -translate-x-1/2 w-[800px] h-[160px] z-10 pointer-events-none bg-black/40 backdrop-blur-sm border-white/10 flex justify-center transition-all duration-300 ${
        position === 'top' ? 'top-0 rounded-b-3xl border-b' :
        position === 'bottom' ? 'bottom-0 rounded-t-3xl border-t' :
        'top-1/2 -translate-y-1/2 rounded-3xl border'
      }`}>
        <div 
          ref={contentRef}
          className="w-full h-full overflow-y-auto teleprompter-scroll no-scrollbar px-10 py-[60px]"
          style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent 5%, black 30%, black 70%, transparent 95%)' }}
        >
          {lines.map((line: string, i: number) => (
            <p key={i} className="text-4xl text-white font-bold leading-relaxed mb-8 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center">
              {line}
            </p>
          ))}
        </div>
      </div>
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
