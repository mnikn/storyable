export function getBaseUrl(filePath: string) {
  const p = filePath.replace(/\\/g, '/');
  const p1 = p.split('.st')[0];
  const fileName = p1.split('/')[p1.split('/').length - 1];
  // const baseUrl = p1
  //   .split('/')
  //   .filter((item) => item !== fileName)
  //   .join('\\');
  let baseUrl = p1.split('/').join('\\');
  baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('\\'));
  return baseUrl;
}

export function concatPath(baseUrl: string, path: string) {
  return baseUrl + '\\' + path;
}
