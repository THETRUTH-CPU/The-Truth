import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Bookmark, 
  Calendar, 
  Info, 
  ArrowRight, 
  ClipboardList, 
  Plus, 
  Compass, 
  Box, 
  Lightbulb, 
  FileText,
  BadgeAlert,
  Sliders,
  FolderLock,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Headphones,
  Printer,
  FileDown,
  Sun,
  Contrast,
  SlidersHorizontal,
  RefreshCw,
  Camera,
  Video
} from "lucide-react";
import { 
  ROOM_TYPES, 
  GOAL_PRESETS, 
  PAIN_POINT_PRESETS, 
  MOCK_LOADING_TIPS, 
  SAMPLE_ROOMS,
  RoomTypePreset
} from "./data";
import { 
  RoomAnalysisResponse, 
  SavedRoomAnalysis, 
  AnalysisRequest 
} from "./types";

// Helper to retrieve brief, highly-contextual tactical advice for decluttering steps
const getDeclutterStepAdvice = (title: string, description: string): string => {
  const t = title.toLowerCase();
  const d = description.toLowerCase();

  if (t.includes("cable") || t.includes("cord") || t.includes("wire") || t.includes("power") || d.includes("cable") || d.includes("cord")) {
    return "Cable Pro-Tip: Label both ends of each wire before bundling. Group power blocks inside a designated cable management box or wire basket to prevent tangled cords and dust build-up.";
  }
  if (t.includes("sort") || t.includes("categorize") || t.includes("separate") || d.includes("sort") || d.includes("categorize")) {
    return "Sorting Rule: Deploy the 'Three-Box Method' (Keep, Donate, Discard). Handle each item exactly once and make an immediate decision—avoid creating an 'undecided' pile.";
  }
  if (t.includes("paper") || t.includes("note") || t.includes("post-it") || t.includes("document") || d.includes("paper") || d.includes("post-it")) {
    return "Paper Triage: Go digital by snapping photos of loose notes, then recycle them immediately. Dedicate exactly one tray for incoming physical papers and clear it weekly.";
  }
  if (t.includes("pillow") || t.includes("cushion") || t.includes("decor") || t.includes("aesthetic") || d.includes("pillow") || d.includes("cushion") || d.includes("plant") || d.includes("accent")) {
    return "Decor Balance: Follow the 'Rule of Threes' by grouping decoration accessories in odd quantities at varying heights. Leave empty buffer space (at least 30%) for the eyes to rest.";
  }
  if (t.includes("container") || t.includes("bin") || t.includes("basket") || t.includes("box") || d.includes("container") || d.includes("bin") || d.includes("basket") || d.includes("box")) {
    return "Storage Advice: Measure shelf height, depth, and width before ordering containers. Prefer opaque or linen baskets for uniform looks, or use clear containers for high-frequency items.";
  }
  if (t.includes("closet") || t.includes("clothe") || t.includes("wear") || t.includes("hanger") || d.includes("closet") || d.includes("clothe") || d.includes("hang")) {
    return "Wardrobe Hack: Turn all hangers backward on the closet rack. As you wear and wash a piece, replace it forward. At year-end, donate everything still hanging backward.";
  }
  if (t.includes("clean") || t.includes("dust") || t.includes("wipe") || t.includes("vacuum") || d.includes("clean") || d.includes("dust") || d.includes("wipe") || d.includes("sponge")) {
    return "Cleaning Flow: Clean from top to bottom (ceiling fixtures first, main shelves second, vacuum floors last) so gravity pulls falling dust down naturally without re-contaminating clean tables.";
  }
  if (t.includes("surface") || t.includes("desk") || t.includes("table") || t.includes("counter") || d.includes("surface") || d.includes("desk") || d.includes("ledge")) {
    return "Surface Buffer: Keep table surfaces 80% free. Create a designated 'catch-all key tray' for active items, and store permanent stationery nested inside drawer organizing trays.";
  }
  if (t.includes("shelf") || t.includes("book") || t.includes("display") || d.includes("shelf") || d.includes("book") || d.includes("shopp")) {
    return "Shelf Distribution: Place heaviest, bulky books at the bottom. Mix vertical book lines with horizontal book stacks and small aesthetic objects to create beautiful negative space.";
  }

  // default practical guidance
  return "Organizer Mantra: Divide and conquer. Pick a single, small physical boundary (e.g. one drawer or a 2-foot counter section) and finish it completely to generate positive momentum.";
};

