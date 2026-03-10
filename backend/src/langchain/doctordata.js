
// import { upsertDoctors } from './pinecone.js'
// export const doctors = [
//     {
//         id:             'dr_001',
//         name:           'Dr. Priya Sharma',
//         specialization: 'General Physician',
//         languages:      ['Hindi', 'English'],
//         experience:     '10 years',
//         fee:            500,
//         available:      true,
//         symptoms:       [
//             'bukhar', 'fever', 'tez bukhar', 'high fever',
//             'sardi', 'cold', 'khansi', 'cough',
//             'sir dard', 'headache', 'badan dard', 'body pain',
//             'ulti', 'vomiting', 'dast', 'diarrhea',
//             'pet dard', 'stomach pain', 'weakness', 'kamzori',
//             'general checkup', 'routine checkup'
//         ],
        
//         embeddingText: `Dr. Priya Sharma is a General Physician with 10 years experience.
// Treats: fever, bukhar, cold, sardi, cough, khansi, headache, sir dard, 
// body pain, badan dard, vomiting, ulti, diarrhea, dast, stomach pain, 
// pet dard, weakness, kamzori, general checkup. Speaks Hindi and English.`,
//     },
//     {
//         id:             'dr_002',
//         name:           'Dr. Rahul Mehta',
//         specialization: 'Cardiologist',
//         languages:      ['Hindi', 'English', 'Urdu'],
//         experience:     '15 years',
//         fee:            1200,
//         available:      true,
//         symptoms:       [
//             'chest pain', 'seene mein dard', 'dil ki dhadkan',
//             'heart problem', 'bp', 'blood pressure', 'high bp',
//             'bp high hai', 'breathlessness', 'saans lene mein takleef',
//             'palpitations', 'dil tez dhadak raha hai', 'heart attack'
//         ],
//         embeddingText: `Dr. Rahul Mehta is a Cardiologist with 15 years experience.
// Treats: chest pain, seene mein dard, heart problems, dil ki dhadkan,
// blood pressure, BP, high BP, breathlessness, saans lene mein takleef,
// palpitations, dil tez dhadak raha hai. Speaks Hindi, English, Urdu.`,
//     },
//     {
//         id:             'dr_003',
//         name:           'Dr. Anjali Gupta',
//         specialization: 'Dermatologist',
//         languages:      ['Hindi', 'English'],
//         experience:     '8 years',
//         fee:            800,
//         available:      true,
//         symptoms:       [
//             'skin problem', 'chamdi ki bimari', 'daane', 'pimples', 'acne',
//             'khujli', 'itching', 'rash', 'allergy', 'hair fall', 'baal girna',
//             'dandruff', 'rusi', 'fungal infection', 'sunburn', 'dark spots'
//         ],
//         embeddingText: `Dr. Anjali Gupta is a Dermatologist with 8 years experience.
// Treats: skin problems, chamdi ki bimari, pimples, daane, acne,
// itching, khujli, rash, allergy, hair fall, baal girna, dandruff,
// rusi, fungal infection, sunburn, dark spots. Speaks Hindi and English.`,
//     },
//     {
//         id:             'dr_004',
//         name:           'Dr. Suresh Patel',
//         specialization: 'Orthopedic',
//         languages:      ['Hindi', 'English', 'Gujarati'],
//         experience:     '12 years',
//         fee:            900,
//         available:      true,
//         symptoms:       [
//             'joint pain', 'jodo mein dard', 'ghutne ka dard', 'knee pain',
//             'back pain', 'kamar dard', 'haddi ka dard', 'bone pain',
//             'fracture', 'haddi toot gayi', 'spine problem', 'arthritis',
//             'gathiya', 'muscle pain', 'muscles mein dard', 'shoulder pain'
//         ],
//         embeddingText: `Dr. Suresh Patel is an Orthopedic specialist with 12 years experience.
// Treats: joint pain, jodo mein dard, knee pain, ghutne ka dard,
// back pain, kamar dard, bone pain, fracture, spine problems, 
// arthritis, gathiya, muscle pain, shoulder pain. Speaks Hindi, English, Gujarati.`,
//     },
//     {
//         id:             'dr_005',
//         name:           'Dr. Fatima Khan',
//         specialization: 'Gynecologist',
//         languages:      ['Hindi', 'English', 'Urdu'],
//         experience:     '11 years',
//         fee:            1000,
//         available:      true,
//         symptoms:       [
//             'periods problem', 'masik dharm', 'irregular periods',
//             'pregnancy', 'garbhavastha', 'pcod', 'pcos',
//             'white discharge', 'safed paani', 'lower abdominal pain',
//             'pet ke neeche dard', 'hormonal issues', 'menopause'
//         ],
//         embeddingText: `Dr. Fatima Khan is a Gynecologist with 11 years experience.
// Treats: period problems, masik dharm, irregular periods, pregnancy,
// garbhavastha, PCOD, PCOS, white discharge, safed paani, 
// lower abdominal pain, hormonal issues, menopause. Speaks Hindi, English, Urdu.`,
//     },
// ]


