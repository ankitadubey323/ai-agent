import Groq from 'groq-sdk'
import { config } from './config.js'
export { runDoctorAgent, clearSession, clearMemory } from './langchain/agent.js'

const groq = new Groq({ apiKey: config.groqApiKey })



export async function askDoctor(transcript, conversationHistory = []) {
    console.log('[Groq] Stage 2 not yet implemented. Transcript received:', transcript)
    return null
}