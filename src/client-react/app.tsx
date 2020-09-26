import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { NotFound } from './pages/NotFound';

export const App = () => (
	<Router>
		<Switch>
			<Route exact path='/'>
				<Welcome/>
			</Route>
			<Route path='*'>
				<NotFound/>
			</Route>
		</Switch>
	</Router>
);
