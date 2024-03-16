const parseDurationToSeconds = (duration) => {
  const matches = duration.match(/^(\d+)([smhdwMy]|ms)$/);
  if (!matches) return null;

  const value = parseInt(matches[1], 10);
  const unit = matches[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 24 * 60 * 60;
    case "w":
      return value * 7 * 24 * 60 * 60;
    case "M":
      return value * 30 * 24 * 60 * 60;
    case "y":
      return value * 365 * 24 * 60 * 60;
    case "ms":
      return value / 1000;
    default:
      return null;
  }
};

module.exports = parseDurationToSeconds;
