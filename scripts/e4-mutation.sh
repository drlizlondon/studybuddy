#!/usr/bin/env bash
# SD-1e check E4 (mutation): remove the closing question from SummaryModal, build that
# copy into dist-e4, run test E1 against it and require that it FAILS. main.jsx is
# restored afterwards whatever happens.
set -u
cd "$(dirname "$0")/.."
backup="$(mktemp)"
cp src/main.jsx "$backup"
restore() { cp "$backup" src/main.jsx; }
trap restore EXIT

target='{task ? CLOSING_QUESTION : CLOSING_QUESTION_BLANK_TASK}'
if ! grep -qF "$target" src/main.jsx; then echo "E4 ERROR: question not found in SummaryModal"; exit 2; fi
python3 - "$target" <<'PY'
import sys
t = sys.argv[1]
s = open("src/main.jsx").read()
open("src/main.jsx", "w").write(s.replace(t, '{""}'))
PY
if grep -qF "$target" src/main.jsx; then echo "E4 ERROR: mutation did not apply"; exit 2; fi
echo "E4: question removed from SummaryModal (mutant)"
npx vite build --outDir dist-e4 --emptyOutDir > /dev/null 2>&1 || { echo "E4 ERROR: mutant build failed"; exit 2; }
restore
if cmp -s "$backup" src/main.jsx; then echo "main.jsx restored"; fi

log="$(mktemp)"
SD1_NESTED=1 SD1_DIST=dist-e4 SD1_PORT=4174 npx playwright test -g "E1 ending a session" --project=desktop-1280 > "$log" 2>&1
status=$?
tail -n 14 "$log"
if [ "$status" -ne 0 ]; then
  echo "E4 OK: E1 failed with the question removed (exit $status)"
  exit 0
fi
echo "E4 FAIL: E1 still passed with the question removed"
exit 1
