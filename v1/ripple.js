let serial=0;
const bitmap=async src=>{const img=new Image();img.src=src;await img.decode();return img;};
export async function ripple(from,to){
  const seq=++serial, canvas=document.querySelector('#ripple');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:false});
  if(!gl)return;
  const imgs=await Promise.all([bitmap(from),bitmap(to)]);
  if(seq!==serial||!document.querySelector('#quick').open)return;
  canvas.width=Math.min(640,canvas.clientWidth);canvas.height=Math.round(canvas.width*canvas.clientHeight/canvas.clientWidth);
  if(!canvas.height)return;
  const program=gl.createProgram(),shaders=[],textures=[];
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);gl.attachShader(program,s);shaders.push(s);}
  shader(gl.VERTEX_SHADER,'attribute vec2 pos;varying vec2 uv;void main(){uv=pos*.5+.5;gl_Position=vec4(pos,0.,1.);}');
  shader(gl.FRAGMENT_SHADER,'precision mediump float;varying vec2 uv;uniform sampler2D a,b;uniform float t;void main(){float wave=sin(uv.y*13.+t*8.)*.037*sin(t*3.14159);gl_FragColor=mix(texture2D(a,vec2(uv.x+wave,uv.y)),texture2D(b,vec2(uv.x-wave,uv.y)),smoothstep(.0,1.,t));}');
  gl.linkProgram(program);gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,'pos');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  imgs.forEach((img,i)=>{const tex=gl.createTexture();textures.push(tex);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    const fit=document.createElement('canvas');fit.width=canvas.width;fit.height=canvas.height;const ctx=fit.getContext('2d'),scale=Math.min(fit.width/img.width,fit.height/img.height);ctx.fillStyle='#e7dece';ctx.fillRect(0,0,fit.width,fit.height);ctx.drawImage(img,(fit.width-img.width*scale)/2,(fit.height-img.height*scale)/2,img.width*scale,img.height*scale);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,fit);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.uniform1i(gl.getUniformLocation(program,i?'b':'a'),i);});
  gl.viewport(0,0,canvas.width,canvas.height);const tLoc=gl.getUniformLocation(program,'t'),start=performance.now();canvas.style.opacity=1;
  function draw(time){const t=Math.min(1,(time-start)/420);if(t<1&&seq===serial&&document.querySelector('#quick').open){gl.uniform1f(tLoc,t);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(draw);}else{if(seq===serial)canvas.style.opacity=0;gl.deleteBuffer(buffer);textures.forEach(x=>gl.deleteTexture(x));shaders.forEach(x=>gl.deleteShader(x));gl.deleteProgram(program);}}
  requestAnimationFrame(draw);
}
