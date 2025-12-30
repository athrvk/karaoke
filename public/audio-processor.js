class PCMProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 48000 * 0.5; // 0.5 seconds delay buffer
        this.bufferL = new Float32Array(this.bufferSize);
        this.bufferR = new Float32Array(this.bufferSize);
        this.writeIndex = 0;
        this.echoEnabled = false;

        this.port.onmessage = (e) => {
            if (e.data.type === 'toggle-echo') {
                this.echoEnabled = e.data.value;
                // Clear buffers on disable to prevent stale audio playback later
                if (!this.echoEnabled) {
                    this.bufferL.fill(0);
                    this.bufferR.fill(0);
                }
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;

        const left = input[0];
        const right = input[1] || input[0]; // Fallback to mono if 1 channel

        // Interleave and convert to Int16
        // 128 samples per channel standard in AudioWorklet
        const interleaved = new Int16Array(left.length * 2);

        for (let i = 0; i < left.length; i++) {
            let lSample = left[i];
            let rSample = right[i];

            if (this.echoEnabled) {
                // Read from delay buffer
                const delayedL = this.bufferL[this.writeIndex];
                const delayedR = this.bufferR[this.writeIndex];

                // Write current input + decay * old to buffer
                this.bufferL[this.writeIndex] = lSample + (delayedL * 0.2);
                this.bufferR[this.writeIndex] = rSample + (delayedR * 0.2);

                // Mix output
                lSample = lSample + (delayedL * 0.2);
                rSample = rSample + (delayedR * 0.2);

                this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
            }

            // Clamp and convert left
            let sL = Math.max(-1, Math.min(1, lSample));
            sL = sL < 0 ? sL * 0x8000 : sL * 0x7FFF;
            interleaved[i * 2] = sL;

            // Clamp and convert right
            let sR = Math.max(-1, Math.min(1, rSample));
            sR = sR < 0 ? sR * 0x8000 : sR * 0x7FFF;
            interleaved[i * 2 + 1] = sR;
        }

        // Send to main thread
        this.port.postMessage(interleaved.buffer, [interleaved.buffer]);

        return true;
    }
}

registerProcessor('pcm-processor', PCMProcessor);
