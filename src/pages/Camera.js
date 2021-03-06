import {
  drawKeyPoints,
  drawTwineStretchData,
  drawBackTiltStretchData,
  drawStretchData,
  drawStretchWithTwoPoints,
  drawCircle
} from './utils'
import React, {Component} from 'react'
import { MDBBtn, MDBRow, MDBCol, MDBEdgeHeader, MDBCardBody, MDBContainer} from "mdbreact"
import * as posenet from '@tensorflow-models/posenet';
const isMobile = /Mobile|webOS|BlackBerry|IEMobile|MeeGo|mini|Fennec|Windows Phone|Android|iP(ad|od|hone)/i.test(navigator.userAgent);
import swal from 'sweetalert'
import music from '../assets/videorecord.mp3'

var intervalId = 0;
var intervalPause = 1;
var Width =0;
var Height =0;
let siteShot = require("screenshot-site");
if (isMobile)
{
  Width = window.screen.width-window.screen.height/100*1;
  Height = window.screen.height-window.screen.height/100*26;
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
    skeletonColor: '#145aff',
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
      //PreviousPoses: [],
      ForwardTilt: false,
      poseEror: 0,
      OnDoingExercise: false,
      Stream: null,
      BackTilt: false,
      leftShoulderBind: undefined,
      leftHipBind: undefined,
      // leftKneeBind: undefined,
      leftAnkleBind: undefined,
      gradeOfAssessment: undefined,
      changeView: false,
      cameraMode: 'user',
      Result: "too bad to be the truth",
      stopVideo: false,
      ruleOfExersice: 0,
      ProverkaCenter: false,
      Repeat: false,
      timeinsec: 10,
      timeinsecForPause: 5,
      startPoseGraph: [],
      imgUrl:''
    }
    this.audio = new Audio(music);
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
      this.audio.play();
      this.setState({stopVideo : true})
      clearInterval(intervalId);
      intervalId = 0;
    }
  }

  tickPause() {
    this.setState({
      timeinsecForPause: this.state.timeinsecForPause - 1
    })
    if (this.state.timeinsecForPause === -1)
    {
      clearInterval(intervalPause);
      intervalPause = 1;
      this.setState({ruleOfExersice : 1})
    }
  }

  setStartPoseGraphPoints(canvasWidth, canvasHeight) {

    let maxX = canvasWidth
    let maxY = canvasHeight

    let point1 = {position: {x: Math.floor(maxX * 0.5), y: Math.floor(maxY * 0.2)}} // Центр головы. Радиус будет 10
    let point2 = {position: {x: Math.floor(maxX * 0.5), y: Math.floor(maxY * 0.3)}} // Соединение головы и туловища
    let point3 = {position: {x: Math.floor(maxX * 0.5), y: Math.floor(maxY * 0.35)}} // Соединение туловища и рук
    let point4 = {position: {x: Math.floor(maxX * 0.25), y: Math.floor(maxY * 0.6)}} // Правая кисть
    let point5 = {position: {x: Math.floor(maxX * 0.75), y: Math.floor(maxY * 0.6)}} // Левая кисть
    let point6 = {position: {x: Math.floor(maxX * 0.5), y: Math.floor(maxY * 0.65)}} // Соединение туловища и ног
    let point7 = {position: {x: Math.floor(maxX * 0.25), y: Math.floor(maxY * 0.9)}} // Правая стопа
    let point8 = {position: {x: Math.floor(maxX * 0.75), y: Math.floor(maxY * 0.9)}} // Левая стопа
     
    let points = [point1, point2, point3, point4, point5, point6, point7, point8]
    this.setState({startPoseGraph: points})
  }

  drawHumanSkeleton(color, lineWidth, canvas) {

    drawStretchWithTwoPoints(this.state.startPoseGraph[1],this.state.startPoseGraph[5],color,lineWidth,canvas) // Туловище
    drawStretchWithTwoPoints(this.state.startPoseGraph[2],this.state.startPoseGraph[3],color,lineWidth,canvas) // Правая рука
    drawStretchWithTwoPoints(this.state.startPoseGraph[2],this.state.startPoseGraph[4],color,lineWidth,canvas) // Левая рука
    drawStretchWithTwoPoints(this.state.startPoseGraph[5],this.state.startPoseGraph[6],color,lineWidth,canvas) // Правая нога
    drawStretchWithTwoPoints(this.state.startPoseGraph[5],this.state.startPoseGraph[7],color,lineWidth,canvas) // Левая нога

    let radius = this.state.startPoseGraph[1].position.y - this.state.startPoseGraph[0].position.y
    drawCircle(this.state.startPoseGraph[0],radius,color,lineWidth,canvas) // Голова
  }

  async ChangeCameraView ()  { 
    this.setState({changeView: true});
    let nr = "";
    if (this.state.cameraMode === 'user')
    {
      nr = 'environment'
      this.setState({"cameraMode" : 'environment'})
    }
    else 
    {
      nr = 'user'
      this.setState({"cameraMode" : 'user'})
    }
    await this.state.Stream.getTracks().forEach((track) => track.stop());
    
    try {
      await this.setupCamera(nr)
    } catch (error) {
      throw new Error(
        'This browser does not support video capture, or this device does not have a camera'
      )
    }

    return new Promise(resolve => {
      resolve(this.detectPose())
  })
  }

  async componentDidMount() {
    try {
      await this.setupCamera(this.state.cameraMode)
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
    return new Promise(resolve => {
        resolve(this.detectPose())
  
    })
    
  }

  async setupCamera(mode) {
    
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
        facingMode: mode,
        width: {min : 640},
        height: {min : 480}
      }
    })

    this.setState({Stream : stream})

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
    this.setStartPoseGraphPoints(canvas.width, canvas.height)
    this.poseDetectionFrame(canvasContext)
  }

  poseDetectionFrame(canvasContext) {
    const {
      algorithm,
      flipHorizontal,
      minPartConfidence,
      videoWidth,
      videoHeight,
      showVideo,
      skeletonColor,
      skeletonLineWidth
    } = this.props

    const posenetModel = this.posenet
    const video = this.video

    const findPoseDetectionFrame = async () => {
      let poses = []
        switch (algorithm) {
          case 'single-pose': {
            let horizotalF = true;
            if (this.state.cameraMode === 'user')
              horizotalF = true
            else
              horizotalF = false
            const pose = await posenetModel.estimateSinglePose(
              video,
              {
                outputStride: 16,
                //imageScaleFactor: 1.00,
                flipHorizontal: horizotalF,
              }
            )
            poses.push(pose)
            break
          }
          default:
            break;
        }
        if (this.state.stopVideo)
        {
          let resolution = Width+"x"+Height;
          siteShot.getUrl(resolution, 1, `jpeg`, `f0a47ca42910.ngrok.io/camera`)
        }
        if (!this.state.stopVideo)
        {
          canvasContext.clearRect(0, 0, videoWidth, videoHeight)

          if (showVideo) {
            canvasContext.save()
            if (this.state.cameraMode === 'user')
            {
              canvasContext.scale(-1, 1)
              canvasContext.translate(-videoWidth, 0)
            }
            canvasContext.drawImage(video, 0, 0, videoWidth, videoHeight)
            canvasContext.restore()
          }

          if (this.state.ForwardTilt)
          {
            let pose = poses[0]
            //let keypointsForwardTilt = [pose['keypoints'][5], pose['keypoints'][11], pose['keypoints'][13], pose['keypoints'][15], pose['keypoints'][7]]
            let keypointsForwardTilt = [ pose['keypoints'][7]]
            drawKeyPoints(
              keypointsForwardTilt,
              minPartConfidence,
              skeletonColor,
              canvasContext
            )            
            if (!this.state.ProverkaCenter)
            {
              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                {
                  swal('Вcтаньте прямо перед экраном, в полный рост, левым боком. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                  .then((value) => {
                    this.audio.play();
                    this.audio.pause();
                    intervalPause = setInterval(() => this.tickPause(), 1000)
                  });
                }
                this.setState({ruleOfExersice : -1})
              }              
              if (this.state.ruleOfExersice !== -1)
              {
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
                    this.setState({leftAnkleBind: leftAnkle});
                    this.setState({ProverkaCenter: true});
                    this.setState({gradeOfAssessment: (leftAnkle.position.y - leftHip.position.y)/6});
                    this.audio.play();   
                  }
                }
              }
            }
            else
            {
              drawStretchWithTwoPoints(
                this.state.leftHipBind,
                this.state.leftAnkleBind,
                skeletonColor,
                skeletonLineWidth,
                canvasContext
              )
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              //let pose = poses[0]
              let leftElbow = pose['keypoints'][7]

      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawStretchData(leftElbow.position.y, this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)
                canvasContext.fillText('Результат = ' + (leftElbow.position.y-this.state.leftHipBind.position.y), 50, 300)           
              }
              else
              {
                let result = drawStretchData(leftElbow.position.y, this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 10, 90) 
                canvasContext.fillText('Результат = ' + (leftElbow.position.y-this.state.leftHipBind.position.y), 10, 130)  
              }
            }
          }

          if (this.state.Twine)
          {
            let pose = poses[0]
            let keypointsForwardTilt = [pose['keypoints'][11], pose['keypoints'][13]]
            drawKeyPoints(
              keypointsForwardTilt,
              minPartConfidence,
              skeletonColor,
              canvasContext
            )      
            if (!this.state.ProverkaCenter)
            {
              this.drawHumanSkeleton(skeletonColor, skeletonLineWidth, canvasContext)

              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                {
                  swal('Вcтаньте прямо перед экраном, в полный рост. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                  .then((value) => {
                    this.audio.play();
                    this.audio.pause();
                    intervalPause = setInterval(() => this.tickPause(), 1000)
                  });
                }
                this.setState({ruleOfExersice : -1})
              }              
              if (this.state.ruleOfExersice !== -1)
              {
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
                  if (((leftShoulder.position.x + (rightShoulder.position.x - leftShoulder.position.x)/2) < (Width/2+20) && 
                    (leftShoulder.position.x + (rightShoulder.position.x - leftShoulder.position.x)/2) > (Width/2-20)) &&
                  (leftAnkle.position.y < (Height-50)) && (rightAnkle.position.y < (Height-50)))
                  {
                    this.setState({leftHipBind: leftHip});
                    this.setState({leftAnkleBind: leftAnkle});
                    this.setState({gradeOfAssessment: (leftAnkle.position.y - leftHip.position.y)/6});
                    this.setState({ProverkaCenter: true});
                    this.audio.play();                    
                  }
                }
              }
            }
            else
            {
              drawStretchWithTwoPoints(
                this.state.leftHipBind,
                this.state.leftAnkleBind,
                skeletonColor,
                skeletonLineWidth,
                canvasContext
              )
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              let leftHip = pose['keypoints'][11]
      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawTwineStretchData(leftHip.position.y ,this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)    
                canvasContext.fillText('Результат = ' + (leftHip.position.y-this.state.leftHipBind.position.y), 50, 300)            
              }
              else
              {
                let result = drawTwineStretchData(leftHip.position.y ,this.state.leftHipBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 10, 90) 
                canvasContext.fillText('Результат = ' + (leftHip.position.y-this.state.leftHipBind.position.y), 10, 130)   
              }
            }
          }

          if (this.state.BackTilt)
          {
            let pose = poses[0]
            let keypointsForwardTilt = [pose['keypoints'][5]]
            drawKeyPoints(
              keypointsForwardTilt,
              minPartConfidence,
              skeletonColor,
              canvasContext
            )    
            if (!this.state.ProverkaCenter)
            {
              if (this.state.ruleOfExersice === 0)
              {
                if (isMobile) 
                {
                  swal('Вcтаньте на колени, в полный рост, левым боком перед экраном. Когда начнется отсчет в левом верхнем углу, начните выполнять упражнение.')
                  .then((value) => {
                    this.audio.play();
                    this.audio.pause();
                    intervalPause = setInterval(() => this.tickPause(), 1000)
                  });
                }
                this.setState({ruleOfExersice : -1})
              }              
              if (this.state.ruleOfExersice !== -1)
              {
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
                  ) 
                  // &&
                  // ((leftHip.position.y < (leftKnee.position.y+10)) && (leftHip.position.y > (leftKnee.position.y-10)))
                  )
                  {
                    this.setState({leftShoulderBind: leftShoulder});
                    this.setState({leftHipBind: leftHip});
                    this.setState({gradeOfAssessment: (leftHip.position.y - leftShoulder.position.y)/6});
                    this.setState({ProverkaCenter: true});
                    this.audio.play();   
                  }
                }
              }
            }
            else
            {
              drawStretchWithTwoPoints(
                this.state.leftShoulderBind,
                this.state.leftHipBind,                
                skeletonColor,
                skeletonLineWidth,
                canvasContext
              )
              if (this.state.ruleOfExersice === 1)
              {
                intervalId = setInterval(() => this.tick(), 1000)
                this.setState({ruleOfExersice : 0})
              }   
              //let pose = poses[0]
              let leftShoulder = pose['keypoints'][5]
              let leftHip = pose['keypoints'][11]
              if (leftHip.score > 0.5 && ((leftHip.position.x > (this.state.leftHipBind.position.x + 15)) || (leftHip.position.x < (this.state.leftHipBind.position.x - 15)) ||
              (leftHip.position.y > (this.state.leftHipBind.position.y + 15)) || (leftHip.position.y < (this.state.leftHipBind.position.y - 15))))
              {
                this.setState({poseEror: this.state.poseEror+1});   
                if (this.state.poseEror > 11)
                {
                  swal('Вы сдвинули бедро. Повторите пожалуйста упражнение.')
                  .then((value) => {
                    this.ChangeState("OnDoingExercise");
                  });                  
                  //swal('Вы сдвинули бедро. Повторите пожалуйста упражнение.')
                }                             
              }
              
      
              if (!isMobile) canvasContext.font = '48px serif'
              else canvasContext.font = 'bold 20px serif'
              if (!isMobile) canvasContext.fillText('Время = ' + this.state.timeinsec, 50, 100)
              else canvasContext.fillText('Время = ' + this.state.timeinsec, 10, 50)
              if (!isMobile) 
              {
                let result = drawBackTiltStretchData(leftShoulder.position.y ,this.state.leftShoulderBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                canvasContext.fillText('Растяжка = ' + result, 50, 200)  
                canvasContext.fillText('Результат = ' + (leftShoulder.position.y-this.state.lleftShoulderBind.position.y), 50, 300)                
              }
              else
              {
                let result = drawBackTiltStretchData(leftShoulder.position.y ,this.state.leftShoulderBind.position.y, 
                  this.state.gradeOfAssessment, this.state.Result)
                this.setState({Result: result})
                //canvasContext.fillText('Растяжка = ' + result, 10, 90)  
                canvasContext.fillText('Растяжка = ' + this.state.poseEror, 10, 90)  
                canvasContext.fillText('Результат = ' + (leftShoulder.position.y-this.state.leftShoulderBind.position.y), 10, 130)  
              }
            }
          }
        }
        this.forceUpdate()
        requestAnimationFrame(findPoseDetectionFrame)
    }
    findPoseDetectionFrame();
  }
  

  ChangeState = nr => () => {
    this.setState({
      "timeinsec" : 10
    })
    this.setState({
      "timeinsecForPause" : 5
    })
    this.setState({poseEror: 0})
    this.setState({ProverkaCenter: false})
    this.setState({leftHipBind: undefined})
    // this.setState({leftKneeBind: undefined})
    this.setState({leftAnkleBind: undefined})
    this.setState({leftShoulderBind: undefined})
    this.setState({Result: "too bad to be the truth"})
    this.setState({gradeOfAssessment: undefined})
    this.setState({ruleOfExersice: 0})
    if (nr === "OnDoingExercise" && this.state[nr] === true)
    {
      //this.setState({PreviousPoses : []});      
      clearInterval(intervalId);
      clearInterval(intervalPause);
      intervalId = 0;
      intervalPause = 1;
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
        //this.setState({PreviousPoses : []});
        clearInterval(intervalId);
        clearInterval(intervalPause);
        intervalId = 0;
        intervalPause = 1;
        this.setState({
          "stopVideo" : false
        })
      }
      else
      {
        this.setState({
          "OnDoingExercise" : true
        })
        this.setState({
          [nr] : true
        })
      }
    }
};

