precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 texelSize;

void main() {
  vec3 result = vec3(0.0);
  float kernel[5];
  kernel[0] = 0.227027;
  kernel[1] = 0.1945946;
  kernel[2] = 0.1216216;
  kernel[3] = 0.054054;
  kernel[4] = 0.016216;

  for (int i = -4; i <= 4; i++) {
    float weight = kernel[abs(i)];
    result += texture2D(uTexture, vUv + texelSize * float(i)).rgb * weight;
  }

  gl_FragColor = vec4(result, 1.0);
}
