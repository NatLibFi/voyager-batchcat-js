/**
 * Copyright 2017 University Of Helsinki (The National Library Of Finland)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var edge = require('edge');
var moment = require('moment');
var record_converter = require('marc-record-converters/lib/converters/iso2709');
const utils = require('./utils');
const constants = require('./constants');

const createAuthorityConnector = require('./authority');

function createBatchcatConnector(global_options, dll_path) {

  dll_path = dll_path ? dll_path : constants.DLL_PATH;

  return {
    auth: createAuthorityConnector(global_options),
    bib: {
      addRecord: function(record, library, cat_location, opac_suppress, options) {

        var result,
            parameters = utils.validateParameters(Object.assign(utils.initializeOptions(global_options, options), utils.normalizeParameters({
              recordData: record_converter.to(record),
              library: library,
              catLocation: cat_location,
              opacSuppress: opac_suppress
            })));

        result = edge.func({
          assemblyFile: dll_path,
          typeName: constants.DLL_TYPE_NAME,
          methodName: 'AddBibRecord'
        })(parameters, true);

        if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
          throw Object.assign(new Error(result.error.message), {
            errorCode: result.error.code
          });
        } else {
          return result.recordId;
        }

      },
      deleteRecord: function(record_id, options) {

        var result,
            parameters = utils.validateParameters(Object.assign(utils.initializeOptions(global_options, options), utils.normalizeParameters({
              recordId: record_id
            })));

        result = edge.func({
          assemblyFile: dll_path,
          typeName: constants.DLL_TYPE_NAME,
          methodName: 'DeleteBibRecord'
        })(parameters, true);

        if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
          throw Object.assign(new Error(result.error.message), {
            errorCode: result.error.code
          });
        }

      },
      updateRecord: function(record_id, record, library, cat_location, opac_suppress, options) {

        var result, parameters, update_date;

        if (options && options.updateDate) {
          update_date = options.updateDate;
        } else {
          update_date = moment(record.get(/^005$/).shift().value, "YYYYMMDDHHmmss");
        }

        if (!moment(update_date).isValid()) {
          throw new Error('Update date is not valid');
        } else {

          parameters = utils.validateParameters(Object.assign(utils.initializeOptions(global_options, options), utils.normalizeParameters({
            recordData: record_converter.to(record),
            recordId: record_id,
            updateDate: update_date.format(),
            library: library,
            catLocation: cat_location,
            opacSuppress: opac_suppress
          })));

          result = edge.func({
            assemblyFile: dll_path,
            typeName: constants.DLL_TYPE_NAME,
            methodName: 'UpdateBibRecord'
          })(parameters, true);

          if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
            throw Object.assign(new Error(result.error.message), {
              errorCode: result.error.code
            });
          }

        }

      }
    }
  };
}

module.exports = createBatchcatConnector;
