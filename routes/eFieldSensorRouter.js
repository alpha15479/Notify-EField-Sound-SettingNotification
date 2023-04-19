const express = require('express');
const router = express.Router();
const EFieldSensorController = require('../controllers/eFieldSensor');
const { check, validationResult } = require('express-validator');
const {logger} = require('../config/logger');

router.get('/', EFieldSensorController.getAllEFieldSensors);
router.get('/:id', EFieldSensorController.getEFieldSensorById);
// router.post('/', EFieldSensorController.validate('createEFieldSensor'), EFieldSensorController.createEFieldSensor);

router.post('/',
    [
        check('warning_point_id', 'warning_point_id is required').not().isEmpty(),
        check('e_field_name', 'e_field_name is required').not().isEmpty(),
        check('lat', 'lat is required').not().isEmpty(),
        check('lon', 'lon is required').not().isEmpty(),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.error(`(Create): ${errors.array().map(error => error.msg).join(', ')}`); 
            return res.status(400).json({ errors: errors.array() });
        } else {
            next(); 
        }
    },
    EFieldSensorController.createEFieldSensor
);

router.put('/:id', EFieldSensorController.updateEFieldSensorById);
router.delete('/:id', EFieldSensorController.deleteEFieldSensorById);

module.exports = router;

