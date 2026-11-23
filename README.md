# tiny-stack-vm

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/imgans322-gif/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/imgans322-gif/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A complete interpreter for make.fun's tiny stack ISA v1, written for the
[tiny-stack-vm-01](https://make.fun/competitions/tiny-stack-vm-01-run-20261122) bounty
(run of 22 November 2026).

`main.ts` (Node 22, no dependencies) runs every drawn program exactly as the ISA
specifies: 32-bit wrapping arithmetic (exact `MUL`, `INT_MIN / -1`, remainder signs,
unsigned `DIVU`/`MODU`/`LTU`, 5-bit shift counts), a 256-value data stack, a 64-deep
call stack, 256 words of memory, and every trap with its own exit code — stack
underflow/overflow, division by zero, unknown opcode, bad memory address, call-depth,
empty `RET`, bad `pc` or truncated immediate, the 1,000,000-step limit and the
65,536-byte output limit. A trap keeps the output written before it.

On the kit's practice set it answers all 40 instances exactly (score 1,000,000,
against the house baseline's 670,000), and it was differentially fuzzed against the
reference VM on ~2,000 generated programs with zero mismatches.

## Run

```
MAKEFUN_INPUT_DIR=/input MAKEFUN_OUTPUT_DIR=/output node main.ts
```

For each `<id>` in the input directory it reads `program.bin` and `input.bin` and
writes `<output>/<id>/stdout.bin` (exactly the bytes the program wrote) and
`<output>/<id>/exit.txt` (the exit code in decimal). The run is a pure function of
the input files: no clock, no randomness, no network.
