// Record a speech sample via the microphone. The recorder also measures voice
// energy (RMS via AnalyserNode) so the skin can tell whether the child actually
// spoke before sending the sample to the Engine for scoring.

export interface RecordingController {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
  // Peak voice energy during the recording window, 0..1 (0 = silence).
  peak: () => number;
  // Whether a real microphone stream is being captured (false = mic denied).
  hasMic: boolean;
}

export function createRecorder(): RecordingController {
  let recorder: MediaRecorder | null = null;
  let audioCtx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let peakEnergy = 0;
  let chunks: Blob[] = [];
  let isLive = false;

  function measure() {
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    if (rms > peakEnergy) peakEnergy = rms;
  }

  return {
    hasMic: false,
    async start() {
      chunks = [];
      peakEnergy = 0;
      isLive = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.start();
        // Analyse voice level while recording.
        try {
          const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtx = new Ctx();
          const src = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          src.connect(analyser);
          isLive = true;
          const timer = window.setInterval(measure, 120);
          recorder.onstop = () => window.clearInterval(timer);
        } catch {
          // Analysis unavailable — fall back to treating the capture as a real attempt.
          isLive = true;
        }
        this.hasMic = true;
      } catch {
        // Mic unavailable/denied — no real capture, and no voice to evaluate.
        recorder = null;
        this.hasMic = false;
      }
    },
    async stop() {
      if (isLive && analyser) measure();
      return new Promise<Blob>((resolve) => {
        if (recorder && recorder.state !== "inactive") {
          recorder.onstop = () => {
            if (audioCtx) audioCtx.close().catch(() => {});
            resolve(new Blob(chunks, { type: "audio/webm" }));
          };
          recorder.stop();
          recorder.stream.getTracks().forEach((t) => t.stop());
        } else {
          // No real capture — resolve an empty-like blob that will be treated as "didn't speak".
          resolve(new Blob([]));
        }
      });
    },
    peak: () => peakEnergy,
  };
}
