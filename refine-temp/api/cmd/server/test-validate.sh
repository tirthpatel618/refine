#!/usr/bin/env bash
set -euo pipefail

# Usage examples:
#   ./test_validate.sh -m addition -d 1 -c 5
#   ./test_validate.sh -m subtraction -d 2 -c 6 -n 50 -x 200
#   ./test_validate.sh -m division -d 1 -c 8
#
# Requires: jq (brew install jq)

BASE_URL="http://localhost:8080"
MODE=""
DIFFICULTY=""
COUNT=""
MIN=""
MAX=""

while getopts "m:d:c:n:x:u:" opt; do
  case "$opt" in
    m) MODE="$OPTARG" ;;
    d) DIFFICULTY="$OPTARG" ;;
    c) COUNT="$OPTARG" ;;
    n) MIN="$OPTARG" ;;
    x) MAX="$OPTARG" ;;
    u) BASE_URL="$OPTARG" ;;
    *) echo "Invalid option"; exit 1 ;;
  esac
done

if [[ -z "${MODE}" || -z "${DIFFICULTY}" || -z "${COUNT}" ]]; then
  echo "Missing required flags. See header for usage."
  exit 1
fi

PROBLEMS_ENDPOINT="${BASE_URL}/api/problems"
VALIDATE_ENDPOINT="${BASE_URL}/api/validate"

# Build /api/problems payload
if [[ -n "${MIN}" && -n "${MAX}" ]]; then
  PROBLEMS_BODY=$(jq -n \
    --arg mode "$MODE" \
    --argjson difficulty "$DIFFICULTY" \
    --argjson count "$COUNT" \
    --argjson min "$MIN" \
    --argjson max "$MAX" \
    '{mode:$mode, difficulty:$difficulty, count:$count, config:{min:$min, max:$max}}')
else
  PROBLEMS_BODY=$(jq -n \
    --arg mode "$MODE" \
    --argjson difficulty "$DIFFICULTY" \
    --argjson count "$COUNT" \
    '{mode:$mode, difficulty:$difficulty, count:$count}')
fi

echo "→ Requesting problems..."
PROBS_JSON=$(curl -sS -X POST "$PROBLEMS_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$PROBLEMS_BODY")

echo "Problems response:"
echo "$PROBS_JSON" | jq .

SEED=$(echo "$PROBS_JSON" | jq -r '.seed')
if [[ "$SEED" == "null" || -z "$SEED" ]]; then
  echo "No seed found in problems response. Exiting."
  exit 1
fi

# Compute answers with jq (handles +, -, ×, ÷)
ANS_JSON=$(echo "$PROBS_JSON" | jq '[.problems[]
  | if .operator=="+" then (.num1 + .num2)
    elif .operator=="-" then (.num1 - .num2)
    elif .operator=="×" then (.num1 * .num2)
    elif .operator=="÷" then (.num1 / .num2)
    else null end]')

# Build /api/validate payload
if [[ -n "${MIN}" && -n "${MAX}" ]]; then
  VALIDATE_BODY=$(jq -n \
    --arg seed "$SEED" \
    --arg mode "$MODE" \
    --argjson difficulty "$DIFFICULTY" \
    --argjson answers "$ANS_JSON" \
    --argjson min "$MIN" \
    --argjson max "$MAX" \
    '{seed:$seed, mode:$mode, difficulty:$difficulty, answers:$answers, config:{min:$min, max:$max}}')
else
  VALIDATE_BODY=$(jq -n \
    --arg seed "$SEED" \
    --arg mode "$MODE" \
    --argjson difficulty "$DIFFICULTY" \
    --argjson answers "$ANS_JSON" \
    '{seed:$seed, mode:$mode, difficulty:$difficulty, answers:$answers}')
fi

echo
echo "→ Validating answers..."
VAL_JSON=$(curl -sS -X POST "$VALIDATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "$VALIDATE_BODY")

echo "Validate response:"
echo "$VAL_JSON" | jq .
