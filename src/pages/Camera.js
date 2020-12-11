import {
  drawKeyPoints,
  drawTwineStretchData,
  drawBackTiltStretchData,
  drawStretchData
} from './utils'
import React, {Component} from 'react'
import { MDBBtn, MDBRow, MDBCol, MDBEdgeHeader, MDBCardBody, MDBContainer} from "mdbreact"
import * as posenet from '@tensorflow-models/posenet'
const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);
import swal from 'sweetalert'



var intervalId = 0;
var Width =0;
var Height =0;
if (isMobile)
{
  Width = window.screen.width-window.screen.height/100*1;
  Height = window.screen.height-window.screen.height/100*25;
}
else
{
  Width = 900;
  Height = 700;
}

class PoseNet extends Component {
  static defaultProps = {
    videoWidth: Width,
    videoHeight: Height,
    flipHorizontal: true,
    algorithm: 'single-pose',
    showVideo: true,
    showSkeleton: true,
    showPoints: true,
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
    maxPoseDetections: 2,
    nmsRadius: 20,
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
      PreviousPoses: [],
      ForwardTilt: false,
      OnDoingExercise: false,
      BackTilt: false,
      leftShoulderBind: undefined,
      leftHipBind: undefined,
      // leftKneeBind: undefined,
      // leftAnkleBind: undefined,
      gradeOfAssessment: undefined,
      Result: "too bad to be the truth",
      stopVideo: false,
      ruleOfExersice: 0,
      ProverkaCenter: false,
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
      this.posenet = await posenet.load();
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
        width: {min : 640},
        height: {min : 480}
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
      flipHorizontal,
      minPoseConfidence,
      minPartConfidence,
      videoWidth,
      videoHeight,
      showVideo,
      showPoints,
      skeletonColor,
    } = this.props

    const posenetModel = this.posenet
    const video = this.video

    const findPoseDetectionFrame = async () => {
      let poses = []
        switch (algorithm) {
          case 'single-pose': {
            const pose = await posenetModel.estimateSinglePose(
              video,
              {
                outputStride: 16,
                //imageScaleFactor: 1.00,
                flipHorizontal,
              }
            )
            poses.push(pose)
            break
          }
          default:
            break;
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

          if (this.state.ForwardTilt)
          {            
            if (!this.state.ProverkaCenter)
            {
              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                  swal('Вcтаньте прямо перед экраном, в полный рост, левым боком. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                this.setState({ruleOfExersice : 1})
              }              
              let pose = poses[0]
              let leftShoulder = pose['keypoints'][5]
              let leftHip = pose['keypoints'][11]
              let leftKnee = pose['keypoints'][13]
              let leftAnkle = pose['keypoints'][15]
              if (leftShoulder.score > 0.7 &&
                leftHip.score > 0.7 &&
                leftKnee.score > 0.7 &&
                leftAnkle.score > 0.7
              ) 
              {
                if ((leftShoulder.position.x < (Width/2+20) && leftShoulder.position.x > (Width/2-20)) &&
                (leftAnkle.position.x < (Height-100)))
                {
                  this.setState({leftHipBind: leftHip});
                  this.setState({ProverkaCenter: true});
                  this.setState({gradeOfAssessment: (leftAnkle.position.y - leftHip.position.y)/6});
                }
              }
            }
            else
            {
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              let pose = poses[0]
              let leftElbow = pose['keypoints'][7]

      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawStretchData(leftElbow.position.y, this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)                
              }
              else
              {
                let result = drawStretchData(leftElbow.position.y, this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 10, 90)  
              }
            }
          }

          if (this.state.Twine)
          {
            if (!this.state.ProverkaCenter)
            {
              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                  swal('Вcтаньте прямо перед экраном, в полный рост. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                this.setState({ruleOfExersice : 1})
              }              
              let pose = poses[0]
              let leftShoulder = pose['keypoints'][5]
              let rightShoulder = pose['keypoints'][6]
              let leftHip = pose['keypoints'][11]
              let rightHip = pose['keypoints'][12]
              let leftKnee = pose['keypoints'][13]
              let rightKnee = pose['keypoints'][14]
              let leftAnkle = pose['keypoints'][15]
              let rightAnkle = pose['keypoints'][16]
              if (leftShoulder.score > 0.7 &&
                leftHip.score > 0.7 &&
                leftKnee.score > 0.7 &&
                leftAnkle.score > 0.7 &&
                rightShoulder.score > 0.7 &&
                rightHip.score > 0.7 &&
                rightKnee.score > 0.7 &&
                rightAnkle.score > 0.7
              ) 
              {
                if (((leftShoulder.position.x + rightShoulder.position.x - leftShoulder.position.x) < (Width/2+20) && 
                  (leftShoulder.position.x + rightShoulder.position.x - leftShoulder.position.x) > (Width/2-20)) &&
                (leftAnkle.position.y < (Height-100)) && (rightAnkle.position.y < (Height-100)))
                {
                  this.setState({leftHipBind: leftHip});
                  this.setState({gradeOfAssessment: (leftAnkle.position.y - leftHip.position.y)/6});
                  this.setState({ProverkaCenter: true});
                }
              }
            }
            else
            {
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              let pose = poses[0]
              let leftHip = pose['keypoints'][11]
      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawTwineStretchData(leftHip.position.y ,this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)                
              }
              else
              {
                let result = drawTwineStretchData(leftHip.position.y ,this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 10, 90)  
              }
            }
          }

