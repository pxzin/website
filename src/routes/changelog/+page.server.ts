import fs from 'fs';
import path from 'path';

export async function load() {
  const changelogPath = path.resolve(process.cwd(), 'CHANGELOG.md');
  const changelogContent = fs.readFileSync(changelogPath, 'utf8');

  return {
    changelogContent
  };
}
