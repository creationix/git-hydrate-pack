var bops = require('bops');
var sha1 = require('git-object-hash/sha-browser.js');
var applyDelta = require('git-apply-delta');

var OFS_DELTA = 6,
    REF_DELTA = 7;


var types = {
  "1": "commit",
  "2": "tree",
  "3": "blob",
};

module.exports = function (find) {
  return function (emit) {
    return function (err, item) {
      if (item === undefined) return emit(err);
      if (item === null) return;// emit(null, item);
      if (item.type === OFS_DELTA) {
        throw new Error("TODO: Apply offset delta");
      }
      if (item.type === REF_DELTA) {
        return find(bops.to(item.reference, 'hex'), function (err, ref) {
          var data = applyDelta(ref.data, item.data);
          var hash = sha1(data);
          emit(null, {
            hash: hash,
            type: ref.type,
            data: data,
            offset: item.offset,
            num: item.num
          });
        });
      }
      var type = types[item.type];
      var hash = sha1(bops.join([
        bops.from(type + " " + item.data.length + "\0"),
        item.data
      ]));
      if (!(item.type in types)) throw new Error("unknown type");
      emit(null, {
        hash: hash,
        type: type,
        data: item.data,
        offset: item.offset,
        num: item.num
      });
    };
  };
};