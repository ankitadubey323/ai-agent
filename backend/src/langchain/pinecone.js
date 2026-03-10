
// import { Pinecone }  from '@pinecone-database/pinecone'
// import { config }    from '../config.js'


// const pinecone = new Pinecone({ apiKey: config.pineconeApiKey })


// let index = null

// function getIndex() {
//     if (!index) {
//         index = pinecone.Index(config.pineconeIndex)
//     }
//     return index
// }



// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({
//             inputs:  text,
//             options: { wait_for_model: true },
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embedding failed: ${err}`)
//     }

//     const result = await response.json()

    
//     let vector
//     if (Array.isArray(result) && Array.isArray(result[0])) {
        
//         vector = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
        
//         vector = result
//     } else if (result.embeddings) {
        
//         vector = result.embeddings[0]
//     } else {
        
//         console.log('[HF] Unexpected response shape:', JSON.stringify(result).slice(0, 200))
//         throw new Error('Could not parse embedding from HuggingFace response')
//     }

//     if (!vector || vector.length === 0) {
//         throw new Error('Empty vector returned from HuggingFace')
//     }

//     console.log(`  [HF] Vector length: ${vector.length}`)
//     return vector
// }

// export async function upsertDoctors(doctors) {
//     const idx     = getIndex()
//     const records = []

//     for (const doctor of doctors) {
//         console.log(`  Embedding Dr. ${doctor.name}...`)

//         try {
//             const embedding = await generateEmbedding(doctor.embeddingText)

//             records.push({
//                 id:     doctor.id,
//                 values: embedding,
//                 metadata: {
//                     name:           doctor.name,
//                     specialization: doctor.specialization,
//                     languages:      doctor.languages.join(', '),
//                     experience:     doctor.experience,
//                     fee:            doctor.fee,
//                     available:      doctor.available,
//                     symptoms:       doctor.symptoms.join(', '),
//                 },
//             })

//             await new Promise(r => setTimeout(r, 500))

//         } catch (err) {
//             console.error(`   Failed to embed ${doctor.name}:`, err.message)
//             throw err
//         }
//     }

//     console.log(`\n[Pinecone] Upserting ${records.length} records...`)
//     await idx.upsert({ records })
//     console.log(`[Pinecone] ✅ Upserted ${records.length} doctors`)
// }

// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const queryEmbedding = await generateEmbedding(symptomText)
//         const idx            = getIndex()

//         const results = await idx.query({
//             vector:          queryEmbedding,
//             topK,
//             includeMetadata: true,
//         })

//         if (!results.matches || results.matches.length === 0) {
//             console.log('[Pinecone] No matches found')
//             return []
//         }

        
//         const matches = results.matches
//             .filter(m => m.score > 0.5)
//             .map(m => ({
//                 score:          m.score,
//                 name:           m.metadata.name,
//                 specialization: m.metadata.specialization,
//                 languages:      m.metadata.languages,
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.fee,
//                 available:      m.metadata.available,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} matching doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return [] 
//     }
// }

// import { Pinecone }  from '@pinecone-database/pinecone'
// import { config }    from '../config.js'

// const pinecone = new Pinecone({ apiKey: config.pineconeApiKey })

// let index = null
// function getIndex() {
//     if (!index) index = pinecone.Index(config.pineconeIndex)
//     return index
// }

// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({
//             inputs:  text,
//             options: { wait_for_model: true },
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embedding failed: ${err}`)
//     }

//     const result = await response.json()

//     let vector
//     if (Array.isArray(result) && Array.isArray(result[0])) {
//         vector = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
//         vector = result
//     } else if (result.embeddings) {
//         vector = result.embeddings[0]
//     } else {
//         console.log('[HF] Unexpected response shape:', JSON.stringify(result).slice(0, 200))
//         throw new Error('Could not parse embedding from HuggingFace response')
//     }

//     if (!vector || vector.length === 0) throw new Error('Empty vector returned')

//     console.log(`  [HF] Vector length: ${vector.length}`)
//     return vector
// }

// export async function upsertDoctors(doctors) {
//     const idx     = getIndex()
//     const records = []

//     for (const doctor of doctors) {
//         console.log(`  Embedding Dr. ${doctor.name}...`)
//         try {
//             const embedding = await generateEmbedding(doctor.embeddingText)
//             records.push({
//                 id:     doctor.id,
//                 values: embedding,
//                 metadata: {
//                     name:           doctor.name,
//                     specialization: doctor.specialization,
//                     languages:      doctor.languages.join(', '),
//                     experience:     doctor.experience,
//                     fee:            doctor.fee,
//                     available:      doctor.available,
//                     symptoms:       doctor.symptoms.join(', '),
//                 },
//             })
//             await new Promise(r => setTimeout(r, 500))
//         } catch (err) {
//             console.error(`   Failed to embed ${doctor.name}:`, err.message)
//             throw err
//         }
//     }

