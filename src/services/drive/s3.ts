import * as S3 from 'aws-sdk/clients/s3';
import * as https from 'https';
import { DriveConfig } from '../../config/types';
import config from '../../config';

const httpsAgent = new https.Agent({
	keepAlive: true
});

export function getS3(drive: DriveConfig) {
	const conf = {
		endpoint: drive.config.endPoint,
		accessKeyId: drive.config.accessKey,
		secretAccessKey: drive.config.secretKey,
		region: drive.config.region,
		sslEnabled: drive.config.useSSL,
		httpOptions: {
		}
	} as S3.ClientConfiguration;

	if (config.proxy) {
		conf.httpOptions.proxy = config.proxy;
	}

	if (drive.config.useSSL) {
		conf.httpOptions.agent = httpsAgent;
	}

	const s3 = new S3(conf);

	return s3;
}
