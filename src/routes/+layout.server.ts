export async function load() {
  return {
    appVersion: process.env.npm_package_version
  };
}
