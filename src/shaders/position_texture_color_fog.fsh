#version 300 es

precision mediump float;

uniform sampler2D u_Texture;

uniform int u_FogMode;
uniform float u_FogStart;
uniform float u_FogEnd;
uniform float u_FogDensity;
uniform vec4 u_FogColor;
uniform mat4 u_FogMatrix;

in vec3 v_Position;
in vec2 v_Texture;
in vec4 v_Color;

out vec4 f_Color;

vec4 linear_fog(vec4 inColor, float vertexDistance) {
    float fogValue = clamp((vertexDistance - u_FogStart) / (u_FogEnd - u_FogStart), 0.0, 1.0);
    return vec4(mix(inColor.rgb, u_FogColor.rgb, fogValue * u_FogColor.a), inColor.a);
}

vec4 exp_fog(vec4 inColor, float vertexDistance) {
    float fogValue = clamp(1.0 - exp(-u_FogDensity * vertexDistance), 0.0, 1.0);
    return vec4(mix(inColor.rgb, u_FogColor.rgb, fogValue * u_FogColor.a), inColor.a);
}

vec4 exp2_fog(vec4 inColor, float vertexDistance) {
    float fogValue = clamp(1.0 - exp(-pow(u_FogDensity, 2.0) * pow(vertexDistance, 2.0)), 0.0, 1.0);
    return vec4(mix(inColor.rgb, u_FogColor.rgb, fogValue * u_FogColor.a), inColor.a);
}

vec4 apply_fog(vec4 inColor, float vertexDistance) {
    if (u_FogMode == 0) {
        return linear_fog(inColor, vertexDistance);
    } else if (u_FogMode == 1) {
        return exp_fog(inColor, vertexDistance);
    } else if (u_FogMode == 2) {
        return exp2_fog(inColor, vertexDistance);
    }

    return inColor;
}

void main() {
    f_Color = texture(u_Texture, v_Texture) * v_Color;
    f_Color = apply_fog(f_Color, length((u_FogMatrix * vec4(v_Position, 1.0)).xyz));
}
