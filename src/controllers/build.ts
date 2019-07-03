import { NextFunction, Request, Response } from 'express';
import { mkdirSync } from 'fs';
import * as WebSocketClient from 'websocket';

import { doBuild, download, unzip } from '../utils';

/**
 * POST /
 * Build a project.
 */
export const build = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send();

  const meta: IJobMeta = req.body;
  const archive = `builds/${meta.BUILD_ID}/archive.zip`;

  mkdirSync(`builds/${meta.BUILD_ID}`, { recursive: true });

  // Download archive
  try {
    await download(meta.PRESIGNED_URL, archive);
  } catch (e) {
    console.log('Failed to download archive: ', e.message);
    return;
  }

  // Unzip archive
  try {
    await unzip(archive, `builds/${meta.BUILD_ID}`);
  } catch (e) {
    console.log('Failed to extract archive: ', e.message);
    return;
  }

  // Init WS client
  const client = new WebSocketClient.client();
  client.on('connect', (connection) => doBuild(connection, meta));
  client.connect('wss://fmgqmvup1i.execute-api.eu-west-1.amazonaws.com/prod');
};
