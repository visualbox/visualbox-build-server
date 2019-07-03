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
  // TODO: proper & secure sanitization
  const buff = Buffer.from(meta.ECR_AUTH_DATA.authorizationToken, 'base64');
  const authData = buff.toString('utf8');
  const [ user, password ] = authData.split(':');

  const proxyEndpoint = meta.ECR_AUTH_DATA.proxyEndpoint.replace(/\s/g, '');
  if (!isUri(proxyEndpoint)) {
    console.log('Malformed proxy endpoint');
    return;
  }

  const buildId = meta.BUILD_ID;
  const tag = meta.IMAGE_TAG.replace(/\s/g, '');
  const repo = meta.IMAGE_REPO_NAME.replace(/\s/g, '');
  const accoundId = meta.AWS_ACCOUNT_ID;
  const region = meta.AWS_REGION.replace(/\s/g, '');

  const sendOutput = (data: Buffer) => {
    // connection.send(data.toString());
    console.log('Send OUTPUT', data.toString());
  };

  const sendError = (data: Buffer) => {
    // connection.send(data.toString());
    console.log('Send ERROR', data.toString());
  };

  execSync(`docker login -u ${user} -p ${password} ${proxyEndpoint}`);

  // execSync(`docker build -t ${repo}:${tag} .`);
  await cmd(`docker build -t ${repo}:${tag} builds/${buildId}`, sendOutput, sendError);

  execSync(`docker tag ${repo}:${tag} ${accoundId}.dkr.ecr.${region}.amazonaws.com/${repo}:${tag}`);
  execSync(`docker push ${accoundId}.dkr.ecr.${region}.amazonaws.com/${repo}:${tag}`);
};

export default doBuild;
