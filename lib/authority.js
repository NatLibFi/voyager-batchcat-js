// authority.js
const edge = require('edge');
const constants = require('./constants');
const utils = require('./utils');
const record_converter = require('marc-record-converters/lib/converters/iso2709');
const moment = require('moment');

module.exports = (global_options) => {

  function validateResult(result) {
    if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
      const error = Object.assign(new Error(result.error.message), {
        errorCode: result.error.code
      });
      return error;
    }
  }

  function createCallParameters(global_options, options, parameters) {
    const normalizedParameters = Object.assign(utils.initializeOptions(global_options, options), utils.normalizeParameters(parameters));
    return utils.validateParameters(normalizedParameters);
  }

  function addRecord(record, cat_location, options) {

    return new Promise((resolve, reject) => {

      const parameters = createCallParameters(global_options, options, {
        recordData: record_converter.to(record),
        catLocation: cat_location,
      });
      
      const result = edge.func({
        assemblyFile: constants.DLL_PATH,
        typeName: constants.DLL_TYPE_NAME,
        methodName: 'AddAuthorityRecord'
      })(parameters, true);

      const error = validateResult(result);
      if (error) {
        reject(error);
      } else {
        resolve(result.recordId);
      }

    });
  }

  function updateRecord(record_id, record, cat_location, options) {
    return new Promise((resolve, reject) => {
    
      const update_date = moment(record.get(/^005$/).shift().value, 'YYYYMMDDHHmmss');

      if (!moment(update_date).isValid()) {
        throw new Error('Update date is not valid');
      }

      const parameters = createCallParameters(global_options, options, {
        recordData: record_converter.to(record),
        recordId: record_id,
        updateDate: update_date.format(),
        catLocation: cat_location,
      });
      
      const result = edge.func({
        assemblyFile: constants.DLL_PATH,
        typeName: constants.DLL_TYPE_NAME,
        methodName: 'UpdateAuthorityRecord'
      })(parameters, true);

      const error = validateResult(result);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }); 
  }

  function deleteRecord(record_id, options) {
    return new Promise((resolve, reject) => {
      
      const parameters = createCallParameters(global_options, options, {
        recordId: record_id
      });
      
      const result = edge.func({
        assemblyFile: constants.DLL_PATH,
        typeName: constants.DLL_TYPE_NAME,
        methodName: 'DeleteAuthorityRecord'
      })(parameters, true);

      const error = validateResult(result);
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }

  return {
    addRecord: addRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
  };
};
