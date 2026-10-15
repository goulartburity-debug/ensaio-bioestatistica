import {parentPort} from 'node:worker_threads';
globalThis.self={postMessage:value=>parentPort.postMessage(value)};
await import('../../sample-size/calculation-worker.mjs');
parentPort.on('message',data=>self.onmessage({data}));
parentPort.postMessage({ready:true});
