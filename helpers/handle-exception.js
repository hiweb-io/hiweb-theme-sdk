import getNestedAttribute from './get-nested-attribute';

export default e => {

  let errors = [];

  // If known error
  let responseErrors = getNestedAttribute(e, 'response.data.errors');
  if (responseErrors) {
    
    // Map to local errors
    errors = responseErrors.map(error => {
      return error.title;
    });

  } else {
    errors = ['Oops! Unknown error!'];
  }

  return errors;
}