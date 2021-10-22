const debounce = (callback, delay = 2000) => {
  let timeoutId;

  // Return a function
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      callback.apply(null, args);
    }, delay);
  };
};
