import { spawn, spawnSync, SpawnSyncOptions } from 'child_process';

const spawnStream = (
  command: string,
  args: readonly string[],
  options: SpawnSyncOptions,
  stdOut: (data: Buffer) => void,
  stdErr: (data: Buffer) => void
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, options);
    proc.stdout.on('data', stdOut);
    proc.stderr.on('data', stdErr);
    proc.on('exit', resolve);
    proc.on('error', reject);
  });
};

const doBuild = async (
  meta: IJobMeta,
  stdOut: (data: Buffer) => void,
  stdErr: (data: Buffer) => void
) => {

  const [
    ECR_USER,
    ECR_TOKEN
  ] = Buffer.from(meta.ECR_AUTH_DATA.authorizationToken, 'base64')
    .toString('utf8')
    .split(':');

  const cwd       = `builds/${meta.BUILD_ID}`;
  const IMAGE     = `${meta.IMAGE_REPO_NAME}:${meta.IMAGE_TAG}`;
  const IMAGE_URI = `${meta.AWS_ACCOUNT_ID}.dkr.ecr.${meta.AWS_REGION}.amazonaws.com/${IMAGE}`;

  spawnSync('docker', ['login', '-u', ECR_USER, '-p', ECR_TOKEN, meta.ECR_AUTH_DATA.proxyEndpoint]);
  console.log('1');
  await spawnStream('docker', ['build', '-t', IMAGE, '.'], { cwd }, stdOut, stdErr);
  console.log('2');
  spawnSync('docker', ['tag', IMAGE, IMAGE_URI]);
  console.log('3');
  spawnSync('docker', ['push', IMAGE_URI]);
  console.log('4');
  spawnSync('docker', ['logout']);
  console.log('5');
};

export default doBuild;
