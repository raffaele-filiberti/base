const { platform } = process.platform;

module.exports = () => ({
  root: `http://${process.env.IP}:${process.env.PORT}/index.html`,
  command: { preinstall: [platform === 'win32' ? 'sh preinstall.sh' : './preinstall.sh'] },
});
