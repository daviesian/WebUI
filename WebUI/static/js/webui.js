var ws = new WebSocket("ws://" + document.location.host);

ws.onmessage = ws_message;

var lastData = null;
var msgCount = 0;

var latestMsg = null;

function ws_message(msg)
{
    if (latestMsg != null)
        console.log("DROP");
    latestMsg = msg;
}

THREE.PerspectiveCamera.prototype.getFocalLength = function(viewportWidth)
{
    return viewportWidth / (2 * Math.tan(((this.fov / 180) * Math.PI)/2));
}

function Axes(width, height, depth) {

    this.width = width;
    this.height = height;
    this.depth = depth;
    
    var g = new THREE.Geometry();

    g.vertices.push(new THREE.Vector3(0,0,0));
    g.vertices.push(new THREE.Vector3(width,0,0));
    
    g.vertices.push(new THREE.Vector3(0,0,0));
    g.vertices.push(new THREE.Vector3(0,height,0));
    
    g.vertices.push(new THREE.Vector3(0,0,0));
    g.vertices.push(new THREE.Vector3(0,0,depth));
    
    var line = new THREE.Line(g, new THREE.LineBasicMaterial({color: 0x0000ff}) , THREE.LinePieces);
    
    g = new THREE.Geometry();

    g.vertices.push(new THREE.Vector3(width,height,depth));
    g.vertices.push(new THREE.Vector3(width,height,0));
    
    g.vertices.push(new THREE.Vector3(width,height,depth));
    g.vertices.push(new THREE.Vector3(0,height,depth));
    
    g.vertices.push(new THREE.Vector3(width,height,depth));
    g.vertices.push(new THREE.Vector3(width,0,depth));
    
    var line2 = new THREE.Line(g, new THREE.LineBasicMaterial({color: 0x00ff00, opacity: 0.5}) , THREE.LinePieces);
    
    g = new THREE.Geometry();
    
    g.vertices.push(new THREE.Vector3(width,height,0));
    g.vertices.push(new THREE.Vector3(width,0,0));
    g.vertices.push(new THREE.Vector3(width,height,0));
    g.vertices.push(new THREE.Vector3(0,height,0));
    
    g.vertices.push(new THREE.Vector3(0,height,depth));
    g.vertices.push(new THREE.Vector3(0,height,0));
    g.vertices.push(new THREE.Vector3(0,height,depth));
    g.vertices.push(new THREE.Vector3(0,0,depth));
    
    g.vertices.push(new THREE.Vector3(width,0,depth));
    g.vertices.push(new THREE.Vector3(0,0,depth));
    g.vertices.push(new THREE.Vector3(width,0,depth));
    g.vertices.push(new THREE.Vector3(width,0,0));
   
    var line3 = new THREE.Line(g, new THREE.LineBasicMaterial({color: 0xffff00, opacity: 0.3}) , THREE.LinePieces);
    
    //line.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI / 6);
    this.objects = [line, line2, line3];
    
    this.extrema = [new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, this.height, 0),
            new THREE.Vector3(0, 0, this.depth),
            new THREE.Vector3(0, this.height, this.depth),
            new THREE.Vector3(this.width, 0, 0),
            new THREE.Vector3(this.width, this.height, 0),
            new THREE.Vector3(this.width, 0, this.depth),
            new THREE.Vector3(this.width, this.height, this.depth)];
}


/*requestAnimationFrame(draw);
function draw()
{

    if (latestMsg)
    {
        var container = document.getElementById('container'),
        
        // Draw Graph
        graph = Flotr.draw(container, [ JSON.parse(latestMsg.data) ], {
        yaxis : {
        max : 1000000,
        min : 0
        }
        });
        latestMsg = null;
    }
        requestAnimationFrame(draw);
}
*/
// create the sphere's material
var sphereMaterial =
  new THREE.MeshLambertMaterial(
    {
      color: 0xCC0000
    });


var renderer,orbitalCamera,scene,pointLight,axes;
    // set the scene size
    var WIDTH = 800,
      HEIGHT = 600,
      ASPECT = WIDTH / HEIGHT;

$(function() {


    // set some camera attributes
    var NEAR = 0.1,
      FAR = 10000;

    // get the DOM element to attach to
    // - assume we've got jQuery to hand
    var $container = $('#container');

    // create a WebGL renderer, camera
    // and a scene
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    /*
    var fov=45;
    orbitalCamera = new OrbitalCamera(new THREE.PerspectiveCamera(fov, ASPECT, NEAR, FAR),
                                      new THREE.Vector3(10,1,10));
    
   */
    var viewHeight = 6;
    orbitalCamera = new OrbitalCamera(new THREE.OrthographicCamera(ASPECT * viewHeight/2,-ASPECT * viewHeight/2,viewHeight/2, -viewHeight/2, NEAR, FAR),
                                      new THREE.Vector3(1,1,1));

    scene = new THREE.Scene();


    // the camera starts at 0,0,0
    // so pull it back
    //camera.position.z = 5;
    //camera.position.y = 0;
    //camera.position.x = 0;
    
    
    //camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), -Math.PI / 6);
    //camera.lookAt(new THREE.Vector3(0,0,0));

    

    // add the camera to the scene
    scene.add(orbitalCamera.camera);

    // start the renderer
    renderer.setSize(WIDTH, HEIGHT);

    // attach the render-supplied DOM element
    $("body").append(renderer.domElement);
    
    axes = new Axes(20,2,20);
    for(var i in axes.objects)
    {
        scene.add(axes.objects[i]);
    }
    
    var pointMaterial = new THREE.ParticleBasicMaterial({
        color: 0xF00000,
        size: 0.1,
        
        });
        
    
    var g = new THREE.Geometry();
    for(var i in axes.extrema)
    {
        g.vertices.push(axes.extrema[i]);
    }
    var ps = new THREE.ParticleSystem(g, pointMaterial);
    scene.add(ps);

    /*
    geometry = new THREE.Geometry();

    for(var i = 0; i < 10; i++)
    {
        geometry.vertices.push(new THREE.Vector3(i*100, 0, 0));
    }
    line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0x0000ff}) , THREE.LineStrip);
    
    scene.add(line);
    
    */
    /*
        // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16;

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);

    // add the sphere to the scene
    scene.add(sphere);
    
    // create a point light
    pointLight =
      new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
    scene.add(pointLight);
    */
    // draw!
    //renderer.render(scene, camera);
    render();
});

