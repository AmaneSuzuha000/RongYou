'use strict';

const fs = require('fs');
const path = require('path');

class Store {
  constructor(app) {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'settings.json');
    this.data = this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
    return {};
  }

  _save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }

  get(key, defaultValue) {
    return this.data[key] !== undefined ? this.data[key] : defaultValue;
  }

  set(key, value) {
    this.data[key] = value;
    this._save();
  }

  delete(key) {
    delete this.data[key];
    this._save();
  }
}

module.exports = Store;
