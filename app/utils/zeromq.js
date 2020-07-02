import { Request } from 'zeromq';

export async function zeromqMessages(m) {
  const sock = new Request();
  sock.connect('tcp://127.0.0.1:8000');
  console.log(sock);
  await sock.send(JSON.stringify(m));
  const [result] = await sock.receive();
  return JSON.parse(result.toString());
}

export const promiseTimeout = function(ms, promise) {
  // Create a promise that rejects in <ms> milliseconds
  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in ' + ms + 'ms.');
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};
