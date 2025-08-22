const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const BASE = ALPHABET.length;
let lastTime = -1;
let lastRand = null;

function encodeTime(ms) {
  let v = BigInt(ms);
  const len = 10;
  const out = new Array(len);
  for (let i = len - 1; i >= 0; i--) {
    const rem = Number(v % BigInt(BASE));
    out[i] = ALPHABET[rem];
    v = v / BigInt(BASE);
  }
  return out.join("");
}

function randomChars(nChars) {
  const needBytes = Math.ceil((nChars * 5) / 8);
  const rnd = (typeof crypto !== "undefined" && crypto.getRandomValues)
    ? crypto.getRandomValues(new Uint8Array(needBytes))
    : (() => { const arr = new Uint8Array(needBytes); for (let i=0;i<needBytes;i++) arr[i]=Math.floor(Math.random()*256); return arr; })();
  const bits = [];
  for (let b of rnd) for (let i=7;i>=0;i--) bits.push((b>>i)&1);
  const out = [];
  for (let i=0;i<nChars;i++) {
    let v = 0;
    for (let j=0;j<5;j++) v = (v<<1) | (bits[i*5 + j] || 0);
    out.push(v);
  }
  return out;
}

function incrementDigits(digs) {
  for (let i = digs.length - 1; i >= 0; i--) {
    if (digs[i] < BASE - 1) { digs[i]++; for (let j = i+1; j<digs.length; j++) digs[j]=0; return; }
  }
  for (let i = 0; i < digs.length; i++) digs[i] = 0;
}

export function tsid18(nowMs = Date.now()) {
  const timePart = encodeTime(nowMs);
  let randDigits;
  if (nowMs === lastTime && lastRand) { randDigits = lastRand.slice(); incrementDigits(randDigits); }
  else { randDigits = randomChars(8); }
  lastTime = nowMs; lastRand = randDigits;
  return timePart + randDigits.map(d => ALPHABET[d]).join("");
}
