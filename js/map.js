//Menu Controls
$('.dd-header-menu-button').click(function(){
  $('.dd-header-menu').toggleClass( "hidden-menu-xs fadeInRight" );
  return false;
});

$('.popup-container-bg').click(function(){
  hidePopUp();
})

$('.dd-header-menu-item').click(function(){

  $('.dd-header-menu').addClass( "hidden-menu-xs" );
  
  if($(this).find('a#menu-about').length != 0){
    $('.popup-container').addClass('animated fadeIn').removeClass('hidden');
  }

  if($(this).find('a#menu-filter').length != 0){
    $('.category-layer').addClass('animated fadeInUp').removeClass('hidden fadeOutDown');
    clearCSSTimeout();
    hideSelection();
  }

  return false;
});

$('.content-close').click(function(){
  hideSelection();
  return false;
});

$('.category-close').click(function(){
  hideCategory();
  return false;
})

var hidePopUp = function(){
  $('.popup-container').addClass('hidden').removeClass('animated fadeIn');
  return false;
}



//Map Initial Variables
var url = 'http://beta.trimet.org/go/json/destinations'
var map = L.map('map', {zoomControl: false}).setView([45.510128, -122.677028], 13);
var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
var destinations = [];
var categories = {};
var destinationsLayer = new L.MarkerClusterGroup({
  iconCreateFunction: function(cluster) {
    return L.divIcon({ name: cluster.getChildCount(), cluster: true, iconUrl: 'img/cluster.png', iconSize: new L.Point(42,42), iconAnchor: new L.Point(21, 21), shadowAnchor: new L.Point(21,-21)});
  },
  showCoverageOnHover: false
});
var selectLayer = new L.FeatureGroup();
var filterOut;
var contentOut;

new L.Control.Zoom({ position: 'bottomright' }).addTo(map);

L.DivIcon = L.Icon.extend({
  options: {
    iconUrl: 'img/marker.png',
    imageIcon: '',
    name: '',
    cluster: false,
    shadowUrl: 'img/marker-shadow.png',
    iconSize: new L.Point(42,57),
    iconAnchor: new L.Point(21, 56),
    shadowSize:   new L.Point(42,6), // size of the shadow
    shadowAnchor: new L.Point(21,0),  // the same for the shadow
    className: 'leaflet-div-icon'
  },

  createIcon: function () {
    var div = document.createElement('div');
    var marker = this._createImg(this.options['iconUrl']);

    var dimg = document.createElement('div');
    dimg.setAttribute ( "class", "map-icon-bg");
    dimg.style.backgroundImage = "url('http://beta.trimet.org/go/files/" + this.options['imageIcon'] + "')";

    var numdiv = document.createElement('div');
    numdiv.innerHTML = this.options['name'] || '';

    if (this.options['cluster']){
      numdiv.setAttribute ( "class", "ttRoute-map-cluster");
    }
    else {
      numdiv.setAttribute ( "class", "ttRoute-map");
    }

    div.appendChild ( marker );
    div.appendChild ( dimg );
    div.appendChild ( numdiv );

    var route = window.location.href.split('tracker/')[1];
    var line = '';
    if (route){line = route.split('/')[2];}

    this._setIconStyles(div, 'icon');
    return div;
  }
});

function clearCSSTimeout(){
  clearTimeout(filterOut);
  clearTimeout(contentOut);
}

function hideSelection(){
  selectLayer.clearLayers();
  window.location.href = "#/"
  var bigWidth = $(window).width() >= 640;
  if (bigWidth){
    $('.content-container').addClass('fadeOutRight');
  }
  else {
    $('.content-container').addClass('fadeOutDown');
  }
  $('.content-container').removeClass('fadeInRight fadeInUp fadeIn');
  contentOut = setTimeout(function() {
    $('.content-container').addClass('hidden')
  }, 1000);
}

function hideCategory(){
  $('.category-layer').addClass('fadeOutDown').removeClass('fadeInUp');
  filterOut = setTimeout(function() {
    $('.category-layer').addClass('hidden')
  }, 1000);
}


function onMarkerClick(location, data){

  clearCSSTimeout();
  selectLayer.clearLayers();
  hideCategory();

  var bigWidth = $(window).width() >= 640;

  var circle = new L.CircleMarker(location, {
    radius: 50,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 0,
    fillOpacity: 0.8,
  });

  selectLayer.addLayer(circle);
  window.location.href = "#/id/" + data.id;

  function inputData(data){
    $('.content-info .content-title').html(data.name);
    $('.content-info .content-categories').html((data.category).join(', '));
    $('.content-info .content-description').html(data.description);
    $('.content-image img').attr("src", "http://beta.trimet.org/go/files/" + data.image.file);
    $('.content-button a.site-visit').attr("href", data.url);
    $('.content-button a.plan-trip').attr("href", "http://trimet.org/#/planner/form/to=" + (data.name).split(' ').join('+') + "::" + data.location.latitude + "," + data.location.longitude);
  }

  if ($('.content-container').is('.hidden, .fadeOutRight, .fadeOutDown')){
    inputData(data);
    $('.content-container').removeClass('hidden fadeOutRight fadeOutDown');

    if (bigWidth){
      $('.content-container').addClass('animated fadeInRight');
    }
    else {
      $('.content-container').addClass('animated fadeInUp');
    }
  }
  else {
    inputData(data);
    $('.content-container').removeClass('fadeInRight fadeInUp').addClass('animated fadeIn');
    var cloneContent = $('.content-container').clone(true);            
    $('.content-container').before(cloneContent);    
    $(".content-container:last").remove();

  }
}

