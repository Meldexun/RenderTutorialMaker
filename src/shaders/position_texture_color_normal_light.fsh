#version 300 es

precision mediump float;

uniform sampler2D u_Texture;

in vec2 v_Texture;
in vec4 v_Color;
in vec3 v_Normal;

out vec4 f_Color;

void main() {
    f_Color = texture(u_Texture, v_Texture) * v_Color;
}
