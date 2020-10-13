import { applyTheme, darkTheme } from '../utils/theme';

export function initializeThemes() { 
	if (localStorage.getItem('theme') == null) {
		applyTheme(darkTheme);
	}
}