//     console.log(`\n[Pinecone] Upserting ${records.length} records...`)
//     // ✅ FIXED: pass array directly, not wrapped in object
//     await idx.upsert(records)
//     console.log(`[Pinecone] ✅ Upserted ${records.length} doctors`)
// }

// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const queryEmbedding = await generateEmbedding(symptomText)
//         const idx            = getIndex()

//         const results = await idx.query({
//             vector:          queryEmbedding,
//             topK,
//             includeMetadata: true,
//         })

//         if (!results.matches || results.matches.length === 0) {
//             console.log('[Pinecone] No matches found')
//             return []
//         }

//         // ✅ FIXED: threshold 0.5 → 0.3 — zyada matches milenge
//         const matches = results.matches
//             .filter(m => m.score > 0.3)
//             .map(m => ({
//                 score:          m.score,
//                 name:           m.metadata.name,
//                 specialization: m.metadata.specialization,
//                 languages:      m.metadata.languages,
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.fee,
//                 available:      m.metadata.available,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} matching doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }

// import { Pinecone }  from '@pinecone-database/pinecone'
// import { config }    from '../config.js'

// const pinecone = new Pinecone({ apiKey: config.pineconeApiKey })

// let index = null
// function getIndex() {
//     if (!index) index = pinecone.Index(config.pineconeIndex)
//     return index
// }

// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({
//             inputs:  text,
//             options: { wait_for_model: true },
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embedding failed: ${err}`)
//     }

//     const result = await response.json()

//     let vector
//     if (Array.isArray(result) && Array.isArray(result[0])) {
//         vector = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
//         vector = result
//     } else if (result.embeddings) {
//         vector = result.embeddings[0]
//     } else {
//         console.log('[HF] Unexpected response shape:', JSON.stringify(result).slice(0, 200))
//         throw new Error('Could not parse embedding from HuggingFace response')
//     }

//     if (!vector || vector.length === 0) throw new Error('Empty vector returned')

//     console.log(`  [HF] Vector length: ${vector.length}`)
//     return vector
// }

// export async function upsertDoctors(doctors) {
//     const idx = getIndex()

//     for (const doctor of doctors) {
//         console.log(`  Embedding Dr. ${doctor.name}...`)
//         try {
//             const embedding = await generateEmbedding(doctor.embeddingText)

//             // ✅ FIXED: upsert one record at a time
//             await idx.upsert([{
//                 id:     doctor.id,
//                 values: embedding,
//                 metadata: {
//                     name:           doctor.name,
//                     specialization: doctor.specialization,
//                     languages:      doctor.languages.join(', '),
//                     experience:     doctor.experience,
//                     fee:            doctor.fee,
//                     available:      doctor.available,
//                     symptoms:       doctor.symptoms.join(', '),
//                 },
//             }])

//             console.log(`  ✅ ${doctor.name} uploaded`)
//             await new Promise(r => setTimeout(r, 500))

//         } catch (err) {
//             console.error(`  ❌ Failed: ${doctor.name}:`, err.message)
//             throw err
//         }
//     }

//     console.log(`\n[Pinecone] ✅ All doctors uploaded!`)
// }

// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const queryEmbedding = await generateEmbedding(symptomText)
//         const idx            = getIndex()

//         const results = await idx.query({
//             vector:          queryEmbedding,
//             topK,
//             includeMetadata: true,
//         })

//         if (!results.matches || results.matches.length === 0) {
//             console.log('[Pinecone] No matches found')
//             return []
//         }

//         const matches = results.matches
//             .filter(m => m.score > 0.3)
//             .map(m => ({
//                 score:          m.score,
//                 name:           m.metadata.name,
//                 specialization: m.metadata.specialization,
//                 languages:      m.metadata.languages,
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.fee,
//                 available:      m.metadata.available,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} matching doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }


// import { Pinecone }  from '@pinecone-database/pinecone'
// import { config }    from '../config.js'

// const pinecone = new Pinecone({ apiKey: config.pineconeApiKey })

// let index = null
// function getIndex() {
//     if (!index) index = pinecone.index(config.pineconeIndex)  // ✅ lowercase .index()
//     return index
// }

// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({
//             inputs:  text,
//             options: { wait_for_model: true },
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embedding failed: ${err}`)
//     }

//     const result = await response.json()

//     let vector
//     if (Array.isArray(result) && Array.isArray(result[0])) {
//         vector = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
//         vector = result
//     } else if (result.embeddings) {
//         vector = result.embeddings[0]
//     } else {
//         console.log('[HF] Unexpected response shape:', JSON.stringify(result).slice(0, 200))
//         throw new Error('Could not parse embedding from HuggingFace response')
//     }

