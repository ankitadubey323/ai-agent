import { AssemblyAI } from 'assemblyai'
import { config }     from './config.js'

const client = new AssemblyAI({ apiKey: config.assemblyApiKey })

export class Transcriber {
    
    constructor(socketId, onTranscript, onError, onPartial = null) {
        this.socketId     = socketId
        this.onTranscript = onTranscript
        this.onError      = onError
        this.onPartial    = onPartial

        this.transcriber  = null
        this.writer       = null
        this.connected    = false
        this.ready        = false

        this._lastTranscript = ''
        this._silenceTimer   = null
        this._pendingText    = ''
        this._audioQueue     = []
    }

    async connect() {
        console.log(`[Assembly] Connecting for ${this.socketId}...`)
        
        this.transcriber = client.streaming.transcriber({
            sampleRate:                   16000,
            endUtteranceSilenceThreshold: 700,
        })

        this.transcriber.on('transcript.partial', (partial) => {
            console.log(`[Assembly] Partial:`, partial?.text)
            if (!partial?.text?.trim()) return
            if (this.onPartial) this.onPartial(partial.text)
            this._pendingText = partial.text
            this._resetSilenceTimer()
        })

        this.transcriber.on('turn', (turn) => {
            if (!turn?.transcript?.trim()) return
            const text = turn.transcript.trim()
            if (text === this._lastTranscript) return
            this._lastTranscript = text
            this._clearSilenceTimer()
            this._pendingText = ''
            console.log(`[Assembly] Final turn (${this.socketId}): "${text}"`)
            this.onTranscript(text)
        })

        this.transcriber.on('error', (err) => {
            console.error(`[Assembly] Error (${this.socketId}):`, err.message)
            this._clearSilenceTimer()
            this.onError(err)
        })

        try {
            await this.transcriber.connect()
            console.log(`[Assembly] Connect done for ${this.socketId}`)
        } catch (err) {
            console.error(`[Assembly] Connect FAILED for ${this.socketId}:`, err.message)
            throw err
        }

        this.connected = true

        const stream = this.transcriber.stream()
        this.writer  = stream.getWriter()
        this.ready   = true

        console.log(`[Assembly] Session connected for ${this.socketId}`)

        if (this._audioQueue.length > 0) {
            console.log(`[Assembly] Flushing ${this._audioQueue.length} buffered chunks`)
            for (const chunk of this._audioQueue) {
                await this._writeChunk(chunk)
            }
            this._audioQueue = []
        }
    }

    async _writeChunk(audioChunk) {
        try {
            await this.writer.write(audioChunk)
            if (this._pendingText) this._resetSilenceTimer()
        } catch (err) {
            console.warn(`[Assembly] Write failed (${this.socketId}):`, err.message)
        }
    }

    _resetSilenceTimer() {
        this._clearSilenceTimer()
        this._silenceTimer = setTimeout(() => {
            if (this._pendingText.trim() && this._pendingText !== this._lastTranscript) {
                const text = this._pendingText.trim()
                this._lastTranscript = text
                this._pendingText    = ''
                console.log(`[Assembly] Silence fallback (${this.socketId}): "${text}"`)
                this.onTranscript(text)
            }
        }, 1500)
    }

    _clearSilenceTimer() {
        if (this._silenceTimer) {
            clearTimeout(this._silenceTimer)
            this._silenceTimer = null
        }
    }

    async sendAudio(audioChunk) {
        if (!this.connected) return
        if (!this.ready || !this.writer) {
            this._audioQueue.push(audioChunk)
            return
        }
        console.log(`[Assembly] Audio chunk: ${audioChunk.length} bytes`)
        await this._writeChunk(audioChunk)
    }

    async forceEndUtterance() {
        if (!this.connected) return
        try {
            if (this._pendingText.trim() && this._pendingText !== this._lastTranscript) {
                const text = this._pendingText.trim()
                this._lastTranscript = text
                this._pendingText    = ''
                this._clearSilenceTimer()
                console.log(`[Assembly] Force end utterance (${this.socketId}): "${text}"`)
                this.onTranscript(text)
            }
        } catch (err) {
            console.warn(`[Assembly] forceEndUtterance failed (${this.socketId}):`, err.message)
        }
    }

    async close() {
        this._clearSilenceTimer()
        this.ready = false
        if (!this.transcriber) return
        try {
            this.connected = false
            await this.transcriber.close()
            console.log(`[Assembly] Session closed for ${this.socketId}`)
        } catch (err) {
            console.warn(`[Assembly] Close error (${this.socketId}):`, err.message)
        }
    }
}
