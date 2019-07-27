declare module 'lookup-dns-cache' {
	import * as net from 'net';

	function lookup(): net.LookupFunction;
}
