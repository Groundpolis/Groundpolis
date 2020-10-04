import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch, useRouteMatch } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import Shell from './components/Shell';
import { isSignedIn } from './utils/api';

const Page = (props: any) => {
	const Lazy = React.lazy(() => import('./pages/' + props.name));
	return (
		<Route exact={props.exact ?? false} path={props.path}>
			<Suspense fallback={<></>}>
				<Lazy />
			</Suspense>
		</Route>
	);
};

function Inner() { 
	const m = useRouteMatch();
	return (
		<Shell zenMode={m.path === '/' && m.isExact && !isSignedIn()}>
			<ErrorBoundary>
				<Switch>
					<Page exact path="/" name="Index" />
					<Page path="/signin" name="SignIn" />
					<Page path="/my/settings" name="Settings" />
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
