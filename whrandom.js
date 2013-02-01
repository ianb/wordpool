// Based on Python's whrandom
var RandomStream = function RandomStream(newSeed) {
  var seed, x, y, z;
  function setSeed(value) {
    if (! value) {
      value = Date.now();
    }
    if (typeof value != "number") {
      if (value.getTime) {
        value = value.getTime();
      }
      value = parseInt(value, 10);
    }
    if ((! value) || isNaN(value)) {
      throw "Bad seed: " + value;
    }
    seed = value;
    x = (seed % 30268) + 1;
    seed = (seed - (seed % 30268)) / 30268;
    y = (seed % 30306) + 1;
    seed = (seed - (seed % 30306)) / 30306;
    z = (seed % 30322) + 1;
    seed = (seed - (seed % 30322)) / 30322;
  }
  setSeed(newSeed);
  var result = function random() {
    x = (171 * x) % 30269;
    y = (172 * y) % 30307;
    z = (170 * z) % 30323;
    if (random.logState) {
      console.log('x', x, 'y', y, 'z', z);
    }
    if (random.storeState) {
      localStorage.setItem(random.storeState, JSON.stringify([x, y, z]));
    }
    return (x / 30269.0 + y / 30307.0 + z / 30323.0) % 1.0;
  };
  result.storeState = null;
  result.setSeed = setSeed;
  result.pick = function (array) {
    var index = Math.floor(result() * array.length);
    return array[index];
  };
  result.lowerLetters = "abcdefghijklmnopqrstuvwxyz";
  result.upperLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  result.letters = result.lowerLetters + result.upperLetters;
  result.numbers = "0123456789";
  result.simplePunctuation = " _-+,./";
  result.extraPunctuation = "!@#$%^&*()=`~[]{};:'\"\\|<>?";
  result.punctuation = result.simplePunctuation + result.extraPunctuation;
  result.whitespace = " \n";
  result.string = function string(letters, length) {
    letters = letters || result.letters;
    length = length || 10;
    var s = "";
    for (var i=0; i<length; i++) {
      s += result.pick(letters);
    }
    return s;
  };
  result.loadState = function (state) {
    if (state === undefined && ! result.storeState) {
      return;
    }
    if (state === undefined) {
      state = localStorage.getItem(result.storeState);
      if (state) {
        state = JSON.parse(state);
      } else {
        return;
      }
    }
    x = state[0];
    y = state[1];
    z = state[2];
  };
  result.clearState = function () {
    if (! result.storeState) {
      return;
    }
    localStorage.removeItem(result.storeState);
  };
  return result;
};