          if (this.state.BackTilt)
          {
            if (!this.state.ProverkaCenter)
            {
              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                  swal('Вcтаньте на колени, в полный рост, левым боком перед экраном. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                this.setState({ruleOfExersice : 1})
              }              
              let pose = poses[0]
              let leftShoulder = pose['keypoints'][5]
              let leftHip = pose['keypoints'][11]
              let leftKnee = pose['keypoints'][13]
              let leftAnkle = pose['keypoints'][15]
              let rightAnkle = pose['keypoints'][16]
              if (leftShoulder.score > 0.7 &&
                leftHip.score > 0.7 &&
                leftKnee.score > 0.7
              ) 
              {
                if ((leftShoulder.position.x< (Width/2+50)) && 
                  (leftShoulder.position.x > (Width/2-50)) &&
                (leftKnee.position.x < (Height-100)) &&
                (
                  ((leftAnkle.position.y < (leftKnee.position.y+20)) && (leftAnkle.position.y > (leftKnee.position.y-20))) || 
                ((rightAnkle.position.y < (leftKnee.position.y+20)) && (rightAnkle.position.y > (leftKnee.position.y-20)))
                ))
                {
                  this.setState({leftShoulderBind: leftShoulder});
                  this.setState({gradeOfAssessment: (leftHip.position.y - leftShoulder.position.y)/6});
                  this.setState({ProverkaCenter: true});
                }
              }
            }
            else
            {
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              let pose = poses[0]
              let leftShoulder = pose['keypoints'][5]
      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawBackTiltStretchData(leftShoulder.position.y ,this.state.leftShoulderBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)                
              }
              else
              {
                let result = drawBackTiltStretchData(leftShoulder.position.y ,this.state.leftShoulderBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                console.log(result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 10, 90)  
              }
            }
          }
        }
        this.forceUpdate()
        requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame()
  }

  ChangeState = nr => () => {
    this.setState({
      "timeinsec" : 10
    })
    this.setState({ProverkaCenter: false})
    this.setState({leftHipBind: undefined})
    // this.setState({leftKneeBind: undefined})
    // this.setState({leftAnkleBind: undefined})
    this.setState({leftShoulderBind: undefined})
    this.setState({Result: "too bad to be the truth"})
    this.setState({gradeOfAssessment: undefined})
    this.setState({ruleOfExersice: 0})
    if (nr === "OnDoingExercise" && this.state[nr] === true)
    {
      this.setState({PreviousPoses : []});
      clearInterval(intervalId);
      intervalId = 0;
      this.setState({
          "stopVideo" : false
      })
        this.setState({
          "Twine" : false
      })
        this.setState({
          "ForwardTilt" : false
      })
        this.setState({
          "BackTilt" : false
      })
      this.setState({
        [nr] : false
      })
    }

    if (nr !== "OnDoingExercise")
    {
      if (nr === "Repeat")
      {
        this.setState({PreviousPoses : []});
        clearInterval(intervalId);
        intervalId = 0;
        this.setState({
          "stopVideo" : false
        })
        //intervalId = setInterval(() => this.tick(), 1000)
      }
      else
      {
        this.setState({
          "OnDoingExercise" : true
        })
        this.setState({
          [nr] : true
        })
        //intervalId = setInterval(() => this.tick(), 1000)
      }
    }
};


  render() {

    
    return ( 
      <>  


{!isMobile && <MDBEdgeHeader color='indigo darken-3' className='sectionPage' />}
          {!isMobile &&<MDBContainer>
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
                        <video id="videoNoShow" playsInline ref={this.getVideo} />
                        <canvas  className="webcam" ref={this.getCanvas} />                  
                  </MDBRow>
                  <MDBRow center>
                        {this.state.OnDoingExercise === false &&<MDBRow center>
                        <MDBRow center><MDBCol size="3" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("ForwardTilt")}>Складка</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="3" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("Twine")}>Разножка</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="5" className='text-center'> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("BackTilt")}>Наклон назад</MDBBtn> 
                        </MDBCol></MDBRow>
                        </MDBRow>}
                      {this.state.OnDoingExercise &&<MDBRow center>
                        <MDBRow center><MDBCol size="3"> 
                          <MDBBtn color="red" onClick = {this.ChangeState("Repeat")}>Повторить</MDBBtn> 
                        </MDBCol>
                        <MDBCol size="2"> 
                          
                        </MDBCol>
                        <MDBCol size="7"> 
                          <MDBBtn color='indigo' onClick = {this.ChangeState("OnDoingExercise")}>Закончить упражнение</MDBBtn> 
                        </MDBCol></MDBRow>
                      </MDBRow>}
                  </MDBRow>
                </MDBCardBody>
              </MDBCol>
            </MDBRow>
        </MDBContainer>}

        
      
      {isMobile &&<MDBContainer>
              <MDBCol>
                  <MDBRow className='d-flex flex-row justify-content-center row'>
                  <video id="videoNoShow" width = {Width} height = {Height} playsInline ref={this.getVideo}/>
                        <canvas  className="webcam" width = {Width} height = {Height} ref={this.getCanvas} />
                  </MDBRow>
                  <MDBRow center>
                        {this.state.OnDoingExercise === false &&<MDBRow center>
                        <MDBRow center> 
                          <MDBBtn size='sm' color='indigo' onClick = {this.ChangeState("ForwardTilt")}>Складка</MDBBtn>            
                          <MDBBtn size='sm' color='indigo' onClick = {this.ChangeState("Twine")}>Разножка</MDBBtn>                   
                          <MDBBtn size='sm' color='indigo' onClick = {this.ChangeState("BackTilt")}>Наклон назад</MDBBtn> 
                        </MDBRow>
                        </MDBRow>}
                      {this.state.OnDoingExercise &&<MDBRow center>
                        <MDBRow center> 
                          <MDBBtn size='sm' color="red" onClick = {this.ChangeState("Repeat")}>Повторить</MDBBtn>            
                          <MDBBtn size='sm' color='indigo' onClick = {this.ChangeState("OnDoingExercise")}>Закончить упражнение</MDBBtn>                   
                        </MDBRow>
                      </MDBRow>}
                  </MDBRow>
              </MDBCol>
        </MDBContainer>}
      </>    
    )
  }
}

export default PoseNet