import changelogContent from '../../../CHANGELOG.md?raw';

export async function load() {
  return {
    changelogContent
  };
}
