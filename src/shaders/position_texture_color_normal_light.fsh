#version 300 es

precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

uniform sampler2D u_Texture;

// general light properties
uniform vec3 u_ViewPosition;
uniform vec3 u_LightPosition;
uniform vec4 u_AmbientColor;
uniform vec4 u_DiffuseColor;
uniform vec4 u_SpecularColor;
uniform float u_SpecularShininess;

// light attenuation
uniform float u_LightConstant;
uniform float u_LightLinear;
uniform float u_LightQuadratic;

// spotlight properties
uniform vec3 u_LightDirection;
uniform float u_LightCutoffInner;
uniform float u_LightCutoffOuter;

in vec3 v_Position;
in vec2 v_Texture;
in vec4 v_Color;
in vec3 v_Normal;

out vec4 f_Color;

void main() {
    f_Color = texture(u_Texture, v_Texture) * v_Color;

    // ambient
    vec3 ambient = u_AmbientColor.w * u_AmbientColor.xyz;

    // diffuse
    vec3 norm = normalize(v_Normal);
    vec3 lightDir = normalize(u_LightPosition - v_Position);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * u_DiffuseColor.w * u_DiffuseColor.xyz;

    // specular
    vec3 viewDir = normalize(u_ViewPosition - v_Position);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), u_SpecularShininess);
    vec3 specular = spec * u_SpecularColor.w * u_SpecularColor.xyz;

    if (u_LightConstant != 1.0 || u_LightLinear != 0.0 || u_LightQuadratic != 0.0) {
        float distance = distance(v_Position, u_LightPosition);
        float attenuation = 1.0 / (u_LightConstant + (u_LightLinear + u_LightQuadratic * distance) * distance);
        diffuse *= attenuation;
        specular *= attenuation;
    }

    if (u_LightCutoffInner > -1.0 || u_LightCutoffOuter > -1.0) {
        float intensity = clamp((dot(lightDir, -normalize(u_LightDirection)) - u_LightCutoffOuter) / (u_LightCutoffInner - u_LightCutoffOuter), 0.0, 1.0);
        diffuse *= intensity;
        specular *= intensity;
    }

    f_Color = vec4((ambient + diffuse + specular) * f_Color.xyz, f_Color.w);
}
