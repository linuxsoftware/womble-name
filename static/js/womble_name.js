// Generated by CoffeeScript 1.6.3
(function() {
  var Globe,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Globe = (function() {
    function Globe() {
      var offset, speedCtrl,
        _this = this;
      this.block = $('.womble .globe');
      offset = this.block.offset();
      this.left = offset.left;
      this.top = offset.top;
      this.diameter = 181;
      this.numFrames = 150;
      this.speed = 60;
      this.frame = this.numFrames;
      this.lastDraw = new Date().getTime();
      this.block.click(function(ev) {
        return _this.stopGlobe(ev);
      });
      speedCtrl = $(".womble .controls .speed");
      speedCtrl[0].value = this.speed;
      speedCtrl.change(function(ev) {
        return _this.speed = ev.target.value;
      });
      this.geocoder = new google.maps.Geocoder();
      $(".womble .go-again").click(function() {
        return _this.goAgain();
      });
    }

    Globe.prototype.spinGlobe = function() {
      var advFrame, delay, now, offset, over,
        _this = this;
      if (this.speed <= 0) {
        return;
      }
      now = new Date().getTime();
      over = now - this.lastDraw;
      this.lastDraw = now;
      delay = 100 - over - this.speed;
      advFrame = 1;
      if (delay < -10) {
        delay += 40;
        advFrame = 2;
      }
      if (delay < 0) {
        delay = 0;
      }
      this.frame -= advFrame;
      if (this.frame < 0) {
        this.frame += this.numFrames;
      }
      offset = this.frame * this.block.width();
      this.block.css('background-position', "" + offset + "px 0");
      if (delay) {
        return setTimeout((function() {
          return requestAnimationFrame(_this.spinGlobe.bind(_this));
        }), delay);
      } else {
        return requestAnimationFrame(this.spinGlobe.bind(this));
      }
    };

    Globe.prototype.stopGlobe = function(ev) {
      var lat, latlng, lng, _ref;
      if (this.speed <= 0) {
        return;
      }
      _ref = this.unproject(ev), lat = _ref[0], lng = _ref[1];
      if (lat === void 0 || lng === void 0) {
        return;
      }
      latlng = "" + (lat.toFixed(6)) + ", " + (lng.toFixed(6));
      $(".womble .latlng").text("" + latlng);
      $(".womble .latlng").attr('href', "https://maps.google.com/maps" + ("?q=" + latlng + "&z=5"));
      this.speed = 0;
      return this.wombleName(lat, lng, 0, function(name) {
        $('.womble .womble-name').text(name);
        return $('.womble .your-name').show();
      });
    };

    Globe.prototype.goAgain = function() {
      this.frame = this.numFrames;
      this.speed = $(".womble .controls .speed")[0].value;
      $('.womble .womble-name').text("");
      $('.womble .your-name').hide();
      $(".womble .latlng").text("");
      $(".womble .latlng").attr('href', "#");
      return this.spinGlobe();
    };

    Globe.prototype.unproject = function(ev) {
      var c, lat, lng, lng0, p, radius, radsToDegs, x, y;
      radius = this.diameter / 2;
      x = ev.pageX - this.left - radius;
      y = -(ev.pageY - this.top - radius);
      lng0 = this.frame * (Math.PI * 2 / this.numFrames);
      p = Math.sqrt(x * x + y * y);
      if (p > radius) {
        return [];
      }
      c = Math.asin(p / radius);
      lat = Math.asin(y * Math.sin(c) / p);
      lng = lng0 + Math.atan2(x * Math.sin(c), p * Math.cos(c));
      if (lng > Math.PI) {
        lng -= Math.PI * 2;
      }
      radsToDegs = function(rads) {
        return rads * 180 / Math.PI;
      };
      return [radsToDegs(lat), radsToDegs(lng)];
    };

    Globe.prototype.wombleName = function(lat1, lng1, dist, callback) {
      var angle, x, y,
        _this = this;
      angle = Math.random() * Math.PI * 2;
      y = Math.sin(angle) * dist;
      x = Math.cos(angle) * dist;
      return this.geocoder.geocode({
        'latLng': {
          lat: lat1 + y,
          lng: lng1 + x
        },
        'language': 'en'
      }, function(results, status) {
        var name;
        if (status === google.maps.GeocoderStatus.OK) {
          name = _this.pickName(results);
        }
        if (name) {
          name = _this.addTitle(name);
          return callback(name);
        } else {
          dist += 1.5;
          if (dist > 5) {
            if (_this.frame >= 120 && _this.frame < 150) {
              return callback(_this.addTitle("Atlantic"));
            } else if (_this.frame >= 50 && _this.frame <= 110) {
              return callback(_this.addTitle("Pacific"));
            } else {
              return callback(_this.addTitle("Earth"));
            }
          } else {
            return _this.wombleName(lat1, lng1, dist, callback);
          }
        }
      });
    };

    Globe.prototype.pickName = function(results) {
      var component, names, nm, result, retval, type, validTypes, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      retval = "";
      validTypes = ["political", "country", "administrative_area_level_1", "administrative_area_level_2", "administrative_area_level_3", "administrative_area_level_4", "administrative_area_level_5", "colloquial_area", "locality", "ward", "neighborhood", "natural_feature", "airport", "park", "point_of_interest"];
      names = [];
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        result = results[_i];
        _ref = result.address_components;
        for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          component = _ref[_j];
          _ref1 = component.types;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            type = _ref1[_k];
            nm = component.long_name;
            nm = nm.replace(/united states/i, "America");
            nm = nm.replace(/united kingdom/i, "Britain");
            nm = nm.replace(/\b(of\ the\ union\ of|state\ of|county|province|district|region|krai|autonomous|unorganized|republic|state|okrug|oblast|rayon|kray|city|department|governorate)\b/gi, "");
            nm = nm.replace(/^\w+\ *\((\w+)\)/, "$1");
            nm = nm.trim();
            if (nm.length > 4 && __indexOf.call(validTypes, type) >= 0 && __indexOf.call(names, nm) < 0) {
              names.push(nm);
            }
          }
        }
      }
      if (names) {
        retval = names[Math.floor(Math.random() * names.length)];
      }
      return retval;
    };

    Globe.prototype.addTitle = function(name) {
      var draw, titles;
      titles = ["Madame", "Great Uncle", "Cousin", "Aunt", "Great Aunt", "Uncle", "Cousin", "Auntie", "Gramps", "Granny", "Cousin", "Captain", "Major", "Cousin", "Cousin", "Professor"];
      if (name === "America" || name === "Russia" || name === "China" || name === "France" || name === "Britain" || name === "Canada" || name === "Australia") {
        draw = Math.floor(Math.random() * titles.length);
      } else {
        draw = Math.floor(Math.random() * (titles.length + name.length));
      }
      if (draw < titles.length) {
        return "" + titles[draw] + " " + name;
      } else {
        return name;
      }
    };

    return Globe;

  })();

  $(function() {
    var globe;
    globe = new Globe;
    globe.spinGlobe();
  });

}).call(this);