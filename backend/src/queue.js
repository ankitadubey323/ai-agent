

const PROCESS_INTERVAL_MS = 20  
const MAX_QUEUE_SIZE      = 100  

 
export class AudioQueue {
    constructor(socketId, onChunk) {
        this.socketId = socketId
        this.onChunk  = onChunk   
        this.queue    = []
        this.running  = false
        this.timer    = null
    }

   
    push(chunk) {
        if (this.queue.length >= MAX_QUEUE_SIZE) {
            
            this.queue.shift()
            console.warn(`[Queue] ${this.socketId} queue full, dropping oldest chunk`)
        }
        this.queue.push(chunk)
        this._start()
    }

    
    _start() {
        if (this.running) return
        this.running = true

        this.timer = setInterval(async () => {
            if (this.queue.length === 0) {
                this._stop()
                return
            }

            const chunk = this.queue.shift()
            try {
                await this.onChunk(chunk)
            } catch (err) {
                console.error(`[Queue] Error processing chunk for ${this.socketId}:`, err.message)
            }
        }, PROCESS_INTERVAL_MS)
    }

    _stop() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = null
        }
        this.running = false
    }

    
    destroy() {
        this._stop()
        this.queue = []
        console.log(`[Queue] Destroyed for ${this.socketId}`)
    }

    get size() {
        return this.queue.length
    }
}
