import * as posenet from '@tensorflow-models/posenet'

const pointRadius = 3

export const config = {
  videoWidth: 900,
  videoHeight: 700,
  flipHorizontal: true,
  algorithm: 'single-pose',
  showVideo: true,
  showSkeleton: true,
  showPoints: true,
  minPoseConfidence: 0.1,
  minPartConfidence: 0.5,
  maxPoseDetections: 2,
  nmsRadius: 20,
  outputStride: 16,
  imageScaleFactor: 0.5,
  skeletonColor: '#ffadea',
  skeletonLineWidth: 6,
  loadingText: 'Loading...please be patient...'
}

function toTuple({x, y}) {
  return [x, y]
}

export function drawKeyPoints(
  keypoints,
  minConfidence,
  skeletonColor,
  canvasContext,
  scale = 1
) {
  keypoints.forEach(keypoint => {
    if (keypoint.score >= minConfidence) {
      const {x, y} = keypoint.position
      canvasContext.beginPath()
      canvasContext.arc(x * scale, y * scale, pointRadius, 0, 2 * Math.PI)
      canvasContext.fillStyle = skeletonColor
      canvasContext.fill()
    }
  })
}

function drawSegment(
  [firstX, firstY],
  [nextX, nextY],
  color,
  lineWidth,
  scale,
  canvasContext
) {
  canvasContext.beginPath()
  canvasContext.moveTo(firstX * scale, firstY * scale)
  canvasContext.lineTo(nextX * scale, nextY * scale)
  canvasContext.lineWidth = lineWidth
  canvasContext.strokeStyle = color
  canvasContext.stroke()
}

export function drawSkeleton(
  keypoints,
  minConfidence,
  color,
  lineWidth,
  canvasContext,
  scale = 1
) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  )

  adjacentKeyPoints.forEach(keypoints => {
    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      color,
      lineWidth,
      scale,
      canvasContext
    )
  })
}

export function drawStretch(
  keypointA,
  keypointB,
  keypointC,
  color,
  lineWidth,
  canvasContext,
  scale = 1
) {
  drawSegment(
    toTuple(keypointA.position),
    toTuple(keypointB.position),
    color,
    lineWidth,
    scale,
    canvasContext
  )

  drawSegment(
    toTuple(keypointB.position),
    toTuple(keypointC.position),
    color,
    lineWidth,
    scale,
    canvasContext
  )
}

function find_angle(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2))
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2))
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2))

  return (
    Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180 / Math.PI
  )
}

export function calculateStretch(poses) {
  let pose = poses[0]
  //let nose = pose['keypoints'][0]
  //let leftWrist = pose['keypoints'][9]
  //let rightWrist = pose['keypoints'][10]

  let rightShoulder = pose['keypoints'][6]
  let leftShoulder = pose['keypoints'][5]
  let rightHip = pose['keypoints'][12]
  let leftHip = pose['keypoints'][11]
  let rightKnee = pose['keypoints'][14]
  let leftKnee = pose['keypoints'][13]
  let rightAnkle = pose['keypoints'][16]
  let leftAnkle = pose['keypoints'][15]

  let statusLeft = false
  let statusRight = false

  let leftAngleA = 0
  let rightAngleA = 0
  let leftAngleB = 0
  let rightAngleB = 0

  if (
    rightShoulder.score > 0.5 &&
    rightHip.score > 0.5 &&
    rightKnee.score > 0.5 &&
    rightAnkle.score > 0.5
  ) {
    statusRight = true

    rightAngleA = find_angle(
      rightAnkle.position,
      rightKnee.position,
      rightHip.position
    )
    rightAngleB = find_angle(
      rightShoulder.position,
      rightHip.position,
      rightKnee.position
    )
  } else if (
    leftShoulder.score > 0.5 &&
    leftHip.score > 0.5 &&
    leftKnee.score > 0.5 &&
    leftAnkle.score > 0.5
  ) {
    statusLeft = true

    leftAngleA = find_angle(
      leftAnkle.position,
      leftKnee.position,
      leftHip.position
    )
    leftAngleB = find_angle(
      leftShoulder.position,
      leftHip.position,
      leftKnee.position
    )
  } else {
    statusLeft = false
    statusRight = false
  }

  // let status = false
  // let angle
  // if ((nose.score > 0.5) && (leftWrist.score > 0.5) && (rightWrist.score > 0.5)) {

  //   angle = find_angle(leftWrist.position, nose.position, rightWrist.position)

  //   status = true

  // }

  // return [status, angle, leftWrist, nose, rightWrist]

  let status = [statusLeft, statusRight]
  let angles = [leftAngleA, leftAngleB, rightAngleA, rightAngleB]
  let positionsLeft = [leftShoulder, leftHip, leftKnee, leftAnkle]
  let positionsRight = [rightShoulder, rightHip, rightKnee, rightAnkle]

  return [status, angles, positionsLeft, positionsRight]
}
