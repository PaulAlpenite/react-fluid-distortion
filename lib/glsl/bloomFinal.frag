// bloomFinal.frag
precision highp float;

varying vec2 vUv;

uniform sampler2D uBaseTexture;  // Original scene texture
uniform sampler2D uBloomTexture; // Blurred bloom texture
uniform float intensity;         // Bloom intensity

void main() {
    vec3 baseColor = texture2D(uBaseTexture, vUv).rgb;
    vec3 bloomColor = texture2D(uBloomTexture, vUv).rgb;

    // Combine the base color with the bloom color
    vec3 finalColor = baseColor + bloomColor * intensity;

    // Apply tone mapping if necessary (optional)
    // finalColor = finalColor / (finalColor + vec3(1.0));

    gl_FragColor = vec4(finalColor, 1.0);
}
