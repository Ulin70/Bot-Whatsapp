const axios = require('axios');
const qrcode = require('qrcode-terminal');
const googleTTS = require('google-tts-api');
const stringSimilarity = require('string-similarity');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

// Buat instance baru dari Client dengan LocalAuth sebagai strategi otentikasi
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'client-one' // Identifikasi unik untuk menyimpan sesi
    })
});

// Database Tanya Jawab
const qaDatabase = [
    { question: "",answer: ""},
    { question: "apa itu forex?",                          answer: "Forex adalah singkatan dari Foreign Exchange, yang dalam bahasa Indonesia berarti pertukaran mata uang asing. Sederhananya, forex adalah aktivitas jual beli mata uang satu negara dengan mata uang negara lain."},
    { question: "apa itu DDOS?",                           answer: "DDOS adalah singkatan dari Distributed Denial of Service. Ini adalah jenis serangan siber yang bertujuan untuk melumpuhkan sebuah sistem atau jaringan komputer dengan membanjiri sistem tersebut dengan lalu lintas internet yang berlebihan."},
    { question: "dimana Sandy checks dilahirkan?",         answer: "Sandy Cheeks, karakter ceria dari serial animasi SpongeBob SquarePants, berasal dari Texas, Amerika Serikat. Meskipun ia hidup di bawah laut di Bikini Bottom, tempat tinggalnya yang unik bernama Treedome, tempat ia menciptakan lingkungan daratan di bawah laut, Sandy tetap memiliki akar Texas yang kuat, tempat kelahiran Sandy Cheeks adalah Texas."},
    { question: "Apa perbedaan IKN dan IKAN?",             answer: "IKN adalah singkatan dari Ibu Kota Nusantara, sedangkan IKAN adalah hewan air yang hidup di dalam air dan biasanya dijadikan makanan oleh manusia."},
    { question: "Apa ibukota Indonesia?",                  answer: "Ibukota Indonesia adalah Jakarta." },
    { question: "Apa itu Javascript?",                     answer: "JavaScript adalah bahasa pemrograman yang digunakan untuk membuat halaman web interaktif." },
    { question: "Apa itu IKN?",                            answer: "IKN adalah singkatan dari Ibu Kota Nusantara. Ini adalah ibu kota masa depan Indonesia yang sedang dibangun di Kalimantan Timur. Nama resmi IKN adalah Nusantara." },
    { question: "kapan IKN Di bangun?",                    answer: "Pembangunan Ibu Kota Nusantara (IKN) merupakan proyek besar yang berlangsung bertahap. Pembangunan tahap awal sudah dimulai sejak tahun 2022. Namun, perlu diingat bahwa pembangunan sebuah kota sebesar IKN membutuhkan waktu yang sangat lama, tidak hanya dalam hitungan tahun, tetapi bahkan puluhan tahun." },
    { question: "Siapa penulis novel Laskar Pelangi?",     answer: "Novel Laskar Pelangi ditulis oleh Andrea Hirata." },
    { question: "Apa planet terbesar di tata surya kita?", answer: "Planet terbesar di tata surya kita adalah Jupiter." },
    { question: "Apakah kamu bisa bernyanyi?",             answer: "Maaf, saya tidak bisa bernyanyi, tetapi saya bisa memberikan Anda musik. Untuk mengakses, ketik: 'putar [judul lagu]-[nama artis]'." },
    { question: "Saya suka musik",                         answer: "Ok, saya bisa memutarkan musik untuk anda. ketik: 'putar [judul lagu]-[nama artis]' untuk meninjau." },
    { question: "Kapan Indonesia merdeka?",                answer: "Indonesia merdeka pada tanggal 17 Agustus 1945." },
    { question: "Siapa nama kamu?",                        answer: "Nama saya Sindi." },
    { question: "Berapa usiamu?",                          answer: "Usia saya 18 tahun." },
    { question: "Dimana kamu berada?",                     answer: "Saya berada di dalam bahasa pemrograman JavaScript." },
    { question: "assalamualaikum",                         answer: "Wa'alaikumsalam Wr.Wb." },
    { question: "kapan kamu dibuat?",                      answer: "Saya dibuat pada tanggal 08 Agustus 2023." },
    { question: "Siapa yang membuat?",                     answer: "Saya dibuat oleh Mr.Dark." },
    { question: "Siapa yang memiliki akses?",              answer: "Mr.Dark memiliki akses." },
    { question: "Siapa yang berwewenang?",                 answer: "Mr.Dark yang berwenang." },
    { question: "Siapa itu Mr.Dark?",                      answer: "Maaf, saya tidak diizinkan untuk memberikan informasi lebih lanjut tentang Mr.Dark." },
    { question: "berapa umur Mr.Dark?",                    answer: "Maaf, saya tidak memiliki informasi tentang umur Mr.Dark." },
    { question: "Apa itu quantum?",                        answer: "Quantum adalah istilah yang sering digunakan dalam berbagai bidang, terutama fisika, untuk menggambarkan konsep yang sangat kecil, yang berhubungan dengan dunia subatomik dan fenomena yang tidak dapat dijelaskan oleh fisika klasik." }
];

