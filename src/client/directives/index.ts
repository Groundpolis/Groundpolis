import { App } from 'vue';

import userPreview from './user-preview';
import size from './size';
import particle from './particle';
import tooltip from './tooltip';
import hotkey from './hotkey';
import appear from './appear';
import anim from './anim';

export default function(app: App) {
	app.directive('userPreview', userPreview);
	app.directive('user-preview', userPreview);
	app.directive('size', size);
	app.directive('particle', particle);
	app.directive('tooltip', tooltip);
	app.directive('hotkey', hotkey);
	app.directive('appear', appear);
	app.directive('anim', anim);
}
