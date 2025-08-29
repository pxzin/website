import fs from 'fs';
import path from 'path';

export async function load() {
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const pkg = JSON.parse(packageJsonContent);

  return {
    appVersion: pkg.version
  };
}
