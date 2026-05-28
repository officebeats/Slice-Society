import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PIZZA_PLACES } from '../constants';
import { GoogleGenAI, Modality } from "@google/genai";
import { PizzaPlace } from '../types';

// Implementation of custom base64 decode for Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Custom Audio Decoding for raw PCM 16-bit
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- Audio Stream Player Class ---
class PCMStreamPlayer {
  private audioContext: AudioContext;
  private nextStartTime: number = 0;
  private isStopped: boolean = false;
  private sampleRate: number;
  private outputNode: GainNode;
  private activeSources: Set<AudioBufferSourceNode> = new Set();

  constructor(audioContext: AudioContext, sampleRate: number = 24000) {
    this.audioContext = audioContext;
    this.sampleRate = sampleRate;
    this.nextStartTime = this.audioContext.currentTime;
    this.outputNode = this.audioContext.createGain();
    this.outputNode.connect(this.audioContext.destination);
  }

  public async queueChunk(base64: string) {
    if (this.isStopped) return;
    
    const bytes = decode(base64);
    const audioBuffer = await decodeAudioData(bytes, this.audioContext, this.sampleRate, 1);
    
    if (this.isStopped) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputNode);
    
    this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
    
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  public stop() {
    this.isStopped = true;
    for (const source of this.activeSources) {
      try { source.stop(); } catch(e) {}
    }
    this.activeSources.clear();
    this.nextStartTime = 0;
  }
}

// Sort places by established date for the timeline
const sortedPlaces = [...PIZZA_PLACES].filter(p => !p.id.startsWith('osm-')).sort((a, b) => parseInt(a.established) - parseInt(b.established));

const HistoryView: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [playbackState, setPlaybackState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [activeItemId, setActiveItemId] = useState<string | null>(null); 
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamPlayerRef = useRef<PCMStreamPlayer | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (streamPlayerRef.current) {
        streamPlayerRef.current.stop();
        streamPlayerRef.current = null;
    }
    setPlaybackState('idle');
    setActiveItemId(null);
  };

  const handleAudioAction = async (targetId: string, place: PizzaPlace) => {
    // 1. Initialize Audio Context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    
    // Always resume context
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // 2. Toggle Off if clicking active item
    if (activeItemId === targetId && (playbackState === 'playing' || playbackState === 'loading')) {
        stopAudio();
        return;
    }

    // 3. STOP any currently playing audio
    stopAudio();

    // 4. Start New Playback Session
    setActiveItemId(targetId);
    setPlaybackState('loading');
    
    streamPlayerRef.current = new PCMStreamPlayer(audioContextRef.current);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const textToRead = `Here is the story of ${place.name}, established in ${place.established}. ${place.history}`;
        const prompt = `Speak with a warm, informative voice. Narrate this: ${textToRead}`;

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Charon' },
                    },
                },
            },
        });

        let firstChunk = true;
        for await (const chunk of responseStream) {
            if (!streamPlayerRef.current || activeItemId !== targetId) break;
            const base64Audio = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (firstChunk) {
                  setPlaybackState('playing');
                  firstChunk = false;
                }
                streamPlayerRef.current.queueChunk(base64Audio);
            }
        }
    } catch (error) {
        console.error("TTS Stream Error:", error);
        setPlaybackState('idle');
        setActiveItemId(null);
    }
  };

  return (
    <div className="pt-8 pb-32 md:pb-8 px-2 w-full max-w-2xl mx-auto min-h-screen">
       <header className="mb-6 flex justify-between items-center sticky top-0 bg-background-light/95 backdrop-blur z-40 py-2 border-b-2 border-black/10">
        <div>
          <h1 className="font-display text-2xl text-primary drop-shadow-[1px_1px_0_black] uppercase">SLICE-SOCIETY HISTORY</h1>
          <p className="font-bold text-[9px] uppercase tracking-widest text-zinc-500">Legends of the Doughmocracy</p>
        </div>
        <button className="w-8 h-8 bg-white border-[3px] border-black rounded-full flex items-center justify-center shadow-[2px_2px_0_0_black] active:translate-y-0.5 active:shadow-none transition-all">
          <span className="material-symbols-outlined text-black text-lg">calendar_month</span>
        </button>
      </header>

      <div className="relative border-l-[3px] border-black border-dashed ml-3 space-y-4 pb-8">
        {sortedPlaces.map((place) => (
            <div key={place.id} className="relative pl-6 md:pl-8 group">
                <div className="absolute -left-[10px] top-5 w-4 h-4 bg-white border-[3px] border-black rounded-full z-10 group-hover:bg-primary transition-all"></div>
                <div className="bg-white border-[3px] border-black rounded-[1.5rem] card-shadow overflow-hidden relative">
                    <div className="h-28 bg-zinc-200 relative overflow-hidden">
                        <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <div className="absolute top-2 left-2 bg-primary text-white font-display text-[10px] px-2 py-0.5 rounded border-[2px] border-black shadow-[2px_2px_0_0_black]">
                            Est. {place.established}
                        </div>
                    </div>

                    <div className="p-3">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="font-display text-lg uppercase leading-none text-black">{place.name}</h2>
                            <button 
                                onClick={() => handleAudioAction(place.id, place)}
                                className={`
                                    w-8 h-8 rounded-full border-[2px] border-black flex items-center justify-center shadow-[2px_2px_0_0_black] active:translate-y-0.5 active:shadow-none transition-all
                                    ${activeItemId === place.id ? 'bg-primary text-white animate-pulse' : 'bg-white text-black hover:bg-zinc-100'}
                                `}
                            >
                                {activeItemId === place.id && playbackState === 'loading' ? (
                                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                ) : (
                                    <span className="material-symbols-outlined text-lg">
                                        {activeItemId === place.id && (playbackState === 'playing' || playbackState === 'loading') ? 'stop' : 'headphones'}
                                    </span>
                                )}
                            </button>
                        </div>
                        <p className="font-bold text-[11px] text-black leading-snug">{place.history}</p>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;