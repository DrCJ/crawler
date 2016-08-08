module.exports = {
  objectToArray: obj => {
    var array = [];
    for (var k in obj) {
      obj[k].key = k;
      array[array.length] = obj[k];
    }
    return array;
  }
}