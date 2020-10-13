import React from 'react';
import Window from '../components/Window';
import { faCat, faCheck, faPlus, faRadiation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from '../components/Spinner';
import { ShellHeader } from '../teleporters';
import { DefaultHeader } from '../components/DefaultHeader';

export default function UITest() { 
	return (
		<div className="_container _vstack">
			<ShellHeader.Source>
				<DefaultHeader title="Groundpolis UI Debugger"/>
			</ShellHeader.Source>
			<h1>Heading</h1>
			<div>
				<h1>Level 1</h1>
				<h2>Level 2</h2>
				<h3>Level 3</h3>
				<h4>Level 4</h4>
				<h5>Level 5</h5>
				<h6>Level 6</h6>
				<p>Hi! I am just a paragraph.</p>
			</div>
			<h1>Button</h1>
			<div className="_hstack">
				<button className="_button">
					Button
				</button>
				<button className="_button primary">
					Primary
				</button>
				<button className="_button danger">
					Danger
				</button>
				<button className="_button command">
					<FontAwesomeIcon icon={faPlus}/>
				</button>
				<button className="_button command primary">
					<FontAwesomeIcon icon={faCheck} />
				</button>
				<button className="_button command danger">
					<FontAwesomeIcon icon={faRadiation} />
				</button>
			</div>
			<div className="_hstack">
				<button className="_button" disabled>
					Disabled
				</button>
				<button className="_button primary" disabled>
					Primary
				</button>
				<button className="_button danger" disabled>
					Danger
				</button>
				<button className="_button command" disabled>
					<FontAwesomeIcon icon={faPlus} />
				</button>
				<button className="_button command primary" disabled>
					<FontAwesomeIcon icon={faCheck} />
				</button>
				<button className="_button command danger" disabled>
					<FontAwesomeIcon icon={faRadiation} />
				</button>
			</div>
			<div className="_hstack">
				<button className="_button static">
					<FontAwesomeIcon icon={faPlus} />
				</button>
				<button className="_button static primary">
					<FontAwesomeIcon icon={faCheck} />
				</button>
				<button className="_button static danger">
					<FontAwesomeIcon icon={faRadiation} />
				</button>
				<button className="_button static" disabled>
					<FontAwesomeIcon icon={faPlus} />
				</button>
				<button className="_button static primary" disabled>
					<FontAwesomeIcon icon={faCheck} />
				</button>
				<button className="_button static danger" disabled>
					<FontAwesomeIcon icon={faRadiation} />
				</button>
			</div>
			<h1>Spinner</h1>
			<Spinner relative />
			<h1>Box</h1>
			<div className="_box">
				<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium dolor eum provident accusamus quis eligendi eos. Obcaecati fugit architecto odit provident quae deleniti non aperiam, dolore reprehenderit, iure eum perspiciatis id illo dolorum nesciunt quo, mollitia officiis! Debitis, sit suscipit? Laboriosam earum numquam vitae non minima enim, similique ab, porro error illum fuga tenetur. Enim fuga quo nam dolorem. Soluta impedit delectus molestiae amet, eaque nostrum adipisci a dolorem vero, itaque aspernatur iusto voluptatem aliquid ea debitis hic inventore. Perspiciatis recusandae itaque perferendis nulla nihil, dolorum, praesentium id voluptates, earum adipisci consequuntur corrupti cupiditate? Labore dolorem at odit eius molestias!</div>
			</div>
			<h1>Window</h1>
			<Window title="Lorem ipsum" icon={faCat}>
				<div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Laudantium dolor eum provident accusamus quis eligendi eos. Obcaecati fugit architecto odit provident quae deleniti non aperiam, dolore reprehenderit, iure eum perspiciatis id illo dolorum nesciunt quo, mollitia officiis! Debitis, sit suscipit? Laboriosam earum numquam vitae non minima enim, similique ab, porro error illum fuga tenetur. Enim fuga quo nam dolorem. Soluta impedit delectus molestiae amet, eaque nostrum adipisci a dolorem vero, itaque aspernatur iusto voluptatem aliquid ea debitis hic inventore. Perspiciatis recusandae itaque perferendis nulla nihil, dolorum, praesentium id voluptates, earum adipisci consequuntur corrupti cupiditate? Labore dolorem at odit eius molestias!</div>
			</Window>
			<h1>Dialog</h1>
			<div className="_hstack">
				<button className="_button primary">
					Dialog
				</button>
				<button className="_button primary">
					Confirm
				</button>
				<button className="_button primary">
					Input Text
				</button>
				<button className="_button primary">
					Select Value
				</button>
				<button className="_button command primary">
					<FontAwesomeIcon icon={faCheck}/>
				</button>
				<button className="_button command primary">
					<Spinner relative/>
				</button>
			</div>
		</div>
	);
}