var isExpired = function(indefinite, endDate){
  var isIndefinte = Number(indefinite);
  var endDate = new Date(endDate.split(' ').join('T'));
  var currentDate = new Date();
  var endDateEpoch = Math.round(endDate.getTime()/1000.0);
  var currentDateEpoch = Math.round(currentDate.getTime()/1000.0);

  if (isIndefinte) {
    return true;
  }
  else {
    if (endDateEpoch >= currentDateEpoch){
      return true;
    }
    else {
      return false;
    }
  }
}

//Marker Controller
function setMarkers(destinations, category){
  destinationsLayer.clearLayers();
  
  $.each(destinations, function( index, value ) {
    var destination = value;

    

    if (category == undefined || category == ''){
      var marker = L.marker([destination.location.latitude, destination.location.longitude], {
        title: destination.name,
        riseOnHover: true,
        riseOffset: 1000,
        icon: new L.DivIcon({name: destination.name, imageIcon: destination.image.file }),
        data: destination
      }).on('click', function(e) {
        onMarkerClick(e.latlng, e.target.options.data);
      });
      destinationsLayer.addLayer(marker);
    }
    else {
      if ($.inArray( category,  destination.category) > -1){
        var marker = L.marker([destination.location.latitude, destination.location.longitude], {
          title: destination.name,
          riseOnHover: true,
          riseOffset: 1000,
          icon: new L.DivIcon({name: destination.name, imageIcon: destination.image.file }),
          data: destination
        }).on('click', function(e) {
          onMarkerClick(e.latlng, e.target.options.data);
        });
        destinationsLayer.addLayer(marker);
      }
    }
  });

  map.addLayer(destinationsLayer);
  map.addLayer(selectLayer);
  map.fitBounds(destinationsLayer.getBounds(), {padding: [150, 150]});
  map.on('click', function(e) {
    clearCSSTimeout();
    hideCategory()
    hideSelection();
  });
}

function setCategories(categories) {
   $.each(categories, function( index, value ) {
    // <div class='category-text'><a href="">Family Fun (1)</a></div>
    $('.categories-list').append('<div class="category-text"><a class="category-select" category-data="' + index + '" href="#">' + index + ' (' + value + ')</a></div>')
   });

   $('.category-select').click(function(){
    hideCategory();
    var category = $(this).attr('category-data');
    setMarkers(destinations, category);
    return false;
   });

}

function getURL(url){
  var urlDestination = url.split('id/')[1];
  setMarkers(destinations);

  if (urlDestination !== undefined && urlDestination !== ''){
    $.each(destinations, function( index, value ) {
      var data = value;
      if (data.id === urlDestination){
        var location = [data.location.latitude, data.location.longitude];
        onMarkerClick(location, data);
        setTimeout(function() {
          var targetZoom = 18;
          var bigWidth = $(window).width() >= 640;

          if (bigWidth){
            map.setView(location, targetZoom);

          }
          else {
            var targetPoint = map.project(location, targetZoom).add([0, $(window).height() / 4]),
                targetLatLng = map.unproject(targetPoint, targetZoom);
            map.setView(targetLatLng, targetZoom);
          }
        }, 500);
      }
    }); 
    // $.each(destinationsLayer._featureGroup._layers, function( index, value ) {
    //   var data = value.options.data;
    //   var location = [data.location.latitude, data.location.longitude]
    //   if (data.id === urlDestination){
    //     onMarkerClick(location, data);
    //   }
    // }); 
  }

}

function getData(){
  $.support.cors = true;
  $.ajax({
      type: "GET",
      url: "http://beta.trimet.org/json.php?url=" + url,
      dataType: "json",
      // headers:{post:2},
      crossDomain: true,
      success: function (json) {
        $.each(json.contents.destinations, function( index, value ) {
          var destination = value;
          if (isExpired(destination.checkbox, destination.enddate)) {
            $.each(destination.category, function( index, value ) {
              if (categories[value] == undefined){
                categories[value] = 1;
              }
              else {
                categories[value] += 1;
              }
            });
            destinations.push(value);
          }
        });

        if (destinations.length){
          getURL(window.location.href);
          setCategories(categories);
          $('.all-categories').text('ALL (' + destinations.length + ')');
        }
        else {
          alert("No active destinations at the moment!")
        }
      },
      error: function(xhr, textStatus, errorThrown){
         alert('request failed');
      }
  });
};

//Run Initial Functions
try{
  if(localStorage.getItem('popState') != 'shown'){
      $('.popup-container').removeClass('hidden');
      localStorage.setItem('popState','shown')
  }
}
catch(err) {
  $('.popup-container').removeClass('hidden');
}
getData();