//     if (!vector || vector.length === 0) throw new Error('Empty vector returned')

//     console.log(`  [HF] Vector length: ${vector.length}`)
//     return vector
// }

// export async function upsertDoctors(doctors) {
//     const idx = getIndex()

//     for (const doctor of doctors) {
//         console.log(`  Embedding ${doctor.name}...`)
//         try {
//             const embedding = await generateEmbedding(doctor.embeddingText)

//             // ✅ Pinecone v7 format — upsertOne per record
//             const record = {
//                 id:     doctor.id,
//                 values: embedding,
//                 metadata: {
//                     name:           doctor.name,
//                     specialization: doctor.specialization,
//                     languages:      doctor.languages.join(', '),
//                     experience:     doctor.experience,
//                     fee:            String(doctor.fee),
//                     available:      String(doctor.available),
//                     symptoms:       doctor.symptoms.join(', '),
//                 },
//             }

//             await idx.upsert([record])
//             console.log(`  ✅ ${doctor.name} uploaded`)
//             await new Promise(r => setTimeout(r, 800))

//         } catch (err) {
//             console.error(`  ❌ Failed: ${doctor.name}:`, err.message)
//             throw err
//         }
//     }

//     console.log(`\n[Pinecone] ✅ All ${doctors.length} doctors uploaded!`)
// }

// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const queryEmbedding = await generateEmbedding(symptomText)
//         const idx            = getIndex()

//         const results = await idx.query({
//             vector:          queryEmbedding,
//             topK,
//             includeMetadata: true,
//         })

//         if (!results.matches || results.matches.length === 0) {
//             console.log('[Pinecone] No matches found')
//             return []
//         }

//         const matches = results.matches
//             .filter(m => m.score > 0.3)
//             .map(m => ({
//                 score:          m.score,
//                 name:           m.metadata.name,
//                 specialization: m.metadata.specialization,
//                 languages:      m.metadata.languages,
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.fee,
//                 available:      m.metadata.available,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} matching doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }

// import fetch from 'node-fetch'
// import { config } from '../config.js'


// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${config.huggingfaceApiKey}`,
//             'Content-Type':  'application/json',
//         },
//         body: JSON.stringify({
//             inputs:  text,
//             options: { wait_for_model: true },
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embedding failed: ${err}`)
//     }

//     const result = await response.json()

//     let vector
//     if (Array.isArray(result) && Array.isArray(result[0])) {
//         vector = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
//         vector = result
//     } else if (result.embeddings) {
//         vector = result.embeddings[0]
//     } else {
//         throw new Error('Could not parse embedding from HuggingFace response')
//     }

//     if (!vector || vector.length === 0) throw new Error('Empty vector returned')
//     console.log(`  [HF] Vector length: ${vector.length}`)
//     return vector
// }

// // ✅ Direct REST API — bypasses SDK bug
// async function pineconeUpsert(vector, id, metadata) {
//     const url = `https://${config.pineconeIndex}.svc.${config.pineconeEnv}.pinecone.io/vectors/upsert`

//     const response = await fetch(url, {
//         method:  'POST',
//         headers: {
//             'Api-Key':      config.pineconeApiKey,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             vectors: [{
//                 id,
//                 values:   vector,
//                 metadata,
//             }]
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`Pinecone upsert failed: ${err}`)
//     }

//     return response.json()
// }

// async function pineconeQuery(vector, topK) {
//     const url = `https://${config.pineconeIndex}.svc.${config.pineconeEnv}.pinecone.io/query`

//     const response = await fetch(url, {
//         method:  'POST',
//         headers: {
//             'Api-Key':      config.pineconeApiKey,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             vector,
//             topK,
//             includeMetadata: true,
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`Pinecone query failed: ${err}`)
//     }

//     return response.json()
// }

// export async function upsertDoctors(doctors) {
//     for (const doctor of doctors) {
//         console.log(`  Embedding ${doctor.name}...`)
//         try {
//             const embedding = await generateEmbedding(doctor.embeddingText)

//             await pineconeUpsert(embedding, doctor.id, {
//                 name:           doctor.name,
//                 specialization: doctor.specialization,
//                 languages:      doctor.languages.join(', '),
//                 experience:     doctor.experience,
//                 fee:            String(doctor.fee),
//                 available:      String(doctor.available),
//                 symptoms:       doctor.symptoms.join(', '),
//             })

//             console.log(`  ✅ ${doctor.name} uploaded`)
//             await new Promise(r => setTimeout(r, 500))

