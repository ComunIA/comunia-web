declare module 'react-speech-kit' {
  export const useSpeechRecognition: (options?: {
    onEnd?: () => void;
    onError?: (event: any) => void;
    onResult?: (result: string) => void;
    onStart?: () => void;
  }) => {
    listen: ({ lang }: { lang: string }) => void;
    stop: () => void;
    listening: boolean;
    interimTranscript: string;
    finalTranscript: string;
    error?: any;
    startListening: () => void;
    stopListening: () => void;
    abortListening: () => void;
  };

  export type SpeechRecognitionListen = () => void;
  export type SpeechRecognitionStop = () => void;
  export type SpeechRecognitionListening = boolean;
}
