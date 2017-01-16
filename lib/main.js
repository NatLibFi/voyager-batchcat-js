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

(function() {
  
  'use strict';

  const DLL_PATH = __dirname + '/managed/batchcat-edge.dll';
  const DLL_TYPE_NAME = 'NatLibFi.Voyager.BatchCatEdge';
  
  module.exports = function(global_options, dll_path) {
    
    var edge = require('edge'),
        moment = require('moment'),
        record_converter = require('marc-record-converters/lib/converters/iso2709'), 
        path = require('path');

    function initializeOptions(additional_options) {
      
      var options = Object.assign({}, global_options, additional_options);

      if (!options.hasOwnProperty('iniDir') || !options.hasOwnProperty('username') || !options.hasOwnProperty('password')) {
        throw new Error('The following options are mandatory: iniDir, username, password');
      } else {
        return Object.assign(options, {
          iniDir: path.dirname(path.resolve(options.iniDir))
        });
      }
      
    }
    
    function normalizeParameters(parameters) {
      return Object.keys(parameters).reduce(function(product, key) {

        var new_value,
            value = parameters[key];

        switch (key) {
        case 'library':
        case 'catLocation':
        case 'recordId':
          new_value = typeof value === 'number' ? value : Number.parseInt(value);
          break;
        case 'opacSuppress':
          new_value = typeof value === 'boolean' ? value : typeof value === 'number' ? Boolean(value) : value === 'true';
          break;
        default:
          new_value = value;
          break;
        }

        return Object.defineProperty(product, key, {
          enumerable: true,
          value: new_value
        });
      }, {});
    }
    
    function validateParameters(parameters) {
      if (parameters.hasOwnProperty('username') && typeof parameters.username !== 'string') {
        throw new Error("Parameter 'username' must be a string");
      } else if (parameters.hasOwnProperty('password') && typeof parameters.password !== 'string') {
        throw new Error("Parameter 'password' must be a string");
      } else if (parameters.hasOwnProperty('iniDir') && typeof parameters.iniDir !== 'string') {
        throw new Error("Parameter 'iniDir' must be a string");
      } else if (parameters.hasOwnProperty('recordData') && typeof parameters.recordData !== 'string') {
        throw new Error("Parameter 'recordData' must be a string");
      } else if (parameters.hasOwnProperty('library') && (typeof parameters.library !== 'number' || isNaN(parameters.library))) {
        throw new Error("Parameter 'library' must be a number");
      } else if (parameters.hasOwnProperty('catLocation') && (typeof parameters.catLocation !== 'number' || isNaN(parameters.catLocation))) {
        throw new Error("Parameter 'catLocation' must be a number");
      } else if (parameters.hasOwnProperty('recordId') && (typeof parameters.recordId !== 'number' || isNaN(parameters.recordId))) {
        throw new Error("Parameter 'recordId' must be a number");
      } else if (parameters.hasOwnProperty('opacSuppress') && typeof parameters.opacSuppress !== 'boolean') {
        throw new Error("Parameter 'opacSuppress' must be a boolean");
      } else {
        return parameters;
      }
    }

    dll_path = dll_path ? dll_path : DLL_PATH;
    
    return {
      bib: {
        addRecord: function(record, library, cat_location, opac_suppress, options) {

          var result,
              parameters = validateParameters(Object.assign(initializeOptions(options), normalizeParameters({
                recordData: record_converter.to(record),
                library: library,
                catLocation: cat_location,
                opacSuppress: opac_suppress
              })));

          result = edge.func({
            assemblyFile: dll_path,
            typeName: DLL_TYPE_NAME,
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
              parameters = validateParameters(Object.assign(initializeOptions(options), normalizeParameters({
                recordId: record_id
              })));
          
          result = edge.func({
            assemblyFile: dll_path,
            typeName: DLL_TYPE_NAME,
            methodName: 'DeleteBibRecord'
          })(parameters, true);

          if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
            throw Object.assign(new Error(result.error.message), {
              errorCode: result.error.code
            });
          }
          
        },
        updateRecord: function(record_id, record_data, library, cat_location, opac_suppress, options) {
          
          var result,
              parameters = validateParameters(Object.assign(initializeOptions(options), normalizeParameters({
                recordData: record_converter.to(record),
                recordId: record_id,
                updateDate: moment(record.get(/^005$/).shift().value, "YYYYMMDDHHmmss").format(),
                library: library,
                catLocation: cat_location,
                opacSuppress: opac_suppress
              })));
          
          result = edge.func({
            assemblyFile: dll_path,
            typeName: DLL_TYPE_NAME,
            methodName: 'UpdateBibRecord'
          })(parameters, true);

          if (typeof result === 'object' && result !== null && result.hasOwnProperty('error')) {
            throw Object.assign(new Error(result.error.message), {
              errorCode: result.error.code
            });
          }
          
        }
      }
    };
    
  };
  
})();
