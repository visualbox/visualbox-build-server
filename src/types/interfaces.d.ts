interface IECRAuthData {
  authorizationToken: string;
  expiresAt: string;
  proxyEndpoint: string;
}

interface IJobMeta {
  BUILD_ID: string;
  PRESIGNED_URL: string;
  ECR_AUTH_DATA: IECRAuthData;
  IMAGE_REPO_NAME: string;
  IMAGE_TAG: string;
  AWS_REGION: string;
  AWS_ACCOUNT_ID: number;
}
