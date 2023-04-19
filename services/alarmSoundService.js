const AlarmSound = require('../models/alarmSoundModel');

const getAllAlarmSounds = async () => {
  const alarmSounds = await AlarmSound.findAll();
  return alarmSounds;
};

const getOne = async () => {
  const alarmSounds = await AlarmSound.findOne();
  return alarmSounds;
};

const getAlarmSoundById = async (id) => {
  const alarmSound = await AlarmSound.findByPk(id);
  return alarmSound;
};

const createAlarmSound = async (newAlarmSound) => {
  const alarmSound = await AlarmSound.create(newAlarmSound);
  return alarmSound;
};

const updateAlarmSoundById = async (id, updatedAlarmSound) => {
  const alarmSound = await AlarmSound.findByPk(id);
  await alarmSound.update(updatedAlarmSound);
  return alarmSound;
};

const deleteAlarmSoundById = async (id) => {
  const alarmSound = await AlarmSound.findByPk(id);
  await alarmSound.destroy();
};

module.exports = {
  getOne,
  getAllAlarmSounds,
  getAlarmSoundById,
  createAlarmSound,
  updateAlarmSoundById,
  deleteAlarmSoundById
};