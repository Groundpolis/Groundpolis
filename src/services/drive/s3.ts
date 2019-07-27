import * as S3 from 'aws-sdk/clients/s3';
import { DriveConfig } from '../../config/types';
import config from '../../config';
import * as httpsProxyAgent from 'https-proxy-agent';
import * as agentkeepalive from 'agentkeepalive';

const httpsAgent = config.proxy
	? new httpsProxyAgent(config.proxy)
	: new agentkeepalive.HttpsAgent({
			freeSocketTimeout: 30 * 1000
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

	if (drive.config.useSSL) {
		conf.httpOptions.agent = httpsAgent;
	}

	const s3 = new S3(conf);

	return s3;
}
