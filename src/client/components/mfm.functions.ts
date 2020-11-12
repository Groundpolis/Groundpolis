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
		label: label ? i18n.global.t(label) : undefined,
		description: description ? i18n.global.t(description) : undefined,
	};
}

function genFlagProp(label?: string, description?: string): MfmFunctionProp {
	return {
		hasValue: false,
		label: label ? i18n.global.t(label) : undefined,
		description: description ? i18n.global.t(description) : undefined,
	};
}

export type MfmFunctionDefinition = string | {
	props?: MfmFunctionProps,
	style: (props: MfmFunctionStyleProp) => string,
	noAnimatedMfmStyle?: (props: MfmFunctionStyleProp) => string,
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
			speed: genProp('_mfmpad._functions.speed'),
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
	},
	bounce: 'animation: mfm-bounce 0.75s linear infinite; transform-origin: center bottom',
	rainbow: 'color: var(--accent); animation: mfm-rainbow 1s linear infinite both',
	flip: {
		props: {
			h: genProp('_mfmpad._functions.hflip'),
			v: genProp('_mfmpad._functions.vflip'),
		},
		style: args => 'transform:' + args.h && args.v ? 'scale(-1, -1)' : args.v ? 'scaleY(-1)' : 'scaleX(-1)',
	},
};
