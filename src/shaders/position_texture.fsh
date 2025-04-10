#version 300 es

precision mediump float;

uniform sampler2D u_Texture;

in vec2 v_Texture;

out vec4 f_Color;

void main() {
    f_Color = texture(u_Texture, v_Texture);
}
