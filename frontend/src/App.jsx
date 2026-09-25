import {
  useEffect,
  useRef,
  useState
} from "react";

import "./App.css";

// ============================================================
// CONFIG
// ============================================================

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5050";

// ============================================================
// LANGUAGES
// ============================================================

const LANGUAGES = {
  "en-IN": {
    label: "English",
    short: "EN",
    placeholder: "Type your question here..."
  },

  "ta-IN": {
    label: "தமிழ்",
    short: "TA",
    placeholder: "உங்கள் கேள்வியை இங்கே எழுதுங்கள்..."
  },

  "hi-IN": {
    label: "हिन्दी",
    short: "HI",
    placeholder: "अपना सवाल यहाँ लिखें..."
  },

  "te-IN": {
    label: "తెలుగు",
    short: "TE",
    placeholder: "మీ ప్రశ్నను ఇక్కడ టైప్ చేయండి..."
  }
};

// ============================================================
// ATM SIDE BUTTON LABELS
// ============================================================

const SIDE_LABELS = {
  "en-IN": [
    "KCC",
    "PMFBY",
    "GRIEVANCE",
    "PACS",
    "HELP"
  ],

  "ta-IN": [
    "KCC",
    "பயிர் காப்பீடு",
    "புகார்",
    "PACS",
    "உதவி"
  ],

  "hi-IN": [
    "KCC",
    "फसल बीमा",
    "शिकायत",
    "PACS",
    "सहायता"
  ],

  "te-IN": [
    "KCC",
    "పంట బీమా",
    "ఫిర్యాదు",
    "PACS",
    "సహాయం"
  ]
};

// ============================================================
// KEYBOARD DEFINITIONS
// ============================================================

const KEYBOARDS = {

  "en-IN": [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"]
  ],

  "ta-IN": [
    ["அ", "ஆ", "இ", "ஈ", "உ", "ஊ", "எ", "ஏ", "ஐ", "ஒ", "ஓ", "ஔ"],
    ["க", "ங", "ச", "ஞ", "ட", "ண", "த", "ந", "ப", "ம"],
    ["ய", "ர", "ல", "வ", "ழ", "ள", "ற", "ன", "ஜ", "ஷ"],
    ["ஸ", "ஹ", "க்", "ச்", "ட்", "த்", "ப்", "ம்", "ன்"]
  ],

  "hi-IN": [
    ["अ", "आ", "इ", "ई", "उ", "ऊ", "ए", "ऐ", "ओ", "औ"],
    ["क", "ख", "ग", "घ", "च", "छ", "ज", "झ", "ट", "ठ"],
    ["ड", "ढ", "ण", "त", "थ", "द", "ध", "न", "प", "फ"],
    ["ब", "भ", "म", "य", "र", "ल", "व", "श", "स", "ह"]
  ],

  "te-IN": [
    ["అ", "ఆ", "ఇ", "ఈ", "ఉ", "ఊ", "ఎ", "ఏ", "ఐ", "ఒ", "ఓ", "ఔ"],
    ["క", "ఖ", "గ", "ఘ", "చ", "ఛ", "జ", "ఝ", "ట", "ఠ"],
    ["డ", "ఢ", "ణ", "త", "థ", "ద", "ధ", "న", "ప", "ఫ"],
    ["బ", "భ", "మ", "య", "ర", "ల", "వ", "శ", "స", "హ"]
  ]
};

// ============================================================
// SESSION
// ============================================================

function generateSessionId() {

  return (
    "voice-" +
    crypto.randomUUID()
  );
}

function getSessionId() {

  const existing =
    localStorage.getItem(
      "coop_sahayak_session_id"
    );

  if (existing) {
    return existing;
  }

  const newSession =
    generateSessionId();

  localStorage.setItem(
    "coop_sahayak_session_id",
    newSession
  );

  return newSession;
}

// ============================================================
// ICON
// ============================================================

