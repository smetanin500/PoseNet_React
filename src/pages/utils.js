const pointRadius = 3

export const config = {
  flipHorizontal: true,
  algorithm: 'single-pose',
  showVideo: true,
  showSkeleton: true,
  showPoints: true,
  minPoseConfidence: 0.1,
  skeletonColor: '#ffadea',
  skeletonLineWidth: 6,
  loadingText: 'Loading...please be patient...'
}

function toTuple({x, y}) {
  return [x, y]
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

export function drawStretchWithTwoPoints(
  keypointA,
  keypointB,
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
}

export function drawKeyPoints(
  keypoints,
  minConfidence,
  skeletonColor,
  canvasContext,
  scale = 1,
) {
  keypoints.forEach(keypoint => {
    if (keypoint.score >= minConfidence)
    {
      const {x, y} = keypoint.position
      canvasContext.beginPath()
      canvasContext.arc(x * scale, y * scale, pointRadius, 0, 2 * Math.PI)
      // canvasContext.font = 'bold 10px serif'
      // canvasContext.fillText(keypoint.position.y, x * scale+10, y * scale+10)
      canvasContext.fillStyle = skeletonColor
      canvasContext.fill()
    }
  })
}


export function drawTwineStretchData(leftHip, leftHipBind, gradeOfAssessment, result) {
  if (result === "too bad to be the truth") {
    if ((leftHip > (leftHipBind + gradeOfAssessment)) && (leftHip < (leftHipBind + 2*gradeOfAssessment))) 
    {
      result = "you can better";
      return result;
    }
    if ((leftHip > (leftHipBind + 2*gradeOfAssessment)) && (leftHip < (leftHipBind + 3*gradeOfAssessment))) 
    {
      result = "keep up the good work";
      return result;
    }
    if ((leftHip > (leftHipBind + 3*gradeOfAssessment)) && (leftHip < (leftHipBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftHip > (leftHipBind + 4*gradeOfAssessment)) && (leftHip < (leftHipBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftHip > (leftHipBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "you can better") {
    if ((leftHip > (leftHipBind + 2*gradeOfAssessment)) && (leftHip < (leftHipBind + 3*gradeOfAssessment))) 
    {
      result = "keep up the good work";
      return result;
    }
    if ((leftHip > (leftHipBind + 3*gradeOfAssessment)) && (leftHip < (leftHipBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftHip > (leftHipBind + 4*gradeOfAssessment)) && (leftHip < (leftHipBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftHip > (leftHipBind + 5*gradeOfAssessment))
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "keep up the good work") {
    if ((leftHip > (leftHipBind + 3*gradeOfAssessment)) && (leftHip < (leftHipBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftHip > (leftHipBind + 4*gradeOfAssessment)) && (leftHip < (leftHipBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftHip > (leftHipBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "well done") {
    if ((leftHip > (leftHipBind + 4*gradeOfAssessment)) && (leftHip < (leftHipBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftHip > (leftHipBind + 5*gradeOfAssessment))
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "awesome") {
    if (leftHip > (leftHipBind + 5*gradeOfAssessment))
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "outstanding") {
    result = "outstanding";
    return result;
  }
}

export function drawBackTiltStretchData(leftShoulder, leftShoulderBind, gradeOfAssessment, result) {
  if (result === "too bad to be the truth") {
    if ((leftShoulder > (leftShoulderBind + gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 2*gradeOfAssessment))) 
    {
      result = "you can better";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 2*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 3*gradeOfAssessment))) 
    {
      result = "keep up the good work";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 3*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 4*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftShoulder > (leftShoulderBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "you can better") {
    if ((leftShoulder > (leftShoulderBind + 2*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 3*gradeOfAssessment))) 
    {
      result = "keep up the good work";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 3*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 4*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftShoulder > (leftShoulderBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "keep up the good work") {
    if ((leftShoulder > (leftShoulderBind + 3*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 4*gradeOfAssessment))) 
    {
      result = "well done";
      return result;
    }
    if ((leftShoulder > (leftShoulderBind + 4*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftShoulder > (leftShoulderBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "well done") {
    if ((leftShoulder > (leftShoulderBind + 4*gradeOfAssessment)) && (leftShoulder < (leftShoulderBind + 5*gradeOfAssessment))) 
    {
      result = "awesome";
      return result;
    }
    if (leftShoulder > (leftShoulderBind + 5*gradeOfAssessment)) 
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "awesome") {
    if (leftShoulder > (leftShoulderBind + 5*gradeOfAssessment))  
    {
      result = "outstanding";
      return result;
    }
    return result;
  }
  if (result === "outstanding") {
    result = "outstanding";
    return result;
  }
}



export function drawStretchData(elbowPosition, hipPosition, gradeOfAssessment, result) {
    if (result === "too bad to be the truth") {
      if ((elbowPosition > (hipPosition + gradeOfAssessment)) && (elbowPosition < (hipPosition + 2*gradeOfAssessment))) 
      {
        result = "you can better";
        return result;
      }
      if ((elbowPosition > (hipPosition + 2*gradeOfAssessment)) && (elbowPosition < (hipPosition + 3*gradeOfAssessment))) 
      {
        result = "keep up the good work";
        return result;
      }
      if ((elbowPosition > (hipPosition + 3*gradeOfAssessment)) && (elbowPosition < (hipPosition + 4*gradeOfAssessment))) 
      {
        result = "well done";
        return result;
      }
      if ((elbowPosition > (hipPosition + 4*gradeOfAssessment)) && (elbowPosition < (hipPosition + 5*gradeOfAssessment))) 
      {
        result = "awesome";
        return result;
      }
      if (elbowPosition > (hipPosition + 5*gradeOfAssessment)) 
      {
        result = "outstanding";
        return result;
      }
      return result;
    }
    if (result === "you can better") {
      if ((elbowPosition > (hipPosition + 2*gradeOfAssessment)) && (elbowPosition < (hipPosition + 3*gradeOfAssessment))) 
      {
        result = "keep up the good work";
        return result;
      }
      if ((elbowPosition > (hipPosition + 3*gradeOfAssessment)) && (elbowPosition < (hipPosition + 4*gradeOfAssessment))) 
      {
        result = "well done";
        return result;
      }
      if ((elbowPosition > (hipPosition + 4*gradeOfAssessment)) && (elbowPosition < (hipPosition + 5*gradeOfAssessment))) 
      {
        result = "awesome";
        return result;
      }
      if (elbowPosition > (hipPosition + 5*gradeOfAssessment)) 
      {
        result = "outstanding";
        return result;
      }
      return result;
    }
    if (result === "keep up the good work") {
      if ((elbowPosition > (hipPosition + 3*gradeOfAssessment)) && (elbowPosition < (hipPosition + 4*gradeOfAssessment))) 
      {
        result = "well done";
        return result;
      }
      if ((elbowPosition > (hipPosition + 4*gradeOfAssessment)) && (elbowPosition < (hipPosition + 5*gradeOfAssessment))) 
      {
        result = "awesome";
        return result;
      }
      if (elbowPosition > (hipPosition + 5*gradeOfAssessment)) 
      {
        result = "outstanding";
        return result;
      }
      return result;
    }
    if (result === "well done") {
      if ((elbowPosition > (hipPosition + 4*gradeOfAssessment)) && (elbowPosition < (hipPosition + 5*gradeOfAssessment))) 
      {
        result = "awesome";
        return result;
      }
      if (elbowPosition > (hipPosition + 5*gradeOfAssessment)) 
      {
        result = "outstanding";
        return result;
      }
      return result;
    }
    if (result === "awesome") {
      if (elbowPosition > (hipPosition + 5*gradeOfAssessment))  
      {
        result = "outstanding";
        return result;
      }
      return result;
    }
    if (result === "outstanding") {
      result = "outstanding";
      return result;
    }
}