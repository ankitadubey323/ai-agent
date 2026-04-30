import dotenv from 'dotenv'
dotenv.config()

const key  = process.env.PINECONE_API_KEY
const host = process.env.PINECONE_HOST

console.log('KEY:', key?.slice(0,15))
console.log('HOST:', host)

// Step 1: Embed
const embedRes = await fetch('https://api.pinecone.io/embed', {
  method: 'POST',
  headers: {
    'Api-Key': key,
    'Content-Type': 'application/json',
    'X-Pinecone-API-Version': '2025-01',
  },
  body: JSON.stringify({
    model: 'llama-text-embed-v2',
    inputs: [{ text: 'fever' }],
    parameters: { input_type: 'query', truncate: 'END' }
  })
})

console.log('Embed status:', embedRes.status)
const embedData = await embedRes.text()
console.log('Embed response:', embedData.slice(0, 300))


// Query part ko ye se replace karo:
const embedJson = JSON.parse(embedData)
const vector = embedJson.data[0].values

const queryRes = await fetch(`https://${process.env.PINECONE_HOST}/query`, {
  method: 'POST',
  headers: { 
    'Api-Key': key, 
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    vector: vector,
    topK: 2,
    includeMetadata: true,
  })
})
console.log('Query status:', queryRes.status)
const queryText = await queryRes.text()
console.log('Query response:', queryText.slice(0, 500))
console.log('Query status:', queryRes.status)
const queryData = await queryRes.json()
console.log('Matches:', queryData.matches?.length)
console.log('First match:', JSON.stringify(queryData.matches?.[0]?.metadata?.name))