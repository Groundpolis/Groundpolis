import * as crypto from 'crypto';

export default (data: string) => {
	const sha256 = crypto.createHash('sha256');
	sha256.update(data);
	return sha256.digest('base64');
};
