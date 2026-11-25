/* Latar sutra: pita hijau halus mengalir pelan. Resolusi rendah + berhenti saat tab tersembunyi, jadi hemat baterai. */
(function () {
  var cv = document.getElementById('bg');
  if (!cv) return;
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision highp float;',
    'uniform vec2 R;uniform float T;',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/R;',
    ' vec2 p=(gl_FragCoord.xy-.5*R)/R.y*2.2;',
    ' float t=T*.045;',
    ' for(int i=1;i<4;i++){float f=float(i);',
    '  p+=vec2(.32/f*sin(f*p.y*1.2+t*5.+f*1.7),.32/f*cos(f*p.x*1.0-t*4.+f*2.3));}',
    ' float ph=p.x*5.5+p.y*3.4+t*3.;',
    ' float s=sin(ph);',
    ' float line=pow(1.-abs(s),9.);',          /* garis tipis halus */
    ' float haze=.5+.5*sin(ph*.25+p.y);',       /* kabut lebar sangat samar */
    ' vec3 base=vec3(.027,.039,.031);',
    ' vec3 c=base+vec3(.05,.25,.15)*line*.30+vec3(.04,.16,.10)*haze*.10;',
    ' c*=mix(.5,1.,smoothstep(0.,.8,uv.y));',
    ' c*=.6+.4*smoothstep(1.3,.1,length(uv-vec2(.3,.95)));',
    ' c+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)/255.;', /* cegah banding */
    ' gl_FragColor=vec4(c,1.);',
    '}'
  ].join('\n');
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  var v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  var pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'R'), uT = gl.getUniformLocation(pr, 'T');
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  function size() {
    var s = .5, w = Math.max(2, Math.round(innerWidth * s)), h = Math.max(2, Math.round(innerHeight * s));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }
  var t0 = performance.now(), last = 0, raf = 0;
  function draw(now) {
    raf = 0;
    if (document.hidden) return;
    if (true) {
      last = now; size();
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, still ? 8 : (now - t0) / 1000 + 8.);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      cv.classList.add('on');
    }
    if (!still) raf = requestAnimationFrame(draw);
  }
  function go() { if (!raf) raf = requestAnimationFrame(draw); }
  document.addEventListener('visibilitychange', go);
  addEventListener('resize', function () { last = 0; go(); });
  go();
})();