function Icon({
  type,
  size = 24
}) {

  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  };

  if (type === "mic") {

    return (
      <svg {...common}>
        <rect
          x="9"
          y="2"
          width="6"
          height="12"
          rx="3"
        />

        <path d="M5 10a7 7 0 0 0 14 0" />

        <path d="M12 17v5" />

        <path d="M8 22h8" />
      </svg>
    );
  }

  if (type === "stop") {

    return (
      <svg {...common}>
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx="2"
        />
      </svg>
    );
  }

  if (type === "send") {

    return (
      <svg {...common}>
        <path d="M22 2 11 13" />
        <path d="m22 2-7 20-4-9-9-4Z" />
      </svg>
    );
  }

  if (type === "volume") {

    return (
      <svg {...common}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
    );
  }

  if (type === "volumeOff") {

    return (
      <svg {...common}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

        <line
          x1="17"
          y1="9"
          x2="23"
          y2="15"
        />

        <line
          x1="23"
          y1="9"
          x2="17"
          y2="15"
        />
      </svg>
    );
  }

  if (type === "refresh") {

    return (
      <svg {...common}>
        <path d="M21 12a9 9 0 0 0-15.5-6.2L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 15.5 6.2L21 16" />
        <path d="M21 21v-5h-5" />
      </svg>
    );
  }

  if (type === "keyboard") {

    return (
      <svg {...common}>
        <rect
          x="2"
          y="5"
          width="20"
          height="14"
          rx="2"
        />

        <path d="M6 9h.01" />
        <path d="M10 9h.01" />
        <path d="M14 9h.01" />
        <path d="M18 9h.01" />

        <path d="M6 13h.01" />
        <path d="M10 13h.01" />
        <path d="M14 13h.01" />
        <path d="M18 13h.01" />

        <path d="M7 16h10" />
      </svg>
    );
  }

  if (type === "backspace") {

    return (
      <svg {...common}>
        <path d="M21 5H8l-5 7 5 7h13a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z" />

        <path d="m14 9-4 4 4 4" />
      </svg>
    );
  }

  if (type === "close") {

    return (
      <svg {...common}>
        <path d="M6 6l12 12" />
        <path d="M18 6 6 18" />
      </svg>
    );
  }

  if (type === "home") {

    return (
      <svg {...common}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (type === "help") {

    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 1 1 4.1 1.9c-.9.7-1.6 1.1-1.6 2.6" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  if (type === "left") {

    return (
      <svg {...common}>
        <path d="m15 18-6-6 6-6" />
      </svg>
    );
  }

  if (type === "right") {

    return (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  return null;
}

// ============================================================
// BASE64
// ============================================================

function blobToBase64(blob) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onloadend = () => {

        const result =
          String(
            reader.result || ""
          );

        const base64 =
          result.includes(",")
            ? result.split(",")[1]
            : result;

        resolve(base64);
      };

      reader.onerror =
        reject;

      reader.readAsDataURL(blob);
    }
  );
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

function extractAIResponse(data) {

  if (!data) {
    return "";
  }

  if (
    typeof data === "string"
  ) {
    return data.trim();
  }

  const possible = [

    data.response,
    data.answer,
    data.text,
    data.message,

    data.aiResponse?.response,
    data.aiResponse?.answer,
    data.aiResponse?.text,
    data.aiResponse?.message,

    data.result?.response,
    data.result?.answer,
    data.result?.text,
    data.result?.message
  ];

  for (
    const value of possible
  ) {

    if (
      typeof value === "string" &&
      value.trim()
    ) {

      return value.trim();
    }
  }

  return "";
}

function extractAudio(data) {

  if (!data) {
    return null;
  }

  return (
    data.audio ||
    data.audioBase64 ||
    data.ttsAudio ||
    data.tts?.audio ||
    null
  );
}

function makeAudioUrl(
  audio,
  mimeType = "audio/wav"
) {

  if (!audio) {
    return null;
  }

  if (
    audio.startsWith("data:")
  ) {
    return audio;
  }

  return (
    `data:${mimeType};base64,${audio}`
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    language,
    setLanguage
  ] = useState("ta-IN");

  const [
    sessionId,
    setSessionId
  ] = useState(
    getSessionId()
  );

  const [
    messages,
    setMessages
  ] = useState([]);

  const [
    input,
    setInput
  ] = useState("");

  const [
    isRecording,
    setIsRecording
  ] = useState(false);

  const [
    isProcessing,
    setIsProcessing
  ] = useState(false);

  const [
    isSpeaking,
    setIsSpeaking
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    status,
    setStatus
  ] = useState(
    "Ready to help"
  );

  const [
    ticketId,
    setTicketId
  ] = useState(null);

  const [
    keyboardVisible,
    setKeyboardVisible
  ] = useState(false);

  const [
    shift,
    setShift
  ] = useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const mediaRecorderRef =
    useRef(null);

  const mediaStreamRef =
    useRef(null);

  const audioChunksRef =
    useRef([]);

  const audioRef =
    useRef(null);

  const messagesEndRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  const cancelRecordingRef =
    useRef(false);

  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [
    messages,
    isProcessing
  ]);

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {

    return () => {

      stopMediaStream();

      stopSpeaking();

    };

  }, []);

  // ==========================================================
  // ADD MESSAGE
  // ==========================================================

  function addMessage(
    role,
    text
  ) {

    if (
      !text ||
      !String(text).trim()
    ) {
      return;
    }

    const message = {

      id:
        crypto.randomUUID(),

      role,

      text:
        String(text).trim(),

      time:
        new Date()
    };

    setMessages(
      previous => [
        ...previous,
        message
      ]
    );
  }

  // ==========================================================
  // STOP MEDIA
  // ==========================================================

  function stopMediaStream() {

    if (
      mediaStreamRef.current
    ) {

      mediaStreamRef.current
        .getTracks()
        .forEach(
          track => track.stop()
        );

      mediaStreamRef.current =
        null;
    }
  }

  // ==========================================================
  // STOP SPEAKING
  // ==========================================================

  function stopSpeaking() {

    try {

      if (
        audioRef.current
      ) {

        audioRef.current.pause();

        audioRef.current.currentTime =
          0;

        audioRef.current =
          null;
      }

    }
    catch (err) {

      console.warn(
        "Audio stop error:",
        err
      );
    }

    setIsSpeaking(false);

    if (!isRecording) {

      setStatus(
        "Ready to help"
      );
    }
  }

  // ==========================================================
  // PLAY AUDIO
  // ==========================================================

  async function playAudio(
    audio,
    mimeType = "audio/wav"
  ) {

    if (!audio) {
      return;
    }

    stopSpeaking();

    const audioUrl =
      makeAudioUrl(
        audio,
        mimeType
      );

    if (!audioUrl) {
      return;
    }

    try {

      const audioElement =
        new Audio(audioUrl);

      audioRef.current =
        audioElement;

      audioElement.onplay =
        () => {

          setIsSpeaking(true);

          setStatus(
            "Coop Sahayak is speaking..."
          );
        };

      audioElement.onended =
        () => {

          setIsSpeaking(false);

          audioRef.current =
            null;

          setStatus(
            "Ready to help"
          );
        };

      audioElement.onerror =
        event => {

          console.error(
            "Audio playback error:",
            event
          );

          setIsSpeaking(false);

          audioRef.current =
            null;

          setStatus(
            "Audio playback failed"
          );
        };

      await audioElement.play();

    }
    catch (err) {

      console.error(
        "Unable to play audio:",
        err
      );

      setIsSpeaking(false);
    }
  }

  // ==========================================================
  // TTS
  // ==========================================================

  async function speakText(
    text,
    selectedLanguage = language
  ) {

    if (
      !text ||
      !String(text).trim()
    ) {
      return;
    }

    try {

      stopSpeaking();

      setStatus(
        "Preparing voice response..."
      );

      const response =
        await fetch(
          `${API_BASE}/api/tts`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                text:
                  String(text).trim(),

                language:
                  selectedLanguage,

                sessionId

              })
          }
        );

      if (!response.ok) {

        throw new Error(
          `TTS request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "TTS response:",
        data
      );

      const audio =
        extractAudio(data);

      if (!audio) {

        setStatus(
          "Response received"
        );

        return;
      }

      await playAudio(
        audio,
        data.audioMimeType ||
        data.mimeType ||
        "audio/wav"
      );

    }
    catch (err) {

      console.error(
        "TTS error:",
        err
      );

      setStatus(
        "Response received"
      );
    }
  }

  // ==========================================================
  // SEND TEXT
  // ==========================================================

  async function sendTextMessage() {

    const text =
      input.trim();

    if (!text) {
      return;
    }

    if (isProcessing) {
      return;
    }

    stopSpeaking();

    setInput("");

    setKeyboardVisible(false);

    setError("");

    addMessage(
      "user",
      text
    );

    setIsProcessing(true);

    setStatus(
      "Processing request..."
    );

    try {

      const response =
        await fetch(
          `${API_BASE}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                message:
                  text,

                sessionId,

                language
              })
          }
        );

      if (!response.ok) {

        throw new Error(
          `Chat request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Chat response:",
        data
      );

      const answer =
        extractAIResponse(data);

      const detectedTicket =
        data.ticketId ||
        data.ticket?.ticketId ||
        data.aiResponse?.ticketId ||
        data.result?.ticketId ||
        null;

      if (
        detectedTicket
      ) {

        setTicketId(
          detectedTicket
        );
      }

      if (!answer) {

        throw new Error(
          "No AI response found."
        );
      }

      addMessage(
        "assistant",
        answer
      );

      await speakText(
        answer,
        language
      );

    }
    catch (err) {

      console.error(
        "Chat error:",
        err
      );

      setError(
        "Unable to connect to Coop Sahayak. Please try again."
      );

      setStatus(
        "Request failed"
      );

    }
    finally {

      setIsProcessing(false);
    }
  }

  // ==========================================================
  // ENTER KEY
  // ==========================================================

  function handleKeyDown(
    event
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendTextMessage();
    }
  }

  // ==========================================================
  // START RECORDING
  // ==========================================================

  async function startRecording() {

    if (isRecording) {
      return;
    }

    if (isProcessing) {
      return;
    }

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      setError(
        "Your browser does not support microphone access."
      );

      return;
    }

    try {

      setError("");

      stopSpeaking();

      cancelRecordingRef.current =
        false;

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });

      mediaStreamRef.current =
        stream;

      audioChunksRef.current =
        [];

      let mimeType =
        "";

      const mimeTypes = [

        "audio/webm;codecs=opus",

        "audio/webm",

        "audio/ogg;codecs=opus"
      ];

      for (
        const type of mimeTypes
      ) {

        if (
          MediaRecorder.isTypeSupported(
            type
          )
        ) {

          mimeType =
            type;

          break;
        }
      }

      console.log(
        "Selected MIME type:",
        mimeType
      );

      const recorder =
        mimeType

          ? new MediaRecorder(
            stream,
            {
              mimeType
            }
          )

          : new MediaRecorder(
            stream
          );

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable =
        event => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            audioChunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        async () => {

          console.log(
            "Recording stopped."
          );

          const finalMimeType =
            recorder.mimeType ||
            mimeType ||
            "audio/webm";

          const blob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  finalMimeType
              }
            );

          console.log(
            "Final audio size:",
            blob.size
          );

          stopMediaStream();

          mediaRecorderRef.current =
            null;

          setIsRecording(false);

          // New session / cancellation
          if (
            cancelRecordingRef.current
          ) {

            cancelRecordingRef.current =
              false;

            audioChunksRef.current =
              [];

            setStatus(
              "Ready to help"
            );

            return;
          }

          if (
            blob.size === 0
          ) {

            setError(
              "No voice was recorded."
            );

            setStatus(
              "Ready to help"
            );

            return;
          }

          await sendVoice(
            blob,
            finalMimeType
          );
        };

      recorder.onerror =
        event => {

          console.error(
            "Recorder error:",
            event
          );

          setError(
            "Unable to record your voice."
          );

          setIsRecording(false);

          mediaRecorderRef.current =
            null;

          stopMediaStream();

          setStatus(
            "Ready to help"
          );
        };

      recorder.start(250);

      setIsRecording(true);

      setStatus(
        "LISTENING — SPEAK NOW"
      );

      console.log(
        "Recording started."
      );

    }
    catch (err) {

      console.error(
        "Microphone error:",
        err
      );

      setError(
        "Microphone permission is required."
      );

      setIsRecording(false);

      stopMediaStream();
    }
  }

  // ==========================================================
  // STOP RECORDING
  // ==========================================================

  function stopRecording() {

    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {

      setStatus(
        "PROCESSING YOUR VOICE..."
      );

      recorder.stop();

      return;
    }

    setIsRecording(false);

    stopMediaStream();
  }

  // ==========================================================
  // SEND VOICE
  // ==========================================================

  async function sendVoice(
    audioBlob,
    mimeType
  ) {

    setIsProcessing(true);

    setStatus(
      "UNDERSTANDING YOUR VOICE..."
    );

    try {

      const base64 =
        await blobToBase64(
          audioBlob
        );

      console.log(
        "Sending audio to:",
        `${API_BASE}/api/voice`
      );

      const response =
        await fetch(
          `${API_BASE}/api/voice`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                audio:
                  base64,

                // Send BOTH names for backend compatibility
                mimeType:
                  mimeType,

                audioMimeType:
                  mimeType,

                language:
                  language,

                sessionId:
                  sessionId
              })
          }
        );

      if (!response.ok) {

        throw new Error(
          `Voice request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Voice backend response:",
        data
      );

      const transcript =
        data.transcription ||
        data.transcript ||
        data.text ||
        data.speechToText ||
        data.userText ||
        "";

      if (
        !transcript ||
        !String(transcript).trim()
      ) {

        throw new Error(
          "Voice transcription is empty."
        );
      }

      addMessage(
        "user",
        transcript
      );

      setStatus(
        "PROCESSING YOUR QUESTION..."
      );

      const chatResponse =
        await fetch(
          `${API_BASE}/api/chat`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                message:
                  transcript,

                sessionId:
                  sessionId,

                language:
                  language
              })
          }
        );

      if (!chatResponse.ok) {

        throw new Error(
          `Chat request failed: ${chatResponse.status}`
        );
      }

      const chatData =
        await chatResponse.json();

      console.log(
        "Chat backend response:",
        chatData
      );

      const answer =
        extractAIResponse(
          chatData
        );

      const detectedTicket =
        chatData.ticketId ||
        chatData.ticket?.ticketId ||
        chatData.aiResponse?.ticketId ||
        chatData.result?.ticketId ||
        null;

      if (
        detectedTicket
      ) {

        setTicketId(
          detectedTicket
        );
      }

      if (!answer) {

        throw new Error(
          "AI response is empty."
        );
      }

      addMessage(
        "assistant",
        answer
      );

      await speakText(
        answer,
        language
      );

    }
    catch (err) {

      console.error(
        "Voice processing error:",
        err
      );

      setError(
        "Unable to process your voice. Please try again."
      );

      setStatus(
        "VOICE PROCESSING FAILED"
      );

    }
    finally {

      setIsProcessing(false);
    }
  }

  // ==========================================================
  // NEW SESSION
  // ==========================================================

  function createNewSession() {

    // Cancel any current recording
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !==
      "inactive"
    ) {

      cancelRecordingRef.current =
        true;

      mediaRecorderRef.current.stop();
    }

    stopMediaStream();

    stopSpeaking();

    const newSession =
      generateSessionId();

    localStorage.setItem(
      "coop_sahayak_session_id",
      newSession
    );

    setSessionId(
      newSession
    );

    setMessages([]);

    setTicketId(null);

    setInput("");

    setError("");

    setKeyboardVisible(false);

    setIsRecording(false);

    setIsProcessing(false);

    setStatus(
      "Ready to help"
    );
  }

  // ==========================================================
  // TIME
  // ==========================================================

  function formatTime(
    date
  ) {

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ).format(date);
  }

  // ==========================================================
  // VIRTUAL KEYBOARD
  // ==========================================================

  function insertKeyboardText(
    value
  ) {

    if (
      isProcessing ||
      isRecording
    ) {
      return;
    }

    setInput(
      previous =>
        previous + value
    );

    setTimeout(() => {

      textareaRef.current?.focus();

    }, 0);
  }

  function keyboardBackspace() {

    setInput(
      previous =>
        previous.slice(
          0,
          -1
        )
    );

    textareaRef.current?.focus();
  }

  function keyboardClear() {

    setInput("");

    textareaRef.current?.focus();
  }

  function keyboardSpace() {

    insertKeyboardText(" ");
  }

  function keyboardEnter() {

    sendTextMessage();
  }

  function handleKeyboardCharacter(
    character
  ) {

    if (
      language === "en-IN" &&
      shift
    ) {

      insertKeyboardText(
        character.toUpperCase()
      );

      setShift(false);

      return;
    }

    insertKeyboardText(
      character
    );
  }

  // ==========================================================
  // SIDE BUTTON ACTION
  // ==========================================================

  function handleSideButton(
    index
  ) {

    if (
      isProcessing ||
      isRecording
    ) {
      return;
    }

    const questions = {

      "en-IN": [
        "What is Kisan Credit Card?",
        "My crop insurance payment has not been received yet.",
        "I want to register a grievance.",
        "How can I become a PACS member?",
        "How can Coop Sahayak help me?"
      ],

      "ta-IN": [
        "கிசான் கிரெடிட் கார்டு என்றால் என்ன?",
        "என் பயிர் காப்பீட்டு தொகை இன்னும் வரவில்லை.",
        "நான் ஒரு புகார் பதிவு செய்ய வேண்டும்.",
        "PACS உறுப்பினராக எப்படி சேரலாம்?",
        "Coop Sahayak என்ன உதவி செய்யும்?"
      ],

      "hi-IN": [
        "किसान क्रेडिट कार्ड क्या है?",
        "मेरी फसल बीमा राशि अभी तक नहीं मिली है।",
        "मैं शिकायत दर्ज करना चाहता हूँ।",
        "PACS सदस्य कैसे बनें?",
        "Coop Sahayak मेरी कैसे मदद कर सकता है?"
      ],

      "te-IN": [
        "కిసాన్ క్రెడిట్ కార్డ్ అంటే ఏమిటి?",
        "నా పంట బీమా డబ్బు ఇంకా రాలేదు.",
        "నేను ఫిర్యాదు నమోదు చేయాలి.",
        "PACS సభ్యుడిగా ఎలా చేరాలి?",
        "Coop Sahayak నాకు ఎలా సహాయం చేస్తుంది?"
      ]
    };

    setInput(
      questions[language][index]
    );

    setKeyboardVisible(true);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }

  // ==========================================================
  // CURRENT LANGUAGE
  // ==========================================================

  const currentLanguage =
    LANGUAGES[language];

  const sideLabels =
    SIDE_LABELS[language];

  const keyboardRows =
    KEYBOARDS[language];

  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="atm-page">

      {/* ======================================================
          ATM OUTER BODY
          ====================================================== */}

      <div className="atm-machine">



        {/* ====================================================
            MAIN ATM BODY
            ==================================================== */}

        <div className="atm-body">

          {/* ==================================================
              LEFT ATM BUTTONS
              ================================================== */}

          <aside className="atm-side-panel left">

            <div className="side-panel-label">
              SELECT
            </div>

            {sideLabels.map(
              (label, index) => (

                <button
                  key={label}
                  className="atm-side-button"
                  onClick={() =>
                    handleSideButton(index)
                  }
                >
                  <span className="side-arrow">
                    <Icon
                      type="right"
                      size={22}
                    />
                  </span>

                  <span>
                    {label}
                  </span>
                </button>
              )
            )}

          </aside>

          {/* ==================================================
              CENTRAL SCREEN
              ================================================== */}

          <section className="atm-screen">

            {/* ================================================
                SCREEN HEADER
                ================================================ */}

            <header className="screen-header">

              <div className="screen-brand">

                <div className="screen-logo government-emblem">
                  <img
                    src="/goi-emblem.svg"
                    alt="Government of India State Emblem"
                  />
                </div>

                <div>
                  <div className="screen-title">
                    Coop Sahayak
                  </div>

                  <div className="screen-subtitle">
                    AI Assistant for Farmers & Cooperatives
                  </div>
                </div>

              </div>

              <div className="screen-controls">

                <div className="language-box">

                  <span>
                    文A
                  </span>

                  <select
                    value={language}
                    onChange={event => {

                      stopSpeaking();

                      setLanguage(
                        event.target.value
                      );

                    }}
                  >

                    {Object.entries(
                      LANGUAGES
                    ).map(
                      ([
                        code,
                        item
                      ]) => (

                        <option
                          key={code}
                          value={code}
                        >
                          {item.label}
                        </option>

                      )
                    )}

                  </select>

                </div>

                <button
                  className="new-session"
                  onClick={
                    createNewSession
                  }
                >
                  <Icon
                    type="refresh"
                    size={21}
                  />

                  <span>
                    NEW
                  </span>
                </button>

              </div>

            </header>

            {/* ================================================
                SESSION BAR
                ================================================ */}

            <div className="screen-status-bar">

              <div className="session-info">

                <span>
                  SESSION
                </span>

                <strong>
                  {sessionId}
                </strong>

              </div>

              <div
                className={
                  `live-status ${isRecording
                    ? "recording"
                    : isProcessing
                      ? "processing"
                      : ""
                  }`
                }
              >

                <span className="live-dot" />

                {isRecording
                  ? "LISTENING"
                  : isProcessing
                    ? "PROCESSING"
                    : status}

              </div>

            </div>

            {/* ================================================
                CHAT DISPLAY
                ================================================ */}

            <main className="screen-chat">

              {messages.length === 0 && (

                <section className="atm-welcome professional-home">

                  <div className="home-identity">
                    <div className="home-emblem-frame">
                      <img
                        src="/goi-emblem.svg"
                        alt="Government of India State Emblem"
                      />
                    </div>

                    <div className="home-identity-text">
                      <div className="home-govt-hi">भारत सरकार</div>
                      <div className="home-govt-en">GOVERNMENT OF INDIA</div>
                      <div className="home-divider" />
                      <div className="home-service">DIGITAL FARMER ASSISTANCE TERMINAL</div>
                    </div>
                  </div>

                  <div className="home-title-block">
                    <h1>Coop Sahayak</h1>
                    <h2>Farmer &amp; Cooperative Assistance</h2>
                    <p>
                      Access information and assistance for agricultural schemes,
                      credit, crop insurance, cooperatives and grievances.
                    </p>
                  </div>

                  <div className="quick-menu professional-menu">
                    <button onClick={() => handleSideButton(0)}>
                      <span className="menu-code">01</span>
                      <strong>{language === "ta-IN" ? "கிசான் கிரெடிட் கார்டு" : language === "hi-IN" ? "किसान क्रेडिट कार्ड" : language === "te-IN" ? "కిసాన్ క్రెడిట్ కార్డ్" : "KISAN CREDIT CARD"}</strong>
                      <small>KCC</small>
                    </button>

                    <button onClick={() => handleSideButton(1)}>
                      <span className="menu-code">02</span>
                      <strong>{language === "ta-IN" ? "பயிர் காப்பீடு" : language === "hi-IN" ? "फसल बीमा" : language === "te-IN" ? "పంట బీమా" : "CROP INSURANCE"}</strong>
                      <small>PMFBY</small>
                    </button>

                    <button onClick={() => handleSideButton(2)}>
                      <span className="menu-code">03</span>
                      <strong>{language === "ta-IN" ? "புகார் சேவை" : language === "hi-IN" ? "शिकायत सेवा" : language === "te-IN" ? "ఫిర్యాదు సేవ" : "GRIEVANCE SERVICE"}</strong>
                      <small>GRIEVANCE</small>
                    </button>

                    <button onClick={() => handleSideButton(3)}>
                      <span className="menu-code">04</span>
                      <strong>{language === "ta-IN" ? "கூட்டுறவு சேவைகள்" : language === "hi-IN" ? "सहकारी सेवाएँ" : language === "te-IN" ? "సహకార సేవలు" : "COOPERATIVE SERVICES"}</strong>
                      <small>PACS</small>
                    </button>
                  </div>

                  <div className="home-instruction">
                    <span>SELECT A SERVICE</span>
                    <span>OR TYPE YOUR QUESTION BELOW</span>
                  </div>

                </section>

              )}

              <section className="messages">

                {messages.map(
                  message => (

                    <div
                      key={message.id}
                      className={
                        `atm-message-row ${message.role}`
                      }
                    >

                      <div className="message-card">

                        <div className="message-card-top">

                          <span className="message-role">

                            {message.role === "assistant"
                              ? "🤖  COOP SAHAYAK"
                              : "👤  YOU"
                            }

                          </span>

                          <span className="message-clock">
                            {formatTime(
                              message.time
                            )}
                          </span>

                        </div>

                        <div
                          className={
                            `atm-message ${message.role
                            }`
                          }
                        >
                          {message.text}
                        </div>

                        {message.role === "assistant" && (

                          <div className="message-actions">

                            {!isSpeaking ? (

                              <button
                                className="speak-response"
                                onClick={() =>
                                  speakText(
                                    message.text,
                                    language
                                  )
                                }
                              >
                                <Icon
                                  type="volume"
                                  size={20}
                                />

                                SPEAK RESPONSE
                              </button>

                            ) : (

                              <button
                                className="stop-response"
                                onClick={
                                  stopSpeaking
                                }
                              >
                                <Icon
                                  type="volumeOff"
                                  size={20}
                                />

                                STOP SPEAKING
                              </button>

                            )}

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )}

                {isProcessing && (

                  <div className="processing-card">

                    <div className="robot-icon">
                      🤖
                    </div>

                    <div>

                      <strong>
                        COOP SAHAYAK
                      </strong>

                      <div className="thinking-dots">
                        <span />
                        <span />
                        <span />
                      </div>

                    </div>

                  </div>

                )}

                {ticketId && (

                  <div className="ticket-panel">

                    <div className="ticket-icon">
                      🎫
                    </div>

                    <div>

                      <strong>
                        GRIEVANCE REGISTERED
                      </strong>

                      <p>
                        Your grievance ticket has been created.
                      </p>

                      <code>
                        {ticketId}
                      </code>

                    </div>

                  </div>

                )}

                <div
                  ref={messagesEndRef}
                />

              </section>

            </main>

            {/* ================================================
                ERROR
                ================================================ */}

            {error && (

              <div className="atm-error">

                <span>
                  ⚠️
                </span>

                <strong>
                  {error}
                </strong>

                <button
                  onClick={() =>
                    setError("")
                  }
                >
                  ×
                </button>

              </div>

            )}

            {/* ================================================
                BOTTOM CONTROL AREA
                ================================================ */}

            <footer className="atm-console">

              {/* ==============================================
                  VOICE CONTROL
                  ============================================== */}

              <div className="voice-console">

                <div className="voice-console-title">

                  <span className="voice-light">
                    <span />
                  </span>

                  VOICE CONTROL

                </div>

                <div className="voice-buttons">

                  <button
                    className={
                      `voice-start ${isRecording
                        ? "active"
                        : ""
                      }`
                    }
                    onClick={
                      startRecording
                    }
                    disabled={
                      isProcessing ||
                      isRecording
                    }
                  >

                    <Icon
                      type="mic"
                      size={30}
                    />

                    <div>

                      <strong>
                        START VOICE
                      </strong>

                      <small>
                        {language === "ta-IN"
                          ? "குரல் பதிவு தொடங்கு"
                          : language === "hi-IN"
                            ? "रिकॉर्डिंग शुरू करें"
                            : language === "te-IN"
                              ? "రికార్డింగ్ ప్రారంభించండి"
                              : "Start recording"
                        }
                      </small>

                    </div>

                  </button>

                  <button
                    className="voice-stop"
                    onClick={
                      stopRecording
                    }
                    disabled={
                      !isRecording
                    }
                  >

                    <Icon
                      type="stop"
                      size={30}
                    />

                    <div>

                      <strong>
                        STOP VOICE
                      </strong>

                      <small>
                        {language === "ta-IN"
                          ? "குரல் பதிவை நிறுத்து"
                          : language === "hi-IN"
                            ? "रिकॉर्डिंग रोकें"
                            : language === "te-IN"
                              ? "రికార్డింగ్ ఆపండి"
                              : "Stop recording"
                        }
                      </small>

                    </div>

                  </button>

                </div>

              </div>

              {/* ==============================================
                  TEXT COMPOSER
                  ============================================== */}

              <div className="text-console">

                <div className="text-console-header">

                  <span>
                    <Icon
                      type="keyboard"
                      size={19}
                    />

                    TYPE YOUR QUESTION
                  </span>

                  <span>
                    {currentLanguage.label}
                  </span>

                </div>

                <div
                  className={
                    `input-terminal ${keyboardVisible
                      ? "keyboard-open"
                      : ""
                    }`
                  }
                >

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onFocus={() =>
                      setKeyboardVisible(true)
                    }
                    onClick={() =>
                      setKeyboardVisible(true)
                    }
                    onChange={event =>
                      setInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleKeyDown
                    }
                    placeholder={
                      currentLanguage.placeholder
                    }
                    disabled={
                      isProcessing ||
                      isRecording
                    }
                    rows={1}
                  />

                  <button
                    className="keyboard-toggle"
                    onClick={() =>
                      setKeyboardVisible(
                        previous =>
                          !previous
                      )
                    }
                    disabled={
                      isProcessing ||
                      isRecording
                    }
                    title="Virtual keyboard"
                  >
                    <Icon
                      type="keyboard"
                      size={27}
                    />
                  </button>

                  <button
                    className="send-terminal"
                    onClick={
                      sendTextMessage
                    }
                    disabled={
                      !input.trim() ||
                      isProcessing ||
                      isRecording
                    }
                  >
                    <Icon
                      type="send"
                      size={29}
                    />

                    <span>
                      SEND
                    </span>
                  </button>

                </div>

              </div>

              {/* ==============================================
                  VIRTUAL KEYBOARD
                  ============================================== */}

              {keyboardVisible && (

                <div className="virtual-keyboard">

                  <div className="keyboard-header">

                    <div>

                      <Icon
                        type="keyboard"
                        size={24}
                      />

                      <strong>
                        {currentLanguage.label} KEYBOARD
                      </strong>

                    </div>

                    <button
                      onClick={() =>
                        setKeyboardVisible(false)
                      }
                    >
                      <Icon
                        type="close"
                        size={23}
                      />
                    </button>

                  </div>

                  <div className="keyboard-body">

                    {/* NUMBER ROW */}

                    <div className="keyboard-row number-row">

                      {[
                        "1",
                        "2",
                        "3",
                        "4",
                        "5",
                        "6",
                        "7",
                        "8",
                        "9",
                        "0"
                      ].map(
                        key => (

                          <button
                            key={key}
                            onClick={() =>
                              insertKeyboardText(
                                key
                              )
                            }
                          >
                            {key}
                          </button>

                        )
                      )}

                      <button
                        className="wide-key"
                        onClick={
                          keyboardBackspace
                        }
                      >
                        <Icon
                          type="backspace"
                          size={25}
                        />
                      </button>

                    </div>

                    {keyboardRows.map(
                      (
                        row,
                        rowIndex
                      ) => (

                        <div
                          className="keyboard-row"
                          key={rowIndex}
                        >

                          {row.map(
                            character => (

                              <button
                                key={character}
                                onClick={() =>
                                  handleKeyboardCharacter(
                                    character
                                  )
                                }
                              >
                                {language === "en-IN" &&
                                  shift
                                  ? character.toUpperCase()
                                  : character
                                }
                              </button>

                            )
                          )}

                        </div>

                      )
                    )}

                    <div className="keyboard-bottom-row">

                      {language === "en-IN" && (

                        <button
                          className={
                            `special-key shift-key ${shift
                              ? "selected"
                              : ""
                            }`
                          }
                          onClick={() =>
                            setShift(
                              previous =>
                                !previous
                            )
                          }
                        >
                          ⇧ SHIFT
                        </button>

                      )}

                      <button
                        className="special-key"
                        onClick={
                          keyboardClear
                        }
                      >
                        CLEAR
                      </button>

                      <button
                        className="space-key"
                        onClick={
                          keyboardSpace
                        }
                      >
                        SPACE
                      </button>

                      <button
                        className="special-key enter-key"
                        onClick={
                          keyboardEnter
                        }
                        disabled={
                          !input.trim() ||
                          isProcessing ||
                          isRecording
                        }
                      >
                        ↵ ENTER
                      </button>

                    </div>

                  </div>

                </div>

              )}

              {/* ==============================================
                  CONSOLE FOOTER
                  ============================================== */}

              <div className="console-footer">

                <span>
                  🎤 VOICE
                </span>

                <span>
                  ⌨ TYPE
                </span>

                <span>
                  ● {currentLanguage.label}
                </span>

                <span className="console-right">
                  {isSpeaking
                    ? "🔊 SPEAKING"
                    : isRecording
                      ? "🔴 RECORDING"
                      : "● SYSTEM READY"
                  }
                </span>

              </div>

            </footer>

          </section>

          {/* ==================================================
              RIGHT ATM BUTTONS
              ================================================== */}

          <aside className="atm-side-panel right">

            <div className="side-panel-label">
              OPTIONS
            </div>

            {sideLabels.map(
              (label, index) => (

                <button
                  key={label}
                  className="atm-side-button"
                  onClick={() =>
                    handleSideButton(index)
                  }
                >

                  <span>
                    {label}
                  </span>

                  <span className="side-arrow">
                    <Icon
                      type="left"
                      size={22}
                    />
                  </span>

                </button>

              )
            )}

          </aside>

        </div>

        {/* ====================================================
            ATM FOOTER
            ==================================================== */}

        <div className="atm-bottom-strip">

          <span>
            COOP SAHAYAK
          </span>

          <span>
            SECURE DIGITAL ASSISTANCE TERMINAL
          </span>

          <span>
            v1.0
          </span>

        </div>

      </div>

    </div>
  );
}