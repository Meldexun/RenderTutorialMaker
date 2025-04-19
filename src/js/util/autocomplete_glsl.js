import { autocompletion } from "@codemirror/autocomplete";

// convert array of keys to array of options
const options_base = [
	{ label: "uniform", type: "keyword" },
	{ label: "in", type: "keyword" },
	{ label: "out", type: "keyword" },
	{ label: "struct", type: "keyword" },

	{ label: "void", type: "type" },

	{ label: "bool", type: "type" },
	{ label: "bvec2", type: "type" },
	{ label: "bvec3", type: "type" },
	{ label: "bvec4", type: "type" },

	{ label: "int", type: "type" },
	{ label: "ivec2", type: "type" },
	{ label: "ivec3", type: "type" },
	{ label: "ivec4", type: "type" },

	{ label: "uint", type: "type" },
	{ label: "uvec2", type: "type" },
	{ label: "uvec3", type: "type" },
	{ label: "uvec4", type: "type" },

	{ label: "float", type: "type" },
	{ label: "vec2", type: "type" },
	{ label: "vec3", type: "type" },
	{ label: "vec4", type: "type" },

	{ label: "mat2", type: "type" },
	{ label: "mat2x3", type: "type" },
	{ label: "mat2x4", type: "type" },
	{ label: "mat3", type: "type" },
	{ label: "mat3x2", type: "type" },
	{ label: "mat3x4", type: "type" },
	{ label: "mat4", type: "type" },
	{ label: "mat4x2", type: "type" },
	{ label: "mat4x3", type: "type" },

	{ label: "sampler2D", type: "type" },

	{ label: "abs", type: "function" },
	{ label: "min", type: "function" },
	{ label: "max", type: "function" },
	{ label: "floor", type: "function" },
	{ label: "ceil", type: "function" },
	{ label: "round", type: "function" },
	{ label: "mod", type: "function" },
	{ label: "clamp", type: "function" },
	{ label: "pow", type: "function" },
	{ label: "sqrt", type: "function" },
	{ label: "log", type: "function" },
	{ label: "log2", type: "function" },
	{ label: "exp", type: "function" },
	{ label: "exp2", type: "function" },

	{ label: "radians", type: "function" },
	{ label: "degrees", type: "function" },
	{ label: "sin", type: "function" },
	{ label: "sinh", type: "function" },
	{ label: "asin", type: "function" },
	{ label: "asinh", type: "function" },
	{ label: "cos", type: "function" },
	{ label: "cosh", type: "function" },
	{ label: "acos", type: "function" },
	{ label: "acosh", type: "function" },
	{ label: "tan", type: "function" },
	{ label: "tanh", type: "function" },
	{ label: "atan", type: "function" },
	{ label: "atanh", type: "function" },

	{ label: "length", type: "function" },
	{ label: "distance", type: "function" },
	{ label: "normalize", type: "function" },
	{ label: "dot", type: "function" },
	{ label: "cross", type: "function" },
	{ label: "reflect", type: "function" },
	{ label: "refract", type: "function" },
	{ label: "mix", type: "function" },

	{ label: "texture", type: "function" }
];

// if regex matches returns CompletionResult
//   from: regex match start + length of group 1
//   options: getOptions(regexMatch)
//   validFor: /^\w*$/
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
export const autocomplete_glsl = autocompletion({
	override: [context => {
		return autocomplete_match(context, /((?:^|[^\w\.]))\w*/, _ => options_base);
	}]
});
