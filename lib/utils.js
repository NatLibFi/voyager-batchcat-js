var path = require('path');

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


function normalizeParameters(parameters) {
  return Object.keys(parameters).reduce(function(product, key) {

    var new_value;
    var value = parameters[key];

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


function initializeOptions(global_options, additional_options) {
  
  var options = Object.assign({}, global_options, additional_options);

  if (!options.hasOwnProperty('iniDir') || !options.hasOwnProperty('username') || !options.hasOwnProperty('password')) {
    throw new Error('The following options are mandatory: iniDir, username, password');
  } else {
    return Object.assign(options, {
      iniDir: path.dirname(path.resolve(options.iniDir))
    });
  }
  
}

module.exports = {
  validateParameters, normalizeParameters, initializeOptions
};
