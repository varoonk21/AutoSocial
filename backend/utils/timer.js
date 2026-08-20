/**
 * Promise-based delay helper.
 * Extracted from: libraries/helpers/src/utils/timer.ts
 */
function timer(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { timer };
