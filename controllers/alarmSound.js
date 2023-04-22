const { check, validationResult } = require('express-validator');
const AlarmSoundService = require('../services/alarmSoundService');
const {logger} = require('../config/soundLogger');

const validate = () => {
  return [
    check('fileName').custom((value, { req }) => {
      if (!req.file) {
        logger.error(`Method(POST), Alarm file is required.`);
        throw new Error('File is required');
      }
      return true;
    }),
    check('sound_name').custom((value, { req }) => {
      if (!value) {
        logger.error(`Method(POST), Alarm sound name is required.`);
        throw new Error('Sound name is required');
      }
      return true;
    })
  ];
};

const uploadAlarmSound = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // logger.error(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    const alarmSoundData = {
      name: req.file.originalname,
      type: req.file.mimetype,
      file: req.file.buffer,
      sound_name: req.body.sound_name
    };
    const newAlarmSound = await AlarmSoundService.createAlarmSound(alarmSoundData);
    logger.info(`Method(POST), Upload alarm file successfully.`);
    res.status(201).json(newAlarmSound);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const updateAlarmSound = async (req, res, next) => {
  try {
    const alarmSound = await AlarmSoundService.getAlarmSoundById(req.params.id);
    if (!alarmSound) {
      logger.error(`Method(PUT), Alarm sound with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'Alarm sound with the given id not found' });
    }

    let newAlarmSoundData = {
      sound_name: req.body.sound_name
    };
    
    if (req.file) {
      newAlarmSoundData = {
        name: req.file.originalname,
        type: req.file.mimetype,
        file: req.file.buffer,
        sound_name: req.body.sound_name
      };
    } 
    
    const updatedAlarmSound = await AlarmSoundService.updateAlarmSoundById(req.params.id, newAlarmSoundData);
    logger.info(`Method(PUT), Update alarm sound with ID ${req.params.id}.`);
    res.status(200).json(updatedAlarmSound);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const getAllAlarm = async (req, res, next) => {
  try {
    const alarmSounds = await AlarmSoundService.getAllAlarmSounds();
    const result = alarmSounds.map((sound) => {
      return {
        id: sound.id,
        name: sound.name,
        type: sound.type,
        sound_name: sound.sound_name,
        created_at: sound.created_at,
        updated_at: sound.updated_at,
      };
    });
    logger.info(`Method(GET), Get all alarm sound.`);
    res.status(200).json(result);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const getAlarmById = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await AlarmSoundService.getAlarmSoundById(id);
    if (!result || !result.file) {
      logger.error(`Method(GET), Alarm sound with ID ${req.params.id} not found.`);
      console.log(`No audio file found for id: ${id}`);
      return res.status(204).send();
    }

    const { file, name } = result;
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': file.length
    });

    res.write(file);
    res.end();
    logger.info(`Method(GET), Get alarm sound with ID ${req.params.id}.`);
  } catch (err) {
    console.log(err);
    logger.error(err);
    return res.status(500).json({ message: err });
  }
};

const deleteAlarmSound = async (req, res, next) => {
  try {
    const alarmSound = await AlarmSoundService.getAlarmSoundById(req.params.id);
    if (!alarmSound) {
      logger.error(`Method(DELETE), Alarm sound with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'Alarm sound not found' });
    }

    const deletedAlarmSound = await AlarmSoundService.deleteAlarmSoundById(req.params.id);
    logger.info(`Method(DELETE), Deleted alarm sound with ID ${req.params.id}.`);
    res.status(204).json(deletedAlarmSound);
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

module.exports = { validate, uploadAlarmSound, updateAlarmSound, getAllAlarm, getAlarmById, deleteAlarmSound };