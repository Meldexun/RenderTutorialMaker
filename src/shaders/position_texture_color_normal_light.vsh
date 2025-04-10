#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec3 a_Position;
in vec2 a_Texture;
in vec4 a_Color;
in vec3 a_Normal;

out vec3 v_Position;
out vec2 v_Texture;
out vec4 v_Color;
out vec3 v_Normal;

void main() {
    gl_PointSize = 10.0;
    vec4 modelPosition = u_ModelMatrix * vec4(a_Position, 1.0);
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelPosition;
    v_Position = vec3(modelPosition);
    v_Texture = a_Texture;
    v_Color = a_Color;
    v_Normal = mat3(transpose(inverse(u_ModelMatrix))) * a_Normal;
}
