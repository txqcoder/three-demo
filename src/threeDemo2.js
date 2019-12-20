// 球形控制器示例
import React, { Component } from 'react'
import  * as THREE from 'three'
// 引入控件，实现旋转，缩放等

import Stats from 'stats.js';
// 引入外部obj格式的模型加载器
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'


import cubeImg from './images/1.png'
import changeImg from './images/2.png'
import objData from './model/10_guan2.obj'  // 一定要对象方式引入
import testMtl from './model/10_guan2.mtl'

export default class ThreeDemo2 extends Component{
    componentDidMount() {
        this.init()
    }
    componentWillUnmount() {
        window.removeEventListener('resize')
        this.stop()
        this.mount.removeChild(this.renderer.domElement)
    }
    /***********three基础环境****************/
    // 初始化场景、相机、渲染器
    init = () =>{
        const width = this.mount.clientWidth // 容器的宽度
        const height = this.mount.clientHeight // 容器的高度
        // 新建一个场景
        const scene = new THREE.Scene()
        // 新建一个相机
        const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000 )
        // 新建一个webgl渲染器,提供抗锯齿属性
        const renderer = new THREE.WebGLRenderer({antialias: true})

        renderer.setSize(width, height) // 画布大小
        renderer.setClearColor(0xffffff, 1) // 设置画布颜色和透明度

    
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
         
        // 添加一个坐标轴辅助
        this.addAxHepler()
        // 添加一个网格辅助
        this.addGridHepler()
        // 添加一个相机辅助
        // this.addCameraHelper()

        // 引入外部obj
        this.importModel()
        // 添加灯光
        this.addLight()

        // 调整相机位置
        this.camera.position.set(80, -2, 0)
        // 设置相机的拍摄物体的角度
        this.camera.lookAt(this.scene.position)
        // 添加控制器
        // this.addControls()
        // /**
        //  *  当相机的位置发生变动后一定要更新控制器
        //  * **/
        // // 更新控制器
        // this.controls.update();


        // 添加容器变化监听
        window.addEventListener('resize', this.handleResize)
        // 讲渲染器生产的canvas追加到dom中
        this.mount.appendChild(this.renderer.domElement)

