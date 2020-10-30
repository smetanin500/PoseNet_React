import {
  drawKeyPoints,
  calculateStretch,
  calculateBackTiltStretch,
  calculateTwineStretch,
  drawStretch,
  drawStretchWithTwoPoints
} from './utils'
import React, {Component} from 'react'
import { MDBBtn, MDBRow, MDBCol, MDBEdgeHeader, MDBCardBody, MDBContainer} from "mdbreact"
import * as posenet from '@tensorflow-models/posenet'

var intervalId = 0;


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
      stretchData: [[false, false]],
      stretchBackTiltData: [[false, false]],
      stretchTwineData: [[false]],
      Twine: false,
      ForwardTilt: false,
      OnDoingExercise: false,
      BackTilt: false,
      stopVideo: false,
      screenshot: null,
      Repeat: false,
      timeinsec: 10
    }
  }

  getCanvas = elem => {
    this.canvas = elem
  }

  getVideo = elem => {
    this.video = elem
  }

  tick() {
    this.setState({
      timeinsec: this.state.timeinsec - 1
    })
    if (this.state.timeinsec === -1)
    {
      this.setState({stopVideo : true})
      clearInterval(intervalId);
      intervalId = 0;
    }
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
    setTimeout(this.writeStrecthResult, 5000)
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
      skeletonColor,
      skeletonLineWidth
    } = this.props

    const posenetModel = this.posenet
    const video = this.video

    const findPoseDetectionFrame = async () => {
      let poses = []
        switch (algorithm) {
          case 'multi-pose': {
            // const net = await posenet.load();
 
            // const poses = await net.estimateMultiplePoses(image, {
            //   flipHorizontal: false,
            //   maxDetections: 5,
            //   scoreThreshold: 0.5,
            //   nmsRadius: 20
            // });
            break
          }
          case 'single-pose': {
            const pose = await posenetModel.estimateSinglePose(
              video,
              {imageScaleFactor,
              flipHorizontal,
              outputStride}
            )
            poses.push(pose)
            break
          }
        }
        if (!this.state.stopVideo)
        {
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
            }
          })

          if (this.state.Twine)
          {

            this.state.stretchTwineData = calculateTwineStretch(poses)

            if (this.state.stretchTwineData[0])
            {
                drawStretchWithTwoPoints(
                  this.state.stretchTwineData[2][0],
                  this.state.stretchTwineData[2][2],
                  skeletonColor,
                  skeletonLineWidth,
                  canvasContext
                )
        
                drawStretchWithTwoPoints(
                  this.state.stretchTwineData[2][1],
                  this.state.stretchTwineData[2][0],
                  skeletonColor,
                  skeletonLineWidth,
                  canvasContext
                )
        
                drawStretchWithTwoPoints(
                  this.state.stretchTwineData[2][3],
                  this.state.stretchTwineData[2][1],
                  skeletonColor,
                  skeletonLineWidth,
                  canvasContext
                )
              }

              canvasContext.font = '48px serif'
              canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              canvasContext.fillText('Растяжка = ' + this.drawTwineStretchData(), 50, 200)
              if (this.state.stretchTwineData[0])
              {
                canvasContext.fillText(this.state.stretchTwineData[1][0], 50, 300)
                canvasContext.fillText(this.state.stretchTwineData[1][1], 50, 400)
              }            
          }

          if (this.state.BackTilt)
          {
            this.state.stretchBackTiltData = calculateBackTiltStretch(poses)

            if (this.state.stretchBackTiltData[0][0]) {
              drawStretch(
                this.state.stretchBackTiltData[2][0],
                this.state.stretchBackTiltData[2][1],
                this.state.stretchBackTiltData[2][2],
                skeletonColor,
                skeletonLineWidth,
                canvasContext
              )
            }

            if (this.state.stretchBackTiltData[0][1]) {
              drawStretch(
                this.state.stretchBackTiltData[3][0],
                this.state.stretchBackTiltData[3][1],
                this.state.stretchBackTiltData[3][2],
                skeletonColor,
                skeletonLineWidth,
                canvasContext
              )
            }

            canvasContext.font = '48px serif'
            canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
            canvasContext.fillText('Растяжка = ' + this.drawBackTiltStretchData(), 50, 200)

            if (this.state.stretchBackTiltData[0][0])
              {
                canvasContext.fillText(this.state.stretchBackTiltData[1][0], 50, 300)
              } 
            if (this.state.stretchBackTiltData[0][1])
              {
                canvasContext.fillText(this.state.stretchBackTiltData[1][1], 50, 400)
              } 
          }
          

          if (this.state.ForwardTilt)
          {
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

            canvasContext.font = '48px serif'
            canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
            canvasContext.fillText('Растяжка = ' + this.drawStretchData(), 50, 200)
          }
        }
        this.forceUpdate()
        requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame()
  }


  drawTwineStretchData() {
    if (this.state.stretchTwineData[0]) {
      let stretchResultString = ''
      let leftAngleHip = this.state.stretchTwineData[1][0]
      let rightAngleHip = this.state.stretchTwineData[1][1]
      let res = 0;

      if ((leftAngleHip <=130 && rightAngleHip <=120) || (rightAngleHip <=130 && leftAngleHip <=120) )
        res = 0
      else if ((leftAngleHip <= 160 && leftAngleHip > 110 && rightAngleHip <= 150 && rightAngleHip > 120) 
                || (rightAngleHip <= 160 && rightAngleHip > 110 && leftAngleHip <= 150 && leftAngleHip > 120))
        res = 1
      else if ((leftAngleHip <= 180 && leftAngleHip > 140 && rightAngleHip <= 170 && rightAngleHip > 150)
                || (rightAngleHip <= 180 && rightAngleHip > 140 && leftAngleHip <= 170 && leftAngleHip > 150))
        res = 2
      else if ((leftAngleHip <= 180 && leftAngleHip > 160 && rightAngleHip <= 180 && rightAngleHip > 170)
                || (rightAngleHip <= 180 && rightAngleHip > 160 && leftAngleHip <= 180 && leftAngleHip > 170))
        res = 3


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
      return stretchResultString
    }
  }

  drawBackTiltStretchData() {
    if (this.state.stretchBackTiltData[0][0]) {
      console.log("left")
      let stretchResultString = ''
      let leftAngleHip = this.state.stretchBackTiltData[1][0]

      let res

      if (leftAngleHip > 135) res = 0
      if ((leftAngleHip <= 135) && (leftAngleHip >= 120)) res = 1
      if ((leftAngleHip <= 120) && (leftAngleHip >= 85)) res = 2
      if (leftAngleHip <= 85) res = 3

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

      return stretchResultString
    }

    if (this.state.stretchBackTiltData[0][1]) {
      console.log("right")
      let stretchResultString = ''
      let rightAngleHip = this.state.stretchBackTiltData[1][1]

      let res

      if (rightAngleHip > 135) res = 0
      if ((rightAngleHip <= 135) && (rightAngleHip >= 120)) res = 1
      if ((rightAngleHip <= 120) && (rightAngleHip >= 85)) res = 2
      if (rightAngleHip <= 85) res = 3

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

      return stretchResultString
    }
  }



  drawStretchData() {
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

      return stretchResultString
    }
  }

  ChangeState = nr => () => {
    console.log(this.state.stopCalc)
    this.setState({
      ["timeinsec"] : 10
    })
    if (nr === "OnDoingExercise" && this.state[nr] === true)
    {
      clearInterval(intervalId);
      intervalId = 0;
      this.setState({
          ["stopVideo"] : false
      })
        this.setState({
          ["Twine"] : false
      })
        this.setState({
          ["ForwardTilt"] : false
      })
        this.setState({
          ["BackTilt"] : false
      })
      this.setState({
        [nr] : false
      })
    }

    if (nr !== "OnDoingExercise")
    {
      if (nr === "Repeat")
      {
        clearInterval(intervalId);
        intervalId = 0;
        this.setState({
          ["stopVideo"] : false
        })
        intervalId = setInterval(() => this.tick(), 1000)
      }
      else
      {
        this.setState({
          ["OnDoingExercise"] : true
        })
        this.setState({
          [nr] : true
        })
        intervalId = setInterval(() => this.tick(), 1000)
      }
    }
};


  render() {

    
    return ( 
      <>  
      <MDBEdgeHeader color='indigo darken-3' className='sectionPage' />   
        <MDBContainer>
            <MDBRow>
              <MDBCol
                md='10'
                className='mx-auto float-none white z-depth-1 py-2 px-2'
              >
                <MDBCardBody className='text-center'>
                  <p className='pb-4'>
                    Направте камеру на себя под прямым углом. Вас должно быть видно в полный рост.
                  </p>
                  <MDBRow className='d-flex flex-row justify-content-center row'>
                        <video id="videoNoShow" playsInline ref={this.getVideo}/>
                        <canvas  className="webcam" ref={this.getCanvas} />
                  </MDBRow>
                  <MDBRow center>
                        {this.state.OnDoingExercise === false &&<MDBRow center>
                        <MDBCol size="3" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("ForwardTilt")}>Складка</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="3" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("Twine")}>Разножка</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="5" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("BackTilt")}>Наклон назад</MDBBtn> 
                        </MDBCol>
                      </MDBRow>}
                      {this.state.OnDoingExercise &&<MDBRow center>
                        <MDBCol size="3"> 
                          <MDBBtn color="red" onClick = {this.ChangeState("Repeat")}>Повторить</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="2"> 
                          
                        </MDBCol>
                        <MDBCol size="7"> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("OnDoingExercise")}>Закончить упражнение</MDBBtn> 
                        </MDBCol>
                      </MDBRow>}
                  </MDBRow>
                </MDBCardBody>
              </MDBCol>
            </MDBRow>
        </MDBContainer>
      </>    
    )
  }
}

export default PoseNet
