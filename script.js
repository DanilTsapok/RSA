"use strict";
let BinaryText;
let text;
let SHAText;
const firstForm = document.getElementById("bynaryForm");
firstForm === null || firstForm === void 0 ? void 0 : firstForm.addEventListener("submit", (event) => {
    event.preventDefault();
    text = document.getElementById("inputText").value;
    const separator = document.getElementById("separator")
        .value;
    const result = document.getElementById("output");
    function stringToBinary(inputText) {
        const modifiedText = inputText.replace(/ /g, "/");
        const words = modifiedText.split("/");
        const convert = words
            .map((word) => word
            .split("")
            .map((char) => {
            const binary = char.charCodeAt(0).toString(2);
            return binary.padStart(8, "0");
        })
            .join(""))
            .join(`${separator}`);
        return convert;
    }
    if (result) {
        BinaryText = stringToBinary(text);
        result.value = BinaryText;
    }
});
const formSecond = document.getElementById("SHAForm");
formSecond === null || formSecond === void 0 ? void 0 : formSecond.addEventListener("submit", async (event) => {
    event.preventDefault();
    const resultSHA = document.getElementById("outputSHA");
    if (text) {
        const encoder = new TextEncoder();
        const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(text));
        const hashHex = Array.from(new Uint8Array(hashBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        SHAText = hashHex;
        if (resultSHA) {
            resultSHA.value = hashHex;
        }
    }
});
const formEncrypt = document.getElementById("encryptRSA");
formEncrypt === null || formEncrypt === void 0 ? void 0 : formEncrypt.addEventListener("submit", async (event) => {
    event.preventDefault();
    const encrypted = await encryptData(SHAText);
    const inputEcrypted = document.getElementById("encrypt");
    inputEcrypted.value = encrypted;
});
const formDecrypt = document.getElementById("decryptRSA");
formDecrypt === null || formDecrypt === void 0 ? void 0 : formDecrypt.addEventListener("submit", async (event) => {
    event.preventDefault();
    const encrypted = await encryptData(SHAText);
    const decrypted = await decryptData(encrypted);
    const inputDecrypted = document.getElementById("decrypt");
    inputDecrypted.value = decrypted;
});
let publicKey;
let privateKey;
async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey({
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
    }, true, ["encrypt", "decrypt"]);
    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;
    const publicKeyPem = await exportPublicKeyToPEM(publicKey);
    const privateKeyPem = await exportPrivateKeyToPEM(privateKey);
    const inputPublicKey = document.getElementById("inputTextRSAPublic");
    const inputPrivateKey = document.getElementById("inputTextRSAPrivate");
    if (inputPublicKey && inputPrivateKey) {
        inputPublicKey.value = publicKeyPem;
        inputPrivateKey.value = privateKeyPem;
    }
}
async function exportPublicKeyToPEM(key) {
    var _a;
    const exported = await crypto.subtle.exportKey("spki", key); // Для публічного ключа
    const byteArray = new Uint8Array(exported);
    const binaryString = byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "");
    const base64String = btoa(binaryString);
    const pemString = `-----BEGIN PUBLIC KEY-----\n${(_a = base64String
        .match(/.{1,64}/g)) === null || _a === void 0 ? void 0 : _a.join("\n")}\n-----END PUBLIC KEY-----`;
    return pemString;
}
async function exportPrivateKeyToPEM(key) {
    var _a;
    const exported = await crypto.subtle.exportKey("pkcs8", key); // Для приватного ключа
    const byteArray = new Uint8Array(exported);
    const binaryString = byteArray.reduce((data, byte) => data + String.fromCharCode(byte), "");
    const base64String = btoa(binaryString);
    const pemString = `-----BEGIN PRIVATE KEY-----\n${(_a = base64String
        .match(/.{1,64}/g)) === null || _a === void 0 ? void 0 : _a.join("\n")}\n-----END PRIVATE KEY-----`;
    return pemString;
}
async function encryptData(data) {
    const encoder = new TextEncoder();
    const encryptedData = await crypto.subtle.encrypt({
        name: "RSA-OAEP",
    }, publicKey, encoder.encode(data));
    // Конвертируем зашифрованные данные в Base64 строку
    const byteArray = new Uint8Array(encryptedData);
    const binaryString = String.fromCharCode(...byteArray);
    const base64String = btoa(binaryString);
    return base64String;
}
async function decryptData(encryptedData) {
    const binaryString = atob(encryptedData);
    const byteArray = new Uint8Array(Array.from(binaryString).map((char) => char.charCodeAt(0)));
    const decryptedData = await crypto.subtle.decrypt({
        name: "RSA-OAEP",
    }, privateKey, byteArray);
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
}
const formGenerateKey = document.getElementById("GenerateKey");
formGenerateKey === null || formGenerateKey === void 0 ? void 0 : formGenerateKey.addEventListener("submit", async (event) => {
    event.preventDefault();
    await generateKeyPair();
});
