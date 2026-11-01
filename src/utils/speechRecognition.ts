// Web Speech API Transcription Helper for Float Voice Capture

// Declare webkitSpeechRecognition interface for TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export class SpeechEngine {
  private recognition: any = null;
  public isListening: boolean = false;
  private onTranscriptCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onStatusChangeCallback: ((listening: boolean) => void) | null = null;

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null;
    const SpeechAPI = win?.SpeechRecognition || win?.webkitSpeechRecognition;

    if (SpeechAPI) {
      try {
        this.recognition = new SpeechAPI();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStatusChangeCallback?.(true);
        };

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final) {
            this.onTranscriptCallback?.(final.trim(), true);
          } else if (interim) {
            this.onTranscriptCallback?.(interim.trim(), false);
          }
        };

        this.recognition.onerror = () => {
          this.isListening = false;
          this.onStatusChangeCallback?.(false);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.onStatusChangeCallback?.(false);
        };
      } catch {
        this.recognition = null;
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStatusChange?: (listening: boolean) => void
  ): boolean {
    if (!this.recognition) return false;
    this.onTranscriptCallback = onTranscript;
    this.onStatusChangeCallback = onStatusChange || null;

    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      this.onStatusChangeCallback?.(false);
    }
  }

  public toggle(
    onTranscript: (text: string, isFinal: boolean) => void,
    onStatusChange?: (listening: boolean) => void
  ): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start(onTranscript, onStatusChange);
    }
  }
}

export const speechEngine = new SpeechEngine();
