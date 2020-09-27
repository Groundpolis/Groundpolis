import React from 'react';
import { isSignedIn } from '../scripts/api';

import Welcome from './Welcome';
import Home from './Home';

export default function Index() {
	return isSignedIn() ? <Home /> : <Welcome />
}
