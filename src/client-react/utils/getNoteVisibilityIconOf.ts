import { faEnvelope, faGlobe, faHome, faLock, faUsers } from '@fortawesome/free-solid-svg-icons'

export const getNoteVisibilityIconOf = (vis: string) => { 
	switch (vis) { 
		case 'public': return faGlobe;
		case 'home': return faHome;
		case 'followers': return faLock;
		case 'specified': return faEnvelope;
		case 'users': return faUsers;
		default: return null;
	}
}
