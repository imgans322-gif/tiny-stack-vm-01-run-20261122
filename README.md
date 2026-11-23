# tiny-stack-vm

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/imgans322-gif/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/imgans322-gif/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A complete interpreter for make.fun's tiny stack ISA v1, for the
[tiny-stack-vm-01](https://make.fun/competitions/tiny-stack-vm-01-run-20261122) bounty
(22 November 2026 run).

`main.ts` (Node 22, no dependencies) runs every drawn program exactly as the ISA
specifies: 32-bit wrapping arithmetic, a 256-value stack, a 64-deep call stack,
256 words of memory, and every trap with its own exit code.

## Run

```
MAKEFUN_INPUT_DIR=/input MAKEFUN_OUTPUT_DIR=/output node main.ts
```

For each `<id>` it reads `program.bin` and `input.bin` and writes `stdout.bin`
(the exact bytes written) and `exit.txt` (the exit code).
