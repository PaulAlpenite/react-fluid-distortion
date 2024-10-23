// diffusion.frag
uniform sampler2D uQuantity;
uniform float diffusionRate;
uniform vec2 texelSize;

void main() {
    vec2 uv = gl_FragCoord.xy * texelSize;

    // Sample neighboring values
    vec3 center = texture2D(uQuantity, uv).rgb;
    vec3 left = texture2D(uQuantity, uv - vec2(texelSize.x, 0)).rgb;
    vec3 right = texture2D(uQuantity, uv + vec2(texelSize.x, 0)).rgb;
    vec3 down = texture2D(uQuantity, uv - vec2(0, texelSize.y)).rgb;
    vec3 up = texture2D(uQuantity, uv + vec2(0, texelSize.y)).rgb;

    // Compute Laplacian
    vec3 laplacian = left + right + up + down - 4.0 * center;

    // Update quantity
    vec3 newQuantity = center + diffusionRate * laplacian;

    gl_FragColor = vec4(newQuantity, 1.0);
}
