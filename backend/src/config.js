// import dotenv from 'dotenv'
// dotenv.config()

// const required = [
//     'ASSEMBLY_API_KEY',
//     'GROQ_API_KEY',
//     'PINECONE_API_KEY',
//     'PINECONE_INDEX',
//     'HUGGINGFACE_API_KEY',
//     'GOOGLE_CLIENT_ID',
//     'GOOGLE_CLIENT_SECRET',
//     'GOOGLE_REDIRECT_URI',
//     'DOCTOR_CALENDAR_ID',
// ]

// for (const key of required) {
//     if (!process.env[key]) {
//         console.error(`Missing required env var: ${key}`)
//         process.exit(1)
//     }
// }

// export const config = {
//     port:               parseInt(process.env.PORT) || 3000,
//     nodeEnv:            process.env.NODE_ENV || 'development',
//     isDev:              process.env.NODE_ENV !== 'production',

//     assemblyApiKey:     process.env.ASSEMBLY_API_KEY,
//     groqApiKey:         process.env.GROQ_API_KEY,
//     pineconeApiKey:     process.env.PINECONE_API_KEY,
//     pineconeIndex:      process.env.PINECONE_INDEX,
//     huggingfaceApiKey:  process.env.HUGGINGFACE_API_KEY,

//     googleClientId:     process.env.GOOGLE_CLIENT_ID,
//     googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     googleRedirectUri:  process.env.GOOGLE_REDIRECT_URI,
//     doctorCalendarId:   process.env.DOCTOR_CALENDAR_ID,

//     elevenLabsApiKey:   process.env.ELEVENLABS_API_KEY  || '',
//     elevenLabsVoiceId:  process.env.ELEVENLABS_VOICE_ID || i52w6eOAcpRkTE6yOgGq,

//     sampleRate:         16000,       // ← THIS WAS MISSING
//     maxChunkSize:       1024 * 1024, // 1MB
//     corsOrigin:         process.env.CORS_ORIGIN || '*',
// }

// import dotenv from 'dotenv'
// dotenv.config()

// const required = [
//     'ASSEMBLY_API_KEY',
//     'GROQ_API_KEY',
//     'PINECONE_API_KEY',
//     'PINECONE_INDEX',
//     'HUGGINGFACE_API_KEY',
//     'GOOGLE_CLIENT_ID',
//     'GOOGLE_CLIENT_SECRET',
//     'GOOGLE_REDIRECT_URI',
//     'DOCTOR_CALENDAR_ID',
// ]

// for (const key of required) {
//     if (!process.env[key]) {
//         console.error(`Missing required env var: ${key}`)
//         process.exit(1)
//     }
// }

// export const config = {
//     port:               parseInt(process.env.PORT) || 3000,
//     nodeEnv:            process.env.NODE_ENV || 'development',
//     isDev:              process.env.NODE_ENV !== 'production',

//     assemblyApiKey:     process.env.ASSEMBLY_API_KEY,
//     groqApiKey:         process.env.GROQ_API_KEY,
//     pineconeApiKey:     process.env.PINECONE_API_KEY,
//     pineconeIndex:      process.env.PINECONE_INDEX,
//     huggingfaceApiKey:  process.env.HUGGINGFACE_API_KEY,

//     googleClientId:     process.env.GOOGLE_CLIENT_ID,
//     googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     googleRedirectUri:  process.env.GOOGLE_REDIRECT_URI,
//     doctorCalendarId:   process.env.DOCTOR_CALENDAR_ID,

//     // ElevenLabs removed — now using Kokoro TTS (free, local, natural Hindi)
//     // elevenLabsApiKey and elevenLabsVoiceId no longer needed

//     sampleRate:         16000,
//     maxChunkSize:       1024 * 1024,
//     corsOrigin:         process.env.CORS_ORIGIN || '*',
// }



import dotenv from 'dotenv'
dotenv.config()

const required = [
    'ASSEMBLY_API_KEY',
    'GROQ_API_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX',
    'PINECONE_HOST',
    'HUGGINGFACE_API_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'DOCTOR_CALENDAR_ID',
]

for (const key of required) {
    if (!process.env[key]) {
        console.error(`Missing required env var: ${key}`)
        process.exit(1)
    }
}

export const config = {
    port:               parseInt(process.env.PORT) || 3000,
    nodeEnv:            process.env.NODE_ENV || 'development',
    isDev:              process.env.NODE_ENV !== 'production',

    assemblyApiKey:     process.env.ASSEMBLY_API_KEY,
    groqApiKey:         process.env.GROQ_API_KEY,
    pineconeApiKey:     process.env.PINECONE_API_KEY,
    pineconeIndex:      process.env.PINECONE_INDEX,
    pineconeHost:       process.env.PINECONE_HOST,   // ← full host URL
    huggingfaceApiKey:  process.env.HUGGINGFACE_API_KEY,

    googleClientId:     process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRedirectUri:  process.env.GOOGLE_REDIRECT_URI,
    doctorCalendarId:   process.env.DOCTOR_CALENDAR_ID,

    sampleRate:         16000,
    maxChunkSize:       1024 * 1024,
    corsOrigin:         process.env.CORS_ORIGIN || '*',
}