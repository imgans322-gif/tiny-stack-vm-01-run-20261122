// tiny-stack-vm: a complete interpreter for make.fun's tiny stack ISA v1 (the kit's
// generator/subject/ISA.md), following the reference VM's semantics and trap codes exactly.
// Per /input/<id>/{program.bin,input.bin} it writes /output/<id>/stdout.bin and exit.txt.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Per-opcode [immediate bytes, pops, pushes] by opcode byte; OK marks known opcodes.
const IMM = new Int8Array(256), POP = new Int8Array(256), PSH = new Int8Array(256), OK = new Uint8Array(256);
for (const [b, i, p, q] of [
  [0,0,0,0],[1,1,0,1],[2,4,0,1],[3,0,1,0],[4,0,1,2],[5,0,2,2],[6,0,2,3],[7,0,3,3],
  [16,0,2,1],[17,0,2,1],[18,0,2,1],[19,0,2,1],[20,0,2,1],[21,0,2,1],[22,0,2,1],
  [23,0,1,1],[24,0,2,1],[25,0,2,1],[26,0,2,1],[27,0,1,1],[28,0,2,1],[29,0,2,1],
  [30,0,2,1],[32,0,2,1],[33,0,2,1],[34,0,2,1],[48,2,0,0],[49,2,1,0],[50,2,1,0],
  [51,2,0,0],[52,0,0,0],[64,0,1,1],[65,0,2,0],[80,0,1,0],[81,0,1,0],[82,0,0,1],[83,0,1,0],
]) { OK[b] = 1; IMM[b] = i; POP[b] = p; PSH[b] = q; }

const OUTMAX = 65536;

// Runs one program to its end; returns [output, output length, exit code].
function run(p, inp) {
  const n = p.length, D = new Int32Array(256), C = new Int32Array(64), M = new Int32Array(256);
  const out = new Uint8Array(OUTMAX);
  let sp = 0, csp = 0, olen = 0, ip = 0, pc = 0, steps = 0;
  const end = (code) => [out, olen, code];
  for (;;) {
    if (steps === 1000000) return end(10);
    if (pc < 0 || pc >= n) return end(9);
    const op = p[pc];
    if (!OK[op]) return end(5);
    const imm = IMM[op];
    if (pc + imm >= n) return end(9);
    steps++;
    if (sp < POP[op]) return end(2);
    if (sp - POP[op] + PSH[op] > 256) return end(3);
    const next = pc + 1 + imm;
    pc = next;
    switch (op) {
      case 0: return end(0); // HALT
      case 1: D[sp++] = (p[next - 1] << 24) >> 24; break; // PUSH8
      case 2: D[sp++] = p[next - 4] | (p[next - 3] << 8) | (p[next - 2] << 16) | (p[next - 1] << 24); break; // PUSH32
      case 3: sp--; break; // POP
      case 4: D[sp] = D[sp - 1]; sp++; break; // DUP
      case 5: { const t = D[sp - 1]; D[sp - 1] = D[sp - 2]; D[sp - 2] = t; break; } // SWAP
      case 6: D[sp] = D[sp - 2]; sp++; break; // OVER
      case 7: { const a = D[sp - 3]; D[sp - 3] = D[sp - 2]; D[sp - 2] = D[sp - 1]; D[sp - 1] = a; break; } // ROT
      case 23: D[sp - 1] = -D[sp - 1] | 0; break; // NEG
      case 27: D[sp - 1] = ~D[sp - 1]; break; // NOT
      case 48: case 49: case 50: { // JMP / JZ / JNZ
        const rel = ((p[next - 2] | (p[next - 1] << 8)) << 16) >> 16;
        if (op === 48 || (op === 49) === (D[--sp] === 0)) pc = next + rel;
        break;
      }
      case 51: // CALL
        if (csp === 64) return end(7);
        C[csp++] = next;
        pc = p[next - 2] | (p[next - 1] << 8);
        break;
      case 52: // RET
        if (csp === 0) return end(8);
        pc = C[--csp];
        break;
      case 64: { // LOAD
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        D[sp - 1] = M[a];
        break;
      }
      case 65: { // STORE
        const a = D[sp - 1];
        if (a < 0 || a > 255) return end(6);
        M[a] = D[sp - 2];
        sp -= 2;
        break;
      }
      case 80: { // PRINT
        const s = String(D[sp - 1]);
        if (olen + s.length > OUTMAX) return end(11);
        sp--;
        for (let k = 0; k < s.length; k++) out[olen++] = s.charCodeAt(k);
        break;
      }
      case 81: // PUTC
        if (olen + 1 > OUTMAX) return end(11);
        out[olen++] = D[--sp] & 255;
        break;
      case 82: D[sp++] = ip < inp.length ? inp[ip++] : -1; break; // IN
      case 83: return end(D[--sp] & 255); // EXIT
      default: { // binary ops
        const b = D[--sp], a = D[sp - 1];
        let r;
        switch (op) {
          case 16: r = (a + b) | 0; break;
          case 17: r = (a - b) | 0; break;
          case 18: r = Math.imul(a, b); break; // MUL
          case 19: if (b === 0) return end(4); r = a === -2147483648 && b === -1 ? a : (a / b) | 0; break;
          case 20: if (b === 0) return end(4); r = b === -1 ? 0 : (a % b) | 0; break;
          case 21: if (b === 0) return end(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; break;
          case 22: if (b === 0) return end(4); r = ((a >>> 0) % (b >>> 0)) | 0; break;
          case 24: r = a & b; break;
          case 25: r = a | b; break;
          case 26: r = a ^ b; break;
          case 28: r = a << (b & 31); break;
          case 29: r = a >> (b & 31); break;
          case 30: r = (a >>> (b & 31)) | 0; break;
          case 32: r = a === b ? 1 : 0; break;
          case 33: r = a < b ? 1 : 0; break;
          default: r = (a >>> 0) < (b >>> 0) ? 1 : 0; break; // 34 LTU
        }
        D[sp - 1] = r;
      }
    }
  }
}

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
for (const id of readdirSync(I).sort()) {
  let prog, inp;
  try { prog = readFileSync(join(I, id, 'program.bin')); } catch { prog = Buffer.alloc(0); }
  try { inp = readFileSync(join(I, id, 'input.bin')); } catch { inp = Buffer.alloc(0); }
  const [out, olen, code] = run(prog, inp);
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), out.subarray(0, olen));
  writeFileSync(join(O, id, 'exit.txt'), `${code}\n`);
}
