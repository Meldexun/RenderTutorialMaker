#version 300 es

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec3 a_Position;
in vec2 a_Texture;
in vec3 a_Normal;

out vec2 v_Texture;
out vec3 v_Normal;

void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
    v_Texture = a_Texture;
    v_Normal = a_Normal;
}