export default function App() {
  // Saved sessions list
  const [sessions, setSessions] = useState<SavedRoomAnalysis[]>([]);
  // Active viewed session ID (null means showing the fresh upload panel, or welcome screen)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  // Loading & generation state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("living_room");
  const [customGoals, setCustomGoals] = useState<string>("");
  const [customPainPoints, setCustomPainPoints] = useState<string>("");
  const [clutterFocus, setClutterFocus] = useState<string>("standard");
  const [roomNameInput, setRoomNameInput] = useState<string>("");
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  // Target upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  // Before & After comparison visualizer states
  const [comparisonMode, setComparisonMode] = useState<"slider" | "side-by-side" | "fade">("slider");
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [fadePosition, setFadePosition] = useState<number>(50);
  const [afterDragActive, setAfterDragActive] = useState<boolean>(false);
  const [openAdviceStepId, setOpenAdviceStepId] = useState<string | null>(null);

  // Image filter adjustments for clarity
  const [imgBrightness, setImgBrightness] = useState<number>(100);
  const [imgContrast, setImgContrast] = useState<number>(100);
  const [imgGrayscale, setImgGrayscale] = useState<number>(0);
  const [imgSaturate, setImgSaturate] = useState<number>(100);
  const [applyFilterTo, setApplyFilterTo] = useState<"both" | "before" | "after">("both");

  // Live camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start camera transmission
  const startCamera = async (mode: "user" | "environment" = cameraFacingMode) => {
    setCameraError(null);
    try {
      // Clear current room photo states
      setImageFile(null);
      
      // Stop existing tracks first
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      setCameraStream(stream);
      setIsCameraActive(true);
      
      // Wait for next render cycle to bind srcObject
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err: any) {
      console.error("Camera acquisition error: ", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Camera permission was denied. Please check your browser settings or privacy settings.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No web camera device detected on your system.");
      } else {
        setCameraError(`Could not access camera: ${err.message || "Unknown error"}`);
      }
    }
  };

  // Stop camera stream completely
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Toggle Front vs Back layout
  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === "user" ? "environment" : "user";
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      startCamera(nextMode);
    }
  };

  // Capture photo from video feed
  const capturePhoto = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (cameraFacingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setImageFile(dataUrl);
        stopCamera();

        // Auto populate room name if empty
        if (!roomNameInput) {
          const activePreset = ROOM_TYPES.find(p => p.id === selectedRoomId);
          const suffix = activePreset ? `${activePreset.name}` : "Room";
          setRoomNameInput(`Captured ${suffix}`);
        }
      }
    } catch (error) {
      console.error("Failed to capture photo:", error);
    }
  };

  // Clean setup
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Text-To-Speech (TTS) voice assistant states
  const [isPlayingSpeech, setIsPlayingSpeech] = useState<boolean>(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [currentPlayingSection, setCurrentPlayingSection] = useState<string>("");

  // Load browser's speech synthesis voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voicesList = window.speechSynthesis.getVoices();
        setAvailableVoices(voicesList);
        if (voicesList.length > 0) {
          // Default to a premium English voice if available, otherwise first
          const engVoice = voicesList.find(v => v.lang.startsWith("en-US")) || 
                           voicesList.find(v => v.lang.startsWith("en")) || 
                           voicesList[0];
          setSelectedVoiceName(engVoice.name);
        }
      };
      
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop current narration immediately when the active workspace changes to avoid overlap
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setCurrentPlayingSection("");
    }
    // Reset image clarification filters on workspace switch
    setImgBrightness(100);
    setImgContrast(100);
    setImgGrayscale(0);
    setImgSaturate(100);
    setApplyFilterTo("both");
  }, [activeSessionId]);

  // CSS Filter styles for image clarification
  const getBeforeStyleFilter = (): React.CSSProperties => {
    if (applyFilterTo === "both" || applyFilterTo === "before") {
      return {
        filter: `brightness(${imgBrightness}%) contrast(${imgContrast}%) grayscale(${imgGrayscale}%) saturate(${imgSaturate}%)`
      };
    }
    return {};
  };

  const getAfterStyleFilter = (): React.CSSProperties => {
    if (applyFilterTo === "both" || applyFilterTo === "after") {
      return {
        filter: `brightness(${imgBrightness}%) contrast(${imgContrast}%) grayscale(${imgGrayscale}%) saturate(${imgSaturate}%)`
      };
    }
    return {};
  };

  // Load and save session logic from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tidy_room_sessions");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      } else {
        // Feed the local storage with initial sample sessions so the application is immediately explorable!
        const initialSamples: SavedRoomAnalysis[] = SAMPLE_ROOMS.map(sample => ({
          id: sample.id,
          timestamp: new Date().toISOString(),
          roomName: sample.roomName,
          imageUrl: sample.imageUrl,
          afterImageUrl: sample.afterImageUrl,
          goals: sample.goals,
          painPoints: sample.painPoints,
          analysis: sample.analysis as RoomAnalysisResponse,
          completedStepIds: []
        }));
        localStorage.setItem("tidy_room_sessions", JSON.stringify(initialSamples));
        setSessions(initialSamples);
        setActiveSessionId(initialSamples[0].id);
      }
    } catch (e) {
      console.error("Failed to load local storage rooms:", e);
    }
  }, []);

  // Save sessions to localStorage when changing state
  const saveToLocalStorage = (updated: SavedRoomAnalysis[]) => {
    try {
      localStorage.setItem("tidy_room_sessions", JSON.stringify(updated));
      setSessions(updated);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  // Cyclic loading phrases effect
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % MOCK_LOADING_TIPS.length);
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Handle Drag-and-Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select or drop a valid photo file (PNG, JPG, HEIC, etc.).");
      return;
    }
    
    // Check file size (recommend < 10mb for fast translation)
    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage("File exceeds 12MB. Please upload a smaller compressed room photo.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Auto populate room name if empty
    if (!roomNameInput) {
      const activePreset = ROOM_TYPES.find(p => p.id === selectedRoomId);
      const suffix = activePreset ? `${activePreset.name}` : "Room";
      setRoomNameInput(`My ${suffix}`);
    }
  };

  // Preset clicks
  const handleRoomTypeSelect = (preset: RoomTypePreset) => {
    setSelectedRoomId(preset.id);
    if (!roomNameInput || roomNameInput.startsWith("My ")) {
      setRoomNameInput(`My ${preset.name}`);
    }
  };

  const addGoalPreset = (preset: string) => {
    setCustomGoals(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return preset;
      if (trimmed.endsWith(".") || trimmed.endsWith(",")) {
        return `${trimmed} Also, ${preset.toLowerCase()}.`;
      }
      return `${trimmed}. Also, ${preset.toLowerCase()}.`;
    });
  };

  const addPainPointPreset = (preset: string) => {
    setCustomPainPoints(prev => {
      const trimmed = prev.trim();
      if (!trimmed) return preset;
      if (trimmed.endsWith(".") || trimmed.endsWith(",")) {
        return `${trimmed} Plus, ${preset.toLowerCase()}.`;
      }
      return `${trimmed}. Plus, ${preset.toLowerCase()}.`;
    });
  };

  // Analyze Action
  const triggerAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage("Please upload or choose a room photo first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    const activePreset = ROOM_TYPES.find(r => r.id === selectedRoomId);
    const name = roomNameInput.trim() || `My ${activePreset?.name || "Room"}`;

    const requestPayload: AnalysisRequest = {
      image: imageFile,
      roomType: selectedRoomId,
      goals: customGoals.trim() || activePreset?.placeholderGoal || "Organize room efficiently",
      painPoints: customPainPoints.trim() || activePreset?.placeholderPain || "Cluttered surfaces",
      clutterFocus: clutterFocus
    };

    try {
      const response = await fetch("/api/organize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Server failed to analyze photo.");
      }

      // Successful analysis! Save to state & local store
      const newSavedSession: SavedRoomAnalysis = {
        id: `room-${Date.now()}`,
        timestamp: new Date().toISOString(),
        roomName: name,
        imageUrl: imageFile,
        goals: requestPayload.goals,
        painPoints: requestPayload.painPoints,
        analysis: data as RoomAnalysisResponse,
        completedStepIds: [],
        userNotes: ""
      };

      const updatedSessions = [newSavedSession, ...sessions];
      saveToLocalStorage(updatedSessions);
      setActiveSessionId(newSavedSession.id);
      
      // Reset form controls
      setImageFile(null);
      setCustomGoals("");
      setCustomPainPoints("");
      setRoomNameInput("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Could not analyze image. Make sure the server model key is set.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Find active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Toggle checklist step completion inside active session
  const toggleStepWithId = (sessionId: string, stepId: string) => {
    const updated = sessions.map(session => {
      if (session.id === sessionId) {
        const completed = [...session.completedStepIds];
        const index = completed.indexOf(stepId);
        if (index > -1) {
          completed.splice(index, 1); // remove
        } else {
          completed.push(stepId); // add
        }
        return {
          ...session,
          completedStepIds: completed
        };
      }
      return session;
    });
    saveToLocalStorage(updated);
  };

  // Save notepad updates
  const saveSessionNotes = (sessionId: string, notes: string) => {
    const updated = sessions.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          userNotes: notes
        };
      }
      return session;
    });
    saveToLocalStorage(updated);
  };

  // Delete session
  const deleteSession = (sessionId: string) => {
    const remaining = sessions.filter(s => s.id !== sessionId);
    saveToLocalStorage(remaining);
    if (remaining.length > 0) {
      setActiveSessionId(remaining[0].id);
    } else {
      setActiveSessionId(null);
    }
  };

  // Reset/Load default templates to explore
  const restoreSamples = () => {
    const refreshed: SavedRoomAnalysis[] = SAMPLE_ROOMS.map(sample => ({
      id: sample.id,
      timestamp: new Date().toISOString(),
      roomName: sample.roomName,
      imageUrl: sample.imageUrl,
      afterImageUrl: sample.afterImageUrl,
      goals: sample.goals,
      painPoints: sample.painPoints,
      analysis: sample.analysis as RoomAnalysisResponse,
      completedStepIds: []
    }));
    saveToLocalStorage(refreshed);
    setActiveSessionId(refreshed[0].id);
    setErrorMessage(null);
  };

  // Upload progress photo logic
  const handleAfterImageUpload = (file: File) => {
    if (!activeSessionId) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid photo file for your transformed layout (PNG, JPG, HEIC, etc.).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setErrorMessage("Selected file exceeds 12MB. Please upload a smaller compressed room photo.");
      return;
    }
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const updated = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            afterImageUrl: base64,
            afterTimestamp: new Date().toISOString()
          };
        }
        return s;
      });
      saveToLocalStorage(updated);
    };
    reader.readAsDataURL(file);
  };

  // Remove the comparison 'after' layout
  const removeAfterImage = (sessionId: string) => {
    const updated = sessions.map(s => {
      if (s.id === sessionId) {
        const copy = { ...s };
        delete copy.afterImageUrl;
        delete copy.afterTimestamp;
        return copy;
      }
      return s;
    });
    saveToLocalStorage(updated);
  };

  // Start speaking a specific text segment
  const playScriptText = (text: string, title: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setErrorMessage("Speech synthesis is not supported on this browser.");
      return;
    }

    // Cancel any active speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice if selected
    if (selectedVoiceName && availableVoices.length > 0) {
      const targetVoice = availableVoices.find(v => v.name === selectedVoiceName);
      if (targetVoice) {
        utterance.voice = targetVoice;
      }
    }

    // Set play rate (0.75 - 2.0x)
    utterance.rate = speechRate;

    utterance.onstart = () => {
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
      setCurrentPlayingSection(title);
    };

    utterance.onend = () => {
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setCurrentPlayingSection("");
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis error:", e);
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setCurrentPlayingSection("");
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPausedSpeech(false);
        } else {
          window.speechSynthesis.pause();
          setIsPausedSpeech(true);
        }
      }
    }
  };

  const handleStopSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      setIsPausedSpeech(false);
      setCurrentPlayingSection("");
    }
  };

  // Compile full room script
  const playFullRoomPlan = (session: SavedRoomAnalysis) => {
    const analysis = session.analysis;
    const parts: string[] = [];
    
    parts.push(`Here is your custom room organization plan for your ${session.roomName}.`);
    parts.push(`Room Analysis Summary. ${analysis.roomAnalysis}`);

    if (analysis.clutterSources && analysis.clutterSources.length > 0) {
      parts.push(`We identified the following primary clutter sources: ${analysis.clutterSources.join(", ")}.`);
    }

    if (analysis.declutterSteps && analysis.declutterSteps.length > 0) {
      parts.push(`Here is your decluttering action checklist:`);
      analysis.declutterSteps.forEach((step, idx) => {
        parts.push(`Step ${idx + 1}: ${step.title}. ${step.description}`);
      });
    }

    if (analysis.layoutSuggestions && analysis.layoutSuggestions.length > 0) {
      parts.push(`Here are your spatial and room layout tips:`);
      analysis.layoutSuggestions.forEach((sugg) => {
        parts.push(`In the ${sugg.area}, we recommend: ${sugg.suggestion}`);
      });
    }

    if (analysis.aestheticTips && analysis.aestheticTips.length > 0) {
      parts.push(`Finally, here are several styling rules for visual peace:`);
      analysis.aestheticTips.forEach((tip, idx) => {
        parts.push(`Tip ${idx + 1}: ${tip}`);
      });
    }

    parts.push(`We hope this guide is helpful while you work. Ready, set, declutter!`);
    playScriptText(parts.join(" "), "Full Organizing Plan");
  };

  const playSummaryOnly = (session: SavedRoomAnalysis) => {
    const text = `Overview for ${session.roomName}. ${session.analysis.roomAnalysis}`;
    playScriptText(text, "Overview Summary Only");
  };

  const playStepsOnly = (session: SavedRoomAnalysis) => {
    const parts: string[] = [`Decluttering Checklist steps for ${session.roomName}:`];
    session.analysis.declutterSteps.forEach((step, idx) => {
      parts.push(`Step ${idx + 1}: ${step.title}. ${step.description}`);
    });
    playScriptText(parts.join(" "), "Steps Checklist Only");
  };

  const playLayoutTipsOnly = (session: SavedRoomAnalysis) => {
    const parts: string[] = [`Spatial layout suggestions for ${session.roomName}:`];
    session.analysis.layoutSuggestions.forEach((sugg) => {
      parts.push(`In the ${sugg.area}, we suggest: ${sugg.suggestion}`);
    });
    session.analysis.storageSolutions.forEach((sol) => {
      parts.push(`Consider using ${sol.item} for the purpose of ${sol.purpose}`);
    });
    playScriptText(parts.join(" "), "Layout Ideas Only");
  };

  // Color severity helper for Clutter Score
  const getScoreColorAndLabel = (score: number) => {
    if (score <= 3) return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Light", fill: "bg-emerald-500" };
    if (score <= 7) return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Moderate", fill: "bg-amber-500" };
    return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "High Clutter", fill: "bg-rose-500" };
  };

  // Trigger pristine window.print for saving as PDF
  const handlePrintPlan = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-zinc-800 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-950">
      <div className="print:hidden">
      
      {/* Top Professional Header */}
      <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/10">
              <Sparkles size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold tracking-tight text-zinc-900">Room Organizer</h1>
              <p className="text-xs font-mono text-emerald-700 font-medium">AI-powered Decluttering & Architectural Styling</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setActiveSessionId(null)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 border shadow-xs ${
                activeSessionId === null 
                  ? "bg-emerald-700 border-emerald-800 text-white hover:bg-emerald-800" 
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <Plus size={16} />
              <span>Analyze New Room</span>
            </button>

            {sessions.length > 0 && (
              <button 
                onClick={restoreSamples}
                title="Restore default sample rooms to test guidelines"
                className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 hover:text-zinc-700 rounded-lg transition-all"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-start space-x-3 shadow-xs">
            <AlertTriangle className="text-orange-600 shrink-0 mt-0.5" size={20} />
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-orange-900">Analysis Restriction or Technical Issue</h4>
              <p className="mt-0.5 opacity-90">{errorMessage}</p>
              {errorMessage.includes("GEMINI_API_KEY") && (
                <div className="mt-3 p-3 bg-white/80 border border-orange-200 rounded-lg text-xs leading-relaxed text-zinc-700">
                  <p className="font-semibold text-orange-950 mb-1">To fix this in AI Studio:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Locate the <strong>Settings (or Secrets)</strong> button in the outer workspace interface.</li>
                    <li>Add a secret environment key named <code className="font-mono bg-zinc-100 text-rose-600 px-1 rounded font-bold">GEMINI_API_KEY</code> with your real key value.</li>
                    <li>The app will automatically detect it server-side to execute your analysis!</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Global grid spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: Menu List / Side View Controls (4 Columns on desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* SAVED SESSIONS NAVIGATOR */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Your Spaces ({sessions.length})</span>
                <ClipboardList size={16} className="text-zinc-400" />
              </div>

              {sessions.length === 0 ? (
                <div className="py-8 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-[#FAF9F5]">
                  <p className="text-sm">No analyzed rooms yet.</p>
                  <button 
                    onClick={restoreSamples} 
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                  >
                    Load Sample Showcases
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[295px] overflow-y-auto pr-1">
                  {sessions.map((sess) => {
                    const isActive = sess.id === activeSessionId;
                    const completionRate = sess.analysis.declutterSteps.length > 0 
                      ? Math.round((sess.completedStepIds.length / sess.analysis.declutterSteps.length) * 100) 
                      : 0;

                    return (
                      <div 
                        key={sess.id}
                        className={`group relative p-3 rounded-xl border flex items-center space-x-3 transition-all duration-200 ${
                          isActive 
                            ? "bg-[#F3F6F0] border-emerald-300 text-emerald-950 ring-1 ring-emerald-300/30 shadow-xs" 
                            : "bg-white border-zinc-100 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-200"
                        }`}
                      >
                        {/* Selector Cover thumbnail */}
                        <button 
                          onClick={() => {
                            setActiveSessionId(sess.id);
                            setErrorMessage(null);
                          }}
                          className="flex-1 flex items-center space-x-3 text-left focus:outline-hidden"
                        >
                          <div className="w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden shrink-0 relative border border-zinc-200">
                            {sess.imageUrl.startsWith("http") ? (
                              <img src={sess.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <img src={sess.imageUrl} alt="" className="w-full h-full object-cover" />
                            )}
                            {completionRate === 100 && (
                              <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                                <CheckCircle2 size={14} className="text-white fill-emerald-600" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 pr-6">
                            <h4 className="text-sm font-semibold truncate text-zinc-900 group-hover:text-emerald-900 transition-colors">
                              {sess.roomName}
                            </h4>
                            <div className="flex items-center space-x-2 mt-0.5 text-xs font-mono text-zinc-400">
                              <span className="capitalize">{sess.analysis.roomType.replace("_", " ")}</span>
                              <span>•</span>
                              <span>Score {sess.analysis.clutterScore}/10</span>
                            </div>
                            <div className="w-full bg-zinc-200 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                          </div>
                        </button>

                        {/* Delete Session Button */}
                        <button 
                          onClick={() => deleteSession(sess.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-all pointer-events-auto"
                          title="Delete Session"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* QUICK INSTRUCTIONS */}
            <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 text-sm space-y-3">
              <h4 className="font-display font-semibold text-zinc-950 flex items-center space-x-1.5">
                <Compass size={16} className="text-emerald-800" />
                <span>Decluttering Blueprint</span>
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed list-inside list-disc">
                <li>Capture a wide flat-angle photo showing the key zones.</li>
                <li>Write precise goals to guide the spatial logic suggestions.</li>
                <li>Set up interactive checklist steps locally and complete them.</li>
                <li>Take custom notes for shopping storage arrays or reminders.</li>
              </ul>
            </div>

            {/* DESIGN CRITERIA STATS FOR ACTIVE SESSION */}
            {activeSession && (
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 mb-3 uppercase tracking-wider">
                  <Sliders size={12} />
                  <span>Interactive Metrics</span>
                </div>
                
                {/* Clutter density index gauge */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-semibold text-zinc-700">Clutter Density Score</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getScoreColorAndLabel(activeSession.analysis.clutterScore).bg} ${getScoreColorAndLabel(activeSession.analysis.clutterScore).text}`}>
                        {activeSession.analysis.clutterScore}/10 ({getScoreColorAndLabel(activeSession.analysis.clutterScore).label})
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex border border-zinc-200/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getScoreColorAndLabel(activeSession.analysis.clutterScore).fill}`}
                        style={{ width: `${activeSession.analysis.clutterScore * 10}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-semibold text-zinc-700">Checklist Processed</span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {activeSession.completedStepIds.length} of {activeSession.analysis.declutterSteps.length}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden flex border border-zinc-200/50">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ 
                          width: `${activeSession.analysis.declutterSteps.length > 0 
                            ? (activeSession.completedStepIds.length / activeSession.analysis.declutterSteps.length) * 100 
                            : 0}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100">
                    <span className="text-xs font-mono text-stone-400 block">Analysis Context</span>
                    <p className="text-xs text-stone-600 mt-1 italic line-clamp-2">
                      &ldquo;{activeSession.goals}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL: MAIN WORKSPACE DISPLAY (8 Columns on desktop) */}
          <div className="lg:col-span-8">

            {/* ANIMATED LOADING AND GENERATION SCREEN */}
            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]"
              >
                {/* Decorative forest theme background ring */}
                <div className="absolute w-[300px] h-[300px] bg-emerald-50 rounded-full blur-3xl opacity-40 -top-12 -left-12" />
                <div className="absolute w-[200px] h-[200px] bg-amber-50 rounded-full blur-3xl opacity-40 -bottom-12 -right-12" />

                <div className="relative mb-6">
                  {/* Outer spinning dash border */}
                  <div className="w-24 h-24 rounded-full border-4 border-dashed border-emerald-600 animate-spin" style={{ animationDuration: "12s" }} />
                  {/* Inter spinning dash border reversed */}
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-emerald-300 animate-spin absolute top-2 left-2" style={{ animationDuration: "6s", animationDirection: "reverse" }} />
                  {/* Core icon */}
                  <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 absolute top-5 left-5">
                    <Sparkles className="animate-pulse" size={24} />
                  </div>
                </div>

                <div className="max-w-md relative z-10 space-y-4">
                  <h3 className="text-2xl font-display font-semibold text-zinc-900">Creating Your Blueprint</h3>
                  
                  {/* Cycles through helpful organisation progress updates */}
                  <div className="h-12 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.p 
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-emerald-800 font-medium text-sm text-center"
                      >
                        {MOCK_LOADING_TIPS[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                  </div>

                  <div className="text-xs text-zinc-400">
                    This typically takes 8 to 15 seconds. Please don't close the browser window.
                  </div>
                </div>
              </motion.div>
            )}

            {/* UNVEILING WORKSPACE CONTENT (IF NOT LOADING) */}
            {!isAnalyzing && (
              <div className="space-y-8">
                
                {/* STATE A: ACTIVE VIEWING DASHBOARD */}
                {activeSessionId !== null && activeSession && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    
                    {/* DASHBOARD HERO HEADER BLOCK */}
                    <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
                      <div className="grid grid-cols-1 md:grid-cols-12">
                        {/* Selected uploaded user image preview */}
                        <div className="md:col-span-5 h-[280px] md:h-full relative overflow-hidden bg-zinc-900">
                          {activeSession.imageUrl.startsWith("http") ? (
                            <img 
                              src={activeSession.imageUrl} 
                              alt="Analyzed Room" 
                              style={getBeforeStyleFilter()}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <img 
                              src={activeSession.imageUrl} 
                              alt="Analyzed Room" 
                              style={getBeforeStyleFilter()}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-3 left-3 bg-zinc-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white flex items-center space-x-1.5 text-xs font-mono">
                            <Calendar size={12} className="text-emerald-400" />
                            <span>{new Date(activeSession.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                                  {activeSession.analysis.roomTypeDisplay}
                                </span>
                                <h2 className="text-2xl font-display font-semibold text-zinc-900 mt-2">
                                  {activeSession.roomName}
                                </h2>
                              </div>

                              <div className="flex items-center space-x-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={handlePrintPlan}
                                  className="px-3 py-1.5 bg-emerald-55 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all cursor-pointer hover:scale-[1.01]"
                                  title="Download blueprint plan as printable PDF"
                                >
                                  <Printer size={13} className="stroke-[2.5]" />
                                  <span>Download Plan</span>
                                </button>

                                <button 
                                  onClick={() => deleteSession(activeSession.id)}
                                  className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-[#FAF9F5] hover:border-zinc-200 transition-all border border-transparent"
                                  title="Delete workspace analysis"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            <p className="text-sm text-stone-600 leading-relaxed mt-4">
                              {activeSession.analysis.roomAnalysis}
                            </p>

                            {/* TEXT-TO-SPEECH (TTS) NARRATION CONTROL DECK */}
                            <div className="mt-5 p-4 rounded-2xl bg-[#FCFAF6] border border-stone-200/80 space-y-3.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center space-x-2.5 bg-transparent text-stone-700">
                                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100/50 shrink-0 shadow-2xs">
                                    <Headphones size={15} className={`stroke-[2.5] ${isPlayingSpeech && !isPausedSpeech ? "animate-bounce" : ""}`} />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-semibold text-zinc-900 leading-none flex items-center gap-1.5">
                                      <span>Declutter Audio Guide</span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    </h4>
                                    <p className="text-[10px] text-stone-500 mt-1">Listen to decluttering tips hands-free while organizing</p>
                                  </div>
                                </div>

                                {/* AUDIO EQUALIZER AMBIENT ANIMS */}
                                {isPlayingSpeech && (
                                  <div className="flex items-center space-x-1 justify-center bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md text-[10px] text-emerald-800 font-mono font-bold self-start sm:self-center shadow-2xs">
                                    <span className="relative flex h-1.5 w-1.5 mr-1">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    {isPausedSpeech ? "PAUSED" : "PLAYING"}

                                    <div className="flex items-end space-x-0.5 h-3 ml-1.5">
                                      <div className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 ${isPlayingSpeech && !isPausedSpeech ? "animate-[bounce_0.8s_infinite_-0.2s]" : "h-1"}`} style={{ height: isPlayingSpeech && !isPausedSpeech ? "" : "3px" }} />
                                      <div className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 ${isPlayingSpeech && !isPausedSpeech ? "animate-[bounce_0.8s_infinite_-0.4s]" : "h-1"}`} style={{ height: isPlayingSpeech && !isPausedSpeech ? "" : "5px" }} />
                                      <div className={`w-0.5 bg-emerald-600 rounded-full transition-all duration-300 ${isPlayingSpeech && !isPausedSpeech ? "animate-[bounce_0.8s_infinite_-0.6s]" : "h-1"}`} style={{ height: isPlayingSpeech && !isPausedSpeech ? "" : "2px" }} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* CURRENT STATUS BAR BRIEF DESCRIPTION */}
                              {isPlayingSpeech && currentPlayingSection && (
                                <div className="text-[11px] font-mono bg-zinc-900 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between">
                                  <span>🔊 Speaking: <strong className="text-zinc-50">{currentPlayingSection}</strong></span>
                                  <span className="text-[9px] text-zinc-500">Click stop anytime</span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-2">
                                {/* MAIN TRIGGER PLAY BUTTONS */}
                                {!isPlayingSpeech ? (
                                  <button
                                    onClick={() => playFullRoomPlan(activeSession)}
                                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                                  >
                                    <Volume2 size={13} />
                                    <span>Listen to Full Plan</span>
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      onClick={handlePauseSpeech}
                                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                                    >
                                      {isPausedSpeech ? <Play size={12} className="fill-white text-white" /> : <Pause size={12} className="fill-white text-white" />}
                                      <span>{isPausedSpeech ? "Resume" : "Pause"}</span>
                                    </button>
                                    <button
                                      onClick={handleStopSpeech}
                                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
                                    >
                                      <Square size={12} className="fill-white text-white" />
                                      <span>Stop</span>
                                    </button>
                                  </>
                                )}

                                {/* SPLIT TARGETED SUB-SECTIONS (ONLY SHOW WHEN NOT CURRENTLY SPEAKING AS A CONVENIENCE) */}
                                {!isPlayingSpeech && (
                                  <div className="flex flex-wrap gap-1.5">
                                    <button
                                      onClick={() => playSummaryOnly(activeSession)}
                                      className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition-all"
                                    >
                                      Summary Only
                                    </button>
                                    <button
                                      onClick={() => playStepsOnly(activeSession)}
                                      className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition-all"
                                    >
                                      Checklist steps
                                    </button>
                                    <button
                                      onClick={() => playLayoutTipsOnly(activeSession)}
                                      className="px-2.5 py-1.5 bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer transition-all"
                                    >
                                      Spatial & Storage Tips
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* VOICE AND SPEED CONFIGURATORS SECTIONS */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t border-stone-200/60 text-xs text-stone-600">
                                {/* VOICE SELECTOR */}
                                {availableVoices.length > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-mono text-stone-400 shrink-0">Voice:</span>
                                    <select
                                      value={selectedVoiceName}
                                      onChange={(e) => {
                                        setSelectedVoiceName(e.target.value);
                                        // If currently speaking, restart with new voice!
                                        if (isPlayingSpeech) {
                                          handleStopSpeech();
                                        }
                                      }}
                                      className="w-full text-xs bg-white border border-stone-200 rounded-md py-0.5 px-2 outline-none text-stone-700 cursor-pointer focus:border-emerald-600/60"
                                    >
                                      {availableVoices.map((voice) => (
                                        <option key={voice.name} value={voice.name}>
                                          {voice.name} ({voice.lang})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-stone-400 italic">Default system voice active</div>
                                )}

                                {/* SPEED SELECTOR */}
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-mono text-stone-400 shrink-0">Speed:</span>
                                  <div className="flex items-center space-x-1">
                                    {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                                      <button
                                        key={rate}
                                        type="button"
                                        onClick={() => {
                                          setSpeechRate(rate);
                                          // If currently speaking, stop so the next manual press picks up the correct rate
                                          if (isPlayingSpeech) {
                                            handleStopSpeech();
                                          }
                                        }}
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer transition-all ${
                                          speechRate === rate
                                            ? "bg-zinc-800 text-white"
                                            : "bg-white border border-stone-200 text-stone-500 hover:text-stone-800"
                                        }`}
                                      >
                                        {rate}x
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* primary list of identified clutter elements */}
                          <div className="pt-4 border-t border-zinc-100">
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-2">Identified Clutter Culprits:</span>
                            <div className="flex flex-wrap gap-2">
                              {activeSession.analysis.clutterSources.map((source, index) => (
                                <span 
                                  key={index} 
                                  className="text-xs bg-[#FAF9F5] border border-stone-200 text-stone-700 px-3 py-1.5 rounded-lg inline-flex items-center"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shrink-0" />
                                  {source}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BEFORE & AFTER COMPARATIVE SUITE */}
                    <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                        <div className="flex items-center space-x-3 bg-white">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center">
                            <Sparkles size={20} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <h3 className="font-display font-semibold text-lg text-zinc-900">Before & After Showcase</h3>
                            <p className="text-xs text-stone-500">Track and compare your tidy accomplishments visually</p>
                          </div>
                        </div>

                        {activeSession.afterImageUrl ? (
                          <div className="flex items-center space-x-2 bg-zinc-100/80 p-1.5 rounded-xl border border-zinc-200/50">
                            <button
                              type="button"
                              onClick={() => setComparisonMode("slider")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                comparisonMode === "slider"
                                  ? "bg-white text-zinc-900 shadow-xs"
                                  : "text-stone-500 hover:text-zinc-800"
                              }`}
                            >
                              Interactive Swipe
                            </button>
                            <button
                              type="button"
                              onClick={() => setComparisonMode("side-by-side")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                comparisonMode === "side-by-side"
                                  ? "bg-white text-zinc-900 shadow-xs"
                                  : "text-stone-500 hover:text-zinc-800"
                              }`}
                            >
                              Side-by-Side
                            </button>
                            <button
                              type="button"
                              onClick={() => setComparisonMode("fade")}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                comparisonMode === "fade"
                                  ? "bg-white text-zinc-900 shadow-xs"
                                  : "text-stone-500 hover:text-zinc-800"
                              }`}
                            >
                              Transparency Fade
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {/* Image Clarification Filters Deck */}
                      <div className="bg-stone-50/50 border border-stone-200/80 rounded-2xl p-4 md:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100/40">
                              <SlidersHorizontal size={14} className="stroke-[2.5]" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-900">Image Clarification Tool</h4>
                              <p className="text-[10px] text-stone-500">Adjust exposure, contrast, and black &amp; white values to examine dark/clustered corners.</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-start sm:self-auto">
                            {/* Reset Button */}
                            {(imgBrightness !== 100 || imgContrast !== 100 || imgGrayscale !== 0 || imgSaturate !== 100) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setImgBrightness(100);
                                  setImgContrast(100);
                                  setImgGrayscale(0);
                                  setImgSaturate(100);
                                  setApplyFilterTo("both");
                                }}
                                className="p-1 px-2.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-mono font-bold flex items-center space-x-1 cursor-pointer transition-all"
                                title="Reset all custom adjustments"
                              >
                                <RefreshCw size={10} className="stroke-[2.5]" />
                                <span>Reset Filters</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Quick Presets row */}
                        <div className="flex flex-wrap items-center gap-1.5 pb-1">
                          <span className="text-[10px] font-bold text-stone-500 mr-1.5 font-mono">Presets:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setImgBrightness(100);
                              setImgContrast(100);
                              setImgGrayscale(0);
                              setImgSaturate(100);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                              imgBrightness === 100 && imgContrast === 100 && imgGrayscale === 0 && imgSaturate === 100
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            }`}
                          >
                            Original
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImgBrightness(135);
                              setImgContrast(120);
                              setImgGrayscale(0);
                              setImgSaturate(110);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                              imgBrightness === 135 && imgContrast === 120 && imgGrayscale === 0 && imgSaturate === 110
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            }`}
                          >
                            Highlight Dark Corners (Clarify)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImgBrightness(100);
                              setImgContrast(145);
                              setImgGrayscale(0);
                              setImgSaturate(85);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                              imgBrightness === 100 && imgContrast === 145 && imgGrayscale === 0 && imgSaturate === 85
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            }`}
                          >
                            High Contrast Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImgBrightness(115);
                              setImgContrast(110);
                              setImgGrayscale(100);
                              setImgSaturate(0);
                            }}
                            className={`px-2 py-1 rounded text-[10px] font-bold border cursor-pointer transition-all ${
                              imgGrayscale === 100
                                ? "bg-zinc-800 border-zinc-800 text-white"
                                : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                            }`}
                          >
                            Technical B&amp;W
                          </button>
                        </div>

                        {/* Sliders Input Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 pt-1">
                          
                          {/* 1. BRIGHTNESS */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-stone-700">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Sun size={12} className="text-amber-500 stroke-[2.5]" /> Brightness
                              </span>
                              <span className="font-mono text-[10px] text-stone-500">{imgBrightness}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="200"
                              value={imgBrightness}
                              onChange={(e) => setImgBrightness(Number(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 2. CONTRAST */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-stone-700">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Contrast size={12} className="text-stone-700 stroke-[2.5]" /> Contrast
                              </span>
                              <span className="font-mono text-[10px] text-stone-500">{imgContrast}%</span>
                            </div>
                            <input
                              type="range"
                              min="50"
                              max="200"
                              value={imgContrast}
                              onChange={(e) => setImgContrast(Number(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 3. GRAYSCALE */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-stone-700">
                              <span className="flex items-center gap-1.5 font-mono">
                                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-stone-400 to-stone-800" /> Grayscale
                              </span>
                              <span className="font-mono text-[10px] text-stone-500">{imgGrayscale}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={imgGrayscale}
                              onChange={(e) => setImgGrayscale(Number(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          {/* 4. SATURATION */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] font-semibold text-stone-700">
                              <span className="flex items-center gap-1.5 font-mono">
                                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-400 via-green-400 to-blue-400" /> Saturation
                              </span>
                              <span className="font-mono text-[10px] text-stone-500">{imgSaturate}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={imgSaturate}
                              onChange={(e) => setImgSaturate(Number(e.target.value))}
                              className="w-full accent-indigo-600 h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Apply-To targets selection when an After Image is available */}
                        {activeSession.afterImageUrl && (
                          <div className="flex items-center space-x-2 pt-2.5 text-[10px] text-stone-500 border-t border-stone-200/50">
                            <span className="font-mono font-bold">Apply Adjustments to:</span>
                            <div className="flex items-center space-x-1.5">
                              {(["both", "before", "after"] as const).map((target) => (
                                <button
                                  key={target}
                                  type="button"
                                  onClick={() => setApplyFilterTo(target)}
                                  className={`px-2 py-0.5 rounded capitalize font-bold cursor-pointer transition-all border ${
                                    applyFilterTo === target
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "bg-white border-stone-200 text-stone-500 hover:text-stone-800"
                                  }`}
                                >
                                  {target === "both" ? "Both Images" : target + " Photo Only"}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {activeSession.afterImageUrl ? (
                        /* COMPARISON VIEWER ELEMENT */
                        <div className="space-y-6">
                          
                          {/* 1. SLIDER COMPARISON MODE */}
                          {comparisonMode === "slider" && (
                            <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 select-none">
                              {/* Before Image (underneath) */}
                              <img
                                src={activeSession.imageUrl}
                                alt="Before room view"
                                style={getBeforeStyleFilter()}
                                className="absolute inset-0 w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-4 left-4 bg-zinc-950/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold z-10 border border-white/10">
                                Before
                              </div>

                              {/* After Image (clipped on top) */}
                              <img
                                src={activeSession.afterImageUrl}
                                alt="Organized after room view"
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ 
                                  height: "100%", 
                                  width: "100%", 
                                  clipPath: `inset(0 0 0 ${sliderPosition}%)`,
                                  ...getAfterStyleFilter()
                                }}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute top-4 right-4 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold z-10">
                                After Organized
                              </div>

                              {/* Slider Divider Bar */}
                              <div 
                                className="absolute inset-y-0 w-1 bg-white hover:bg-emerald-300 cursor-ew-resize z-20"
                                style={{ left: `${sliderPosition}%` }}
                              >
                                {/* Center Handle */}
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-zinc-700 shadow-lg border border-zinc-200 flex items-center justify-center hover:bg-emerald-50 active:scale-95 transition-transform hover:text-emerald-700">
                                  <Sliders size={14} className="rotate-90 stroke-[2.5]" />
                                </div>
                              </div>

                              {/* Standard Overlay Input range for absolute touch-friendly scrub */}
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={sliderPosition}
                                onChange={(e) => setSliderPosition(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                              />
                            </div>
                          )}

                          {/* 2. SIDE BY SIDE MODE */}
                          {comparisonMode === "side-by-side" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                                <img
                                  src={activeSession.imageUrl}
                                  alt="Before room view"
                                  style={getBeforeStyleFilter()}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 bg-zinc-950/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold border border-white/10">
                                  Before
                                </div>
                              </div>

                              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-100">
                                <img
                                  src={activeSession.afterImageUrl}
                                  alt="After room view"
                                  style={getAfterStyleFilter()}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold">
                                  After Organized
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. TRANSPARENCY OVERLAY FADE MODE */}
                          {comparisonMode === "fade" && (
                            <div className="space-y-4">
                              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 select-none">
                                {/* Base Before Image */}
                                <img
                                  src={activeSession.imageUrl}
                                  alt="Before room view"
                                  style={getBeforeStyleFilter()}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute top-4 left-4 bg-zinc-950/80 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold z-10 border border-white/10">
                                  Before (0% Transformed)
                                </div>

                                {/* Layered After image with custom opacity */}
                                <img
                                  src={activeSession.afterImageUrl}
                                  alt="After room view"
                                  className="absolute inset-0 w-full h-full object-cover"
                                  style={{ 
                                    opacity: fadePosition / 100,
                                    ...getAfterStyleFilter()
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                                <div 
                                  className="absolute top-4 right-4 bg-emerald-600 text-white px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider uppercase font-bold z-10"
                                  style={{ opacity: fadePosition > 20 ? 1 : 0 }}
                                >
                                  After ({fadePosition}% Transparent Overlay)
                                </div>
                              </div>

                              {/* Manual slider controller underneath */}
                              <div className="bg-stone-50 p-4 rounded-xl border border-zinc-200 flex items-center space-x-4">
                                <span className="text-xs font-mono font-bold text-stone-500 shrink-0">Before</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={fadePosition}
                                  onChange={(e) => setFadePosition(Number(e.target.value))}
                                  className="flex-1 accent-emerald-700 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs font-mono font-bold text-emerald-800 shrink-0">After Organized</span>
                              </div>
                            </div>
                          )}

                          {/* Quick details & actions */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100 text-xs text-zinc-500">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Grab the slider handle to compare states or change standard tabs.</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => afterFileInputRef.current?.click()}
                                className="px-3 py-1.5 border border-zinc-200 text-zinc-600 hover:text-emerald-800 bg-white hover:bg-emerald-50 hover:border-emerald-200 rounded-lg font-medium transition-all cursor-pointer"
                              >
                                Replace After Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAfterImage(activeSession.id)}
                                className="px-3 py-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100/60 rounded-lg font-medium transition-all cursor-pointer"
                              >
                                Delete After Photo
                              </button>
                            </div>
                          </div>

                        </div>
                      ) : (
                        /* UPLOAD CALL TO ACTION */
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                          <div className="md:col-span-8 space-y-2">
                            <h4 className="font-semibold text-zinc-900 text-sm">Organized your space? Upload an 'After' Photo to compare progress!</h4>
                            <p className="text-xs text-stone-600 leading-relaxed">
                              Celebrate your hard work and beautiful organized surroundings. Grab your smartphone or camera, capture a photo matching the initial angle, and upload it here. You'll instantly unlock interactive swipe compare modes, side-by-side grids, and cross-dissolve fade mixers to watch clutter dissolve into thin air!
                            </p>
                          </div>

                          <div className="md:col-span-4">
                            <div
                              onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAfterDragActive(true);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAfterDragActive(true);
                              }}
                              onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAfterDragActive(false);
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAfterDragActive(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                  handleAfterImageUpload(e.dataTransfer.files[0]);
                                }
                              }}
                              onClick={() => afterFileInputRef.current?.click()}
                              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                                afterDragActive
                                  ? "border-emerald-600 bg-emerald-50/50"
                                  : "border-zinc-300 hover:border-emerald-600 bg-zinc-50"
                              }`}
                            >
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2 shadow-xs">
                                <Upload size={16} />
                              </div>
                              <span className="text-xs font-semibold text-zinc-800 block">
                                Upload 'After' Layout
                              </span>
                              <span className="text-[10px] text-zinc-500 mt-1 block">
                                Drop or click to transfer
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hidden File Input for After Photo */}
                      <input
                        type="file"
                        ref={afterFileInputRef}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleAfterImageUpload(e.target.files[0]);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>

                    {/* TWO-COLUMN GRID OF CRUCIAL STRATEGIES */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      
                      {/* SUB SECTION 1: THE PORTABLE ACTION CHEKLIST */}
                      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <CheckCircle2 size={18} />
                            </div>
                            <h3 className="font-display font-semibold text-lg text-zinc-900">Tidying Checklist</h3>
                          </div>
                          
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            {activeSession.completedStepIds.length} / {activeSession.analysis.declutterSteps.length}
                          </span>
                        </div>

                        {/* Staggered Checklist Container */}
                        <div className="space-y-4">
                          {activeSession.analysis.declutterSteps.map((step) => {
                            const isChecked = activeSession.completedStepIds.includes(step.id);
                            return (
                              <div
                                key={step.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleStepWithId(activeSession.id, step.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    toggleStepWithId(activeSession.id, step.id);
                                  }
                                }}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start space-x-3.5 focus:outline-hidden cursor-pointer ${
                                  isChecked 
                                    ? "bg-[#FAFDF6] border-emerald-200 text-stone-500 opacity-80" 
                                    : "bg-white border-zinc-200 text-stone-800 hover:border-zinc-300 hover:shadow-xs"
                                }`}
                              >
                                {/* Customized large checkbox */}
                                <div className={`w-6 h-6 rounded-lg stretch-0 flex items-center justify-center mt-0.5 border shrink-0 transition-all ${
                                  isChecked 
                                    ? "bg-emerald-600 border-emerald-600 text-white" 
                                    : "bg-stone-50 border-stone-300"
                                }`}>
                                  {isChecked && <CheckCircle2 size={14} className="stroke-[3]" />}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase bg-zinc-100 border border-zinc-200/65 rounded px-1.5 py-0.5 text-zinc-500">
                                      {step.phase}
                                    </span>
                                    
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOpenAdviceStepId(openAdviceStepId === step.id ? null : step.id);
                                      }}
                                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                        openAdviceStepId === step.id 
                                          ? "bg-[#FAF7F0] border border-amber-300 text-amber-800 scale-105" 
                                          : "text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50"
                                      }`}
                                      title="Show expert practical advice for this step"
                                    >
                                      <Info size={13} className="stroke-[2.5]" />
                                    </button>
                                  </div>
                                  <h4 className={`text-sm font-semibold mt-1.5 ${isChecked ? "line-through text-stone-400" : "text-zinc-900"}`}>
                                    {step.title}
                                  </h4>
                                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                    {step.description}
                                  </p>

                                  {/* EXPANDABLE CONTEXTUAL TACTICAL ADVICE */}
                                  <AnimatePresence>
                                    {openAdviceStepId === step.id && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.2 }}
                                        onClick={(e) => e.stopPropagation()} // don't toggle checkbox when clicking inside advice text
                                        className="bg-[#FCFAF2] border border-amber-200/50 rounded-xl p-3.5 space-y-1 text-stone-800 select-text overflow-hidden cursor-default"
                                      >
                                        <div className="flex items-center space-x-1.5 text-[9px] font-bold text-amber-800 uppercase font-mono tracking-wider">
                                          <Sparkles size={11} className="fill-amber-500 text-amber-500 stroke-[2.5]" />
                                          <span>Pro-Advice &amp; Tactics</span>
                                        </div>
                                        <p className="text-[11px] text-stone-600 leading-relaxed font-sans normal-case font-normal select-text">
                                          {getDeclutterStepAdvice(step.title, step.description)}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SUB SECTION 2: SPATIAL ALIGNMENT, DESIGN TOOLS & STORAGE */}
                      <div className="space-y-8">
                        
                        {/* ZONING SUGGESTIONS */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
                          <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <Box size={18} />
                            </div>
                            <h3 className="font-display font-semibold text-lg text-zinc-900">Spatial Layout</h3>
                          </div>

                          <div className="space-y-4">
                            {activeSession.analysis.layoutSuggestions.map((layout, idx) => (
                              <div key={idx} className="p-4 rounded-2xl bg-[#FCFAF5] border border-amber-200/40">
                                <span className="text-xs font-mono uppercase font-bold text-amber-800 tracking-wider">
                                  {layout.area}
                                </span>
                                <p className="text-xs text-stone-700 leading-relaxed mt-1.5">
                                  {layout.suggestion}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* DETAILED SMART STORAGE RECOMMENDER */}
                        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
                          <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <Compass size={18} />
                            </div>
                            <h3 className="font-display font-semibold text-lg text-zinc-900">Storage Solutions</h3>
                          </div>

                          <div className="divide-y divide-zinc-100">
                            {activeSession.analysis.storageSolutions.map((solution, idx) => (
                              <div key={idx} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-sm font-semibold text-zinc-900">{solution.item}</h4>
                                  <span className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                                    solution.estimatedCost === "Low" 
                                      ? "bg-emerald-50 text-emerald-700" 
                                      : solution.estimatedCost === "Medium"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-rose-50 text-rose-700"
                                  }`}>
                                    Cost: {solution.estimatedCost}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                  {solution.purpose}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* AESTHETIC VISUAL TIPS & NOTES WRITING BOARD */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      
                      {/* DISPLAY STYLING IDEAS */}
                      <div className="md:col-span-5 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-zinc-100">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                            <Lightbulb size={18} />
                          </div>
                          <h3 className="font-display font-semibold text-lg text-zinc-900">Styling & Peace Rules</h3>
                        </div>

                        <ul className="space-y-3.5">
                          {activeSession.analysis.aestheticTips.map((tip, idx) => (
                            <li key={idx} className="flex items-start text-xs text-stone-700 leading-relaxed">
                              <span className="text-emerald-700 mr-2.5 font-bold font-mono shrink-0 mt-0.5">0{idx+1}.</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* MEMO NOTES FOR USER WORK / LISTS */}
                      <div className="md:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                              <FileText size={18} />
                            </div>
                            <h3 className="font-display font-semibold text-lg text-zinc-900">Custom Planner & Notes</h3>
                          </div>
                          <span className="text-xs font-mono text-stone-400">Autosaved Locally</span>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-medium text-stone-500 block">
                            Write shopping lists, target measurements, or capture your cleaning notes here:
                          </label>
                          <textarea
                            value={activeSession.userNotes || ""}
                            onChange={(e) => saveSessionNotes(activeSession.id, e.target.value)}
                            className="w-full h-[145px] p-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-transparent leading-relaxed"
                            placeholder="Example: Need to stop by IKEA to get 2 woven baskets. Also, organize bookshelf on Saturday morning!"
                          />
                        </div>
                      </div>

                    </div>

                  </motion.div>
                )}

                {/* STATE B: EMPTY STATE & SETUP FORM PANEL */}
                {(activeSessionId === null || sessions.length === 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* ENHANCED INPUT SETUP FORM (7 Columns) */}
                    <div className="md:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs">
                      <div className="pb-4 mb-6 border-b border-zinc-100">
                        <h2 className="text-2xl font-display font-semibold text-zinc-900">Upload Room Showcase</h2>
                        <p className="text-sm text-stone-500 mt-1">Provide room characteristics and receive high-fidelity, customized instructions from Gemini.</p>
                      </div>

                      <form onSubmit={triggerAnalysis} className="space-y-6">
                        
                        {/* DRAG AND DROP FILE UPLOADER */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">Room Picture</label>
                            
                            {/* Toggle between Upload and Live Camera */}
                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => { stopCamera(); }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                  !isCameraActive
                                    ? "bg-zinc-800 border-zinc-800 text-white shadow-xs"
                                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                }`}
                              >
                                <span>File Upload</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { startCamera("environment"); }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                                  isCameraActive
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                                }`}
                              >
                                <Camera size={11} className="stroke-[2.5]" />
                                <span>Live Camera</span>
                              </button>
                            </div>
                          </div>
                          
                          {isCameraActive ? (
                            /* LIVE BROWSER CAMERA CAPTURE VIEWFINDER */
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              className="relative bg-zinc-950 rounded-3xl overflow-hidden shadow-xs border border-zinc-800 flex flex-col items-center justify-center min-h-[320px]"
                            >
                              {cameraError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900 text-stone-200 space-y-4">
                                  <div className="w-12 h-12 rounded-full bg-red-950/80 text-red-400 flex items-center justify-center border border-red-900/30">
                                    <AlertTriangle size={20} className="stroke-[2.5]" />
                                  </div>
                                  <div className="space-y-1 max-w-md">
                                    <h5 className="text-sm font-bold text-white">Camera Access Failed</h5>
                                    <p className="text-xs text-stone-400 leading-relaxed">{cameraError}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      type="button"
                                      onClick={() => startCamera(cameraFacingMode)}
                                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Try Again
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => stopCamera()}
                                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-stone-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-[320px] object-cover rounded-3xl ${
                                      cameraFacingMode === "user" ? "scale-x-[-1]" : ""
                                    }`}
                                  />
                                  
                                  {/* Scanning indicator */}
                                  <div className="absolute inset-x-0 top-0 h-[2px] bg-emerald-500/80 shadow-[0_0_10px_#10b981] animate-[bounce_3s_infinite]" />

                                  {/* Camera Controls Layer */}
                                  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-6 px-6 z-10">
                                    
                                    {/* Facing switch clicker */}
                                    <button
                                      type="button"
                                      onClick={toggleCameraFacingMode}
                                      className="p-3 bg-zinc-900/85 text-white hover:bg-zinc-800 border border-zinc-700/60 rounded-full transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center"
                                      title="Toggle Front/Rear Camera"
                                    >
                                      <RefreshCw size={14} className="stroke-[2.5]" />
                                    </button>

                                    {/* Capture shutter key */}
                                    <button
                                      type="button"
                                      onClick={capturePhoto}
                                      className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 rounded-full border-4 border-white/80 shadow-2xl transition-all cursor-pointer flex items-center justify-center p-0.5"
                                      title="Click to Snapshot Room"
                                    >
                                      <div className="w-full h-full bg-emerald-600 hover:bg-emerald-500 rounded-full border border-zinc-950/25 active:scale-95 transition-transform" />
                                    </button>

                                    {/* Deactive/Stop close */}
                                    <button
                                      type="button"
                                      onClick={stopCamera}
                                      className="p-3 bg-zinc-900/85 text-white hover:bg-red-900 border border-zinc-700/60 rounded-full transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center"
                                      title="Cancel Camera Mode"
                                    >
                                      <Trash2 size={14} className="stroke-[2.5]" />
                                    </button>

                                  </div>
                                  
                                  {/* Interactive overlay tag */}
                                  <div className="absolute top-3 left-3 bg-zinc-900/80 border border-zinc-700/50 rounded-full px-2.5 py-1 text-[9px] font-mono font-bold uppercase text-emerald-400 flex items-center space-x-1.5 shadow-md">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span>Stream: {cameraFacingMode === "user" ? "Front Selfie" : "Main Rear"}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <div 
                              onDragEnter={handleDrag}
                              onDragOver={handleDrag}
                              onDragLeave={handleDrag}
                              onDrop={handleDrop}
                              onClick={() => {
                                if (!imageFile) {
                                  fileInputRef.current?.click();
                                }
                              }}
                              className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
                                dragActive 
                                  ? "border-emerald-600 bg-emerald-50/50" 
                                  : imageFile 
                                    ? "border-emerald-500 bg-[#FAFDF6] cursor-default" 
                                    : "border-zinc-300 hover:border-emerald-600 bg-[#FAFDF9] cursor-pointer"
                              }`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden" 
                              />

                              {imageFile ? (
                                <div className="space-y-3">
                                  <div className="w-full max-h-[220px] overflow-hidden rounded-2xl relative border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                                    <img src={imageFile} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-zinc-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          fileInputRef.current?.click();
                                        }}
                                        className="text-white bg-zinc-900/80 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer hover:bg-zinc-800 transition-all"
                                      >
                                        Browse New
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          startCamera("environment");
                                        }}
                                        className="text-white bg-emerald-700/90 hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                                      >
                                        <Camera size={12} className="stroke-[2.5]" />
                                        <span>Use Camera</span>
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-700 font-semibold flex items-center">
                                      <CheckCircle2 size={14} className="mr-1 inline-block" /> Snapshot ready for analysis
                                    </span>
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setImageFile(null);
                                      }}
                                      className="text-stone-500 hover:text-red-600 underline"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 py-4">
                                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                                    <Upload size={20} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-900">Drag and drop your room photo, or <span className="text-emerald-800 underline">browse</span></p>
                                    <p className="text-xs text-stone-500 mt-1">Or use the <span className="text-emerald-800 font-bold hover:underline" onClick={(e) => { e.stopPropagation(); startCamera("environment"); }}>Live Camera</span> button above to capture</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ROOM TYPE PRESETS WRAPPED GRIDS */}
                        <div className="space-y-2">
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">Select Space Category</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {ROOM_TYPES.map((preset) => {
                              const isSelected = selectedRoomId === preset.id;
                              const IconComponent = preset.icon;
                              return (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => handleRoomTypeSelect(preset)}
                                  className={`p-3 rounded-2xl border text-left flex items-center space-x-2.5 transition-all ${
                                    isSelected 
                                      ? "bg-[#F3F6F0] border-emerald-500 text-emerald-950 ring-1 ring-emerald-500/10 shadow-xs" 
                                      : "bg-white border-zinc-200 text-stone-700 hover:border-zinc-300"
                                  }`}
                                >
                                  <span className={`p-1.5 rounded-lg ${isSelected ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500"}`}>
                                    <IconComponent size={14} />
                                  </span>
                                  <span className="text-xs font-semibold leading-none">{preset.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Custom Room Name */}
                        <div>
                          <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Custom Room Name (Optional)</label>
                          <input 
                            type="text"
                            value={roomNameInput}
                            onChange={(e) => setRoomNameInput(e.target.value)}
                            placeholder="e.g. Upstairs Attic Office, Downstairs Kitchen"
                            className="w-full text-sm p-3.5 bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-600/50"
                          />
                        </div>

                        {/* ADVANCED GOALS & PAIN POINT SELECTORS */}
                        <div className="space-y-4">
                          
                          {/* Organization priorities */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">Your Goals & Standards</label>
                              <span className="text-[10px] text-emerald-800 font-medium">Click presets below to auto-append</span>
                            </div>
                            <textarea 
                              value={customGoals}
                              onChange={(e) => setCustomGoals(e.target.value)}
                              placeholder="e.g. Make it safe for school kids, make desk accessible, hide chargers or books..."
                              className="w-full text-sm p-3.5 h-[80px] bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-600/50"
                            />
                            {/* Preset Shortcuts */}
                            <div className="flex flex-wrap gap-1.5">
                              {GOAL_PRESETS.map((p, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => addGoalPreset(p)}
                                  className="text-[10px] bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-900 border border-zinc-200 hover:border-emerald-200 px-2 py-1 rounded-md transition-all text-stone-600"
                                >
                                  + {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Pain Points */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">Main Pain Points & Challenges</label>
                              <span className="text-[10px] text-emerald-800 font-medium">Click presets below to auto-append</span>
                            </div>
                            <textarea 
                              value={customPainPoints}
                              onChange={(e) => setCustomPainPoints(e.target.value)}
                              placeholder="e.g. Too many clothes on the chair, wire nesting, mail piling up on clean drawers..."
                              className="w-full text-sm p-3.5 h-[80px] bg-zinc-50/50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-600/50"
                            />
                            {/* Preset Shortcuts */}
                            <div className="flex flex-wrap gap-1.5">
                              {PAIN_POINT_PRESETS.map((p, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => addPainPointPreset(p)}
                                  className="text-[10px] bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-900 border border-zinc-200 hover:border-emerald-200 px-2 py-1 rounded-md transition-all text-stone-600"
                                >
                                  + {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Clutter evaluation focus level selector */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">Inspection Depth</label>
                            <div className="flex space-x-3">
                              {["standard", "high-detail", "architect-rearrangement"].map((mode) => (
                                <label key={mode} className="flex items-center space-x-2 text-xs text-stone-700 capitalize cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="clutterFocus" 
                                    value={mode}
                                    checked={clutterFocus === mode}
                                    onChange={(e) => setClutterFocus(e.target.value)}
                                    className="text-emerald-700 focus:ring-emerald-500"
                                  />
                                  <span>{mode.replace("-", " ")}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                        </div>

                        {/* BIG ACTION RUN BUTTON */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={!imageFile}
                            className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-2 text-sm font-semibold transition-all duration-300 shadow-sm ${
                              imageFile 
                                ? "bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:shadow-md" 
                                : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            }`}
                          >
                            <Sparkles size={16} className="text-amber-300 animate-pulse" />
                            <span>Generate AI-powered Organization Recommendations</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>

                      </form>
                    </div>

                    {/* CONVENIENT WELCOME / SAMPLE PORTFOLIO (5 Columns) */}
                    <div className="md:col-span-5 space-y-6">
                      
                      {/* ACCUEIL GREETING CARD */}
                      <div className="bg-emerald-950 text-emerald-50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
                        {/* Decorative radial blur green overlay */}
                        <div className="absolute w-[150px] h-[150px] bg-emerald-500 rounded-full blur-3xl opacity-20 -bottom-10 -left-10" />
                        
                        <div className="relative space-y-4">
                          <div className="inline-block px-2.5 py-1 rounded bg-emerald-800 text-[10px] font-mono tracking-widest text-emerald-300 uppercase">
                            Personal Organizer
                          </div>
                          
                          <h3 className="text-xl font-display font-semibold leading-snug">Bring Clarity and Space Back to Your Interiors</h3>
                          <p className="text-xs text-emerald-300 leading-relaxed">
                            No judgment. Just clever spatial strategies, item sorting checklists, furniture placement suggestions, and minimal styling metrics.
                          </p>

                          <div className="pt-2 text-xs space-y-2">
                            <p className="font-semibold text-emerald-200">How to photograph for best results:</p>
                            <ul className="list-disc pl-4 space-y-1 text-emerald-300/85">
                              <li>Switch on secondary lights or fetch natural daylight.</li>
                              <li>Stand back to capture floor-to-wall interfaces.</li>
                              <li>Avoid blurry or fully backlit silhouettes.</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* QUICKLY LOAD SAMPLE INSPIRATIONS CARD */}
                      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-4">
                        <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 uppercase tracking-wider">
                          <Compass size={14} />
                          <span>Explore Guidelines Now</span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          Don't have a photo handy? Click one of the showcase rooms below to explore how the checklist tracking and blueprint layout works inside your browser.
                        </p>

                        <div className="space-y-3 pt-1">
                          {SAMPLE_ROOMS.map((sample) => (
                            <button
                              key={sample.id}
                              onClick={() => {
                                // Add to sessions if not already present
                                if (!sessions.some(s => s.id === sample.id)) {
                                  const sess: SavedRoomAnalysis = {
                                    id: sample.id,
                                    timestamp: new Date().toISOString(),
                                    roomName: sample.roomName,
                                    imageUrl: sample.imageUrl,
                                    afterImageUrl: sample.afterImageUrl,
                                    goals: sample.goals,
                                    painPoints: sample.painPoints,
                                    analysis: sample.analysis as RoomAnalysisResponse,
                                    completedStepIds: []
                                  };
                                  saveToLocalStorage([sess, ...sessions]);
                                }
                                setActiveSessionId(sample.id);
                                setErrorMessage(null);
                              }}
                              className="w-full text-left p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-stone-50 hover:bg-white flex items-center space-x-3 transition-all duration-200 group focus:outline-hidden"
                            >
                              <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-zinc-200">
                                <img src={sample.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-zinc-900 truncate group-hover:text-emerald-800 transition-colors">
                                  {sample.roomName}
                                </h4>
                                <p className="text-[10px] text-stone-500 truncate mt-0.5 whitespace-nowrap">
                                  Goal: {sample.goals}
                                </p>
                              </div>
                              <ArrowRight size={14} className="text-zinc-400 group-hover:translate-x-1 duration-200 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Humble aesthetic footer */}
      <footer className="border-t border-zinc-200 bg-white/50 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-400 space-y-1 text-xs">
          <p className="font-mono">Room Organizer Assistant • Powered by gemini-3.5-flash with Structured Outputs</p>
          <p>© {new Date().getFullYear()} Room Organizer. Styled beautifully with pure Tailwind and layout animations.</p>
        </div>
      </footer>

      </div>

      {/* PERFECTLY FORMATTED, INK-FRIENDLY PDF / PRINT LAYOUT CONTAINER */}
      {activeSession && (
        <div className="hidden print:block p-8 bg-white text-zinc-900 font-sans max-w-4xl mx-auto space-y-8">
          
          {/* Header Report Card */}
          <div className="border-b-2 border-emerald-800 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-mono tracking-widest font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {activeSession.analysis.roomTypeDisplay}
                </span>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mt-2">
                  {activeSession.roomName} Blueprint
                </h1>
                <p className="text-sm text-zinc-500 mt-1 font-medium">
                  AI-powered Room Organization and Spatial Layout Plan
                </p>
              </div>
              <div className="text-right font-mono text-xs text-zinc-400 space-y-1">
                <p>Date: {new Date(activeSession.timestamp).toLocaleDateString()}</p>
                <p>Clutter Score: <strong className="text-zinc-950 font-bold">{activeSession.analysis.clutterScore}/10</strong></p>
                <p>Status: {activeSession.completedStepIds.length === activeSession.analysis.declutterSteps.length ? "Fully Organized" : "In Progress"}</p>
              </div>
            </div>
          </div>

          {/* Goals and Executive Summary */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Your Stated Goals</h3>
              <p className="text-sm text-zinc-800 italic leading-relaxed">
                &ldquo;{activeSession.goals}&rdquo;
              </p>
            </div>
            {activeSession.painPoints && (
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Current Areas of Concern</h3>
                <p className="text-sm text-zinc-800 italic leading-relaxed">
                  &ldquo;{activeSession.painPoints}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-3 uppercase tracking-wide">
              Room Analysis &amp; Overview
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {activeSession.analysis.roomAnalysis}
            </p>
          </div>

          {/* Before and After Image Showcases */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 uppercase tracking-wide">
              Visual Spaces Comparison
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider">Initial State (Before)</h4>
                <div className="aspect-[16/10] bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden">
                  <img src={activeSession.imageUrl} alt="Before state" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider">Transformed State (After)</h4>
                <div className="aspect-[16/10] bg-zinc-100 rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center">
                  {activeSession.afterImageUrl ? (
                    <img src={activeSession.afterImageUrl} alt="After state" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-xs text-zinc-400 italic">No progress photo uploaded yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Identified culprits */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Identified Clutter Sources</h3>
            <div className="flex flex-wrap gap-2">
              {activeSession.analysis.clutterSources.map((source, index) => (
                <span key={index} className="text-xs border border-zinc-300 bg-zinc-50 px-3 py-1.5 rounded-lg text-zinc-800 font-medium">
                  • {source}
                </span>
              ))}
            </div>
          </div>

          {/* Checklist steps */}
          <div className="pt-2 avoid-break">
            <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-3 uppercase tracking-wide">
              Decluttering Action Checklist
            </h2>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-300 text-zinc-500 font-semibold uppercase text-xs">
                  <th className="py-2 w-12 text-center">Status</th>
                  <th className="py-2 w-32">Phase</th>
                  <th className="py-2">Item title &amp; details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {activeSession.analysis.declutterSteps.map((step) => {
                  const isChecked = activeSession.completedStepIds.includes(step.id);
                  return (
                    <tr key={step.id} className="align-top py-3">
                      <td className="py-3 text-center text-lg font-bold">
                        {isChecked ? "☑" : "☐"}
                      </td>
                      <td className="py-3 pr-2 text-xs font-mono font-bold text-zinc-500 uppercase">
                        {step.phase}
                      </td>
                      <td className="py-3">
                        <h4 className="font-semibold text-zinc-900">{step.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Spatial Layout & Storage suggestions */}
          <div className="grid grid-cols-2 gap-8 avoid-break pt-4">
            <div className="space-y-4 font-sans">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 uppercase tracking-wide font-display">
                Spatial Alignment Suggestions
              </h2>
              <div className="space-y-4">
                {activeSession.analysis.layoutSuggestions.map((layout, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50">
                    <span className="text-xs font-mono uppercase font-bold text-zinc-700 tracking-wider">
                      {layout.area}
                    </span>
                    <p className="text-xs text-zinc-800 leading-relaxed mt-1">
                      {layout.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 font-sans">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 uppercase tracking-wide font-display">
                Recommended Projects &amp; Containers
              </h2>
              <div className="divide-y divide-zinc-200">
                {activeSession.analysis.storageSolutions.map((solution, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <h4 className="text-zinc-900">{solution.item}</h4>
                      <span className="text-xs font-mono text-zinc-500">Cost: {solution.estimatedCost}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      {solution.purpose}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Styling rules */}
          {activeSession.analysis.aestheticTips && activeSession.analysis.aestheticTips.length > 0 && (
            <div className="avoid-break pt-4">
              <h2 className="text-lg font-bold text-zinc-900 border-b border-zinc-200 pb-1 mb-3 uppercase tracking-wide font-display">
                Interior Styling &amp; Visual Peace Rules
              </h2>
              <ul className="space-y-2">
                {activeSession.analysis.aestheticTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start text-xs text-zinc-700">
                    <span className="font-bold text-zinc-900 mr-2">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Printable User Custom Notes */}
          {activeSession.userNotes && activeSession.userNotes.trim() !== "" && (
            <div className="avoid-break bg-stone-50/50 p-6 rounded-xl border border-zinc-300 pt-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-700 mb-2 font-display">
                Planner Notes &amp; Shopping Lists
              </h2>
              <p className="text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed italic">
                {activeSession.userNotes}
              </p>
            </div>
          )}

          {/* Report Footer */}
          <div className="border-t border-zinc-200 pt-6 text-center text-[10px] text-zinc-400 font-mono">
            <p>Room Organizer Blueprint Report. Powered by gemini-3.5-flash with Structured Outputs.</p>
            <p className="mt-1">Keep spaces organized, reduce cognitive stress, and maintain visual peace.</p>
          </div>

        </div>
      )}

    </div>
  );
}
