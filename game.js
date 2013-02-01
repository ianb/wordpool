$(function () {

  var $container = $("#container");
  var $selector = $("#selector");
  var $selectoff = $("#selectoff");

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
      this.l = l;
      if (! x) {
        x = Math.floor(letterPlacer() * ($container.width() - this.width));
        y = Math.floor(letterPlacer() * ($container.height() - this.height));
      }
      this.el = $('<div class="letter">').text(l.toUpperCase());
      this.el.css({
        top: y,
        left: x
      });
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

    function mousemove(event2) {
      var x = event2.pageX;
      var y = event2.pageY;
      console.log("got", x, y, startX, startY);
      if (x < startX || y < startY) {
        $selectoff.show();
        $selector.hide();
      } else {
        $selectoff.hide();
        $selector.show();
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
