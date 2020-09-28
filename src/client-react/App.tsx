import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

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

export const App = () => (
	<ErrorBoundary>
		<Router>
			<Switch>
				<Page exact path="/" name="Index" />
				{ /* <Page exact path='/signup' name='Signup' /> */ }
				{ /* <Page exact path='/signin' name='Signin' /> */ }
				<Page path="/my/settings" name="Settings" />
				<Page path="*" name="NotFound" />
			</Switch>
		</Router>
	</ErrorBoundary>
);
