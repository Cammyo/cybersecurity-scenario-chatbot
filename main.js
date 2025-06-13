const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
});

// IPC Handlers
ipcMain.handle('fetch-scenarios', async () => db.getAllScenarios());
ipcMain.handle('add-scenario', async (event, scenario) => db.addScenario(scenario));
ipcMain.handle('delete-scenario', async (event, id) => db.deleteScenario(id));  
ipcMain.handle('send-to-chatbot', async (event, { query, conversation_id }) => {
    const payload = {
        query,
        inputs: {}, // Adjust if needed for additional inputs
        response_mode: 'blocking', // Use 'blocking' for immediate responses
        user: 'user-123', // Example user identifier
    };
  
    // Include conversation_id if available
    if (conversation_id) {
        payload.conversation_id = conversation_id;
    }
  
    try {
        const response = await fetch('https://api.dify.ai/v1/chat-messages', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${process.env.DIFY_API_KEY}`, // Replace with your actual API key
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
    
        if (!response.ok) {
            const error = await response.json();
            console.error('API Error:', error);
            throw new Error(`API Error: ${response.status} ${JSON.stringify(error)}`);
        }
    
        return await response.json(); // Return the full response
        } catch (error) {
        console.error('Error communicating with chatbot:', error);
        throw error;
    }
});
  