/**
 * Sleep for seconds
 * @param {number} sec - Seconds
 * @returns {Promise<void>}
 */
export function sleep(sec) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), sec * 1000)
  });
}
