export default (object, dottedString) => {

  let tmpObject = object;
  let nestedAttributes = dottedString.split('.');
  let getter = (obj, key) => {

    if (!obj || typeof obj !== 'object' || typeof obj[key] === 'undefined') {
      return tmpObject = null;
    }

    return tmpObject = obj[key];

  };

  nestedAttributes.forEach(key => {
    tmpObject = getter(tmpObject, key);
  });

  return tmpObject;
}