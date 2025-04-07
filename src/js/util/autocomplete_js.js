import { localCompletionSource } from "@codemirror/lang-javascript";
import { autocompletion } from "@codemirror/autocomplete";
import { vec2, vec3, vec4, mat2, mat3, mat4 } from "gl-matrix";

// convert array of keys to array of options
function options(keys, getType) {
	return keys.map(p => {
		return {
			label: p,
			type: getType(p)
		};
	})
}
const gl = document.createElement("canvas").getContext("webgl2");
const options_gl = options(Object.keys(gl.__proto__), p => typeof gl[p]);
const options_vec2 = options(Object.keys(vec2), p => typeof vec2[p]);
const options_vec3 = options(Object.keys(vec3), p => typeof vec3[p]);
const options_vec4 = options(Object.keys(vec4), p => typeof vec4[p]);
const options_mat2 = options(Object.keys(mat2), p => typeof mat2[p]);
const options_mat3 = options(Object.keys(mat3), p => typeof mat3[p]);
const options_mat4 = options(Object.keys(mat4), p => typeof mat4[p]);
const options_Math = options(Object.getOwnPropertyNames(Math), p => typeof Math[p]);
const options_base = [
	{ label: "gl", type: "object" },
	{ label: "vec2", type: "object" },
	{ label: "vec3", type: "object" },
	{ label: "vec4", type: "object" },
	{ label: "mat2", type: "object" },
	{ label: "mat3", type: "object" },
	{ label: "mat4", type: "object" },
	{ label: "Math", type: "object" },
	{ label: "toRadian", type: "function" },
	{ label: "fetchProgram", type: "function" },
	{ label: "loadProgram", type: "function" },
	{ label: "loadShader", type: "function" },
	{ label: "loadTexture", type: "function" },
	{ label: "loadGLTF", type: "function" },
	{ label: "loadInternalGLTF", type: "function" },
	{ label: "initProcessedGLTF", type: "function" },
	{ label: "loadAndInitGLTF", type: "function" },
	{ label: "disposeGLTF", type: "function" },
	{ label: "renderGLTF", type: "function" }
];

// if regex matches returns CompletionResult
// from: regex match start + length of group 1
// options: getOptions(regexMatch)
// validFor: /^\w*$/
// otherwise returns null
function autocomplete_match(context, regex, getOptions) {
	const before = context.matchBefore(regex);
	if (before) {
		const match = before.text.match(regex);
		const options = getOptions(match);
		if (options) {
			return {
				from: before.from + match[1].length,
				options: options,
				validFor: /^\w*$/
			};
		}
	}
	return null;
}
export const autocomplete_js = autocompletion({
	override: [context => {
		let autocomplete;
		if (autocomplete = autocomplete_match(context, /((?:^|[^\w\.])gl\.)\w*/, _ => options_gl)) {
			return autocomplete;
		}
		if (autocomplete = autocomplete_match(context, /((?:^|[^\w\.])((?:vec|mat)\d)\.)\w*/, match => {
			switch (match[2]) {
				case "vec2":
					return options_vec2;
				case "vec3":
					return options_vec3;
				case "vec4":
					return options_vec4;
				case "mat2":
					return options_mat2;
				case "mat3":
					return options_mat3;
				case "mat4":
					return options_mat4;
				default:
					return null;
			}
		})) {
			return autocomplete;
		}
		if (autocomplete = autocomplete_match(context, /((?:^|[^\w\.])Math\.)\w*/, _ => options_Math)) {
			return autocomplete;
		}
		const autocomplete_local = localCompletionSource(context);
		const autocomplete_base = autocomplete_match(context, /((?:^|[^\w\.]))\w*/, _ => options_base);
		if (autocomplete_local) {
			if (autocomplete_base) {
				const result = {};
				Object.keys(autocomplete_local).filter(p => p !== "options").forEach(p => result[p] = autocomplete_local[p]);
				result.options = autocomplete_local.options.concat(autocomplete_base.options);
				return result;
			}
			return autocomplete_local;
		} else {
			return autocomplete_base;
		}
	}]
});
