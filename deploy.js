const FtpDeploy = require('ftp-deploy');

const ftpDeploy = new FtpDeploy();

const config = {
  user: '',
  password: '',
  host: '',
  port: 21,
  localRoot: `${__dirname}/../dist`,
  remoteRoot: '/www',
  include: ['*', '**/*'],
  exclude: [],
  deleteRemote: true,
  forcePasv: true,
};

ftpDeploy.on('uploading', (data) => {
  console.log(`${data.transferredFileCount + 1} / ${data.totalFilesCount} | ${data.filename}`);
});

ftpDeploy
  .deploy(config)
  .then(() => console.log('finished'))
  .catch((err) => console.log(err));

