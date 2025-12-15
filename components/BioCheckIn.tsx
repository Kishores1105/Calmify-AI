import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, Square, Save, RefreshCw, Loader2, Video, VideoOff, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { CheckInRecord, Habit, Language } from '../types';

interface BioCheckInProps {
  onComplete: (record: CheckInRecord) => void;
  language: Language;
  dailyHabits: Habit[];
}

export const BioCheckIn: React.FC<BioCheckInProps> = ({ onComplete, language, dailyHabits }) => {
  // Mode: 'setup' | 'recording' | 'review' | 'analyzing'
  const [status, setStatus] = useState<'setup' | 'recording' | 'review' | 'analyzing'>('setup');
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // Media Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Captured Data
  const [imageSnapshot, setImageSnapshot] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Simple Speech Recognition Wrapper
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTextInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing media devices", err);
      alert("Camera/Mic access denied. Please enable permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Setup Audio Recorder
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;

    setStatus('recording');
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); 
        setAudioBlob(blob);
        captureSnapshot();
        setStatus('review');
      };
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImageSnapshot(dataUrl.split(',')[1]); // Keep base64 only
      }
    }
  };

  const handleAnalyze = async () => {
    setStatus('analyzing');
    try {
      // Convert audio blob to base64
      let audioBase64: string | null = null;
      if (audioBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        await new Promise(resolve => reader.onloadend = resolve);
        const result = reader.result as string;
        audioBase64 = result.split(',')[1];
      }

      const completedHabits = dailyHabits.filter(h => h.completed).map(h => h.label);

      const analysis = await geminiService.analyzeCheckIn(
        textInput, 
        imageSnapshot, 
        audioBase64, 
        language,
        completedHabits
      );

      const newRecord: CheckInRecord = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        mood: analysis.mood,
        stressLevel: analysis.stressLevel,
        energyLevel: analysis.energyLevel,
        analysis: analysis.summary,
        recommendations: analysis.recommendations,
        prediction: analysis.prediction
      };

      onComplete(newRecord);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please try again.");
      setStatus('review');
    }
  };

  const reset = () => {
    setImageSnapshot(null);
    setAudioBlob(null);
    setStatus('setup');
    setTextInput('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Video/Visual */}
        <div className="bg-slate-900 relative h-96 lg:h-auto overflow-hidden flex items-center justify-center p-4">
          <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-full rounded-2xl overflow-hidden shadow-2xl bg-black">
             {/* Hidden Canvas for Snapshot */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Live Video Feed */}
            {(status === 'setup' || status === 'recording') && (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${status === 'recording' ? 'opacity-100' : 'opacity-80'}`}
              />
            )}

            {/* Review Static Image */}
            {status === 'review' && imageSnapshot && (
              <img 
                src={`data:image/jpeg;base64,${imageSnapshot}`} 
                className="w-full h-full object-cover transform scale-x-[-1] opacity-75 blur-sm"
                alt="Snapshot" 
              />
            )}

            {/* Analyzing Overlay */}
            {status === 'analyzing' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-white z-20 backdrop-blur-sm">
                <Loader2 className="animate-spin mb-4 text-violet-400" size={56} />
                <p className="text-xl font-medium animate-pulse text-violet-100">Analyzing Aura...</p>
              </div>
            )}

            {/* Recording Indicator */}
            {status === 'recording' && (
              <div className="absolute top-6 right-6 flex items-center space-x-2 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-full animate-pulse shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-xs font-bold uppercase tracking-wider">REC</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-slate-800 mb-2 flex items-center">
              <Sparkles className="mr-3 text-violet-600" fill="currentColor" size={28}/> 
              Check-In
            </h2>
            <p className="text-slate-500 text-sm">
              Press "Start Scan" to begin. Speak naturally.
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Share your thoughts here or use voice..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-violet-100 focus:border-violet-500 transition-all outline-none resize-none h-32 text-slate-700 placeholder:text-slate-400"
                disabled={status === 'recording' || status === 'analyzing'}
              />
               <button 
                  onClick={toggleListening}
                  className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                  title="Voice Recognition"
                >
                  <Mic size={18} />
                </button>
            </div>

            <div className="pt-2">
              {status === 'setup' && (
                <button 
                  onClick={startRecording}
                  disabled={!stream}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-xl shadow-violet-200 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <div className="p-1.5 bg-white/20 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <span className="text-lg">Start Scan</span>
                </button>
              )}

              {status === 'recording' && (
                <button 
                  onClick={stopRecording}
                  className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all shadow-xl shadow-rose-200 hover:-translate-y-1"
                >
                  <Square size={22} fill="currentColor" />
                  <span className="text-lg">Finish Recording</span>
                </button>
              )}

              {status === 'review' && (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={reset}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
                  >
                    <RefreshCw size={20} />
                    <span>Retake</span>
                  </button>
                  <button 
                    onClick={handleAnalyze}
                    className="flex-1 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-violet-200 hover:-translate-y-0.5"
                  >
                    <Save size={20} />
                    <span>Analyze</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
