export interface GplatesRotation {
  time: number
  lat: number
  lon: number
  angle: number
  plateId1: number
  plateId2: number
}

export interface GplatesData {
  rotations: GplatesRotation[]
  metadata: {
    totalRotations: number
    timeRange: {
      min: number
      max: number
    }
  }
}

export const gplatesData: GplatesData = {
  rotations: [],
  metadata: {
    totalRotations: 0,
    timeRange: {
      min: -230,
      max: 0
    }
  }
} 