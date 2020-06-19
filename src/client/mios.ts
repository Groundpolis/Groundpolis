import autobind from 'autobind-decorator';
import Vue from 'vue';
import { EventEmitter } from 'eventemitter3';

import { apiUrl } from './config';
import Progress from './scripts/loading';

import Stream from './scripts/stream';
import store from './store';

/**
 * Misskey Operating System
 */
export default class MiOS extends EventEmitter {
	public app: Vue;

	public store: ReturnType<typeof store>;

	/**
	 * A connection manager of home stream
	 */
	public stream: Stream;

	constructor(vuex: MiOS['store']) {
		super();
		this.store = vuex;
	}

	@autobind
	public signout() {
		this.store.dispatch('logout');
		location.href = '/';
	}

	/**
	 * Initialize MiOS (boot)
	 * @param callback A function that call when initialized
	 */
	@autobind
	public async init(callback) {
		const finish = () => {
			callback();

			this.store.dispatch('instance/fetch');
		};

		// ユーザーをフェッチしてコールバックする
		const fetchme = (token, cb) => {
			let me = null;

			// Return when not signed in
			if (token == null || token === 'null') {
				return done();
			}

			// Fetch user
			fetch(`${apiUrl}/i`, {
				method: 'POST',
				body: JSON.stringify({
					i: token
				})
			})
			// When success
			.then(res => {
				// When failed to authenticate user
				if (res.status !== 200 && res.status < 500) {
					return this.signout();
				}

				// Parse response
				res.json().then(i => {
					me = i;
					me.token = token;
					done();
				});
			})
			// When failure
			.catch(() => {
				// Render the error screen
				document.body.innerHTML = '<div id="err">Oops!</div>';

				Progress.done();
			});

			function done() {
				if (cb) cb(me);
			}
		};

		// フェッチが完了したとき
		const fetched = () => {
			this.emit('signedin');

			this.initStream();

			// Finish init
			finish();
		};

		// キャッシュがあったとき
		if (this.store.state.i != null) {
			if (this.store.state.i.token == null) {
				this.signout();
				return;
			}

			// とりあえずキャッシュされたデータでお茶を濁して(?)おいて、
			fetched();

			// 後から新鮮なデータをフェッチ
			fetchme(this.store.state.i.token, freshData => {
				this.store.dispatch('mergeMe', freshData);
			});
		} else {
			// Get token from localStorage
			let i = localStorage.getItem('i');

			// 連携ログインの場合用にCookieを参照する
			if (i == null || i === 'null') {
				i = (document.cookie.match(/igi=(\w+)/) || [null, null])[1];
			}

			fetchme(i, me => {
				if (me) {
					this.store.dispatch('login', me);
					fetched();
				} else {
					this.initStream();

					// Finish init
					finish();
				}
			});
		}
	}

	@autobind
	private initStream() {
		this.stream = new Stream(this);
	}
}
