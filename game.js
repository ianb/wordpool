$(function () {

  var $container = $("#container");
  var $selector = $("#selector");
  var $picking = $("#picking");
  var $result = $("#result");
  var $score = $("#score");
  var hint = $("#hint")[0];

  var freqLetters = [];
  (function initFreqLetters() {
    var divider = words.minFreq / 5;
    for (var l in words.freq) {
      for (var j=0; j<words.freq[l]/divider; j++) {
        freqLetters.push(l);
      }
    }
  })();

  function wordScore(word) {
    var l = word.length;
    if (l == 1) {
      return 0.1;
    }
    if (l == 2) {
      return 0.3;
    }
    if (l == 3) {
      return 1;
    }
    if (l == 4) {
      return 1.4;
    }
    return l - 3;
  }

  function squareScore(pos) {
    var width = (pos[2] - pos[0]) / Letter.prototype.width;
    var height = (pos[3] - pos[1]) / Letter.prototype.height;
    var total = width + height;
    if (total < 6) {
      return 0;
    }
    console.log("score", width, height, total);
    return (total - 6) * 0.05;
  }

  function addScore(n) {
    var cur = parseFloat($score.text() || 0, 10);
    cur += n;
    $score.text(cur.toFixed(1));
  }
  addScore(0);

  var Letters = {
    targetLetters: 100,

    letters: [],

    addLetter: function (l) {
      this.letters.push(l);
    },

    clear: function () {
      for (var i=0; i<this.letters.length; i++) {
        this.letters[i].el.remove();
      }
      this.letters = [];
    },

    shuffle: function () {
      this.clear();
      this.refreshLetters();
    },

    pickLocation: function () {
      var width = Letter.prototype.width;
      var height = Letter.prototype.height;
      var totalWidth = $container.width();
      var totalHeight = $container.height();
      var _len = this.letters.length;
      while (1) {
        var x = Math.floor(letterPlacer() * (totalWidth - width));
        var y = Math.floor(letterPlacer() * (totalHeight - height));
        var good = true;
        for (var i=0; i<_len; i++) {
          var l = this.letters[i];
          if (x >= l.x &&
              y >= l.y &&
              x <= l.x+width &&
              y <= l.y+height) {
            good = false;
            break;
          }
        }
        if (good) {
          return [x, y];
        }
      }
    },

    removeLetter: function (l) {
      l.el.remove();
      for (var i=0; i<this.letters.length; i++) {
        if (this.letters[i] === l) {
          this.letters.splice(i, 1);
          break;
        }
      }
    },

    pickLetter: function () {
      return letterPicker.pick(freqLetters);
    },

    createLetter: function () {
      var pos = this.pickLocation();
      var l = Letter(this.pickLetter(), pos[0], pos[1]);
      this.addLetter(l);
    },

    refreshLetters: function () {
      while (this.letters.length < this.targetLetters) {
        this.createLetter();
      }
    },

    showIntersection: function (x, y, x2, y2) {
      $(".selected-letter").removeClass("selected-letter");
      $picking.empty();
      $result.empty();
      var _len = this.letters.length;
      var width = Letter.prototype.width / 2;
      var height = Letter.prototype.height / 2;
      var word = [];
      for (var i=0; i<_len; i++) {
        var l = this.letters[i];
        if (x < (l.x + width) &&
            y < (l.y + height) &&
            x2 > (l.x - width) &&
            y2 > (l.y - height)) {
          var el = $('<div class="pick-letter">').text(l.letter.toUpperCase());
          word.push(l.letter);
          el.data("letter", l);
          $picking.append(el);
          l.el.addClass("selected-letter");
        }
      }
      if (word.length && hint.checked) {
        word.sort();
        word = word.join("");
        if (words.sorted[word]) {
          $result.text("maybe...");
        } else {
          $result.text("");
        }
      }
    },

    calculateWord: function (pos) {
      var letters = [];
      var wordLetters = [];
      $picking.find(".pick-letter").each(function () {
        var e = $(this);
        wordLetters.push(e.text().toLowerCase());
        letters.push(e.data("letter"));
      });
      var word = wordLetters.sort().join("");
      var result = words.sorted[word];
      if ((! word) || (! result)) {
        $result.text("No word :(");
        $result.addClass("bad");
        $selector.hide();
        return;
      }
      $result.removeClass("bad").empty();
      result = result.split(/,/g);
      result = picker.pick(result);
      var score = wordScore(word);
      var score2 = squareScore(pos);
      $result.text(
        result + " = " + score.toFixed(1) + " (word) + " +
            score2.toFixed(1) + " (square)");
      letters.forEach(function (l) {
        this.removeLetter(l);
      }, this);
      addScore(wordScore(word));

      $selector.hide();
      this.refreshLetters();
    }
  };

  function Letter() {
    var o = Object.create(Letter.prototype);
    o.constructor.apply(o, arguments);
    return o;
  }

  var letterPicker = RandomStream();
  var letterPlacer = RandomStream();
  var picker = RandomStream();

  var letterCount = 0;

  Letter.prototype = {
    width: 20,
    height: 20,

    constructor: function (l, x, y) {
      this.letter = l;
      this.el = $('<div class="letter">').text(l.toUpperCase());
      this.el.attr("data-count", letterCount++);
      this.el.css({
        top: y,
        left: x
      });
      this.x = x;
      this.y = y;
      $container.append(this.el);
    }
  };

  Letters.refreshLetters();

  $container.mousedown(function (event) {
    var startX = event.pageX;
    var startY = event.pageY;
    $selector.show().css({
      top: startY,
      left: startX,
      width: 10,
      height: 10
    });

    function selectoff() {
      return false;
    }

    var pos = [];
    function mousemove(event2) {
      var x1 = Math.min(startX, event2.pageX);
      var x2 = Math.max(startX, event2.pageX);
      var y1 = Math.min(startY, event2.pageY);
      var y2 = Math.max(startY, event2.pageY);
      Letters.showIntersection(x1, y1, x2, y2);
      $selector.css({
        top: y1,
        left: x1,
        width: x2-x1,
        height: y2-y1
      });
      pos = [x1, y1, x2, y2];
    }

    $(document).bind("mousemove", mousemove);
    $(document).bind("selectstart", selectoff);
    $(document).one("mouseup", function () {
      $(document).unbind("mousemove", mousemove);
      $(document).unbind("selectstart", selectoff);
      Letters.calculateWord(pos);
    });

    // An alternative to selectstart:
    return false;
  });

  $("#shuffle").click(function () {
    addScore(-1);
    Letters.shuffle();
  });

});
