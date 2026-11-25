/* Latar sutra: pita hijau halus mengalir pelan. Resolusi rendah + berhenti saat tab tersembunyi, jadi hemat baterai. */
(function () {
  var cv = document.getElementById('bg');
  if (!cv) return;
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var fs = [
    'precision mediump float;',
    'uniform vec2 R;uniform float T;',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/R;',
    ' vec2 p=(gl_FragCoord.xy-.5*R)/R.y*3.2;',
    ' float t=T*.05;',
    ' for(int i=1;i<5;i++){float f=float(i);',
    '  p+=vec2(.4/f*sin(f*p.y*1.3+t*6.+f*1.7),.4/f*cos(f*p.x*1.1-t*5.+f*2.3));}',
    ' float v=.5+.5*sin(p.x*3.4+p.y*2.4+t*4.);',
    ' float rib=smoothstep(.45,.98,v);',
    ' float core=pow(rib,2.2);',
    ' vec3 base=vec3(.027,.039,.031);',
    ' vec3 deep=vec3(.05,.27,.17);',
    ' vec3 lite=vec3(.30,.62,.38);',
    ' vec3 c=base+deep*rib*.62+lite*core*.30;',
    ' c*=mix(.55,1.,smoothstep(0.,.9,uv.y));',   /* lebih redup di bawah, dekat dock */
    ' c*=.6+.4*smoothstep(1.3,.1,length(uv-vec2(.3,.95)));',
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
    var s = .4, w = Math.max(2, Math.round(innerWidth * s)), h = Math.max(2, Math.round(innerHeight * s));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
  }
  var t0 = performance.now(), last = 0, raf = 0;
  function draw(now) {
    raf = 0;
    if (document.hidden) return;
    if (now - last > 33 || still) {
      last = now; size();
      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, still ? 8 : (now - t0) / 1000 + 8);
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
