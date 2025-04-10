#version 300 es

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

in vec3 a_Position;
in vec2 a_Texture;
in vec4 a_Color;

out vec3 v_Position;
out vec2 v_Texture;
out vec4 v_Color;

void main() {
    gl_PointSize = 10.0;
    vec4 modelPosition = u_ModelMatrix * vec4(a_Position, 1.0);
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * modelPosition;
    v_Position = vec3(modelPosition);
    v_Texture = a_Texture;
    v_Color = a_Color;
}
