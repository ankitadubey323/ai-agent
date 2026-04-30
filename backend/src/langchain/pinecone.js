
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

// import dotenv from 'dotenv'
// dotenv.config()

// import fetch from 'node-fetch'

// const PINECONE_HOST = process.env.PINECONE_HOST
// const PINECONE_KEY  = process.env.PINECONE_API_KEY
// const HF_KEY        = process.env.HUGGINGFACE_API_KEY

// const HF_MODEL = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
// const HF_URL   = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}/pipeline/feature-extraction`

// export async function generateEmbedding(text) {
//     const response = await fetch(HF_URL, {
//         method:  'POST',
//         headers: {
//             'Authorization': `Bearer ${HF_KEY}`,
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

// async function pineconeUpsert(vector, id, metadata) {
//     const host = PINECONE_HOST.replace(/\/$/, '')
//     const url  = `${host}/vectors/upsert`

//     console.log(`  [Pinecone] Upserting to: ${url}`)

//     const response = await fetch(url, {
//         method:  'POST',
//         headers: {
//             'Api-Key':      PINECONE_KEY,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             vectors: [{ id, values: vector, metadata }]
//         }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`Pinecone upsert failed: ${err}`)
//     }

//     return response.json()
// }

// async function pineconeQuery(vector, topK) {
//     const host = PINECONE_HOST.replace(/\/$/, '')
//     const url  = `${host}/query`

//     const response = await fetch(url, {
//         method:  'POST',
//         headers: {
//             'Api-Key':      PINECONE_KEY,
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
//     console.log(`[Pinecone] Host: ${PINECONE_HOST}`)
//     console.log(`[Pinecone] Key: ${PINECONE_KEY?.slice(0,10)}...`)

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



// import dotenv from 'dotenv'
// dotenv.config()

// import { Pinecone } from '@pinecone-database/pinecone'

// const pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
// const index = pc.index('doctoragent') // health app wala same index

// // ─── Embedding — llama-text-embed-v2 (same as health app) ────────
// const getEmbedding = async (text) => {
//     const response = await pc.inference.embed(
//         'llama-text-embed-v2',
//         [text],
//         { inputType: 'query', truncate: 'END' }
//     )
//     return response.data[0].values
// }

// // ─── Search doctors by symptoms ───────────────────────────────────
// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const queryEmbedding = await getEmbedding(symptomText)

//         const results = await index.query({
//             vector:          queryEmbedding,
//             topK,
//             includeMetadata: true,
//             filter: { isActive: { $eq: true } }, // sirf active doctors
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
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.consultationFees,
//                 languages:      m.metadata.languages,
//                 city:           m.metadata.city,
//                 profilePhoto:   m.metadata.profilePhoto,
//                 clinicName:     m.metadata.clinicName,
//                 available:      m.metadata.isActive,
//                 pineconeId:     m.id,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} real registered doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }
// backend/src/langchain/pinecone.js
// import dotenv from 'dotenv'
// dotenv.config()

// import fetch from 'node-fetch'

// const PINECONE_HOST    = process.env.PINECONE_HOST  // doctoragent-ixr4bi3.svc.aped-4627-b74a...
// const PINECONE_KEY     = process.env.PINECONE_API_KEY
// const HUGGINGFACE_KEY  = process.env.HUGGINGFACE_API_KEY

// // ─── Embedding using HuggingFace ──────────────────
// async function getEmbedding(text) {
//     const model = 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
//     const url = `https://router.huggingface.co/hf-inference/models/${model}/pipeline/feature-extraction`
    
//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Authorization': `Bearer ${HUGGINGFACE_KEY}`,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ inputs: text }),
//     })

//     if (!response.ok) {
//         const err = await response.text()
//         throw new Error(`HuggingFace embed failed: ${err}`)
//     }

//     const text_content = await response.text()
//     if (!text_content) {
//         throw new Error('Empty response from HuggingFace')
//     }

//     let result
//     try {
//         result = JSON.parse(text_content)
//     } catch (e) {
//         throw new Error(`Failed to parse HuggingFace response: ${text_content.slice(0, 200)}`)
//     }

//     // HuggingFace returns array of vectors directly or nested in array
//     let values
//     if (Array.isArray(result) && Array.isArray(result[0])) {
//         values = result[0]
//     } else if (Array.isArray(result) && typeof result[0] === 'number') {
//         values = result
//     } else if (result.embeddings) {
//         values = result.embeddings[0]
//     } else {
//         throw new Error(`Unexpected HuggingFace response format: ${JSON.stringify(result).slice(0, 100)}`)
//     }

//     if (!values || values.length === 0) throw new Error('Empty embedding returned')
//     console.log(`[Pinecone] Embedding dimension: ${values.length}`)
//     return values
// }

// // ─── Query Pinecone ───────────────────────────────────────────────
// async function pineconeQuery(vector, topK) {
//     const host = PINECONE_HOST.replace(/\/$/, '')
//     const url  = `https://${host}/query`

//     const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//             'Api-Key':      PINECONE_KEY,
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

