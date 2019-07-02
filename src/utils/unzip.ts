import { createReadStream } from 'fs';
import unzipper from 'unzipper';

const unzip = (src: string, dest: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    createReadStream(src)
      .pipe(
        unzipper.Extract({ path: dest })
          .on('close', resolve)
          .on('error', reject)
      );
  });
};

export default unzip;
