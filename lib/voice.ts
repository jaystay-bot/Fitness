// Browser-only Web Speech API wrapper. No external imports — the
// SpeechRecognition / webkitSpeechRecognition objects are global on
// browsers that support them. We type them locally so the build does
// not require @types/dom-speech-recognition.

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onstart: ((event: Event) => void) | null;
}

interface SpeechRecognitionCtor {
  new (): SpeechRecognition;
}

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isVoiceSupported(): boolean {
  return getCtor() !== null;
}

export interface VoiceRecognizerOptions {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  lang?: string;
}

export interface VoiceRecognizer {
  start(): void;
  stop(): void;
}

export function createRecognizer(
  options: VoiceRecognizerOptions,
): VoiceRecognizer | null {
  const Ctor = getCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = options.lang ?? "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const alt = result[0];
      if (!alt) continue;
      if (result.isFinal) {
        final += alt.transcript;
      } else {
        interim += alt.transcript;
      }
    }
    if (final) options.onTranscript(final.trim(), true);
    else if (interim) options.onTranscript(interim.trim(), false);
  };
  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    options.onError?.(event.error);
  };
  recognition.onend = () => {
    options.onEnd?.();
  };

  return {
    start() {
      try { recognition.start(); } catch { /* already started */ }
    },
    stop() {
      try { recognition.stop(); } catch { /* already stopped */ }
    },
  };
}
