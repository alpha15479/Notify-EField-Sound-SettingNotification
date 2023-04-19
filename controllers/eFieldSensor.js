const EFieldSensorService = require('../services/eFieldSensorService');
const { check, validationResult } = require('express-validator');
const {logger} = require('../config/logger');

const validate = (method) => {
  switch (method) {
    case 'createEFieldSensor': {
      return [
        check('warning_point_id', 'warning_point_id is required').not().isEmpty(),
        check('e_field_name', 'e_field_name is required').not().isEmpty(),
        check('lat', 'lat is required').not().isEmpty(),
        check('lon', 'lon is required').not().isEmpty(),
      ];
    }
    case 'updateEFieldSensorById': {
      return [
        check('warning_point_id').not().isEmpty()
        .custom(async (value) => {
          const warning = await EFieldSensorService.getOne({ where: { warning_point_id: value }});
          if (warning) {
            throw new Error('warning point id already exists');
          }
        }),
      ];
    }
    default:
      return [];
  }
}

async function getAllEFieldSensors(req, res, next) {
  try {
    const eFieldSensors = await EFieldSensorService.getAllEFieldSensors();
    logger.info('Method(GET), Get all e field sensor data from database.');
    res.status(200).json(eFieldSensors);
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

async function getEFieldSensorById(req, res, next) {
  try {
    const eFieldSensor = await EFieldSensorService.getEFieldSensorById(req.params.id);
    if (!eFieldSensor) {
      logger.error(`Method(GET), E field sensor with ID ${req.params.id} not found`);
      return res.status(204).json({ message: 'E-Field Sensor not found' });
    }
    logger.info('Get e field sensor data by id from database.');
    res.status(200).json(eFieldSensor);
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

async function createEFieldSensor(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const newEFieldSensor = await EFieldSensorService.createEFieldSensor(req.body);
    logger.info(`Method(POST), Successful create E field sensor data: ${JSON.stringify(req.body)}`);
    res.status(201).json(newEFieldSensor);
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

async function updateEFieldSensorById(req, res, next) {
  try {
    const eFieldSensor = await EFieldSensorService.getEFieldSensorById(req.params.id);
    if (!eFieldSensor) {
      logger.error(`Method(Update), E field sensor with ID ${req.params.id} not found`);
      return res.status(204).json({ message: 'E field sensor not found' });
    }
    
    const updatedEFieldSensor = await EFieldSensorService.updateEFieldSensorById(req.params.id, req.body);
    logger.info(`Method(Update), Updated E field sensor with ID ${req.params.id}`);
    res.status(200).json(updatedEFieldSensor);
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

async function deleteEFieldSensorById(req, res, next) {
  try {
    const eFieldSensor = await EFieldSensorService.getEFieldSensorById(req.params.id);
    if (!eFieldSensor) {
      logger.error(`Method(DELETE), E field sensor with ID ${req.params.id} not found.`);
      return res.status(204).json({ message: 'E field sensor not found.' });
    }

    const deletedEFieldSensor = await EFieldSensorService.deleteEFieldSensorById(req.params.id);
    logger.info(`Method(DELETE), Deleted E field sensor with ID ${req.params.id}.`);
    res.status(204).json(deletedEFieldSensor);
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = {
  validate,
  getAllEFieldSensors,
  getEFieldSensorById,
  createEFieldSensor,
  updateEFieldSensorById,
  deleteEFieldSensorById,
};