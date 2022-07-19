import { Loader } from "@googlemaps/js-api-loader";

// create and return a map
export async function createMap(
    containerID: string,
    mapOptions: MapOptions
): Promise<google.maps.Map> {
    // map loader
    const loader = new Loader({
        apiKey: import.meta.env.VITE_MAPS_API_KEY,
    });
    await loader.load();

    // create map
    const mapDiv = document.getElementById(containerID) as HTMLElement;
    const map = new google.maps.Map(mapDiv, mapOptions);
    return map;
}
