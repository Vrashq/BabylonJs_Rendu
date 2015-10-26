uniform sampler2D uTex;
varying vec2 vUv;

void main() {
    vec4 texelColor = texture2D( uTex, vUv );
    vec4 color = vec4(1.0,0.0,0.0,1.0);
    gl_FragColor = vec4(mix(color.rgb,texelColor.rgb,texelColor.a),texelColor.a);
}