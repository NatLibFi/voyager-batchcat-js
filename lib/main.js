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
  
  const DLL_PATH = 'lib/managed/batchcat-edge.dll';
  const DLL_TYPE_NAME = 'NatLibFi.Voyager.BatchCatEdge';
  
  module.exports = function(global_options, dll_path) {

    var edge = require('edge'),
        moment = require('moment'),
	convertRecord = require('marc-record-serializers/lib/ISO2709').toISO2709,	
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
    
    function validateParameters(parameters) {
      if (parameters.hasOwnProperty('username') && typeof parameters.username !== 'string') {
        throw new Error("Parameter 'username' must be a string");
      } else if (parameters.hasOwnProperty('password') && typeof parameters.password !== 'string') {
        throw new Error("Parameter 'password' must be a string");
      } else if (parameters.hasOwnProperty('iniDir') && typeof parameters.iniDir !== 'string') {
        throw new Error("Parameter 'iniDir' must be a string");
      } else if (parameters.hasOwnProperty('recordData') && typeof parameters.recordData !== 'string') {
        throw new Error("Parameter 'recordData' must be a string");
      } else if (parameters.hasOwnProperty('library') && typeof parameters.library !== 'number') {
        throw new Error("Parameter 'library' must be a number");
      } else if (parameters.hasOwnProperty('catLocation') && typeof parameters.catLocation !== 'number') {
        throw new Error("Parameter 'catLocation' must be a number");
      } else if (parameters.hasOwnProperty('recordId') && typeof parameters.recordId !== 'number') {
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
              parameters = validateParameters(Object.assign(initializeOptions(options), {
                recordData: convertRecord(record),
                library: library,
                catLocation: cat_location,
                opacSuppress: opac_suppress
              }));
  
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
              parameters = validateParameters(Object.assign(initializeOptions(options), {
                recordId: record_id
              }));
  
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
              parameters = validateParameters(Object.assign(initializeOptions(options), {
                recordData: convertRecord(record),
		recordId: record_id,
		updateDate: moment(record.get(/^005$/).shift().value, "YYYYMMDDHHmmss").format(),
                library: library,
                catLocation: cat_location,
                opacSuppress: opac_suppress
              }));
  
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
