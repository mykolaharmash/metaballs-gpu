#define CIRCLE_COUNT __CIRCLE_COUNT__

precision mediump float;

uniform vec3 u_circleList[CIRCLE_COUNT];
varying vec4 v_position;

void main() {

  vec4 color;
  float effect = 0.0;
  float totalDist = 0.0;

  for (int i = 0; i < CIRCLE_COUNT; i++) {
    vec3 circle = u_circleList[i];
    float dist = distance(circle.xy, v_position.xy);

    effect += circle.z / dist;
    totalDist += dist;
  }

  if (effect >= 1.0) {
    color = vec4(1.0 - totalDist / 20.0, 0, totalDist / 20.0, 1);
  } else {
    color = vec4(0, 0, 0, 1);
  }

  gl_FragColor = color;
}
