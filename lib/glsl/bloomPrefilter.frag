precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform float threshold;

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;
  float brightness = dot(color, vec3(0.299, 0.587, 0.114));
  color = brightness > threshold ? color : vec3(0.0);
  gl_FragColor = vec4(color, 1.0);
}
