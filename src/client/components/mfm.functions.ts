import { i18n } from "@/i18n";

export type MfmFunctionProp = {
	label?: string,
	description?: string,
	hasValue: boolean,
};

export type MfmFunctionProps = Record<string, MfmFunctionProp>;

export type MfmFunctionStyleProp = Record<string, string | undefined>;

function genProp(label?: string, description?: string): MfmFunctionProp {
	return {
		hasValue: true,
		label: label ? i18n.t(label) : undefined,
		description: description ? i18n.t(description) : undefined,
	};
}

function genFlagProp(label?: string, description?: string): MfmFunctionProp {
	return {
		hasValue: false,
		label: label ? i18n.t(label) : undefined,
		description: description ? i18n.t(description) : undefined,
	};
}

export type MfmFunctionDefinition = string | {
	props?: MfmFunctionProps,
	style?: (props: MfmFunctionStyleProp) => string,
	class?: string,
	noAnimatedMfmStyle?: true | ((props: MfmFunctionStyleProp) => string),
	isGroundpolisExtension?: boolean,
};

export const mfmFunctions: Record<string, MfmFunctionDefinition> = {
	tada: {
		style: _ => 'font-size: 150%; animation: tada 1s linear infinite both;',
		noAnimatedMfmStyle: _ => 'font-size: 150%',
	},
	wobble: {
		style: _ => 'font-size: 300%; animation: mfm-wobble 1s ease-out infinite both;',
		noAnimatedMfmStyle: _ => 'font-size: 300%',
	},
	jelly: {
		props: {
			speed: genProp('_mfmpad._functions.speed'),
		},
		style: args => `animation: mfm-rubberBand ${args.speed || '1s'} linear infinite both;`
	},
	twitch: {
		props: {
			speed: genProp('_mfmpad._functions.speed'),
		},
		style: args => `animation: mfm-twitch ${args.speed || '0.5s'} ease infinite;`
	},
	shake: {
		props: {
			speed: genProp('_mfmpad._functions.speed'),
		},
		style: args => `animation: mfm-shake ${args.speed || '0.5s'} ease infinite;`
	},
	spin: {
		props: {
			left: genFlagProp('_mfmpad._functions.spinLeft'),
			alternate: genFlagProp('_mfmpad._functions.spinAlternate'),
			x: genFlagProp('_mfmpad._functions.xspin'),
			y: genFlagProp('_mfmpad._functions.yspin'),
			speed: genProp('_mfmpad._functions.speed', '_mfmpad._functions.spinSpeedDescription'),
		},
		style: args => {
			const direction = args.left ? 'reverse' : args.alternate ? 'alternate' :
				'normal';
			const anime = args.x ? 'mfm-spinX' : args.y ? 'mfm-spinY' : 'mfm-spin';
			const speed = args.speed || '1.5s';
			return `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};`;
		}
	},
	jump: 'animation: mfm-jump 0.75s linear infinite',
	blink: {
		props: {
			speed: genProp('_mfmpad._functions.speed'),
		},
		style: args => `animation: mfm-blink ${args.speed || '1s'} step-end infinite`,
		isGroundpolisExtension: true,
	},
	bounce: {
		style: _ => 'animation: mfm-bounce 0.75s linear infinite; transform-origin: center bottom',
		noAnimatedMfmStyle: true,
		isGroundpolisExtension: true,
	},
	rainbow: {
		style: _ => 'color: var(--accent); animation: mfm-rainbow 1s linear infinite both',
		noAnimatedMfmStyle: true,
		isGroundpolisExtension: true,
	},
	flip: {
		props: {
			h: genFlagProp('_mfmpad._functions.hflip'),
			v: genFlagProp('_mfmpad._functions.vflip'),
		},
		style: args => 'transform:' + (args.h && args.v ? 'scale(-1, -1)' : args.v ? 'scaleY(-1)' : 'scaleX(-1)'),
		noAnimatedMfmStyle: true,
	},
	rotate: {
		props: {
			angle: genProp('_mfmpad._functions.angle', '_mfmpad._functions.rotateAngleDescription'),
			x: genFlagProp('_mfmpad._functions.xspin'),
			y: genFlagProp('_mfmpad._functions.yspin'),
		},
		style: args => {
			const f = args.x ? 'perspective(128px) rotateX' : args.y ? 'perspective(128px) rotateY' : 'rotate';
			return `transform: ${f}(${args.angle || '90'}deg); transform-origin: center center`;
		},
		noAnimatedMfmStyle: true,
		isGroundpolisExtension: true,
	},
	font: {
		props: {
			size: genProp('_mfmpad._functions.size', '_mfmpad._functions.fontSizeDescription'),
			color: genProp('_mfmpad._functions.color', '_mfmpad._functions.fontColorDescription'),
			serif: genFlagProp('_mfmpad._functions.serif'),
			monospace: genFlagProp('_mfmpad._functions.monospace'),
			cursive: genFlagProp('_mfmpad._functions.cursive'),
			fantasy: genFlagProp('_mfmpad._functions.fantasy'),
			emoji: genFlagProp('_mfmpad._functions.emoji'),
			math: genFlagProp('_mfmpad._functions.math'),
		},
		style: prop => {
			const family =
				prop.serif ? 'font-family: serif' :
				prop.monospace ? 'font-family: monospace' :
				prop.cursive ? 'font-family: cursive' :
				prop.fantasy ? 'font-family: fantasy' :
				prop.emoji ? 'font-family: emoji' :
				prop.math ? 'font-family: math' :
				null;
			return `font-size: ${prop.size || 'unset'}; color: ${prop.color || 'unset'}; ${family}`
		},
		noAnimatedMfmStyle: true,
		isGroundpolisExtension: true,
	},
	x2: 'font-size: 200%',
	x3: 'font-size: 400%',
	x4: 'font-size: 600%',
	blur: {
		class: '_mfm_blur_',
	},
};
