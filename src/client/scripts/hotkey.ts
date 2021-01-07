import keyCode from './keycode';

type Keymap = Record<string, Function>;

type Pattern = {
	which: string[];
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
};

type Action = {
	patterns: Pattern[];
	callback: Function;
	allowRepeat: boolean;
};

const parseKeymap = (keymap: Keymap) => Object.entries(keymap).map(([patterns, callback]): Action => {
	const result = {
		patterns: [],
		callback: callback,
		allowRepeat: true
	} as Action;

	if (patterns.match(/^\(.*\)$/) !== null) {
		result.allowRepeat = false;
		patterns = patterns.slice(1, -1);
	}

	result.patterns = patterns.split('|').map(part => {
		const pattern = {
			which: [],
			ctrl: false,
			alt: false,
			shift: false
		} as Pattern;

		const keys = part.trim().split('+').map(x => x.trim().toLowerCase());
		for (const key of keys) {
			switch (key) {
				case 'ctrl': pattern.ctrl = true; break;
				case 'alt': pattern.alt = true; break;
				case 'shift': pattern.shift = true; break;
				default: pattern.which = keyCode(key).map(k => k.toLowerCase());
			}
		}

		return pattern;
	});

	return result;
});

const ignoreElemens = ['input', 'textarea'];

function match(e: KeyboardEvent, patterns: Action['patterns']): boolean {
	const key = e.code.toLowerCase();
	return patterns.some(pattern => pattern.which.includes(key) &&
		pattern.ctrl === e.ctrlKey &&
		pattern.shift === e.shiftKey &&
		pattern.alt === e.altKey &&
		!e.metaKey
	);
}

export const makeHotkey = (keymap: Keymap) => {
	const actions = parseKeymap(keymap);

	return (e: KeyboardEvent) => {
		if (document.activeElement) {
			if (ignoreElemens.some(el => document.activeElement!.matches(el))) return;
			if (document.activeElement.attributes['contenteditable']) return;
		}

		for (const action of actions) {
			const matched = match(e, action.patterns);

			if (matched) {
				if (!action.allowRepeat && e.repeat) return;

				e.preventDefault();
				e.stopPropagation();
				action.callback(e);
				break;
			}
		}
	};
};