// async function uploadDoctors() {
//     console.log(`\nUploading ${doctors.length} doctors to Pinecone...\n`)
//     try {
//         await upsertDoctors(doctors)
//         console.log('\n All doctors uploaded successfully!')
//         console.log('You can now start the server: node server.js')
//     } catch (err) {
//         console.error('\n Upload failed:', err.message)
//         process.exit(1)
//     }
// }
// const isMain = process.argv[1].includes('doctorData')
// if (isMain) uploadDoctors()



import dotenv from 'dotenv'
dotenv.config()

import { upsertDoctors } from './pinecone.js'

export const doctors = [
    {
        id:             'dr_001',
        name:           'Dr. Priya Sharma',
        specialization: 'General Physician',
        languages:      ['Hindi', 'English'],
        experience:     '10 years',
        fee:            500,
        available:      true,
        symptoms:       [
            'bukhar', 'fever', 'tez bukhar', 'high fever',
            'sardi', 'cold', 'khansi', 'cough',
            'sir dard', 'headache', 'badan dard', 'body pain',
            'ulti', 'vomiting', 'dast', 'diarrhea',
            'pet dard', 'stomach pain', 'weakness', 'kamzori',
            'general checkup', 'routine checkup'
        ],
        embeddingText: `Dr. Priya Sharma is a General Physician with 10 years experience.
Treats: fever, bukhar, cold, sardi, cough, khansi, headache, sir dard,
body pain, badan dard, vomiting, ulti, diarrhea, dast, stomach pain,
pet dard, weakness, kamzori, general checkup. Speaks Hindi and English.`,
    },
    {
        id:             'dr_002',
        name:           'Dr. Rahul Mehta',
        specialization: 'Cardiologist',
        languages:      ['Hindi', 'English', 'Urdu'],
        experience:     '15 years',
        fee:            1200,
        available:      true,
        symptoms:       [
            'chest pain', 'seene mein dard', 'dil ki dhadkan',
            'heart problem', 'bp', 'blood pressure', 'high bp',
            'breathlessness', 'saans lene mein takleef',
            'palpitations', 'dil tez dhadak raha hai', 'heart attack'
        ],
        embeddingText: `Dr. Rahul Mehta is a Cardiologist with 15 years experience.
Treats: chest pain, seene mein dard, heart problems, dil ki dhadkan,
blood pressure, BP, high BP, breathlessness, saans lene mein takleef,
palpitations, dil tez dhadak raha hai. Speaks Hindi, English, Urdu.`,
    },
    {
        id:             'dr_003',
        name:           'Dr. Anjali Gupta',
        specialization: 'Dermatologist',
        languages:      ['Hindi', 'English'],
        experience:     '8 years',
        fee:            800,
        available:      true,
        symptoms:       [
            'skin problem', 'chamdi ki bimari', 'daane', 'pimples', 'acne',
            'khujli', 'itching', 'rash', 'allergy', 'hair fall', 'baal girna',
            'dandruff', 'rusi', 'fungal infection', 'sunburn', 'dark spots'
        ],
        embeddingText: `Dr. Anjali Gupta is a Dermatologist with 8 years experience.
Treats: skin problems, chamdi ki bimari, pimples, daane, acne,
itching, khujli, rash, allergy, hair fall, baal girna, dandruff,
rusi, fungal infection, sunburn, dark spots. Speaks Hindi and English.`,
    },
    {
        id:             'dr_004',
        name:           'Dr. Suresh Patel',
        specialization: 'Orthopedic',
        languages:      ['Hindi', 'English', 'Gujarati'],
        experience:     '12 years',
        fee:            900,
        available:      true,
        symptoms:       [
            'joint pain', 'jodo mein dard', 'ghutne ka dard', 'knee pain',
            'back pain', 'kamar dard', 'haddi ka dard', 'bone pain',
            'fracture', 'spine problem', 'arthritis',
            'gathiya', 'muscle pain', 'shoulder pain'
        ],
        embeddingText: `Dr. Suresh Patel is an Orthopedic specialist with 12 years experience.
Treats: joint pain, jodo mein dard, knee pain, ghutne ka dard,
back pain, kamar dard, bone pain, fracture, spine problems,
arthritis, gathiya, muscle pain, shoulder pain. Speaks Hindi, English, Gujarati.`,
    },
    {
        id:             'dr_005',
        name:           'Dr. Fatima Khan',
        specialization: 'Gynecologist',
        languages:      ['Hindi', 'English', 'Urdu'],
        experience:     '11 years',
        fee:            1000,
        available:      true,
        symptoms:       [
            'periods problem', 'masik dharm', 'irregular periods',
            'pregnancy', 'garbhavastha', 'pcod', 'pcos',
            'white discharge', 'safed paani', 'lower abdominal pain',
            'pet ke neeche dard', 'hormonal issues', 'menopause'
        ],
        embeddingText: `Dr. Fatima Khan is a Gynecologist with 11 years experience.
Treats: period problems, masik dharm, irregular periods, pregnancy,
garbhavastha, PCOD, PCOS, white discharge, safed paani,
lower abdominal pain, hormonal issues, menopause. Speaks Hindi, English, Urdu.`,
    },
]

async function uploadDoctors() {
    console.log(`\nUploading ${doctors.length} doctors to Pinecone...\n`)
    try {
        await upsertDoctors(doctors)
        console.log('\n✅ All doctors uploaded successfully!')
    } catch (err) {
        console.error('\n❌ Upload failed:', err.message)
        process.exit(1)
    }
}

uploadDoctors()