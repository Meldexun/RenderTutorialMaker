#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec3 a_Position;
in vec2 a_Texture;

out vec2 v_Texture;

void main() {
    gl_PointSize = 10.0;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    v_Texture = a_Texture;
}
