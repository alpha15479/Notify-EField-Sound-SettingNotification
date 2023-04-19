const EFieldSensor = require('../models/EFieldSensorModel');

const getAllEFieldSensors = async () => {
  const eFieldSensors = await EFieldSensor.findAll();
  return eFieldSensors;
};

const getOne = async () => {
  const eFieldSensors = await EFieldSensor.findOne();
  return eFieldSensors;
};

const getEFieldSensorById = async (id) => {
  const eFieldSensor = await EFieldSensor.findByPk(id);
  return eFieldSensor;
};

const createEFieldSensor = async (newEFieldSensor) => {
  const eFieldSensor = await EFieldSensor.create(newEFieldSensor);
  return eFieldSensor;
};

const updateEFieldSensorById = async (id, updatedEFieldSensor) => {
  const eFieldSensor = await EFieldSensor.findByPk(id);
  await eFieldSensor.update(updatedEFieldSensor);
  return eFieldSensor;
};

const deleteEFieldSensorById = async (id) => {
  const eFieldSensor = await EFieldSensor.findByPk(id);
  await eFieldSensor.destroy();
};

module.exports = {
  getOne,
  getAllEFieldSensors,
  getEFieldSensorById,
  createEFieldSensor,
  updateEFieldSensorById,
  deleteEFieldSensorById
};