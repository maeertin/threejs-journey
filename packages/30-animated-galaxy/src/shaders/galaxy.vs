uniform float uSize;
uniform float uSpeed;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
  );
}

void main() {
  /**
   * Position
   */
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Spin
  float angle = atan(modelPosition.z, modelPosition.x);
  float length = length(modelPosition.xz); // Same as: distance(modelPosition.xz, vec2(0.0))
  float angleOffset = 1.0 / length * uTime * uSpeed;
  angle += angleOffset;
  modelPosition.x = cos(angle) * length;
  modelPosition.z = sin(angle) * length;

  // Or with the rotate function
  // float length = length(modelPosition.xz);
  // modelPosition.xz = rotate(modelPosition.xz, (uTime * 0.2) / length, vec2(0.0));

  // Randomness
  modelPosition.xyz += aRandomness;

  // ...
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  /**
   * Size
   */
  gl_PointSize = uSize * aScale;

  // Size attenuation formula taken from:
  // https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderLib/points.glsl.js
  gl_PointSize *= (1.0 / - viewPosition.z);

  /**
   * Varying
   */
  vColor = color;
}
