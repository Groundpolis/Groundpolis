import { locale } from '../../config';

export default ($root: any) => {
	const setBanner = file => {
		return $root.api('i/update', {
			bannerId: file.id
		}).then(i => {
			$root.$store.commit('updateIKeyValue', {
				key: 'bannerId',
				value: i.bannerId
			});
			$root.$store.commit('updateIKeyValue', {
				key: 'bannerUrl',
				value: i.bannerUrl
			});

			$root.dialog({
				title: locale['desktop']['banner-updated'],
				text: null
			});

			return i;
		}).catch(err => {
			switch(err.id) {
				case '75aedb19-2afd-4e6d-87fc-67941256fa60':
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
				title: locale['desktop']['choose-banner']
			});

		return selectedFile
			.then(setBanner)
			.catch(err => err && console.warn(err));
	};
};
