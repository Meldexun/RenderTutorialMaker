#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec3 a_Position;
in vec4 a_Color;

out vec4 v_Color;

void main() {
    gl_PointSize = 10.0;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    v_Color = a_Color;
}
