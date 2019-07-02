import { createWriteStream, unlink } from 'fs';
import { get } from 'https';

const download = (url: string, dest: string): Promise<string> => {
  const file = createWriteStream(dest);

  return new Promise((resolve, reject) => {
    get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err: Error) => {
      unlink(dest, reject);
      reject(err.message);
    });
  });
};

export default download;
