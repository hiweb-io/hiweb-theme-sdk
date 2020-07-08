class Str {

  limit(str, limit) {

    if (!limit) {
      return str;
    }

    if (!str) {
      return '';
    }

    if (str.length <= limit) {
      return str;
    }

    return str.substring(0, limit) + '...';

  }
}

export default new Str;