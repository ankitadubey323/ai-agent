

import { HumanMessage, AIMessage } from '@langchain/core/messages'
const memoryStore = new Map()

export function getMemory(socketId) {
    if (!memoryStore.has(socketId)) {
        memoryStore.set(socketId, [])
        console.log(`[Memory] Created for ${socketId}`)
    }
    return memoryStore.get(socketId)
}

export function addToMemory(socketId, userText, aiText) {
    const history = getMemory(socketId)
    history.push(new HumanMessage(userText))
    history.push(new AIMessage(aiText))
}

export function clearMemory(socketId) {
    memoryStore.delete(socketId)
    console.log(`[Memory] Cleared for ${socketId}`)
}