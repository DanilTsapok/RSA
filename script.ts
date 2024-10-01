let BinaryText: string;
let text: string;
let SHAText: string;

const firstForm = document.getElementById("bynaryForm");

firstForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  text = (document.getElementById("inputText") as HTMLTextAreaElement).value;
  const separator = (document.getElementById("separator") as HTMLInputElement)
    .value;

  const result = document.getElementById("output") as HTMLInputElement;

  function stringToBinary(inputText: string): string {
    const modifiedText = inputText.replace(/ /g, "/");
    const words = modifiedText.split("/");
    const convert = words
      .map((word) =>
        word
          .split("")
          .map((char) => {
            const binary = char.charCodeAt(0).toString(2);
            return binary.padStart(8, "0");
          })
          .join("")
      )
      .join(`${separator}`);

    return convert;
  }

  if (result) {
    BinaryText = stringToBinary(text);
    result.value = BinaryText;
  }
});

const formSecond = document.getElementById("SHAForm");
formSecond?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const resultSHA = document.getElementById("outputSHA") as HTMLInputElement;

  if (text) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(text)
    );
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

formEncrypt?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const encrypted = await encryptData(SHAText);
  const inputEcrypted = document.getElementById("encrypt") as HTMLInputElement;
  inputEcrypted.value = encrypted;
});

const formDecrypt = document.getElementById("decryptRSA");

formDecrypt?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const encrypted = await encryptData(SHAText);
  const decrypted = await decryptData(encrypted);
  const inputDecrypted = document.getElementById("decrypt") as HTMLInputElement;
  inputDecrypted.value = decrypted;
});

let publicKey: CryptoKey;
let privateKey: CryptoKey;

async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  publicKey = keyPair.publicKey;
  privateKey = keyPair.privateKey;
  const publicKeyPem = await exportPublicKeyToPEM(publicKey);
  const privateKeyPem = await exportPrivateKeyToPEM(privateKey);

  const inputPublicKey = document.getElementById(
    "inputTextRSAPublic"
  ) as HTMLTextAreaElement;
  const inputPrivateKey = document.getElementById(
    "inputTextRSAPrivate"
  ) as HTMLTextAreaElement;

  if (inputPublicKey && inputPrivateKey) {
    inputPublicKey.value = publicKeyPem;
    inputPrivateKey.value = privateKeyPem;
  }
}

async function exportPublicKeyToPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("spki", key); // Для публічного ключа
  const byteArray = new Uint8Array(exported);
  const binaryString = byteArray.reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ""
  );
  const base64String = btoa(binaryString);
  const pemString = `-----BEGIN PUBLIC KEY-----\n${base64String
    .match(/.{1,64}/g)
    ?.join("\n")}\n-----END PUBLIC KEY-----`;
  return pemString;
}

async function exportPrivateKeyToPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("pkcs8", key); // Для приватного ключа
  const byteArray = new Uint8Array(exported);
  const binaryString = byteArray.reduce(
    (data, byte) => data + String.fromCharCode(byte),
    ""
  );
  const base64String = btoa(binaryString);
  const pemString = `-----BEGIN PRIVATE KEY-----\n${base64String
    .match(/.{1,64}/g)
    ?.join("\n")}\n-----END PRIVATE KEY-----`;
  return pemString;
}

async function encryptData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encoder.encode(data)
  );

  const byteArray = new Uint8Array(encryptedData);
  const binaryString = String.fromCharCode(...byteArray);
  const base64String = btoa(binaryString);
  return base64String;
}

async function decryptData(encryptedData: string): Promise<string> {
  const binaryString = atob(encryptedData);
  const byteArray = new Uint8Array(
    Array.from(binaryString).map((char) => char.charCodeAt(0))
  );
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    byteArray
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

const formGenerateKey = document.getElementById("GenerateKey");
formGenerateKey?.addEventListener("submit", async (event) => {
  event.preventDefault();
  await generateKeyPair();
});
