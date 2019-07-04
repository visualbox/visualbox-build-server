import { Request, Response } from 'express';
import { mkdirSync } from 'fs';
import rimraf from 'rimraf';
import * as WebSocketClient from 'websocket';

import { doBuild, download, unzip } from '../utils';

const BUILD_MAGIC_STR = Buffer.from([0x24, 0x39, 0x23, 0x5d]);

const sleep = (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const cleanup = () => {
  rimraf.sync('builds');
};

const m = (
  type: 'INFO' | 'ERROR',
  room: string,
  data: Buffer
) => {
  return JSON.stringify({
    action: 'message',
    data: data.toString(),
    room,
    type
  });
};

/**
 * POST /
 * Build a project.
 */
export const build = async (
  req: Request,
  res: Response
) => {
  res.status(200).send();

  // Wait for web-client to connect
  await sleep(1000);

  const meta: IJobMeta = req.body;
  const dir = `builds/${meta.BUILD_ID}/`;
  const archive = `${dir}archive.zip`;

  mkdirSync(dir, { recursive: true });

  // Download archive
  try {
    await download(meta.PRESIGNED_URL, archive);
  } catch (e) {
    console.log('Failed to download archive: ', e.message);
    cleanup();
    return;
  }

  // Unzip archive
  try {
    await unzip(archive, dir);
  } catch (e) {
    console.log('Failed to extract archive: ', e.message);
    cleanup();
    return;
  }

  // Init WS client
  const client = new WebSocketClient.client();
  client.connect(process.env.WS_ENDPOINT);
  client.on('connect', async (connection) => {
    try {
      await doBuild(
        meta,
        // stdout
        (data: Buffer) => {
          connection.send(m('INFO', meta.BUILD_ID, data));
        },
        // stderr
        (data: Buffer) => {
          connection.send(m('ERROR', meta.BUILD_ID, data));
        }
      );
    } catch (e) {
      console.log('Failed to build: ', e.message);
    } finally {
      cleanup();
      connection.send(m('INFO', meta.BUILD_ID, BUILD_MAGIC_STR));
      client.abort();
      console.log('I did a build :)');
    }
  });
};
