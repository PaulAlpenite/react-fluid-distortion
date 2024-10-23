// sunrays.frag
precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 sunPosition;
uniform float weight;
uniform float decay;
uniform float exposure;

void main() {
    vec2 delta = sunPosition - vUv;
    float dist = length(delta);
    vec2 step = delta / dist * 0.02;
    vec2 uv = vUv;
    float illuminationDecay = 1.0;
    vec3 color = vec3(0.0);

    for (int i = 0; i < 100; i++) {
        uv += step;
        vec3 sampleColor = texture2D(uTexture, uv).rgb;
        sampleColor *= illuminationDecay * weight;
        color += sampleColor;
        illuminationDecay *= decay;
    }

    gl_FragColor = vec4(color * exposure, 1.0);
}
