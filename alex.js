const qrcode = require('qrcode-terminal');
const fs = require('fs');
const { Client, LegacySessionAuth, LocalAuth, MessageMedia } = require('whatsapp-web.js');

// Buat instance baru dari Client dengan LocalAuth sebagai strategi otentikasi
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'client-one' // Identifikasi unik untuk menyimpan sesi
    })
});

// Simpan sesi ke file setelah berhasil otentikasi
client.on('authenticated', (session) => {
    console.log(session);
});

// Inisialisasi client
client.initialize();

// Menangani event saat QR code dihasilkan
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Menangani event saat client siap untuk mengirim dan menerima pesan
client.on('ready', () => {
    console.log("Client siap untuk mengirim dan menerima pesan");
});

client.on('message', message => {
    if(message.body === 'halo')
        {
            message.reply('Hai');
        }
});