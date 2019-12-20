import React, { Component } from 'react'
import  * as THREE from 'three'
// 引入控件，实现旋转，缩放等
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
// 引入外部obj格式的模型加载器
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
// 球形控制器要在场景追加到dom后才能调用使用

import cubeImg from './images/1.png'
import changeImg from './images/2.png'
import newImg from './images/3.jpg'
import objData from './model/data.obj'  // 一定要对象方式引入, 否则cli会修改静态资源的路径，导致加载不到
import testMtl from './model/10_guan.mtl'

export default class ThreeDemo extends Component{
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
        const camera = new THREE.PerspectiveCamera(28, width / height, 1, 1000 )
        // 新建一个webgl渲染器,提供抗锯齿属性
        const renderer = new THREE.WebGLRenderer({antialias: true})

        renderer.setSize(width, height) // 画布大小
        renderer.setClearColor(0xffffff, 1) // 设置画布颜色和透明度

    
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        // 添加灯光
        this.addLight()
        // 添加一个坐标轴辅助
        this.addAxHepler()
        // 添加一个网格辅助
        this.addGridHepler()
        // 添加一个相机辅助
        // this.addCameraHelper()

        // 导入外部obj
        this.importModel()
        // 调用创建几何物体方法
        // this.initCube()


        // 调整相机位置
        this.camera.position.set(80, 0, 0)
        // 设置相机的拍摄物体的角度
        this.camera.lookAt(this.scene.position)

        // 添加容器变化监听
        window.addEventListener('resize', this.handleResize)
        // 讲渲染器生产的canvas追加到dom中
        this.mount.appendChild(this.renderer.domElement)
        // 球形控制器要在渲染器追加到dom之后才执行
        this.addTControls()
        // // 添加轨道控制器
        // this.addControls()


        // 添加一个性能侦测器
        const stats = new Stats();
        document.body.appendChild( stats.dom );
        this.stats = stats

        this.start()

      
    }
    // 添加一个轨道控制器,允许摄像机围绕目标旋转。
    addControls = () => {
        const controls = new OrbitControls(this.camera, this.renderer.domElement)
        // OrbitControls的控制参数
        // controls.autoRotate = true //默认围绕循环
        controls.enableDamping = true // 启用旋转惯性
        controls.dampingFactor = 0.099 // 阻尼系数大小
        
        // // controls.enableRotate = false // 禁用旋转
        // controls.enableZoom  = false // 禁用缩放

        // controls.maxPolarAngle  = 1.6  // 竖直方向上设置相同的值来禁用竖直方向的旋转
        // controls.minPolarAngle = 1.6
        this.controls = controls
    }
    // 添加一个球形轨道控制器 实现360旋转
    addTControls = () =>{
        /** TrackballControls的控制参数**/
        const controls = new TrackballControls(this.camera, this.renderer.domElement)
        controls.dynamicDampingFactor = 0.12 // 阻尼系数
        // controls.noZoom = true // 禁用缩放
        this.controls = controls

    }
    /**************辅助系********************/
    // 添加一个坐标轴辅助
    addAxHepler = () => {
        const axesHelper = new THREE.AxesHelper( 60) // 坐标轴的长度
        this.scene.add(axesHelper)
    }
    // 添加一个网格辅助
    addGridHepler = () => {
        const gridHelper = new THREE.GridHelper( 30, 30 ) // 30 * 30
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

        // 添加物体后一定要调整相机的角度
        // // 相加所在的位置
        //this.camera.position.set(40, 400, 330)
        // 设置相机的拍摄物体的角度
        //this.camera.lookAt(this.scene.position)

        /**
         *  当相机的位置发生变动后一定要更新控制器
         * **/
        // 更新控制器
        // this.controls.update();
        
    }
    // 外部导入3D模型（几何体+材质）
    // 由于obj格式的模型 通常obj和mtl的相配的，模型和材质，所以都要引入
    importModel = () => {
        const _this = this
        const manager = new THREE.LoadingManager();
        manager.addHandler( /\.dds$/i, new DDSLoader() );
        
        new MTLLoader( manager )
        .load(testMtl, function ( materials ) { // 载入mtl
            materials.preload();
            new OBJLoader( manager )
                .setMaterials( materials )
                .load(objData, function ( object ) { // 载入obj
                    object.scale.z = 0.17
                    object.scale.x = 0.17
                    object.scale.y = 0.17

                    object.position.y = 2.8
                    _this.objectDemo = object

                    _this.loadImg(object, 27) // 载入初始化皮肤
                   
                    
                },function ( xhr ) {
                    // xhr的实例， 实现导入的进度条
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            
                }, function ( error ) {
        
                    console.log( 'An error happened' );
            
                });
        });

        this.manager = manager
    }
    loadImg = (faterObj = this.objectDemo, setId, setImg = newImg) => {
        console.log(faterObj);
        
        const _this = this
        new THREE.TextureLoader( this.manager ).load(setImg, 	// onLoad回调
            function ( texture ) {
                // 加载图片
                faterObj.traverse(function ( child ) {
                    console.log(child);
                    
                    /**
                     * 注意，判断哪一面不需要渲染图片不能根据id来排除，因为随着场景中实物的新增，模型中的id会发生改变
                     * */
                    if(child.isMesh && child.name === 'ç½èº«'){
                        console.log('渲染包装图')
                        child.material.map = texture;
                    }
                     
                    // if (child.id === setId && child.isMesh) {
                    //     child.material.map= texture;
                    // }
                } );
                _this.scene.add(faterObj)
        });
    }
    // 为模型添加图片
    setActiveImg = (url) =>{
      this.loadImg(this.objectDemo, 27, url)
    }
    /*************灯光********************/ 
    // 添加一个灯光
    addLight = () => {
        // 平行光
        const  DirectLight = new THREE.DirectionalLight( 0xffffff, 0.5)
        // 环境光
        const  AmLight = new THREE.AmbientLight(0xaaaaaa)
        // 添加一个聚光灯-常亮与环境物体的某一部位
        const light = new THREE.SpotLight(0x333333) // 默认白色光

        // 添加一个罐底聚光
        const bottomLight = new THREE.SpotLight(0xe2e2e2)
        bottomLight.position.set(10, -20, 0) // 底部聚光灯的位置
        const bottomLight2 = new THREE.SpotLight(0xe2e2e2)
        bottomLight2.position.set(10, -20, 0) // 底部聚光灯的位置
        
        // 罐底聚光灯辅助
        const bottomLightHelper = new THREE.SpotLightHelper( bottomLight );
        
        // 添加一个聚光灯光源辅助
        const spotLightHelper = new THREE.SpotLightHelper(light);
        // 设置罐头顶部聚灯光的角度
        light.position.set( 10, 20, 0 )
        // 将灯光添加到场景中
        this.scene.add(AmLight)
        this.scene.add(DirectLight)
        this.scene.add(light)
        this.scene.add(bottomLight)
        this.scene.add(bottomLight2)

        this.scene.add(spotLightHelper)
        this.scene.add(bottomLightHelper)
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