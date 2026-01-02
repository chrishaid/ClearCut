import { FSRS, generatorParameters, type FSRSParameters } from 'ts-fsrs'

// FSRS configuration optimized for HSAT test prep
// Key settings:
// - 90% target retention for high-stakes test prep
// - 21-day max interval to keep skills warm during 30-week study period
// - Fuzz enabled for natural spacing variation

export const FSRS_CONFIG: Partial<FSRSParameters> = {
  request_retention: 0.90,      // Target 90% recall probability
  maximum_interval: 21,         // Cap at 21 days for test prep
  enable_fuzz: true,            // Add small randomness to prevent clustering
  enable_short_term: true,      // Use learning steps for new cards
}

// Create a new FSRS instance with our config
export function createFSRS(): FSRS {
  const params = generatorParameters(FSRS_CONFIG)
  return new FSRS(params)
}

// Singleton instance for server-side use
let fsrsInstance: FSRS | null = null

export function getFSRS(): FSRS {
  if (!fsrsInstance) {
    fsrsInstance = createFSRS()
  }
  return fsrsInstance
}

// Export rating values for easy access
export { Rating, State } from 'ts-fsrs'
export type { Card, RecordLog, ReviewLog } from 'ts-fsrs'