        // 性能侦测器
        const stats = new Stats();
        document.body.appendChild( stats.dom );
        this.stats = stats
        this.addControls()
        this.start()

      
    }
    // 添加一个控制器,允许摄像机围绕目标旋转。
    addControls = () => {
        const controls = new TrackballControls(this.camera, this.renderer.domElement)
        // OrbitControls的控制参数
        // controls.autoRotate = true //默认围绕循环
        // controls.enableDamping = true // 启用旋转惯性
        // controls.dampingFactor = 0.099 // 阻尼系数大小
        
        // // controls.enableRotate = false // 禁用旋转
        // controls.enableZoom  = false // 禁用缩放

        // controls.maxPolarAngle  = 1.6  // 竖直方向上设置相同的值来禁用竖直方向的旋转
        // controls.minPolarAngle = 1.6


        /** TrackballControls的控制参数**/
     
        // controls.panCamera()
        // controls.screenSpacePanning = true


        this.controls = controls
    }
    /**************辅助系********************/
    // 添加一个坐标轴辅助
    addAxHepler = () => {
        const axesHelper = new THREE.AxesHelper( 60)
        this.scene.add(axesHelper)
    }
    // 添加一个网格辅助
    addGridHepler = () => {
        const gridHelper = new THREE.GridHelper( 30, 30 )
        this.scene.add(gridHelper)
    }
    // 添加一个相机辅助
    addCameraHelper = () => {
        const cameraHelper = new THREE.CameraHelper( this.camera );
        this.scene.add( cameraHelper )
    }
    /***************几何实例********************/ 
    // 创建一个几何体的具象
    initCube = () => {
        const texture = new THREE.TextureLoader().load(cubeImg)
        // 绘制一个几何体
        const cubeGeomtery = new THREE.CylinderBufferGeometry(2, 2, 4, 8) // 正方体
        const cubeMaterial  = new THREE.MeshPhongMaterial({ // 网格材质
            // color: 0xff0fff
            map: texture
        })
        const cube = new THREE.Mesh(cubeGeomtery, cubeMaterial) // 将几何体和材质结合
        this.cube = cube
        this.material = cubeMaterial
        // 将几何体添加到场景中
        this.scene.add(cube)
        
    }
    // 外部导入3D模型（几何体+材质）
    // 由于obj格式的模型 通常obj和mtl的相配的，模型和材质，所以都要引入
    importModel = () => {
        const _this = this
        const manager = new THREE.LoadingManager();
        manager.addHandler( /\.dds$/i, new DDSLoader() );
        
        new MTLLoader( manager )
        .load(testMtl, function ( materials ) { // 载入mtl
            console.log(materials)
            materials.preload();
            new OBJLoader( manager )
                .setMaterials( materials )
                .load(objData, function ( object ) { // 载入obj
                    console.log(object)
                    object.scale.z = 0.17
                    object.scale.x = 0.17
                    object.scale.y = 0.17
                    object.position.y = 2.8
                    _this.scene.add(object)
                    // _this.loadImg(object, 20) // 载入初始化皮肤
                    _this.objectDemo = object
                    
                },function ( xhr ) {
                    // xhr的实例， 实现导入的进度条
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            
                }, function ( error ) {
        
                    console.log( 'An error happened' );
            
                });
        });

        this.manager = manager
    }
    // 载入外部图片方法
    loadImg = (faterObj = this.objectDemo, setId, setImg = cubeImg) => {
        console.log(faterObj);
        const _this = this
        new THREE.TextureLoader( this.manager ).load(setImg, 	// onLoad回调
            function ( texture ) {
                console.log(texture)
                // 加载图片
                faterObj.traverse(function ( child ) {
                    console.log(child);
                    if (child.id === setId && child.isMesh) {
                        child.material.map = texture;
                    }
                } );
                _this.scene.add(faterObj)
                console.log(_this.scene)
        });
    }
    // 切换外包装图片
    setActiveImg = (url) =>{
      this.loadImg(this.objectDemo, 20, url)
    }
    /*************灯光********************/ 
    // 添加一个灯光
    addLight = () => {
        // 平行光
        const  DirectLight = new THREE.DirectionalLight( 0xffffff, 1 )
        // 环境光
        const  AmLight = new THREE.AmbientLight( 0xc5c5c5 )
        // 添加一个聚光灯-常亮与环境物体的某一部位
        const light = new THREE.SpotLight() // 默认白色光
        // 设置聚灯光的角度
        light.position.set( 2, 10, 2 )
        // 将灯光添加到场景中
        // this.scene.add(light)
        this.scene.add(AmLight)
        this.scene.add(DirectLight)
        
    }

    /**********功能方法*********** */
    // 监听窗口变化 动态绘制
    handleResize = () => {
        const width = this.mount.clientWidth
        const height = this.mount.clientHeight
        // 设置渲染器大小
        this.renderer.setSize(width, height)
        // 设置摄像机视锥体的长宽比（画布的宽高比）
        this.camera.aspect = width / height
        // 更新摄像机投影矩阵
        this.camera.updateProjectionMatrix()
    }
    // 开始帧绘制
    start = () => {
        if(!this.frameId){
            this.frameId = requestAnimationFrame(this.animate)
        }
    }
    // 结束绘制
    stop = () => {
        cancelAnimationFrame(this.frameId)
    }
    // 实时绘制
    animate = () => {
        this.controls.update();
        this.stats.update()
        this.renderScene()
        this.frameId = window.requestAnimationFrame(this.animate)
    }
    // 进行绘制
    renderScene = () => {
        this.renderer.render(this.scene, this.camera)
    }
    render(){
        return (
            <div className="test-box">
                <div className="three-content" ref = {mount => this.mount = mount}></div>
                <button onClick={()=>this.setActiveImg(changeImg)}>切换主题</button>
            </div>
        )
    }
}