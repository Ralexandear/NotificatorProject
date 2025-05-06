export function sleep(ms: number, log = true) {
  if (log) console.log('sleeping for', ms / 1000, 'sec')
  return new Promise(resolve => setTimeout(resolve, ms));
}