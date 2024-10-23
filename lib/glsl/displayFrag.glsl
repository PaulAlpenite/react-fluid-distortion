// displayFrag.glsl
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;        // Fluid texture
uniform sampler2D uBloomTexture;   // Bloom texture
uniform sampler2D uSunraysTexture; // Sunrays texture
uniform float bloomIntensity;
uniform float sunraysIntensity;

void main() {
    // Sample the fluid texture
    vec3 baseColor = texture2D(uTexture, vUv).rgb;

    // Sample the bloom texture
    vec3 bloomColor = texture2D(uBloomTexture, vUv).rgb;

    // Sample the sunrays texture
    vec3 sunraysColor = texture2D(uSunraysTexture, vUv).rgb;

    // Combine the colors with their respective intensities
    vec3 finalColor = baseColor + bloomColor * bloomIntensity + sunraysColor * sunraysIntensity;

    // Output the final color
    gl_FragColor = vec4(finalColor, 1.0);
}