// // ─── Search Doctors ───────────────────────────────────────────────
// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching for: "${symptomText}"`)

//         const vector  = await getEmbedding(symptomText)
//         const results = await pineconeQuery(vector, topK)

//         console.log(`[Pinecone] Raw matches: ${results?.matches?.length || 0}`)

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
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.consultationFees || m.metadata.fee,
//                 languages:      m.metadata.languages,
//                 city:           m.metadata.city,
//                 profilePhoto:   m.metadata.profilePhoto,
//                 clinicName:     m.metadata.clinicName,
//                 email:          m.metadata.email,
//                 available:      m.metadata.isActive,
//                 pineconeId:     m.id,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }



// backend/src/langchain/pinecone.js
// import dotenv from 'dotenv'
// dotenv.config()

// import { Pinecone } from '@pinecone-database/pinecone'

// const pc    = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
// const INDEX = 'doctoragent'

// // ─── Embedding using Pinecone SDK inference ───────────────────────
// async function getEmbedding(text) {
//     const result = await pc.inference.embed(
//         'llama-text-embed-v2',
//         [text],
//         { inputType: 'query', truncate: 'END' }
//     )
//     console.log('[Pinecone] Embed result type:', typeof result)
    
//     // SDK returns EmbeddingsList — iterate kar ke values nikalo
//     const values = result[0]?.values
//     if (!values || values.length === 0) throw new Error('Empty embedding returned')
//     console.log(`[Pinecone] Embedding dim: ${values.length}`)
//     return values
// }

// // ─── Search Doctors ───────────────────────────────────────────────
// export async function searchDoctors(symptomText, topK = 2) {
//     try {
//         console.log(`[Pinecone] Searching: "${symptomText}"`)

//         const vector = await getEmbedding(symptomText)
//         const index  = pc.index(INDEX)

//         const results = await index.query({
//             vector,
//             topK,
//             includeMetadata: true,
//         })

//         console.log(`[Pinecone] Raw matches: ${results?.matches?.length || 0}`)

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
//                 experience:     m.metadata.experience,
//                 fee:            m.metadata.consultationFees || m.metadata.fee,
//                 languages:      m.metadata.languages,
//                 city:           m.metadata.city,
//                 profilePhoto:   m.metadata.profilePhoto,
//                 clinicName:     m.metadata.clinicName,
//                 email:          m.metadata.email,
//                 available:      m.metadata.isActive,
//                 pineconeId:     m.id,
//             }))

//         console.log(`[Pinecone] Found ${matches.length} doctors`)
//         return matches

//     } catch (err) {
//         console.error('[Pinecone] Search failed:', err.message)
//         return []
//     }
// }



// backend/src/langchain/pinecone.js
import dotenv from 'dotenv'
dotenv.config()

const PINECONE_KEY  = process.env.PINECONE_API_KEY
const PINECONE_HOST = process.env.PINECONE_HOST

// ─── Embedding via REST API ───────────────────────────────────────
async function getEmbedding(text) {
    const res = await fetch('https://api.pinecone.io/embed', {
        method: 'POST',
        headers: {
            'Api-Key':                PINECONE_KEY,
            'Content-Type':           'application/json',
            'X-Pinecone-API-Version': '2025-01',
        },
        body: JSON.stringify({
            model:      'llama-text-embed-v2',
            inputs:     [{ text }],
            parameters: { input_type: 'query', truncate: 'END' }
        })
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Embed failed (${res.status}): ${err}`)
    }

    const data   = await res.json()
    const values = data?.data?.[0]?.values
    if (!values || values.length === 0) throw new Error('Empty embedding returned')
    console.log(`[Pinecone] Embedding dim: ${values.length}`)
    return values
}

// ─── Query via REST API ───────────────────────────────────────────
async function pineconeQuery(vector, topK) {
    const url = `https://${PINECONE_HOST}/query`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Api-Key':      PINECONE_KEY,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vector,
            topK,
            includeMetadata: true,
        })
    })

    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Query failed (${res.status}): ${err}`)
    }

    return res.json()
}

// ─── Search Doctors ───────────────────────────────────────────────
export async function searchDoctors(symptomText, topK = 2) {
    try {
        console.log(`[Pinecone] Searching: "${symptomText}"`)

        const vector  = await getEmbedding(symptomText)
        const results = await pineconeQuery(vector, topK)

        console.log(`[Pinecone] Raw matches: ${results?.matches?.length || 0}`)

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
                experience:     m.metadata.experience,
                fee:            m.metadata.consultationFees || m.metadata.fee,
                languages:      m.metadata.languages,
                city:           m.metadata.city,
                profilePhoto:   m.metadata.profilePhoto,
                clinicName:     m.metadata.clinicName,
                email:          m.metadata.email,
                available:      m.metadata.isActive,
                pineconeId:     m.id,
            }))

        console.log(`[Pinecone] Found ${matches.length} doctors`)
        return matches

    } catch (err) {
        console.error('[Pinecone] Search failed:', err.message)
        return []
    }
}
