const CryptoJS = require('crypto-js');

const getSecretKey = () => {
    const secret = process.env.AES_SECRET;

    if (!secret) {
        throw new Error('AES_SECRET no esta configurada');
    }

    return CryptoJS.SHA256(secret).toString();
};

const encryptData = (data) => {
    if (data === undefined || data === null) {
        throw new Error('El texto a cifrar es requerido');
    }

    return CryptoJS.AES.encrypt(String(data), getSecretKey()).toString();
};

const decryptData = (encryptedData) => {
    if (!encryptedData) {
        throw new Error('El texto cifrado es requerido');
    }

    const bytes = CryptoJS.AES.decrypt(encryptedData, getSecretKey());
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error('No fue posible descifrar la informacion');
    }

    return decrypted;
};

module.exports = {
    encryptData,
    decryptData
};
