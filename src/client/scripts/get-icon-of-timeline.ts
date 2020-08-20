import { faHome, faComments, faShareAlt, faGlobe, faCat, faListUl, faBroadcastTower, faAt, faEnvelope, faCommentAlt, faProjectDiagram, faSatelliteDish } from '@fortawesome/free-solid-svg-icons';

export const getIconOfTimeline = (src: string) => {
	switch (src) {
		case 'home': return faHome;
		case 'local': return faComments;
		case 'social': return faShareAlt;
		case 'global': return faGlobe;
		case 'cat': return faCat;
		case 'list': return faListUl;
		case 'antenna': return faBroadcastTower;
		case 'channel': return faSatelliteDish;
		case 'mentions': return faAt;
		case 'direct': return faEnvelope;
		case 'followers': return faCommentAlt;
		case 'remoteFollowing': return faProjectDiagram;
		default: return null;
	}
}