function OrbitalCamera(camera, focalPoint) {
    this.camera = camera;
    this.angle=0;
    this.elevation=0;
    this.focalPoint = focalPoint;
    
}

OrbitalCamera.prototype.zoomToPoints = function(points) {
    if (this.camera instanceof THREE.PerspectiveCamera)
    {
        var fl = this.camera.getFocalLength(HEIGHT);
        var maxDepth = 0;
        var invCamera = new THREE.Matrix4().getInverse(this.camera.matrix);
        var cameraSpaceFocalPointZ = this.focalPoint.clone().applyMatrix4(invCamera).z;
        points.forEach(function(p,i) {
            
            var q = p.clone();
            q.applyMatrix4(invCamera); // q is our point in camera space
            
            var leftCameraZ = q.x * fl / -(WIDTH/2);
            var rightCameraZ = q.x * fl / (WIDTH/2);
            var topCameraZ = q.y * fl / (HEIGHT/2);
            var bottomCameraZ = q.y * fl / -(HEIGHT/2);
            
            var extraZ = (q.z - cameraSpaceFocalPointZ) // This is the camera Z delta between q and the focal point.
            maxDepth = Math.max(maxDepth, leftCameraZ + extraZ, rightCameraZ + extraZ, topCameraZ + extraZ, bottomCameraZ + extraZ);
        });
        
        this.camera.position.set(0,0,maxDepth);
    }
    else if (this.camera instanceof THREE.OrthographicCamera)
    {
        var minX = Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        var minXp,minYp,maxXp,maxYp;
        
        var invCamera = new THREE.Matrix4().getInverse(this.camera.matrix);
        points.forEach(function(p,i) {
            
            var q = p.clone();
            q.applyMatrix4(invCamera); // q is our point in camera space
            
            if (q.x < minX) {
                minX = q.x;
                minXp = p.x;
            }
            if (q.y < minY) {
                minY = q.y;
                minYp = p.y;
            }
            if (q.x > maxX) {
                maxX = q.x;
                maxXp = p.x;
            }
            if (q.y > maxY) {
                maxY = q.y;
                maxYp = p.y;
            }

        });
        
        var newRangeX = maxX - minX;
        var newRangeY = maxY - minY;
        var newAspect = newRangeX / newRangeY;
        if (newAspect < ASPECT)
        {
            this.camera.left = -ASPECT * newRangeY/2;
            this.camera.right = ASPECT * newRangeY/2;
            this.camera.top = maxY;
            this.camera.bottom = minY;
        }
        else
        {
            this.camera.left = minX;
            this.camera.right = maxX;
            this.camera.top = (newRangeX/2)/ ASPECT;
            this.camera.bottom = (-newRangeX/2)/ASPECT;
        }
        console.log(newAspect);
        this.camera.updateProjectionMatrix();
        this.camera.position.set(0,0,5000);
    }
    else
    {
        console.error("Invalid camera type provided to OrbitalCamera");
    }
    
    this.camera.position.applyAxisAngle(new THREE.Vector3(1,0,0), -this.elevation * Math.PI / 180);
    this.camera.position.applyAxisAngle(new THREE.Vector3(0,1,0), this.angle * Math.PI / 180);
    this.camera.position.add(this.focalPoint);
    this.camera.lookAt(this.focalPoint);
    this.camera.updateMatrix();
}


var series = [];

function render() {

    if (latestMsg)
    {
        msg = JSON.parse(latestMsg.data);
        console.log(msg);
        
        if (series[msg.series] === undefined || series[msg.series].geometry.vertices.length != msg.ys.length)
        {
            var g = new THREE.Geometry();

            for(var i = 0; i < msg.ys.length; i++)
            {
                g.vertices.push(new THREE.Vector3(0,0,0));
            }
            var line = new THREE.Line(g, new THREE.LineBasicMaterial({color: 0x0000ff}) , THREE.LineStrip);
            series[msg.series] = line; // TODO: remove from scene if already defined.
            scene.add(line);
            console.log("ADDING SERIES:", msg.series);
        }
        
        minX = msg.minX;
        minY = msg.minY;
        maxX = msg.maxX;
        maxY = msg.maxY;
        for(var i = 0; i < msg.ys.length; i++)
        {
            series[msg.series].geometry.vertices[i].x = (i - minX) / (maxX - minX);
            series[msg.series].geometry.vertices[i].y = (msg.ys[i] - minY) / (maxY - minY);
        }
        series[msg.series].geometry.verticesNeedUpdate = true;
        
        
        latestMsg = null;
    }

    
    orbitalCamera.angle += 1
    orbitalCamera.elevation += 0.1
    if (orbitalCamera.angle > 360) {
        orbitalCamera.angle -= 360;
    }
    
    orbitalCamera.zoomToPoints(axes.extrema);
    
	renderer.render(scene, orbitalCamera.camera);
    requestAnimationFrame(render);
    
}
