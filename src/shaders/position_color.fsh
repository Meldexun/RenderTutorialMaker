#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec4 v_Color;

out vec4 f_Color;

void main() {
    f_Color = v_Color;
}
