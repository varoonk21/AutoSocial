import * as settingsService from './settings.service.js';

async function getSettings(req, res) {
  const settings = await settingsService.getUserSettings(req.user);
  res.json(settings);
}

async function updateSettings(req, res) {
  const settings = await settingsService.updateUserSettings(req.user._id, req.body);
  res.json(settings);
}

export {
  getSettings,
  updateSettings,
};
