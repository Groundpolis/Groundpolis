import { locale } from '../../config';

export default ($root: any) => {
	const setAvatar = file => {
		return $root.api('i/update', {
			avatarId: file.id
		}).then(i => {
			$root.$store.commit('updateIKeyValue', {
				key: 'avatarId',
				value: i.avatarId
			});
			$root.$store.commit('updateIKeyValue', {
				key: 'avatarUrl',
				value: i.avatarUrl
			});

			$root.dialog({
				title: locale['desktop']['avatar-updated'],
				text: null
			});

			return i;
		}).catch(err => {
			switch(err.id) {
				case 'f419f9f8-2f4d-46b1-9fb4-49d3a2fd7191':
					$root.dialog({
						type: 'error',
						title: locale['desktop']['unable-to-process'],
						text: locale['desktop']['invalid-filetype']
					});
					break;
				default:
					$root.dialog({
						type: 'error',
						text: locale['desktop']['unable-to-process']
					});
			}
		});
	};

	return (file = null) => {
		const selectedFile = file
			? Promise.resolve(file)
			: $root.$chooseDriveFile({
				multiple: false,
				type: 'image/*',
				title: locale['desktop']['choose-avatar']
			});

		return selectedFile
			.then(setAvatar)
			.catch(err => err && console.warn(err));
	};
};
