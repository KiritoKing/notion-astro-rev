import fse from 'fs-extra';

export interface SaveOptions {
  ignoreCache?: boolean;
  log?: (message: string) => void;
}

// example: https://prod-files-secure.s3.us-west-2.amazonaws.com/ed3b245b-dd96-4e0d-a399-9a99a0cf37c0/d16195b7-f998-4b7c-8d2e-38b9c47be295/image.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X/20250123/us-west-2/s3/aws4_request&X-Amz-Date=20250123T145339Z&X-Amz-Expires=3600&X-Amz-Signature=c67284d3172499aa2f41faa55710f81ec49f53687c500ad1a794b2c0410d477f&X-Amz-SignedHeaders=host&x-id=GetObject
export async function saveImageFromAWS(url: string, dir: string, options: SaveOptions = {}) {
  const { ignoreCache, log } = options;
  const enableCache = !ignoreCache;

  if (!fse.existsSync(dir)) {
    throw new Error(`Directory ${dir} does not exist`);
  }

  const _url = new URL(url);
  const [parentId, objId, fileName] = _url.pathname.split('/').filter(Boolean); // 排除掉第一个空字符串
  if (!fileName || !parentId || !objId) {
    throw new Error('Invalid URL');
  }

  const ext = fileName.split('.').at(-1);
  const name = `${parentId}-${objId}.${ext}`;
  const path = `${dir}/${name}`;

  if (!enableCache || !fse.existsSync(`${dir}/${name}`)) {
    const response = await fetch(url);

    const buffer = await response.arrayBuffer();
    fse.writeFile(path, new Uint8Array(buffer));
    log?.(`Saved image ${name} to ${path}`);
  } else {
    log?.(`Skip saving image ${name}, since it is cached.`);
  }

  return {
    absPath: path,
    filename: name,
  };
}
