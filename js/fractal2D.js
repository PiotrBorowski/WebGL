// zmienne globalne 
var gl_canvas; 
var gl_ctx;  

var _position; 
var _color;  

var _triangleVertexBuffer; 
var _triangleFacesBuffer;  

var vertices = new Array();
var verticesFaces = new Array();
var offset = 0;

//parametry
var depht;
var edgeLength;
var deform;
// funkcja główna  
function runWebGLFractal2D () {
   gl_canvas = document.getElementById("glcanvas");
   gl_ctx = gl_getContext(gl_canvas);    
   //clearing arrays
   vertices.length = 0;
   verticesFaces.length = 0;
   offset = 0;

    gl_clear();
   getParameters();
   drawFractal(-1,1,edgeLength,depht);
   gl_initShaders();    
   gl_initBuffers();    
   gl_draw();
}  

// pobranie kontekstu WebGL 
function gl_getContext (canvas) {
    try {       
       var ctx = canvas.getContext("webgl");
       ctx.viewportWidth = canvas.width;
       ctx.viewportHeight = canvas.height;    
    } catch (e) {}

    if (!ctx) {
       document.write('Unable to initialize WebGL context.')
    }    
    return ctx; 
}

// shadery 
function gl_initShaders () {
   var vertexShader = "\n\
    attribute vec2 position;\n\
    attribute vec3 color;\n\
    varying vec3 vColor;\n\
    void main(void) {\n\
       gl_Position = vec4(position, 0., 1.);\n\
       vColor = color;\n\
    }"; 

   var fragmentShader = "\n\
      precision mediump float;\n\
      varying vec3 vColor;\n\
      void main(void) {\n\
         gl_FragColor = vec4(vColor, 1.);\n\
      }"; 

   var getShader = function(source, type, typeString) {
      var shader = gl_ctx.createShader(type);  
      gl_ctx.shaderSource(shader, source);    
      gl_ctx.compileShader(shader);      

      if (!gl_ctx.getShaderParameter(shader, gl_ctx.COMPILE_STATUS)) { 
         alert('error in ' + typeString);  
         return false;       
      }     
      return shader;
   };    

   var shaderVertex = getShader(vertexShader, gl_ctx.VERTEX_SHADER, "VERTEX");    
   var shaderFragment = getShader(fragmentShader, gl_ctx.FRAGMENT_SHADER, "FRAGMENT");

   var shaderProgram = gl_ctx.createProgram(); 
   gl_ctx.attachShader(shaderProgram, shaderVertex);
   gl_ctx.attachShader(shaderProgram, shaderFragment);
   gl_ctx.linkProgram(shaderProgram); 

   _position = gl_ctx.getAttribLocation(shaderProgram, "position");
   _color = gl_ctx.getAttribLocation(shaderProgram, "color");   
   gl_ctx.enableVertexAttribArray(_position); 
   gl_ctx.enableVertexAttribArray(_color);    
   gl_ctx.useProgram(shaderProgram); }  

// bufory 
function gl_initBuffers () {
   var triangleVertices = [
      -0.5, 0,       
      0, 0, 1,       
      0, 1,       
      0, 1, 0,       
      0.5, 0,       
      1, 0, 0 
   ];     
 
   _triangleVertexBuffer = gl_ctx.createBuffer();   
   gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);
   console.log(vertices)
   gl_ctx.bufferData(gl_ctx.ARRAY_BUFFER, 
                     new Float32Array(vertices),
   gl_ctx.STATIC_DRAW);     

   var triangleFaces = [
    0, 1, 2,   
    0, 2, 3
];     

    console.log(verticesFaces)
   _triangleFacesBuffer = gl_ctx.createBuffer();
   gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);
   gl_ctx.bufferData(gl_ctx.ELEMENT_ARRAY_BUFFER,                     
                     new Uint16Array(verticesFaces),                      
                     gl_ctx.STATIC_DRAW);
}  

// rysowanie 
function gl_draw() {
    gl_ctx.clearColor(0.0, 0.0, 0.0, 0.0);    

    var animate = function () {     
       gl_ctx.viewport(0.0, 0.0, gl_canvas.width, gl_canvas.height);  
       gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT);      

       gl_ctx.vertexAttribPointer(_position, 2, gl_ctx.FLOAT, false, 4*(2+3), 0);
       gl_ctx.vertexAttribPointer(_color, 3, gl_ctx.FLOAT, false, 4*(2+3), 2*4);

       gl_ctx.bindBuffer(gl_ctx.ARRAY_BUFFER, _triangleVertexBuffer);      
       gl_ctx.bindBuffer(gl_ctx.ELEMENT_ARRAY_BUFFER, _triangleFacesBuffer);

       gl_ctx.drawElements(gl_ctx.TRIANGLES, verticesFaces.length, gl_ctx.UNSIGNED_SHORT, 0);  
       gl_ctx.flush();
    };   
        animate();
}

function gl_clear() {
    gl_ctx.clear(gl_ctx.COLOR_BUFFER_BIT);  

}

function drawFractal(x, y, a, level)
{
    if(level == 0){
        return;
    }

    var edge = a/3;
    var centerX = x+edge;
    var centerY = y-edge;

    var rand1 = Math.random()/(100/deform);
    var rand2 = Math.random()/(100/deform);

    vertices.push(centerX + rand1,centerY+rand2);
    vertices.push(Math.random(),0,0);
    vertices.push(centerX+ rand1,centerY-edge+rand2);
    vertices.push(0,Math.random(),0);
    vertices.push(centerX+edge+rand1,centerY-edge+rand2);
    vertices.push(0,0,Math.random());
    vertices.push(centerX+edge+rand1,centerY+rand2);
    vertices.push(0,Math.random(),Math.random());

    verticesFaces.push(offset+0,offset+1,offset+2);
    verticesFaces.push(offset+0,offset+2,offset+3);

    offset += 4;

    var tempX = x;
    var tempY = y;

    drawFractal(tempX,tempY,edge,level-1);
    tempX += edge;
	drawFractal(tempX,tempY, edge, level - 1);
	tempX += edge;
	drawFractal(tempX,tempY, edge, level - 1);

	tempX = x;
	tempY = y - edge;

	drawFractal(tempX,tempY, edge, level - 1);
	tempY -= edge;
	drawFractal(tempX,tempY, edge, level - 1);
	tempX += edge;
	drawFractal(tempX,tempY, edge, level - 1);
	tempX += edge;
	drawFractal(tempX,tempY, edge, level - 1);
	tempY+= edge;
	drawFractal(tempX,tempY, edge, level - 1);
}

function getParameters(){
    edgeLength = document.getElementById('edgeLength').value;
    depht = document.getElementById('depht').value;
    deform = document.getElementById('deform').value;
}