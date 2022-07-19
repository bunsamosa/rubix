// type defintions for city

type LatLng = {
    lat: number;
    lng: number;
};

type MapOptions = {
    tilt: number;
    heading: number;
    zoom: number;
    center: LatLng;
    mapId: string;
};
