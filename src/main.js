import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

const getSenderWindow = (event) => BrowserWindow.fromWebContents(event.sender);

ipcMain.handle('window:minimize', (event) => {
  getSenderWindow(event)?.minimize();
});

ipcMain.handle('window:close', (event) => {
  getSenderWindow(event)?.close();
});

ipcMain.handle('window:get-always-on-top', (event) => {
  return getSenderWindow(event)?.isAlwaysOnTop() ?? false;
});

ipcMain.handle('window:toggle-always-on-top', (event) => {
  const currentWindow = getSenderWindow(event);

  if (!currentWindow) {
    return false;
  }

  const nextState = !currentWindow.isAlwaysOnTop();
  currentWindow.setAlwaysOnTop(nextState);
  return nextState;
});

const WINDOW_SIZE_PRESETS = {
  small: [300, 300],
  medium: [350, 520],
  large: [430, 620],
};

const WINDOW_RESIZE_STEPS = 8;
const WINDOW_RESIZE_INTERVAL_MS = 14;

ipcMain.handle('window:get-size-preset', (event) => {
  const currentWindow = getSenderWindow(event);

  if (!currentWindow) {
    return 'small';
  }

  const [width, height] = currentWindow.getSize();

  if (width >= WINDOW_SIZE_PRESETS.large[0] || height >= WINDOW_SIZE_PRESETS.large[1]) {
    return 'large';
  }

  if (width >= WINDOW_SIZE_PRESETS.medium[0] || height >= WINDOW_SIZE_PRESETS.medium[1]) {
    return 'medium';
  }

  return 'small';
});

ipcMain.handle('window:set-size-preset', (event, preset) => {
  const currentWindow = getSenderWindow(event);
  const nextSize = WINDOW_SIZE_PRESETS[preset] ?? WINDOW_SIZE_PRESETS.small;
  const nextPreset = preset in WINDOW_SIZE_PRESETS ? preset : 'small';

  if (!currentWindow) {
    return 'small';
  }

  const [currentX, currentY] = currentWindow.getPosition();
  const [currentWidth, currentHeight] = currentWindow.getSize();
  const targetX = Math.round(currentX + (currentWidth - nextSize[0]) / 2);
  const targetY = Math.round(currentY + (currentHeight - nextSize[1]) / 2);

  if (currentWindow.__resizeAnimation) {
    clearInterval(currentWindow.__resizeAnimation);
  }

  let step = 0;
  currentWindow.__resizeAnimation = setInterval(() => {
    if (currentWindow.isDestroyed()) {
      clearInterval(currentWindow.__resizeAnimation);
      currentWindow.__resizeAnimation = null;
      return;
    }

    step += 1;
    const progress = step / WINDOW_RESIZE_STEPS;
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    currentWindow.setBounds({
      x: Math.round(currentX + ((targetX - currentX) * easedProgress)),
      y: Math.round(currentY + ((targetY - currentY) * easedProgress)),
      width: Math.round(currentWidth + ((nextSize[0] - currentWidth) * easedProgress)),
      height: Math.round(currentHeight + ((nextSize[1] - currentHeight) * easedProgress)),
    }, true);

    if (step >= WINDOW_RESIZE_STEPS) {
      clearInterval(currentWindow.__resizeAnimation);
      currentWindow.__resizeAnimation = null;
    }
  }, WINDOW_RESIZE_INTERVAL_MS);

  return nextPreset;
});

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 300,
    minWidth: 300,
    minHeight: 300,
    resizable: false,
    autoHideMenuBar: true,
    transparent: true,
    frame: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