//         } catch (err) {
//             console.error(`  ❌ Failed: ${doctor.name}:`, err.message)
//             throw err
//         }
//     }
//     console.log(`\n[Pinecone] ✅ All ${doctors.length} doctors uploaded!`)
// }

// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)
//         const queryEmbedding = await generateEmbedding(symptomText)
//         const results        = await pineconeQuery(queryEmbedding, topK)

//         if (!results.matches || results.matches.length === 0) {
//             console.log('[Pinecone] No matches found')
//             return []
//         }

//         const matches = results.matches
//             .filter(m => m.score > 0.3)
//             .map(m => ({
//                 score:          m.score,
//                 name:           m.metadata.name,
//                 specialization: m.metadata.specialization,
//                 languages:      m.metadata.languages,
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.fee,
//                 available:      m.metadata.available,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} matching doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }

import dotenv from 'dotenv'
dotenv.config()

import fetch from 'node-fetch'

const PINECONE_HOST = process.env.PINECONE_HOST
const PINECONE_KEY  = process.env.PINECONE_API_KEY
const HF_KEY        = process.env.HUGGINGFACE_API_KEY

const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

export async function generateEmbedding(text) {
    const response = await fetch(HF_URL, {
        method:  'POST',
        headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type':  'application/json',
        },
        body: JSON.stringify({
            inputs:  text,
            options: { wait_for_model: true },
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`HuggingFace embedding failed: ${err}`)
    }

    const result = await response.json()

    let vector
    if (Array.isArray(result) && Array.isArray(result[0])) {
        vector = result[0]
    } else if (Array.isArray(result) && typeof result[0] === 'number') {
        vector = result
    } else if (result.embeddings) {
        vector = result.embeddings[0]
    } else {
        throw new Error('Could not parse embedding from HuggingFace response')
    }

    if (!vector || vector.length === 0) throw new Error('Empty vector returned')
    console.log(`  [HF] Vector length: ${vector.length}`)
    return vector
}

async function pineconeUpsert(vector, id, metadata) {
    const host = PINECONE_HOST.replace(/\/$/, '')
    const url  = `${host}/vectors/upsert`

    console.log(`  [Pinecone] Upserting to: ${url}`)

    const response = await fetch(url, {
        method:  'POST',
        headers: {
            'Api-Key':      PINECONE_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vectors: [{ id, values: vector, metadata }]
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Pinecone upsert failed: ${err}`)
    }

    return response.json()
}

async function pineconeQuery(vector, topK) {
    const host = PINECONE_HOST.replace(/\/$/, '')
    const url  = `${host}/query`

    const response = await fetch(url, {
        method:  'POST',
        headers: {
            'Api-Key':      PINECONE_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vector,
            topK,
            includeMetadata: true,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Pinecone query failed: ${err}`)
    }

    return response.json()
}

export async function upsertDoctors(doctors) {
    console.log(`[Pinecone] Host: ${PINECONE_HOST}`)
    console.log(`[Pinecone] Key: ${PINECONE_KEY?.slice(0,10)}...`)

    for (const doctor of doctors) {
        console.log(`  Embedding ${doctor.name}...`)
        try {
            const embedding = await generateEmbedding(doctor.embeddingText)

            await pineconeUpsert(embedding, doctor.id, {
                name:           doctor.name,
                specialization: doctor.specialization,
                languages:      doctor.languages.join(', '),
                experience:     doctor.experience,
                fee:            String(doctor.fee),
                available:      String(doctor.available),
                symptoms:       doctor.symptoms.join(', '),
            })

            console.log(`  ✅ ${doctor.name} uploaded`)
            await new Promise(r => setTimeout(r, 500))

        } catch (err) {
            console.error(`  ❌ Failed: ${doctor.name}:`, err.message)
            throw err
        }
    }
    console.log(`\n[Pinecone] ✅ All ${doctors.length} doctors uploaded!`)
}

export async function searchDoctors(symptomText, topK = 2) {
    try {
        console.log(`[Pinecone] Searching for: "${symptomText}"`)
        const queryEmbedding = await generateEmbedding(symptomText)
        const results        = await pineconeQuery(queryEmbedding, topK)

        if (!results.matches || results.matches.length === 0) {
            console.log('[Pinecone] No matches found')
            return []
        }

        const matches = results.matches
            .filter(m => m.score > 0.3)
            .map(m => ({
                score:          m.score,
                name:           m.metadata.name,
                specialization: m.metadata.specialization,
                languages:      m.metadata.languages,
                experience:     m.metadata.experience,
                fee:            m.metadata.fee,
                available:      m.metadata.available,
            }))

        console.log(`[Pinecone] Found ${matches.length} matching doctors`)
        return matches

    } catch (err) {
        console.error('[Pinecone] Search failed:', err.message)
        return []
    }
}