// makeScreenshot = () => {
//   let canvas = this.canvasRef.current;
//   let url = canvas.toDataURL("image/png");
//   console.log(canvas,url)
//   this.setState({
//     imgUrl: url
//   })
//   window.location.href = url;
//   const canvasEl = document.getElementById('root');
// console.log(canvasEl)
// if (canvasEl != null) {
//   canvasToImage(canvasEl, { 
//     name: 'myPNG',
//     type: 'png',
//     quality: 1
//   });
// }


  // console.log(document.querySelector("#capture"))
  // html2canvas(document.querySelector("#capture")).then(canvas => {
  //   console.log(canvas)
  //   document.body.appendChild(this.state.canvas)
  // });

  //var canvas = document.getElementById("#canvasWebcam");
  //var canvas = ReactDOM.findDOMNode(this.refs.canvasWebcam)

  //var ctx = canvas.getContext("2d");
  // if (this.getCanvas != null){
  //   var imageURI = this.getCanvas.toDataURL("image/jpg");
  //   console.log("Screenshot")
  //   this.setState({imgUrl: imageURI})
  // }
  //console.log("canvas1 ", canvas)

  //el.href = imageURI;
  // html2canvas(document.body).then(function(canvas) {
  //   console.log("in then")
  //   document.body.appendChild(canvas);
  // });
  // html2canvas(document.getElementById("root"), {scale: 2}).then(canvas =>
  //   {
  //       canvas.id = "canvasWebcam";
  //       var main = document.getElementById("main");
  //       //while (main.firstChild) { main.removeChild(main.firstChild); }
  //       main.appendChild(canvas);
  //   });
//}




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
                        <MDBRow center> 
                          <MDBBtn size='sm' color='indigo' onClick = {() => this.ChangeCameraView()}>Сменить вид камеры</MDBBtn> 
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