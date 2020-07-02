let convertRange = (value, r1, r2, rounded = true) => {
  value = ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
  if (rounded) {
    return Math.round(value);
  } else {
    return Math.round(value * 10) / 10;
  }
};

export default convertRange;
