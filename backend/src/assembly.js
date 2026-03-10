

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

       
        this._lastTranscript = ''
        
        this._silenceTimer   = null
        this._pendingText    = ''
    }

    async connect() {
        this.transcriber = client.streaming.transcriber({
            sampleRate:          config.sampleRate,
            endUtteranceSilenceThreshold: 700, 
        })

        await this.transcriber.connect()
        this.connected = true
        console.log(`[Assembly] Session connected for ${this.socketId}`)

        const stream = this.transcriber.stream()
        this.writer  = stream.getWriter()

        
        this.transcriber.on('transcript.partial', (partial) => {
            if (!partial?.text?.trim()) return

            
            if (this.onPartial) {
                this.onPartial(partial.text)
            }

            
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
        if (!this.connected || !this.writer) return
        try {
            await this.writer.write(audioChunk)
           
            if (this._pendingText) this._resetSilenceTimer()
        } catch (err) {
            console.warn(`[Assembly] Write failed (${this.socketId}):`, err.message)
        }
    }

    
    async forceEndUtterance() {
        if (!this.connected || !this.transcriber) return
        try {
            await this.transcriber.endUtterance()
            console.log(`[Assembly] Forced utterance end for ${this.socketId}`)
        } catch (err) {
            console.warn(`[Assembly] forceEndUtterance failed (${this.socketId}):`, err.message)
        }
    }

    
    async close() {
        this._clearSilenceTimer()
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