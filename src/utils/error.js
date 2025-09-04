export const parseError = (err, defaultMessage) => {
  try {
    const errArr = [];
    for (let i in err.response.data) {
      errArr.push(`<div>${i}: ${err.response.data[i]}</div>`);
    }

    return errArr.join('<br/>');
  } catch (error) {}

  return (
    defaultMessage ||
    'There has been an error. Please reach out to an admin for assistance.'
  );
};
