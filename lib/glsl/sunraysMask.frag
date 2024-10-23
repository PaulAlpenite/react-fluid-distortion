precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;

void main() {
  vec3 color = texture2D(uTexture, vUv).rgb;
  float brightness = dot(color, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(vec3(brightness), 1.0);
}
