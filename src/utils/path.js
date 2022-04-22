const os = require('os');
const fs = require('fs');
const vscode = require('vscode');

function getCurrentFolderPath() {
  return Array.isArray(vscode.workspace.workspaceFolders)
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : '';
}

function getIDEPath() {
  const platform = os.platform();
  const idePath = {
    win32: {
      cil: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat',
      exe: 'C:/Program Files (x86)/Tencent/微信web开发者工具/微信开发者工具.exe',
    },
    darwin: {
      cli: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
      exe: '/Applications/wechatwebdevtools.app'
    },
  };

  if (idePath.hasOwnProperty(platform) && fs.existsSync(idePath[platform].cli)) {
    return idePath[platform];
  }

  return null;
}

module.exports = {
  getCurrentFolderPath,
  getIDEPath,
};
