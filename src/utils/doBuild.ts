import { exec, execSync } from 'child_process';
import { isUri } from 'valid-url';
import * as WebSocketClient from 'websocket';

const cmd = (command: string, stdOut: (data: Buffer) => void, stdErr: (data: Buffer) => void): Promise<any> => {
  return new Promise((resolve, reject) => {
    const proc = exec(command);
    proc.stdout.on('data', stdOut);
    proc.stderr.on('data', stdErr);
    proc.on('exit', resolve);
  });
};

const doBuild = async (connection: WebSocketClient.connection, meta: IJobMeta) => {
  const authorizationToken = meta.ECR_AUTH_DATA.authorizationToken.replace(/\s/g, '');

  const proxyEndpoint = meta.ECR_AUTH_DATA.proxyEndpoint.replace(/\s/g, '');
  if (!isUri(proxyEndpoint)) {
    console.log('Malformed proxy endpoint');
    return;
  }

  const tag = meta.IMAGE_TAG.replace(/\s/g, '');
  const repo = meta.IMAGE_REPO_NAME.replace(/\s/g, '');

  const sendOutput = (data: Buffer) => {
    // connection.send(data.toString());
    console.log('Send OUTPUT', data.toString());
  };

  const sendError = (data: Buffer) => {
    // connection.send(data.toString());
    console.log('Send ERROR', data.toString());
  };

  execSync(`docker login -u AWS -p ${authorizationToken} ${proxyEndpoint}`);

  // execSync(`docker build -t ${repo}:${tag} .`);
  await cmd(`docker build -t ${repo}:${tag} .`, sendOutput, sendError);

  execSync(`docker tag ${repo}:${tag} ${proxyEndpoint}/${repo}:${tag}`);
  execSync(`docker push ${proxyEndpoint}/${repo}:${tag}`);
};

export default doBuild;