// Fakta acak
const randomFacts = [
    "Candi Borobudur adalah monumen Buddha terbesar di dunia.",
    "Indonesia memiliki lebih dari 17.000 pulau.",
    "Komodo hanya dapat ditemukan di Indonesia.",
    "Bahasa Indonesia memiliki lebih dari 700 bahasa daerah.",
    "Rafflesia arnoldii, bunga terbesar di dunia, dapat ditemukan di Indonesia."
];

// Inisialisasi client
client.initialize();

// Menangani event saat QR code dihasilkan
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code telah dihasilkan. Silakan pindai untuk login.');
});

// Menangani event saat client siap
client.on('ready', () => {
    console.log("Bot siap menerima dan mengirim pesan");
});

// Fungsi untuk mencari lagu dan mendapatkan pratinjaunya
async function searchAndGetPreview(query) {
    try {
        const response = await axios.get(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`);
        if (response.data.data && response.data.data.length > 0) {
            const track = response.data.data[0];
            return {
                title: track.title,
                artist: track.artist.name,
                preview: track.preview
            };
        }
        return null;
    } catch (error) {
        console.error('Error saat mencari lagu:', error.message);
        return null;
    }
}

// fungsi untuk pesan suara
async function generateVoiceMessage(text) {
    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: 'id',
            slow: false,
            host: 'https://translate.google.com',
        });
        
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const media = new MessageMedia('audio/mp3', buffer.toString('base64'));
        return media;
    } catch (error) {
        console.error('Error generating voice message:', error);
        return null;
    }
}

// fungsi untuk mengunduh gambar
async function unduhGambar(ukuran) {
    try {
        // Menggunakan layanan picsum.photos untuk mendapatkan gambar placeholder
        const url = `https://picsum.photos/${ukuran}`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        return buffer;
    } catch (error) {
        console.error('Error saat mengunduh gambar:', error.message);
        return null;
    }
}

// Fungsi untuk menemukan pertanyaan yang paling cocok dan mengembalikan jawabannya
function findAnswer(question) {
    const matches = stringSimilarity.findBestMatch(
        question.toLowerCase(), 
        qaDatabase.map(qa => qa.question.toLowerCase())
    );
    if (matches.bestMatch.rating > 0.6) {
        return qaDatabase[matches.bestMatchIndex].answer;
    }
    return null;
}

// Fungsi untuk mendapatkan fakta acak
function getRandomFact() {
    return randomFacts[Math.floor(Math.random() * randomFacts.length)];
}

// Fungsi untuk melakukan operasi aritmatika
function performArithmetic(operation, ...numbers) {
    if (numbers.length < 2) {
        return 'Error: Minimal dua angka diperlukan untuk operasi';
    }

    let result = numbers[0];

    for (let i = 1; i < numbers.length; i++) {
        switch (operation) {
            case '+':
                result += numbers[i];
                break;
            case '-':
                result -= numbers[i];
                break;
            case '*':
                result *= numbers[i];
                break;
            case '/':
                if (numbers[i] === 0) {
                    return 'Error: Pembagian dengan nol tidak diperbolehkan';
                }
                result /= numbers[i];
                break;
            default:
                return 'Operasi tidak valid';
        }
    }

    return result;
}

// Menangani pesan masuk
client.on('message', async message => {
    try {
        const chat = await message.getChat();
        const lowerCaseBody = message.body.toLowerCase();
        
        // Periksa apakah pesan berasal dari grup
        if (chat.isGroup) {
            // Hanya merespons jika bot disebutkan atau pesan dimulai dengan '!'
            if (!message.mentionedIds.includes(client.info.wid._serialized) && !lowerCaseBody.startsWith('!')) {
                return;
            }
            
            // Hapus mention atau '!' dari isi pesan
            const cleanedBody = lowerCaseBody.replace(/^!/, '').replace(/@\d+/, '').trim();
            
            await handleMessage(cleanedBody, message, chat);
        } else {
            // Untuk obrolan pribadi, tangani pesan seperti sebelumnya
            await handleMessage(lowerCaseBody, message, chat);
        }
    } catch (error) {
        console.error('Error saat menangani pesan:', error.message);
    }
});

async function handleMessage(cleanedBody, message, chat) {
    if (['ping!', 'p'].includes(cleanedBody)) {
        await chat.sendMessage('pong! Bot Online');
    // lagu
    } else if (cleanedBody.startsWith('putar ')) {
        const query = cleanedBody.slice(6).trim();
        const song = await searchAndGetPreview(query);
        if (song) {
            await chat.sendMessage(`Ditemukan: ${song.title} oleh ${song.artist}\nMengirim pratinjau...`);
            const media = await MessageMedia.fromUrl(song.preview);
            await chat.sendMessage(media);
        } else {
            await chat.sendMessage('Maaf, saya tidak dapat menemukan lagu tersebut.');
    // fakta acak
        }
    } else if (cleanedBody === 'fakta acak') {
        await chat.sendMessage(getRandomFact());
    // Fitur aritmatika
    }else if (/^(hitung|calc)\s+([\d\.+\-*/\s]+)$/.test(cleanedBody)) {
        const match = cleanedBody.match(/^(hitung|calc)\s+([\d\.+\-*/\s]+)$/);
        const expression = match[2].trim();
        const parts = expression.split(/([+\-*/])/);
        const operation = parts.find(part => part.match(/[+\-*/]/));
        const numbers = parts.filter(part => !part.match(/[+\-*/]/)).map(Number);
    
        if (operation) {
            const result = performArithmetic(operation, ...numbers);
            await chat.sendMessage(`Hasil: ${expression} = ${result}`);
        } else {
            await chat.sendMessage('Error: Operasi tidak valid');
        // Unduh gambar acak
        }
    } else if (cleanedBody.startsWith('gambar ')) {
        const ukuran = cleanedBody.slice(7).trim() || '300'; // Default ukuran 300x300 jika tidak disebutkan
        const gambarBuffer = await unduhGambar(ukuran);
        if (gambarBuffer) {
            const media = new MessageMedia('image/jpeg', gambarBuffer.toString('base64'));
            await chat.sendMessage(media, { caption: `Ini gambar acak dengan ukuran ${ukuran}x${ukuran} piksel` });
        } else {
            await chat.sendMessage('Maaf, saya tidak bisa mengunduh gambar saat ini.');
        }
    } else {
        const answer = findAnswer(cleanedBody);
        if (answer) {
            await chat.sendMessage("Maaf, saya tidak yakin tentang itu. Anda bisa bertanya tentang ibukota, sastra, planet, sejarah, atau kimia. Atau ketik 'fakta acak' untuk mendapatkan informasi menarik! Untuk operasi aritmatika, gunakan format: 'hitung 5 + 3' atau 'calc 10 * 2', untuk mendengarkan musik gunakan format: 'putar [judul lagu]'. Untuk mendapatkan gambar acak, gunakan format: 'gambar [ukuran]', misalnya 'gambar 300'.");
            const voiceMessage = await generateVoiceMessage(answer);
            if (voiceMessage) {
                await chat.sendMessage(voiceMessage, { sendAudioAsVoice: true });}
                else {const voiceMessage = await generateVoiceMessage(defaultResponse);}
        }
    }
}
