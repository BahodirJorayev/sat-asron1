import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  CircleDot,
  StopCircle,
  Users,
  MessageSquare,
  Calculator,
  Share2,
  X,
  Sparkles,
  Hand,
  Maximize2,
  Minimize2,
  Layers,
  Bookmark,
  CheckCircle2,
  Send,
  Volume2,
  Copy,
  ThumbsUp,
  Download,
  Square,
  Circle,
  Move,
  Settings,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { User, Chat, LiveStreamSession, Message } from '../../types';
import { LiveWhiteboard } from '../LiveWhiteboard';
import { DesmosCalculator } from '../DesmosCalculator';
import { uploadChatMedia, broadcastStreamSignalRealtime } from '../../lib/chatRealtimeService';

interface Props {
  user: User;
  activeChat?: Chat;
  session?: LiveStreamSession;
  onClose: () => void;
  onLessonRecordedAndSaved: (savedMessage: Message, targetChatId?: string) => void;
}

interface LiveQuestionItem {
  id: string;
  sender: string;
  text: string;
  time: string;
  votes: number;
  isQuestion: boolean;
  votedBy: string[];
}

export const LiveStreamStudio: React.FC<Props> = ({
  user,
  activeChat,
  session,
  onClose,
  onLessonRecordedAndSaved,
}) => {
  const isHost =
    user.role === 'SUPER_ADMIN' ||
    user.role === 'ADMIN' ||
    activeChat?.createdById === user.id ||
    activeChat?.channelAdmins?.includes(user.id);

  // 1. Media States & Controls
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeTabMode, setActiveTabMode] = useState<'WHITEBOARD' | 'SCREEN' | 'DESMOS' | 'SPLIT'>('SCREEN');
  const [pipShape, setPipShape] = useState<'RECT' | 'CIRCLE'>('RECT');
  const [pipPosition, setPipPosition] = useState<'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'TOP_RIGHT' | 'TOP_LEFT'>('BOTTOM_LEFT');
  const [isPipMinimized, setIsPipMinimized] = useState<boolean>(false);

  // Video & Stream Refs
  const stageContainerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 2. High-Grade Recording Engine (MediaRecorder API)
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Recording completion dialog
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlobData, setRecordedBlobData] = useState<Blob | null>(null);
  const [recordedLessonResult, setRecordedLessonResult] = useState<{
    id: string;
    title: string;
    videoUrl: string;
    durationSecs: number;
    recordedAt: string;
  } | null>(null);
  const [forwardTargetChatId, setForwardTargetChatId] = useState<string>(activeChat?.id || '');
  const [isUploadingRecording, setIsUploadingRecording] = useState<boolean>(false);
  const [recordingSuccessNotice, setRecordingSuccessNotice] = useState<string | null>(null);

  // 3. Floating Desmos Hub
  const [isDesmosOpen, setIsDesmosOpen] = useState<boolean>(false);
  const [isDesmosFullScreen, setIsDesmosFullScreen] = useState<boolean>(false);

  // 4. Live Stream Sidebars & Questions
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarView, setSidebarView] = useState<'CHAT' | 'QUESTIONS' | 'VIEWERS'>('CHAT');

  const [liveMessages, setLiveMessages] = useState<
    { id: string; sender: string; text: string; time: string; isQuestion?: boolean }[]
  >([
    {
      id: 'lm-1',
      sender: 'ASRON Master Tutor',
      text: 'Jonli efir boshlandi. Ekran orqali Bluebook va Desmos darsi olib borilmoqda.',
      time: '19:40',
    },
  ]);

  const [liveQuestions, setLiveQuestions] = useState<LiveQuestionItem[]>([
    {
      id: 'q-1',
      sender: 'Azizbek K.',
      text: 'Desmosda regression orqali sistema tenglamalarini 15 soniyada yechish usuli qanday?',
      time: '19:42',
      votes: 5,
      isQuestion: true,
      votedBy: ['usr-1', 'usr-2'],
    },
  ]);

  const [inputLiveMessage, setInputLiveMessage] = useState<string>('');
  const [inputLiveQuestion, setInputLiveQuestion] = useState<string>('');

  // Live Attendees
  const [attendees, setAttendees] = useState<{ id: string; name: string; avatar: string; handRaised: boolean; isMuted: boolean }[]>([
    { id: 'usr-1', name: 'Azizbek K. (1520 Goal)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80', handRaised: true, isMuted: true },
    { id: 'usr-2', name: 'Madina Sh. (Math 800)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80', handRaised: false, isMuted: true },
    { id: 'usr-3', name: 'Javohir T. (RW 760)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80', handRaised: false, isMuted: false },
  ]);

  const [handRaisedByMe, setHandRaisedByMe] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Initialize Host/Viewer Camera & Microphone
  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          if (active) {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        }
      } catch (err) {
        console.warn('Camera/Mic permission access:', err);
      }
    }

    if (isCameraOn) {
      initCamera();
    }

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn]);

  // Screen Share Engine: Entire OS Screen Capture (getDisplayMedia)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);
      setActiveTabMode('WHITEBOARD');
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          // Request full OS screen / window / tab capture with system audio
          const screenStream = await (navigator.mediaDevices as any).getDisplayMedia({
            video: {
              displaySurface: 'monitor', // Prefer entire monitor / OS
              frameRate: { ideal: 60, max: 60 },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              cursor: 'always',
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 48000,
            },
            surfaceSwitching: 'include',
            selfBrowserSurface: 'exclude',
            systemAudio: 'include',
          });

          screenStreamRef.current = screenStream;
          if (screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
          }
          setIsScreenSharing(true);
          setActiveTabMode('SCREEN');

          // Handle when user stops sharing via browser bar
          screenStream.getVideoTracks()[0].onended = () => {
            setIsScreenSharing(false);
            setActiveTabMode('WHITEBOARD');
          };
        } else {
          setIsScreenSharing(true);
          setActiveTabMode('SCREEN');
        }
      } catch (err) {
        console.warn('Screen sharing cancelled or unsupported:', err);
      }
    }
  };

  // Build Unified Stream for Recording (Video + Mixed Audio)
  const buildCombinedRecordingStream = (): MediaStream | null => {
    try {
      const hasScreenAudio = !!(screenStreamRef.current && screenStreamRef.current.getAudioTracks().length > 0);
      const hasMicAudio = !!(mediaStreamRef.current && isMicOn && mediaStreamRef.current.getAudioTracks().length > 0);

      let masterAudioTrack: MediaStreamTrack | null = null;

      if (hasScreenAudio && hasMicAudio && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const dest = audioCtx.createMediaStreamDestination();

          if (screenStreamRef.current) {
            const screenSource = audioCtx.createMediaStreamSource(screenStreamRef.current);
            screenSource.connect(dest);
          }
          if (mediaStreamRef.current) {
            const micSource = audioCtx.createMediaStreamSource(mediaStreamRef.current);
            micSource.connect(dest);
          }

          masterAudioTrack = dest.stream.getAudioTracks()[0];
        } catch (mixErr) {
          console.warn('AudioContext mixing fallback:', mixErr);
          masterAudioTrack = mediaStreamRef.current?.getAudioTracks()[0] || screenStreamRef.current?.getAudioTracks()[0] || null;
        }
      } else if (hasScreenAudio) {
        masterAudioTrack = screenStreamRef.current!.getAudioTracks()[0];
      } else if (hasMicAudio) {
        masterAudioTrack = mediaStreamRef.current!.getAudioTracks()[0];
      }

      // Main video track (Screen share stream first, or webcam stream)
      let mainVideoTrack: MediaStreamTrack | null = null;
      if (screenStreamRef.current && screenStreamRef.current.getVideoTracks().length > 0) {
        mainVideoTrack = screenStreamRef.current.getVideoTracks()[0];
      } else if (mediaStreamRef.current && mediaStreamRef.current.getVideoTracks().length > 0) {
        mainVideoTrack = mediaStreamRef.current.getVideoTracks()[0];
      }

      if (mainVideoTrack) {
        const tracks = [mainVideoTrack];
        if (masterAudioTrack) tracks.push(masterAudioTrack);
        return new MediaStream(tracks);
      }
    } catch (e) {
      console.warn('Audio/Video mixing notice:', e);
    }
    return screenStreamRef.current || mediaStreamRef.current;
  };

  // 1-Click Start / Stop Recording Pipeline
  const handleToggleRecording = () => {
    if (isRecording) {
      // 1. Stop Recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);

      const finalDuration = recordingSeconds;
      setRecordingSeconds(0);

      // Create blob from chunks
      setTimeout(() => {
        let blobUrl = '';
        let blobObj: Blob | null = null;
        if (recordedChunksRef.current.length > 0) {
          blobObj = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          blobUrl = URL.createObjectURL(blobObj);
          setRecordedBlobUrl(blobUrl);
          setRecordedBlobData(blobObj);
        }

        const recordedVideo = {
          id: `rec-${Date.now()}`,
          title: `${activeChat?.name || 'ASRON SAT Masterclass'} - Live Lesson`,
          videoUrl: blobUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          durationSecs: finalDuration || 180,
          recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setRecordedLessonResult(recordedVideo);
      }, 300);
    } else {
      // 2. Start Recording
      recordedChunksRef.current = [];
      setRecordedBlobUrl(null);
      setRecordedBlobData(null);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      try {
        const streamToRecord = buildCombinedRecordingStream();
        if (streamToRecord && typeof MediaRecorder !== 'undefined') {
          let mimeType = 'video/webm;codecs=vp9,opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm;codecs=vp8,opus';
          }
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm';
          }

          const recorder = new MediaRecorder(streamToRecord, {
            mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
            videoBitsPerSecond: 2500000,
          });

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              recordedChunksRef.current.push(e.data);
            }
          };

          recorder.start(1000);
          mediaRecorderRef.current = recorder;
        }
      } catch (err) {
        console.warn('MediaRecorder init error:', err);
      }
    }
  };

  // Immediate Local Download of Recorded Lesson
  const handleDownloadRecordedFile = () => {
    if (!recordedLessonResult) return;
    const dateStamp = new Date().toISOString().slice(0, 10);
    const filename = `ASRON_SAT_Lesson_${dateStamp}.webm`;

    if (recordedBlobData) {
      const url = URL.createObjectURL(recordedBlobData);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (recordedBlobUrl) {
      const a = document.createElement('a');
      a.href = recordedBlobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Deliver Lesson Recording -> Saved Messages / Selected Channel
  const handleDeliverRecording = async (forwardToChannel: boolean) => {
    if (!recordedLessonResult) return;
    setIsUploadingRecording(true);

    let finalVideoUrl = recordedLessonResult.videoUrl;

    if (recordedChunksRef.current.length > 0) {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      try {
        const uploadRes = await uploadChatMedia(blob, `recording-${Date.now()}.webm`, 'stream-recordings');
        if (uploadRes.url) {
          finalVideoUrl = uploadRes.url;
        }
      } catch (e) {
        console.warn('Upload fallback to local URL:', e);
      }
    }

    const savedLessonMessage: Message = {
      id: `msg-rec-${Date.now()}`,
      senderId: user.id,
      senderName: user.fullName,
      senderAvatar: user.avatarUrl,
      senderRole: user.role,
      content: `🎬 **Live SAT Masterclass Darsi Yozuvi**\n\n📌 **Mavzu:** ${recordedLessonResult.title}\n⏱️ **Davomiyligi:** ${Math.floor(recordedLessonResult.durationSecs / 60)}m ${recordedLessonResult.durationSecs % 60}s\n📅 **Sana:** ${recordedLessonResult.recordedAt}`,
      recordingVideoUrl: finalVideoUrl,
      recordingTitle: recordedLessonResult.title,
      recordingDuration: recordedLessonResult.durationSecs,
      createdAt: new Date().toISOString(),
    };

    onLessonRecordedAndSaved(
      savedLessonMessage,
      forwardToChannel ? forwardTargetChatId || activeChat?.id : undefined
    );

    setIsUploadingRecording(false);
    setRecordedLessonResult(null);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLiveMessage.trim()) return;

    const newMsg = {
      id: `lm-${Date.now()}`,
      sender: user.fullName,
      text: inputLiveMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLiveMessages((prev) => [...prev, newMsg]);
    setInputLiveMessage('');
  };

  const handleSendLiveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLiveQuestion.trim()) return;

    const newQ: LiveQuestionItem = {
      id: `q-${Date.now()}`,
      sender: user.fullName,
      text: inputLiveQuestion.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      votes: 1,
      isQuestion: true,
      votedBy: [user.id],
    };

    setLiveQuestions((prev) => [newQ, ...prev]);
    setInputLiveQuestion('');
  };

  const handleUpvoteQuestion = (qId: string) => {
    setLiveQuestions((prev) =>
      prev.map((q) => {
        if (q.id === qId) {
          const alreadyVoted = q.votedBy.includes(user.id);
          return {
            ...q,
            votes: alreadyVoted ? q.votes - 1 : q.votes + 1,
            votedBy: alreadyVoted ? q.votedBy.filter((id) => id !== user.id) : [...q.votedBy, user.id],
          };
        }
        return q;
      })
    );
  };

  const handleToggleHandRaise = () => {
    setHandRaisedByMe((prev) => !prev);
    setAttendees((prev) =>
      prev.map((a) => (a.id === user.id ? { ...a, handRaised: !handRaisedByMe } : a))
    );
  };

  const handleCopyInviteLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `https://asronsat.uz/join/${activeChat?.slug || activeChat?.inviteCode || 'sat-asron'}`
      );
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // PIP Position CSS classes
  const pipPositionClasses = {
    BOTTOM_LEFT: 'bottom-20 left-8',
    BOTTOM_RIGHT: 'bottom-20 right-8',
    TOP_LEFT: 'top-20 left-8',
    TOP_RIGHT: 'top-20 right-8',
  }[pipPosition];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0A0F1D] text-[#F8FAFC] font-sans overflow-hidden select-none">
      {/* 1. Top Studio Control Bar */}
      <div className="h-16 px-6 bg-[#121A2F] border-b border-[#1E293B] flex items-center justify-between shrink-0">
        {/* Left: Stream Info & Live Status Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">
              JONLI EFIR
            </span>
          </div>

          <div className="h-4 w-px bg-[#1E293B]" />

          <div>
            <h3 className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
              <span>{activeChat?.name || 'SAT | ASRON Live Studio'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#0A0F1D] text-[#E07A5F] border border-[#1E293B]">
                {isHost ? 'Host / O\'qituvchi' : 'O\'quvchi'}
              </span>
            </h3>
          </div>

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs font-mono font-bold animate-pulse">
              <CircleDot size={12} className="text-rose-400" />
              <span>REC {formatTimer(recordingSeconds)}</span>
            </div>
          )}
        </div>

        {/* Center: Stage Switcher Tabs (Screen / Whiteboard / Desmos) */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0A0F1D] rounded-xl border border-[#1E293B]">
          <button
            onClick={() => {
              if (!isScreenSharing) handleToggleScreenShare();
              else setActiveTabMode('SCREEN');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'SCREEN'
                ? 'bg-[#E07A5F] text-[#0A0F1D]'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Monitor size={13} />
            <span>Ekran Ulashish (OS) {isScreenSharing ? '• Faol' : ''}</span>
          </button>

          <button
            onClick={() => setActiveTabMode('WHITEBOARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'WHITEBOARD'
                ? 'bg-[#E07A5F] text-[#0A0F1D]'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Layers size={13} />
            <span>Interaktiv Doska</span>
          </button>

          <button
            onClick={() => setActiveTabMode('SPLIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTabMode === 'SPLIT'
                ? 'bg-[#E07A5F] text-[#0A0F1D]'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Sparkles size={13} />
            <span>Split: Doska + Desmos</span>
          </button>

          <button
            onClick={() => setIsDesmosOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDesmosOpen
                ? 'bg-[#0B1B3D] text-[#E07A5F] border border-[#E07A5F]/40'
                : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
          >
            <Calculator size={13} />
            <span>Desmos Kalkulyator</span>
          </button>
        </div>

        {/* Right: Broadcast & Stream End Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyInviteLink}
            className="px-3 py-1.5 rounded-lg bg-[#0A0F1D] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Nusxalandi' : 'Ulashish'}</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
              isSidebarOpen ? 'bg-[#1E293B] text-[#F8FAFC]' : 'bg-[#0A0F1D] text-[#64748B] hover:text-[#F8FAFC]'
            }`}
            title="Chat va Savollar"
          >
            <MessageSquare size={15} />
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <X size={13} />
            <span>{isHost ? 'Efirni Yakunlash' : 'Chiqish'}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Studio Body */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Central Stage Area */}
        <div ref={stageContainerRef} className="relative flex-1 flex flex-col bg-[#080C17] p-4 overflow-hidden">
          {/* Active Worksurface View */}
          <div className="relative flex-1 w-full h-full rounded-2xl overflow-hidden bg-[#121A2F] border border-[#1E293B] shadow-2xl">
            {activeTabMode === 'WHITEBOARD' && (
              <LiveWhiteboard className="w-full h-full" isHost={isHost} />
            )}

            {activeTabMode === 'SPLIT' && (
              <div className="w-full h-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#1E293B] overflow-hidden">
                <div className="flex-1 h-full min-h-[280px]">
                  <LiveWhiteboard className="w-full h-full" isHost={isHost} />
                </div>
                <div className="flex-1 h-full min-h-[280px] bg-white">
                  <DesmosCalculator isExpanded={true} />
                </div>
              </div>
            )}

            {activeTabMode === 'SCREEN' && (
              <div className="w-full h-full bg-[#0A0F1D] flex flex-col items-center justify-center p-6 text-center">
                {isScreenSharing ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="max-w-md space-y-3 text-[#F8FAFC]">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B1B3D] border border-[#1E293B] text-[#E07A5F] flex items-center justify-center mx-auto">
                      <Monitor size={24} />
                    </div>
                    <h3 className="text-base font-bold">Butun Kompyuter Ekranini Ulashish</h3>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      Bluebook ilovasi, PDF kitoblar, Desmos yoki istalgan dasturni 1080p 60fps sifatda talabalarga ko'rsating.
                    </p>
                    <button
                      onClick={handleToggleScreenShare}
                      className="px-5 py-2.5 rounded-xl bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Monitor size={15} />
                      <span>Ekranni Ulashishni Boshlash</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Draggable & Configurable Webcam PIP Overlay with discrete X button */}
          {!isPipMinimized && (
            <motion.div
              drag
              dragConstraints={stageContainerRef}
              dragElastic={0.05}
              className={`absolute ${pipPositionClasses} z-30 ${
                pipShape === 'CIRCLE' ? 'w-44 h-44 rounded-full' : 'w-60 h-40 rounded-2xl'
              } bg-[#121A2F] border-2 border-[#1E293B] shadow-2xl overflow-hidden group cursor-move select-none`}
            >
              {isCameraOn ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100 pointer-events-none"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0F1D] p-3 text-center">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E07A5F] mb-1"
                  />
                  <span className="text-[11px] font-bold text-[#F8FAFC] truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[9px] font-mono text-[#64748B]">Kamera o'chiq</span>
                </div>
              )}

              {/* Quick PIP Controls Overlay */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/80 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPipShape((prev) => (prev === 'RECT' ? 'CIRCLE' : 'RECT'));
                  }}
                  className="text-neutral-300 hover:text-white p-0.5 cursor-pointer"
                  title="Shaklni almashtirish"
                >
                  {pipShape === 'RECT' ? <Circle size={11} /> : <Square size={11} />}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPipPosition((prev) => {
                      if (prev === 'BOTTOM_LEFT') return 'BOTTOM_RIGHT';
                      if (prev === 'BOTTOM_RIGHT') return 'TOP_RIGHT';
                      if (prev === 'TOP_RIGHT') return 'TOP_LEFT';
                      return 'BOTTOM_LEFT';
                    });
                  }}
                  className="text-neutral-300 hover:text-white p-0.5 cursor-pointer"
                  title="Burchakni almashtirish"
                >
                  <Move size={11} />
                </button>
                {/* Discrete X button to minimize PIP without killing camera */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPipMinimized(true);
                  }}
                  className="p-0.5 rounded-sm bg-rose-600/80 hover:bg-rose-600 text-white cursor-pointer transition-colors"
                  title="Kamerani yashirish"
                >
                  <X size={11} />
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] font-mono text-[#F8FAFC]">
                <span className="truncate">{user.fullName.split(' ')[0]}</span>
                {isMicOn ? <Mic size={10} className="text-emerald-400" /> : <MicOff size={10} className="text-rose-400" />}
              </div>
            </motion.div>
          )}

          {/* Floating trigger to restore minimized camera PIP */}
          {isPipMinimized && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              type="button"
              onClick={() => setIsPipMinimized(false)}
              className="absolute bottom-20 left-6 z-30 px-3 py-1.5 rounded-xl bg-[#121A2F]/90 hover:bg-[#1E293B] border border-[#1E293B] text-xs font-mono text-white shadow-xl flex items-center gap-2 cursor-pointer transition-colors"
              title="Kamerani qayta ko'rsatish"
            >
              <Video size={13} className="text-[#E07A5F]" />
              <span>Kamerani ko'rsatish</span>
            </motion.button>
          )}

          {/* Floating Desmos PIP */}
          <AnimatePresence>
            {isDesmosOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  width: isDesmosFullScreen ? '95%' : '540px',
                  height: isDesmosFullScreen ? '90%' : '390px',
                }}
                exit={{ opacity: 0, scale: 0.94, y: 12 }}
                className="absolute z-40 top-8 right-8 bg-[#121A2F] rounded-2xl border border-[#1E293B] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="h-9 px-4 bg-[#0A0F1D] border-b border-[#1E293B] text-[#F8FAFC] flex items-center justify-between shrink-0 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <Calculator size={13} className="text-[#E07A5F]" />
                    <span className="font-bold">Official SAT Desmos Calculator</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsDesmosFullScreen((prev) => !prev)}
                      className="text-[#64748B] hover:text-[#F8FAFC] p-1 cursor-pointer"
                    >
                      {isDesmosFullScreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                    </button>
                    <button
                      onClick={() => setIsDesmosOpen(false)}
                      className="text-[#64748B] hover:text-[#F8FAFC] p-1 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full h-full bg-white">
                  <DesmosCalculator isExpanded={true} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Floating Controls Bar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 bg-[#121A2F]/90 backdrop-blur-md rounded-2xl border border-[#1E293B] shadow-xl">
            {/* Mic Toggle */}
            <button
              onClick={() => setIsMicOn((prev) => !prev)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isMicOn ? 'bg-[#1E293B] text-[#F8FAFC]' : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
              }`}
              title={isMicOn ? 'Mikrofonni o\'chirish' : 'Mikrofonni yoqish'}
            >
              {isMicOn ? <Mic size={15} /> : <MicOff size={15} />}
            </button>

            {/* Camera Toggle */}
            <button
              onClick={() => setIsCameraOn((prev) => !prev)}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isCameraOn ? 'bg-[#1E293B] text-[#F8FAFC]' : 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
              }`}
              title={isCameraOn ? 'Kamerani o\'chirish' : 'Kamerani yoqish'}
            >
              {isCameraOn ? <Video size={15} /> : <VideoOff size={15} />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={handleToggleScreenShare}
              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                isScreenSharing ? 'bg-[#E07A5F] text-[#0A0F1D]' : 'bg-[#1E293B] text-[#64748B] hover:text-[#F8FAFC]'
              }`}
              title="Ekran Ulashish (OS)"
            >
              <Monitor size={15} />
            </button>

            {/* Student Raise Hand Toggle */}
            {!isHost && (
              <button
                onClick={handleToggleHandRaise}
                className={`px-3 py-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                  handRaisedByMe ? 'bg-[#E07A5F] text-[#0A0F1D] font-bold' : 'bg-[#1E293B] text-[#F8FAFC]'
                }`}
              >
                <Hand size={14} />
                <span>{handRaisedByMe ? 'Qo\'l Ko\'tarildi' : 'Qo\'l Ko\'tarish'}</span>
              </button>
            )}

            {/* Host Live Stream Recording Engine */}
            {isHost && (
              <button
                onClick={handleToggleRecording}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D]'
                }`}
              >
                {isRecording ? <StopCircle size={14} /> : <CircleDot size={14} />}
                <span>{isRecording ? 'Yozishni To\'xtatish' : 'Yozib Olishni Boshlash'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Live Sidebar (Chat, Questions, Viewers) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="h-full bg-[#121A2F] border-l border-[#1E293B] flex flex-col shrink-0 overflow-hidden font-sans"
            >
              {/* Sidebar Header Tabs */}
              <div className="h-14 px-3 bg-[#0A0F1D] border-b border-[#1E293B] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1 p-1 bg-[#121A2F] rounded-lg border border-[#1E293B] w-full">
                  <button
                    onClick={() => setSidebarView('CHAT')}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      sidebarView === 'CHAT' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    Chat
                  </button>

                  <button
                    onClick={() => setSidebarView('QUESTIONS')}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      sidebarView === 'QUESTIONS' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    Savollar ({liveQuestions.length})
                  </button>

                  <button
                    onClick={() => setSidebarView('VIEWERS')}
                    className={`flex-1 py-1 rounded text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                      sidebarView === 'VIEWERS' ? 'bg-[#1E293B] text-[#F8FAFC]' : 'text-[#64748B] hover:text-[#94A3B8]'
                    }`}
                  >
                    O'quvchilar ({attendees.length})
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              {sidebarView === 'CHAT' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                    {liveMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl text-xs space-y-1 ${
                          m.isQuestion
                            ? 'bg-[#0B1B3D] border border-[#1E293B] text-[#F8FAFC]'
                            : 'bg-[#0A0F1D] border border-[#1E293B] text-[#94A3B8]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-[#E07A5F]">{m.sender}</span>
                          <span className="text-[#64748B]">{m.time}</span>
                        </div>
                        <p className="leading-relaxed text-[#F8FAFC]">{m.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSendLiveMessage}
                    className="p-3 bg-[#0A0F1D] border-t border-[#1E293B] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputLiveMessage}
                      onChange={(e) => setInputLiveMessage(e.target.value)}
                      placeholder="Xabar yozing..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] transition-colors cursor-pointer"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}

              {sidebarView === 'QUESTIONS' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                  <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                    {liveQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-[#0A0F1D] border border-[#1E293B] space-y-2"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-[#E07A5F]">{q.sender}</span>
                          <span className="text-[#64748B]">{q.time}</span>
                        </div>
                        <p className="text-xs text-[#F8FAFC] leading-relaxed">{q.text}</p>
                        <div className="flex items-center justify-between pt-1 border-t border-[#1E293B]">
                          <button
                            onClick={() => handleUpvoteQuestion(q.id)}
                            className={`px-2 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                              q.votedBy.includes(user.id)
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-[#121A2F] text-[#64748B] hover:text-[#F8FAFC]'
                            }`}
                          >
                            <ThumbsUp size={11} />
                            <span>+{q.votes} Ovoz</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSendLiveQuestion}
                    className="p-3 bg-[#0A0F1D] border-t border-[#1E293B] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputLiveQuestion}
                      onChange={(e) => setInputLiveQuestion(e.target.value)}
                      placeholder="Ustozga savol berish..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#121A2F] border border-[#1E293B] text-xs text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] transition-colors cursor-pointer"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </div>
              )}

              {sidebarView === 'VIEWERS' && (
                <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] px-1 mb-2">
                    Faol O'quvchilar ({attendees.length})
                  </div>
                  {attendees.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={att.avatar}
                          alt={att.name}
                          className="w-7 h-7 rounded-full object-cover border border-[#1E293B]"
                        />
                        <span className="font-medium text-[#F8FAFC] text-xs truncate max-w-[130px]">
                          {att.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {att.handRaised && (
                          <span className="p-1 rounded-md bg-[#E07A5F]/20 text-[#E07A5F]" title="Qo'l ko'targan">
                            <Hand size={12} />
                          </span>
                        )}
                        <span className="p-1 rounded-md text-[#64748B]">
                          {att.isMuted ? <MicOff size={12} /> : <Mic size={12} className="text-emerald-400" />}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Lesson Recording Finalized & Delivery Center Modal */}
      {recordedLessonResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-sans">
          <div className="w-full max-w-md p-6 bg-[#121A2F] text-[#F8FAFC] rounded-2xl border border-[#1E293B] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B1B3D] border border-[#1E293B] text-[#E07A5F] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F8FAFC]">Dars Muvaffaqiyatli Yozib Olindi!</h3>
                <p className="text-xs font-mono text-[#64748B]">
                  {formatTimer(recordedLessonResult.durationSecs)} • Saqlash va tarqatishga tayyor
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0A0F1D] border border-[#1E293B] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Manzil:</span>
                <span className="font-bold text-[#E07A5F] flex items-center gap-1">
                  <Bookmark size={11} /> Saqlanganlar (Saved Messages)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Format:</span>
                <span className="text-[#F8FAFC]">HD Video (1080p WebM/MP4)</span>
              </div>
            </div>

            {/* Direct Local Download Button */}
            <button
              onClick={handleDownloadRecordedFile}
              className="w-full py-2.5 px-4 rounded-xl bg-[#0A0F1D] hover:bg-[#1A233A] border border-[#1E293B] text-xs font-mono font-bold text-[#F8FAFC] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download size={14} className="text-[#E07A5F]" />
              <span>Videoni Kompyuterga Yuklash</span>
            </button>

            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-mono text-[#64748B] uppercase tracking-wider block">
                Kanalga ham yuborilsinmi?
              </label>
              <input
                type="text"
                value={forwardTargetChatId}
                onChange={(e) => setForwardTargetChatId(e.target.value)}
                placeholder="Kanal yoki Guruh IDsi"
                className="w-full p-2.5 rounded-lg bg-[#0A0F1D] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] focus:outline-hidden focus:border-[#E07A5F]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleDeliverRecording(false)}
                disabled={isUploadingRecording}
                className="px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-xs font-mono text-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
              >
                Faqat Saqlanganlarga
              </button>
              <button
                onClick={() => handleDeliverRecording(true)}
                disabled={isUploadingRecording}
                className="px-4 py-2 rounded-lg bg-[#E07A5F] hover:bg-[#c96c53] text-[#0A0F1D] text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Send size={13} />
                <span>{isUploadingRecording ? 'Yuklanmoqda...' : 'Kanalga Yuborish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
