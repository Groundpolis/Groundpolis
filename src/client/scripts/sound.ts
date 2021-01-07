import { ColdDeviceStorage } from '@/store';

const cache = new Map<string, HTMLAudioElement>();

export function play(type: string) {
	const sound = ColdDeviceStorage.get('sound_' + type as any);
	if (sound.type == null) return;
	playFile(sound.type, sound.volume);
}

export function playFile(file: string, volume: number) {
	if (volume === 0) return;
	const masterVolume = ColdDeviceStorage.get('sound_masterVolume');
	if (masterVolume === 0) return;

	let audio: HTMLAudioElement;
	if (cache.has(file)) {
		audio = cache.get(file) as HTMLAudioElement;
	} else {
		audio = new Audio(`/assets/sounds/${file}.mp3`);
		cache.set(file, audio);
	}
	audio.volume = masterVolume - ((1 - volume) * masterVolume);
	audio.play();
}
