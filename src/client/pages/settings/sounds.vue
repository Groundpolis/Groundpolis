<template>
<FormBase>
	<FormRange v-model:value="masterVolume" :min="0" :max="1" :step="0.05">
		<template #label><Fa :icon="volumeIcon" :key="volumeIcon"/> {{ $ts.masterVolume }}</template>
	</FormRange>

	<FormGroup>
		<template #label>{{ $ts.sounds }}</template>
		<MkFolder v-for="type in Object.keys(sounds)" :key="type" class="_vMargin" :expanded="false">
			<template #header>{{ $t('_sfx.' + type) }}</template>
			<div class="_px-2 _py-2 _card _mb-2">
				<MkSelect class="_mb-2" :value="sounds[type].type" @change="setType(type, $event.target.value)">
					<template #label>{{ $ts.sounds }}</template>
					<option v-for="item in soundsTypes" :value="item" :key="item">{{ item === null ? $ts.none : item }}</option>
				</MkSelect>
				<div class="_hstack dense">
					<MkRange class="_ma-0 range" :value="sounds[type].volume" @change="setVolume(type, $event.target.value)" :min="0" :max="1" :step="0.05">
						<template #label>{{ $ts.volume }}</template>
					</MkRange>
					<button class="_btn _pa-0" @click="play(type)" style="width: 36px; height: 36px"><Fa :icon="faPlay"/></button>
				</div>
			</div>
		</MkFolder>
	</FormGroup>

	<FormButton @click="reset()" danger><Fa :icon="faRedo"/> {{ $ts.default }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faMusic, faPlay, faVolumeUp, faVolumeMute, faChevronDown, faRedo } from '@fortawesome/free-solid-svg-icons';
import FormRange from '@/components/form/range.vue';
import FormSelect from '@/components/form/select.vue';
import FormBase from '@/components/form/base.vue';
import FormButton from '@/components/form/button.vue';
import FormGroup from '@/components/form/group.vue';
import MkFolder from '@/components/ui/folder.vue';
import MkSelect from '@/components/ui/select.vue';
import MkRange from '@/components/ui/range.vue';
import * as os from '@/os';
import { ColdDeviceStorage } from '@/store';
import { playFile } from '@/scripts/sound';

const soundsTypes = [
	null,
	'syuilo/up',
	'syuilo/down',
	'syuilo/pope1',
	'syuilo/pope2',
	'syuilo/waon',
	'syuilo/popo',
	'syuilo/triple',
	'syuilo/poi1',
	'syuilo/poi2',
	'syuilo/pirori',
	'syuilo/pirori-wet',
	'syuilo/pirori-square-wet',
	'syuilo/square-pico',
	'syuilo/reverved',
	'syuilo/ryukyu',
	'syuilo/kick',
	'syuilo/snare',
	'aisha/1',
	'aisha/2',
	'aisha/3',
	'noizenecio/kick_gaba',
	'noizenecio/kick_gaba2',
	'xeltica/alert',
	'xeltica/marimba_1',
	'xeltica/marimba_2',
	'xeltica/marimba_3',
	'xeltica/marimba_4',
];

export default defineComponent({
	components: {
		FormSelect,
		FormButton,
		FormBase,
		FormRange,
		FormGroup,
		MkFolder,
		MkSelect,
		MkRange,
	},

	emits: ['info'],

	data() {
		return {
			INFO: {
				title: this.$ts.sounds,
				icon: faMusic
			},
			sounds: {} as Record<string, {type: string, volume: number}>,
			soundsTypes,
			faMusic, faPlay, faVolumeUp, faVolumeMute, faChevronDown, faRedo,
		}
	},

	computed: {
		masterVolume: { // TODO: (外部)関数にcomputedを使うのはアレなので直す
			get() { return ColdDeviceStorage.get('sound_masterVolume'); },
			set(value) { ColdDeviceStorage.set('sound_masterVolume', value); }
		},
		volumeIcon() {
			return this.masterVolume === 0 ? faVolumeMute : faVolumeUp;
		}
	},

	created() {
		this.sounds.note = ColdDeviceStorage.get('sound_note');
		this.sounds.noteMy = ColdDeviceStorage.get('sound_noteMy');
		this.sounds.notification = ColdDeviceStorage.get('sound_notification');
		this.sounds.chat = ColdDeviceStorage.get('sound_chat');
		this.sounds.chatBg = ColdDeviceStorage.get('sound_chatBg');
		this.sounds.antenna = ColdDeviceStorage.get('sound_antenna');
		this.sounds.channel = ColdDeviceStorage.get('sound_channel');
		this.sounds.reversiPutBlack = ColdDeviceStorage.get('sound_reversiPutBlack');
		this.sounds.reversiPutWhite = ColdDeviceStorage.get('sound_reversiPutWhite');
	},

	mounted() {
		this.$emit('info', this.INFO);
	},

	methods: {
		async edit(type) {
			const { canceled, result } = await os.form(this.$t('_sfx.' + type), {
				type: {
					type: 'enum',
					enum: soundsTypes.map(x => ({
						value: x,
						label: x == null ? this.$ts.none : x,
					})),
					label: this.$ts.sound,
					default: this.sounds[type].type,
				},
				volume: {
					type: 'range',
					mim: 0,
					max: 1,
					step: 0.05,
					label: this.$ts.volume,
					default: this.sounds[type].volume
				},
				listen: {
					type: 'button',
					content: this.$ts.listen,
					action: (_, values) => {
						playFile(values.type, values.volume);
					}
				}
			});
			if (canceled) return;

			const v = {
				type: result.type,
				volume: result.volume,
			};

			ColdDeviceStorage.set('sound_' + type, v);
			this.sounds[type] = v;
		},

		reset() {
			for (const sound of Object.keys(this.sounds)) {
				const v = ColdDeviceStorage.default['sound_' + sound];
				ColdDeviceStorage.set('sound_' + sound, v);
				this.sounds[sound] = v;
			}
		},

		setType(key: string, type: string) {
			const v = {
				type: type,
				volume: this.sounds[key].volume,
			};

			ColdDeviceStorage.set('sound_' + key, v);
			this.sounds[key] = v;
		},

		setVolume(key: string, value: number) {
			const v = {
				type: this.sounds[key].type,
				volume: value,
			};

			ColdDeviceStorage.set('sound_' + key, v);
			this.sounds[key] = v;
		},

		play(key: string) {
			const {type, volume} = this.sounds[key];
			playFile(type, volume);
		}
	}
});
</script>

<style lang="scss" scoped>
.range {
	display: flex;
	align-items: center;
}
</style>
