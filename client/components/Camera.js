import {
  drawKeyPoints,
  drawSkeleton,
  calculateStretch,
  drawStretch
} from './utils'
import React, {Component} from 'react'
import * as posenet from '@tensorflow-models/posenet'

class PoseNet extends Component {
  static defaultProps = {
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

  constructor(props) {
    super(props, PoseNet.defaultProps)

    this.state = {
      stretchData: [[false, false]]
    }
  }

  getCanvas = elem => {
    this.canvas = elem
  }

  getVideo = elem => {
    this.video = elem
  }

  async componentDidMount() {
    try {
      await this.setupCamera()
    } catch (error) {
      throw new Error(
        'This browser does not support video capture, or this device does not have a camera'
      )
    }

    try {
      this.posenet = await posenet.load()
    } catch (error) {
      throw new Error('PoseNet failed to load')
    } finally {
      setTimeout(() => {
        this.setState({loading: false})
      }, 200)
    }

    this.detectPose()
  }

  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      )
    }
    const {videoWidth, videoHeight} = this.props
    const video = this.video
    video.width = videoWidth
    video.height = videoHeight

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: 'user',
        width: videoWidth,
        height: videoHeight
      }
    })

    video.srcObject = stream

    return new Promise(resolve => {
      video.onloadedmetadata = () => {
        video.play()
        resolve(video)
      }
    })
  }

  detectPose() {
    const {videoWidth, videoHeight} = this.props
    const canvas = this.canvas
    const canvasContext = canvas.getContext('2d')

    canvas.width = videoWidth
    canvas.height = videoHeight

    this.poseDetectionFrame(canvasContext)
  }

  poseDetectionFrame(canvasContext) {
    const {
      algorithm,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      minPoseConfidence,
      minPartConfidence,
      maxPoseDetections,
      nmsRadius,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      showSkeleton,
      skeletonColor,
      skeletonLineWidth
    } = this.props

    const posenetModel = this.posenet
    const video = this.video

    const findPoseDetectionFrame = async () => {
      let poses = []

      switch (algorithm) {
        case 'multi-pose': {
          poses = await posenetModel.estimateMultiplePoses(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride,
            maxPoseDetections,
            minPartConfidence,
            nmsRadius
          )
          break
        }
        case 'single-pose': {
          const pose = await posenetModel.estimateSinglePose(
            video,
            imageScaleFactor,
            flipHorizontal,
            outputStride
          )
          poses.push(pose)
          break
        }
      }

      canvasContext.clearRect(0, 0, videoWidth, videoHeight)

      if (showVideo) {
        canvasContext.save()
        canvasContext.scale(-1, 1)
        canvasContext.translate(-videoWidth, 0)
        canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
        canvasContext.restore()
      }

      poses.forEach(({score, keypoints}) => {
        if (score >= minPoseConfidence) {
          if (showPoints) {
            drawKeyPoints(
              keypoints,
              minPartConfidence,
              skeletonColor,
              canvasContext
            )
          }
          if (showSkeleton) {
            // drawSkeleton(
            //   keypoints,
            //   minPartConfidence,
            //   skeletonColor,
            //   skeletonLineWidth,
            //   canvasContext
            // )
            // drawStretch(
            //   this.state.stretchData[2],
            //   this.state.stretchData[3],
            //   this.state.stretchData[4],
            //   skeletonColor,
            //   skeletonLineWidth,
            //   canvasContext
            // )
          }
        }
      })

      this.state.stretchData = calculateStretch(poses)

      if (this.state.stretchData[0][0]) {
        drawStretch(
          this.state.stretchData[2][0],
          this.state.stretchData[2][1],
          this.state.stretchData[2][2],
          skeletonColor,
          skeletonLineWidth,
          canvasContext
        )

        drawStretch(
          this.state.stretchData[2][1],
          this.state.stretchData[2][2],
          this.state.stretchData[2][3],
          skeletonColor,
          skeletonLineWidth,
          canvasContext
        )
      }

      if (this.state.stretchData[0][1]) {
        drawStretch(
          this.state.stretchData[3][0],
          this.state.stretchData[3][1],
          this.state.stretchData[3][2],
          skeletonColor,
          skeletonLineWidth,
          canvasContext
        )

        drawStretch(
          this.state.stretchData[3][1],
          this.state.stretchData[3][2],
          this.state.stretchData[3][3],
          skeletonColor,
          skeletonLineWidth,
          canvasContext
        )
      }

      // if (this.state.stretchData[0]) {
      //   drawStretch(
      //     this.state.stretchData[2],
      //     this.state.stretchData[3],
      //     this.state.stretchData[4],
      //     skeletonColor,
      //     skeletonLineWidth,
      //     canvasContext
      //   )
      // }
      //console.log(this.state.stretchData[0], this.state.stretchData[1])
      this.forceUpdate()
      requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame()
  }

  drawStretchData() {
    //console.log(this.state.stretchData)
    if (this.state.stretchData[0][0]) {
      let stretchResultString = ''
      let angleA = this.state.stretchData[1][0]
      let angleB = this.state.stretchData[1][1]

      let resA
      let resB
      let res

      if (angleA < 45) resA = 0
      if (angleA >= 45 && angleA < 90) resA = 1
      if (angleA >= 90 && angleA < 135) resA = 2
      if (angleA >= 135) resA = 3

      if (angleB < 45) resB = 4
      if (angleB >= 45 && angleB < 90) resB = 3
      if (angleB >= 90 && angleB < 135) resB = 2
      if (angleB >= 135) resB = 1

      if (resA > resB) {
        res = resB
      } else {
        res = resA
      }

      switch (res) {
        case 0: {
          stretchResultString = 'bad'
          break
        }
        case 1: {
          stretchResultString = 'middle'
          break
        }
        case 2: {
          stretchResultString = 'good'
          break
        }
        case 3: {
          stretchResultString = 'excellent'
          break
        }
      }
      // if (this.state.stretchData[1] < 45) stretchResultString = 'плохая'
      // if ((this.state.stretchData[1] > 45) && (this.state.stretchData[1] < 90)) stretchResultString = 'средняя'
      // if (this.state.stretchData[1] > 90) stretchResultString = 'хорошая'
      // let result = stretchResultString
      // console.log("Растяжка ", stretchResultString)
      // return result

      return stretchResultString
    }

    if (this.state.stretchData[0][1]) {
      let stretchResultString = ''
      let angleA = this.state.stretchData[1][2]
      let angleB = this.state.stretchData[1][3]

      let resA
      let resB
      let res

      if (angleA < 45) resA = 0
      if (angleA >= 45 && angleA < 90) resA = 1
      if (angleA >= 90 && angleA < 135) resA = 2
      if (angleA >= 135) resA = 3

      if (angleB < 45) resB = 3
      if (angleB >= 45 && angleB < 90) resB = 2
      if (angleB >= 90 && angleB < 135) resB = 1
      if (angleB >= 135) resB = 0

      if (resA > resB) {
        res = resB
      } else {
        res = resA
      }

      switch (res) {
        case 0: {
          stretchResultString = 'bad'
          break
        }
        case 1: {
          stretchResultString = 'middle'
          break
        }
        case 2: {
          stretchResultString = 'good'
          break
        }
        case 3: {
          stretchResultString = 'excellent'
          break
        }
      }
      // if (this.state.stretchData[1] < 45) stretchResultString = 'плохая'
      // if ((this.state.stretchData[1] > 45) && (this.state.stretchData[1] < 90)) stretchResultString = 'средняя'
      // if (this.state.stretchData[1] > 90) stretchResultString = 'хорошая'
      // let result = stretchResultString
      // console.log("Растяжка ", stretchResultString)
      // return result

      return stretchResultString
    }
  }

  render() {
    return (
      <div>
        <div>
          <video id="videoNoShow" playsInline ref={this.getVideo} />
          <canvas className="webcam" ref={this.getCanvas} />
          <div> Stretching {this.drawStretchData()}</div>
        </div>
      </div>
    )
  }
}

export default PoseNet
