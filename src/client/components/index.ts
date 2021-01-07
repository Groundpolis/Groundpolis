import { App } from 'vue';

import mfm from './global/misskey-flavored-markdown.vue';
import a from './global/a.vue';
import acct from './global/acct.vue';
import avatar from './global/avatar.vue';
import emoji from './global/emoji.vue';
import userName from './global/user-name.vue';
import ellipsis from './global/ellipsis.vue';
import time from './global/time.vue';
import url from './global/url.vue';
import i18n from './global/i18n';
import loading from './global/loading.vue';
import error from './global/error.vue';
import plainText from './global/plain-text.vue';

export default function(app: App) {
	app.component('Mfm', mfm);
	app.component('MkA', a);
	app.component('MkAcct', acct);
	app.component('MkAvatar', avatar);
	app.component('MkEmoji', emoji);
	app.component('MkUserName', userName);
	app.component('MkEllipsis', ellipsis);
	app.component('MkTime', time);
	app.component('MkUrl', url);
	app.component('MkLoading', loading);
	app.component('MkError', error);
	app.component('MkPlainText', plainText);
	app.component('I18n', i18n);
}
