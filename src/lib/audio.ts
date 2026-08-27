// Record a speech sample via the microphone. If the mic is unavailable/denied,
// produce a tiny dummy blob so the demo still flows through the Engine (which in a
// real deployment would run Wav2Vec on the actual audio).

export interface RecordingController {
  start: () => Promise<void>;
  stop: () => Promise<Blob>;
}

export function createRecorder(): RecordingController {
  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];

  return {
    async start() {
      chunks = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.start();
      } catch {
        // Mic unavailable — the controller will synthesize a blob on stop().
        recorder = null;
      }
    },
    async stop() {
      return new Promise<Blob>((resolve) => {
        if (recorder && recorder.state !== "inactive") {
          recorder.onstop = () => resolve(new Blob(chunks, { type: "audio/webm" }));
          recorder.stop();
          recorder.stream.getTracks().forEach((t) => t.stop());
        } else {
          // Simulated capture so the Engine still sees an attempt.
          resolve(new Blob(["phonemica-demo-simulated-audio"], { type: "audio/webm" }));
        }
      });
    },
  };
}
