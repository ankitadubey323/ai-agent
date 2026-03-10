
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

let rnnoise   = null
let frameSize = 480

export async function initRNNoise() {
    try {
        const RNNoiseModule = require('rnnoise-wasm')
        const RNNoise = RNNoiseModule.default || RNNoiseModule
        rnnoise   = await RNNoise()
        frameSize = rnnoise.frameSize
        console.log('[Noise] RNNoise loaded. Frame size:', frameSize)
    } catch (err) {
        console.warn('[Noise] RNNoise failed to load, running without noise reduction:', err.message)
        rnnoise = null
    }
}

function int16ToFloat32(buffer) {
    const int16   = new Int16Array(buffer)
    const float32 = new Float32Array(int16.length)
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768
    }
    return float32
}

function float32ToInt16(float32) {
    const int16 = new Int16Array(float32.length)
    for (let i = 0; i < float32.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32768)))
    }
    return Buffer.from(int16.buffer)
}

export function removeNoise(audioBuffer) {
    // If RNNoise failed to load, skip noise reduction and return original
    if (!rnnoise) return audioBuffer

    try {
        const inputFloat  = int16ToFloat32(audioBuffer)
        const outputFloat = new Float32Array(inputFloat.length)

        for (let i = 0; i < inputFloat.length; i += frameSize) {
            const frame = inputFloat.slice(i, i + frameSize)

            if (frame.length < frameSize) {
                const padded = new Float32Array(frameSize)
                padded.set(frame)
                const cleaned = rnnoise.processFrame(padded)
                outputFloat.set(cleaned.slice(0, frame.length), i)
                break
            }

            outputFloat.set(rnnoise.processFrame(frame), i)
        }

        return float32ToInt16(outputFloat)

    } catch (err) {
        console.warn('[Noise] Processing failed, using original audio:', err.message)
        return audioBuffer
    }
}