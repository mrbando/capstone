
function hasMinLength(property, minLength) {
    const result = function (data = {}) {
      const value = data[property];
      if (value && value.length >= minLength) {
        return data;
      }
      const error = new Error(
        `The '${property}' property must be at least ${minLength} characters.`
      );
      error.status = 400;
      throw error;
    };
    Object.defineProperty(result, "name", {
      value: `hasMinLength${property.toUpperCase()}Of${minLength}`,
      writable: false,
    });
    Object.defineProperty(result, "__filename", {
      value: __filename,
      writable: false,
    });
    return result;
  }
  
  module.exports = hasMinLength;