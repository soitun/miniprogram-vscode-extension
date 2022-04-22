const fs = require('fs');
const path = require('path');
const vscode = require('vscode');
const { readJSON } = require('./json');
const { getCurrentFolderPath, getProjectConfigPath } = require('./path');

function readProjectConfig() {
  const rootPath = getCurrentFolderPath();
  const projectFilePath = getProjectConfigPath(rootPath);

  if (fs.existsSync(projectFilePath)) {
    const config = readJSON(projectFilePath);

    config.projectname = decodeURIComponent(config.projectname);

    return config;
  }

  return null;
}

function getMiniProgramRootPath(rootPath, relativePath) {
  if (relativePath) {
    return path.resolve(rootPath, relativePath);
  }

  return rootPath;
}

function createProject(context) {
  const privateKey = context.workspaceState.get('privateKey');
  const privateKeyPath = context.workspaceState.get('privateKeyPath'); // 废弃
  const rootPath = getCurrentFolderPath();
  const projectConfig = readProjectConfig();
  const options = {
    appid: projectConfig.appid,
    type: projectConfig.compileType === 'miniprogram' ? 'miniProgram' : 'miniProgramPlugin',
    projectPath: getMiniProgramRootPath(rootPath, projectConfig.miniprogramRoot),
    ignores: ['node_modules/**/*'],
  };

  if (!projectConfig) {
    return Promise.reject('未找到 project.config.json 文件');
  }

  if (privateKey) {
    return Promise.resolve({
      ...options,
      privateKey,
    });
  }

  // TODO: 废弃
  if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    return Promise.resolve({
      ...options,
      privateKeyPath,
    });
  }

  return new Promise((resolve, reject) => {
    vscode.window.showInformationMessage('请选择代码上传密钥文件，代码上传密钥可以在微信小程序后台“开发”-“开发设置”功能生成并下载，并关闭 IP 白名单', '打开微信小程序后台', '查看详细说明').then(result => {
      switch (result) {
        case '打开微信小程序后台':
          vscode.env.openExternal('https://mp.weixin.qq.com/');
          break;
        case '查看详细说明':
          vscode.env.openExternal('https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html');
          break;
      }
    });
    vscode.window.showOpenDialog({
      canSelectMany: false,
      filters: {
        '代码上传密钥文件': ['key'],
      },
      openLabel: '选择',
    }).then(result => {
      if (Array.isArray(result)) {
        const keyFile = result[0].fsPath;
        const key = fs.readFileSync(keyFile, 'utf-8');
        context.workspaceState.update('privateKey', key);

        resolve({
          ...options,
          privateKey: key,
        });
      } else {
        reject();
      }
    });
  });
}

module.exports = {
  readProjectConfig,
  createProject,
};
