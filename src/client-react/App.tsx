import React, { Suspense, useEffect, useLayoutEffect } from 'react';
import { setGlobal } from 'reactn';
import { BrowserRouter as Router, Route, Switch, useRouteMatch } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import Shell from './components/Shell';
import Spinner from './components/Spinner';
import { api, isSignedIn } from './utils/api';
import { useDeviceSetting } from './settings/device';

const Page = (props: any) => {
	const Lazy = React.lazy(() => import('./pages/' + props.name));
	return (
		<Route exact={props.exact ?? false} path={props.path}>
			<Suspense fallback={<Spinner/>}>
				<Lazy />
			</Suspense>
		</Route>
	);
};

function Inner() { 
	const m = useRouteMatch();
	useEffect(() => {
		(async () => {
			setGlobal({
				meta: await api('meta'),
				i: isSignedIn() ? await api('i') : null
			});
		})();
	}, []);

	const [deviceSetting] = useDeviceSetting(); 

	return (
		<Shell zenMode={m.path === '/' && m.isExact && !isSignedIn()}>
			<ErrorBoundary>
				<Switch>
					<Page exact path="/" name="Index" />
					<Page path="/signin" name="SignIn" />
					<Page path="/my/settings" name="Settings" />
					<Page path="/uitest" name="UITest" />
					<Page path="/@:acct" name="User/Index" />
					<Page path="/notes/:noteId" name="Note" />
					<Page path="*" name="NotFound" />
				</Switch>
			</ErrorBoundary>
		</Shell>
	);
}

export function App() {
	return (
		<Router>
			<Inner/>
		</Router>
	);
}
