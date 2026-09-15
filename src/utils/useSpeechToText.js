import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";

export const SPEECH_LANG_MAP = {
  en: { code: "en-IN", name: "English (India)", nativeName: "English" },
  hi: { code: "hi-IN", name: "Hindi", nativeName: "हिन्दी" },
  te: { code: "te-IN", name: "Telugu", nativeName: "తెలుగు" },
  ta: { code: "ta-IN", name: "Tamil", nativeName: "தமிழ்" },
  bn: { code: "bn-IN", name: "Bengali", nativeName: "বাংলা" },
  mr: { code: "mr-IN", name: "Marathi", nativeName: "मराठी" },
  gu: { code: "gu-IN", name: "Gujarati", nativeName: "ગુજરાતી" },
  kn: { code: "kn-IN", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ml: { code: "ml-IN", name: "Malayalam", nativeName: "മലയാളം" },
  or: { code: "or-IN", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  pa: { code: "pa-IN", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  ur: { code: "ur-IN", name: "Urdu", nativeName: "اردو" },
  as: { code: "as-IN", name: "Assamese", nativeName: "অসমীয়া" },
  sa: { code: "sa-IN", name: "Sanskrit", nativeName: "संस्कृतम्" },
  ne: { code: "ne-NP", name: "Nepali", nativeName: "नेपाली" },
  mai: { code: "hi-IN", name: "Maithili", nativeName: "मैथिली" },
};

export function useSpeechToText({ onTranscript, onError, lang } = {}) {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  // Extract 2-letter language code from i18n or explicit prop
  const currentLangKey = (lang || i18n?.language || "en").toLowerCase().slice(0, 2);
  const speechConfig = SPEECH_LANG_MAP[currentLangKey] || SPEECH_LANG_MAP.en;
  const recognitionLang = speechConfig.code;

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      const msg = "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
      if (onError) {
        onError(msg);
      } else {
        alert(msg);
      }
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = recognitionLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim() && onTranscript) {
          onTranscript(transcript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          alert("Microphone access was denied. Please allow microphone permissions in your browser.");
        } else if (onError && event.error !== "no-speech" && event.error !== "aborted") {
          onError(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
      if (onError) onError(err.message);
    }
  }, [onTranscript, onError, recognitionLang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    currentSpeechLang: speechConfig,
    recognitionLang,
    startListening,
    stopListening,
    toggleListening,
  };
}
