$(function () {

  var $container = $("#container");
  var $selector = $("#selector");
  var $selectoff = $("#selectoff");
  var $picking = $("#picking");

  var freqLetters = [];
  (function initFreqLetters() {
    var divider = words.minFreq / 5;
    for (var l in words.freq) {
      for (var j=0; j<words.freq[l]/divider; j++) {
        freqLetters.push(l);
      }
    }
  })();

  var Letters = {
    targetLetters: 100,

    letters: [],

    addLetter: function (l) {
      this.letters.push(l);
    },

    pickLetter: function () {
      return letterPlacer.pick(freqLetters);
    },

    createLetter: function () {
      var l = Letter(this.pickLetter());
      this.addLetter(l);
    },

    refreshLetters: function () {
      while (this.letters.length < this.targetLetters) {
        this.createLetter();
      }
    },

    showIntersection: function (x, y, x2, y2) {
      $picking.empty();
      var _len = this.letters.length;
      var width = Letter.prototype.width / 2;
      var height = Letter.prototype.height / 2;
      for (var i=0; i<_len; i++) {
        var l = this.letters[i];
        if (x < (l.x + width) &&
            y < (l.y + height) &&
            x2 > (l.x - width) &&
            y2 > (l.y - height)) {
          var el = $('<div class="pick-letter">').text(l.letter.toUpperCase());
          $picking.append(el);
        }
      }
    }
  };

  function Letter() {
    var o = Object.create(Letter.prototype);
    o.constructor.apply(o, arguments);
    return o;
  }

  var letterPlacer = RandomStream(1);

  Letter.prototype = {
    width: 20,
    height: 20,

    constructor: function (l, x, y) {
      this.letter = l;
      if (! x) {
        x = Math.floor(letterPlacer() * ($container.width() - this.width));
        y = Math.floor(letterPlacer() * ($container.height() - this.height));
      }
      this.el = $('<div class="letter">').text(l.toUpperCase());
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
    $selectoff.hide().css({
      top: startY,
      left: startX
    });

    function selectoff() {
      return false;
    }

    var good = true;
    function mousemove(event2) {
      var x = event2.pageX;
      var y = event2.pageY;
      if (x < startX || y < startY) {
        if (good) {
          $selectoff.show();
          $selector.hide();
          good = false;
        }
      } else {
        if (! good) {
          $selectoff.hide();
          $selector.show();
          good = true;
        }
      }
      if (good) {
        Letters.showIntersection(startX, startY, x, y);
      }
      $selector.css({
        width: x-startX,
        height: y-startY
      });
    }

    $(document).bind("mousemove", mousemove);
    $(document).bind("selectstart", selectoff);
    $(document).one("mouseup", function () {
      $(document).unbind("mousemove", mousemove);
      $(document).unbind("selectstart", selectoff);
      $selectoff.hide();
    });

  });

});
