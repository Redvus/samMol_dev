ymaps.ready(init);

function init() {
    var mapGeography = new ymaps.Map("mapGeography", {
        center: [53.225631, 50.180304],
        zoom: 12,
        type: "yandex#map",
    });
    mapGeography.behaviors.disable("scrollZoom");
}
