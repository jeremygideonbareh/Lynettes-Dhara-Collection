// One shared canvas follows the active photograph. The source stays visible below it.
let renderer;
function makeRenderer(){
  const canvas=document.createElement('canvas');canvas.className='silk-light';canvas.setAttribute('aria-hidden','true');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false,powerPreference:'low-power'});if(!gl)return;
  const program=gl.createProgram();
  for(const [type,source] of [[gl.VERTEX_SHADER,'attribute vec2 v;varying vec2 uv;void main(){uv=v*.5+.5;gl_Position=vec4(v,0.,1.);}'],[gl.FRAGMENT_SHADER,`precision mediump float;
  varying vec2 uv;uniform sampler2D photo;uniform float progress;uniform vec2 crop;
  void main(){vec3 cloth=texture2D(photo,(uv-.5)*crop+.5).rgb;
    float band=exp(-45.*pow(uv.x+uv.y*.37-mix(-.35,1.72,progress),2.));
    float strength=band*(.3+dot(cloth,vec3(.21,.66,.13))*.52);
    gl_FragColor=vec4(mix(cloth,vec3(1.,.85,.57),strength*.4),sin(3.14159*progress)*.98);}`]]) {
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);gl.attachShader(program,s);gl.deleteShader(s);
  }
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'v');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  const progress=gl.getUniformLocation(program,'progress'),crop=gl.getUniformLocation(program,'crop');let frame;
  return function draw(host){
    const img=host.querySelector('img');if(!img?.naturalWidth||!host.clientWidth)return;
    cancelAnimationFrame(frame);host.append(canvas);canvas.width=Math.min(480,host.clientWidth);canvas.height=Math.round(canvas.width*host.clientHeight/host.clientWidth);
    gl.viewport(0,0,canvas.width,canvas.height);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
    const ratio=(img.naturalWidth/img.naturalHeight)/(canvas.width/canvas.height);gl.uniform2f(crop,Math.min(1,1/ratio),Math.min(1,ratio));
    const t=performance.now();
    function play(now){const phase=Math.min(1,(now-t)/900);if(phase>=1||document.hidden||document.documentElement.classList.contains('reduced')||!host.isConnected){canvas.remove();return;}
      gl.uniform1f(progress,phase);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);frame=requestAnimationFrame(play);}
    frame=requestAnimationFrame(play);
  };
}
export function sweep(host){if(document.documentElement.classList.contains('reduced')||navigator.connection?.saveData)return;renderer??=makeRenderer();renderer?.(host);}

