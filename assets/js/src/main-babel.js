"use strict";

//Test features
var passiveSupported = false;
try {
  var options = Object.defineProperty({}, "passive", {
    get: function get() {
      passiveSupported = true;
    }
  });
  window.addEventListener("test", null, options);
} catch (err) {}

//Cache elements
var body = document.body,
    nav = document.getElementById('nav'),
    header = document.getElementById('header'),
    sun = document.getElementById('sun'),
    lede = document.querySelector('#welcome .lede'),
    introduction = document.querySelector('#welcome .introduction'),
    parallax_one,
    parallax_two,
    parallax_three,
    parallax_four,
    parallax_five;

//General variables
var transitioning = false;
var worldData;
var windowHeight = $(window).height();

//Kick everything off
$.getJSON("worlds.json", function (data) {
  console.log('Worlds loaded');
  worldData = data;
  var get = getParameters(getNavUrl());

  setupParallax(get.world);
});

// Page scrolling effects
var last_scroll = windowHeight / 100;
var ticking = false;
window.addEventListener('scroll', function (e) {
  this_scroll = window.scrollY;
  if (this_scroll >= last_scroll * 1.1) {
    console.log('Hide');
    nav.classList.add('hide');
    last_scroll = this_scroll;
  } else if (this_scroll <= last_scroll / 1.1) {
    console.log('reveal');
    nav.classList.remove('hide');
    last_scroll = this_scroll;
  }
  if (!ticking) {
    window.requestAnimationFrame(function () {
      var offset = this_scroll * -1;
      parallax_one.css({ 'margin-bottom': offset / 5 + "px" });
      parallax_two.css({ 'margin-bottom': offset / 4 + "px" });
      parallax_three.css({ 'margin-bottom': offset / 3 + "px" });
      parallax_four.css({ 'margin-bottom': offset / 2 + "px" });
      parallax_five.css({ 'margin-bottom': offset + "px" });
      ticking = false;
    });
  }
  ticking = true;
});
function resetScroll() {
  nav.classList.add('hide');
  last_scroll = 0;
}

//Animation work
animate_stage();

function animate_stage() {
  if (body.classList.contains('default') || body.classList.contains('midnight')) {
    body.classList.add('sunrise');
    setTimeout(function () {
      body.classList.add('daytime');
    }, 5000);
  }
}

$(".explore-button a").click(function () {
  if (transitioning === false) {
    transitioning = true;
    var target = $("#" + this.getAttribute("target"));
    target.parents().addClass('target_parent');
    target.css({
      'top': target.offset().top - $(window).scrollTop(),
      'left': target.offset().left,
      'width': target.width(),
      'position': 'fixed'
    }).queue(function () {
      //Don't set class until CSS properties added
      target.addClass('target_world');
      body.classList.add('transitioning');
      $(this).dequeue();
    });
    target.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function (e) {
      swapWorld(target);
    });
  }
  return false;
});

function swapWorld(target) {
  var newWorld = $(target).attr("world");
  console.log('Now entering: ' + newWorld);
  $(window).scrollTop(0);
  header.classList.add('entering');
  body.className = newWorld;
  console.log(target);
  target[0].style.cssText = null;
  body.classList.remove('transitioning');
  refreshElements(newWorld);
}

function refreshElements(world) {
  var elements = worldData[world];
  var newHTML = '';
  header.innerHTML = '';
  $.each(elements, function (key, value) {
    newHTML += '<img src="' + value + '" id="' + world + '_' + key + '"/>';
  });
  header.innerHTML = newHTML;
  lede.innerHTML = worldData.copy[world].lede;
  introduction.innerHTML = worldData.copy[world].introduction;
  resetScroll();
  setupParallax(world);
}

function setupParallax() {
  var world = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'default';

  var layers = worldData.layers[world];
  var record = worldData[world];
  var prefix;
  if (world == 'default') {
    prefix = '#';
  } else {
    prefix = '#' + world + '_';
  }
  $.each(layers, function (layer, entries) {
    for (var i = 0, len = entries.length; i < len; i++) {
      $(prefix + entries[i]).addClass('parallax_' + layer);
      delete record[entries[i]];
    }
  });
  $.each(record, function (element) {
    $(prefix + element).addClass('parallax_five');
  });
  parallax_one = $('.parallax_one');
  parallax_two = $('.parallax_two');
  parallax_three = $('.parallax_three');
  parallax_four = $('.parallax_four');
  parallax_five = $('.parallax_five');
}

//Tools
function getNavUrl() {
  //Get Url
  return window.location.search.replace("?", "");
}
function getParameters(url) {
  //Params obj
  var params = {};
  //To lowercase
  url = url.toLowerCase();
  //To array
  url = url.split('&');

  //Iterate over url parameters array
  var length = url.length;
  for (var i = 0; i < length; i++) {
    //Create prop
    var prop = url[i].slice(0, url[i].search('='));
    //Create Val
    var value = url[i].slice(url[i].search('=')).replace('=', '');
    //Params New Attr
    params[prop] = value;
  }
  return params;
}
