#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

uniform sampler2D u_Texture;

in vec2 v_Texture;

out vec4 f_Color;

void main() {
    f_Color = texture(u_Texture, v_Texture);
}
