/** 
 * Global variables and functions used in the state of each session emulation
 * @module config */

// global Mqtt variable
var mqtt;

// definition of the variable for topic susbscription to publish messages
var mqttTopicToPublish;

// definition of the variable timers for set intervals pubilsh messages (parametrized)
var mqttTimerFullUpdate;
var mqttTimerPartialUpdate;
var mqttMessagesPerTimer;

// flag variable to set necessity of update antennas and anchors states
var needUpdateAntennas = false;
var needUpdateAnchors = false;

// flag variable to prevent double animations
var animatingAssetPointFlags = [false];

// flag variable to set connected state (connected/disconnected)
var connectedFlag = false;

// list variable to hold selected ml agents
var selected_ml_agent_algorithm = [];

// MQTT connect field variables
var connection_string = "";

// backend read rate var
var backend_read_rate;

// set variables to Path Loss Model [RSSI] (parametrized)
var pathLossExpoent;        // assuming n = 2
var txPower;                // assuming an txPower 20 dBm 
var referenceDistance;      // assuming d0 = 1 meter
var constantFading;         // min and max values of Gaussian distribution, Xσ
var skewIndex;              // skew index applied to Gaussian distribution, σ
var attenuationFactor;      // 1 dBm factor by intersetion wall

// flags variables to set buttons states (activate/deactivate)
var coordinatesPointContainerFlag = 0;
var distanceRssiContainerFlag = 0;
var animationOptionsContainerFlag = 0;
var consoleDebuggerContainerFlag = 0;
var rssiPathLossModelContainerFlag = 0;
var mqttVariablesContainerFlag = 0;
var mlAgentsContainerFlag = 0;
// ========== End of global variables used in the state of each session emulation ========== //

// ========== Splash Page code ========== //
// Populate dropdown list of maps
var map_select = document.getElementById("map_select");
var map_options = [
    'Library - Aveiro University - Aveiro, Portugal',
    'Instituto de Telecomunicações Building 1 - Aveiro, Portugal',
    'Policlínica Dr. Mário Martins - São João da Madeira, Aveiro, Portugal'
];

for (var i = 0; i < map_options.length; i++) {
    var opt = map_options[i];
    var el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    map_select.appendChild(el);
}

// Add click eventListner to enter Button and hide Splash Page
var splashScreen = document.querySelector('.splash');
var mapSelectorConfirmButton = document.getElementById('map_select_enter');
mapSelectorConfirmButton.addEventListener('click', () => {
    splashScreen.style.opacity = 0;
    setTimeout(() => {
        splashScreen.classList.add('hidden')
    }, 500)
    // call main() after confirm map selection
    mainMethod();
})
// ========== End of Splash Page Code ========== //

// ========== Generic Functions used in session simulation ========== //

/**
 * Load a JSON object from the path
 * @param {string} url URL string path
 * @param {XMLHttpRequest} callback Callback function
 */
function loadJsonFile(url, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', url, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}
 
/**
 * Assign Variable Parameters from JSON file
 * @param {JSON} jsonData JSON Data object
 */
function assignVariableParameters(jsonData) {
    // mqtt_connection_parameters
    document.getElementById("mqtt_hostname_input").value = jsonData.mqtt_connection_parameters.hostname;
    document.getElementById("mqtt_port_input").value = jsonData.mqtt_connection_parameters.port;
    document.getElementById("mqtt_username_input").value = jsonData.mqtt_connection_parameters.username;
    document.getElementById("mqtt_password_input").value = jsonData.mqtt_connection_parameters.password;
    document.getElementById("topic_publish_input").value = jsonData.mqtt_connection_parameters.publish_topic;
    document.getElementById("topic_receive_predictions_input").value = jsonData.mqtt_connection_parameters.predictions_topic;
    document.getElementById("topic_receive_calculations_input").value = jsonData.mqtt_connection_parameters.calculations_topic;
    document.getElementById("reconnect_timeout_input").value = jsonData.mqtt_connection_parameters.reconnect_timeout;
    document.getElementById("mqtt_timer_full_update").value = jsonData.mqtt_connection_parameters.timer_full_update;
    document.getElementById("mqtt_timer_partial_update").value = jsonData.mqtt_connection_parameters.timer_partial_update;
    document.getElementById("mqtt_messages_per_timer").value = jsonData.mqtt_connection_parameters.messages_per_timer;
    document.getElementById("backend_read_rate_input").value = jsonData.mqtt_connection_parameters.backend_read_rate;

    // ml_agents_parameters
    document.getElementById("KNN-label").textContent = jsonData.ml_agents_parameters.k_nearest_neighbor;
    document.getElementById("SVR-label").textContent = jsonData.ml_agents_parameters.support_vector_regression;
    document.getElementById("GBR-label").textContent = jsonData.ml_agents_parameters.gradient_boost_regression;
    document.getElementById("RF-label").textContent = jsonData.ml_agents_parameters.random_forest;
    document.getElementById("DT-label").textContent = jsonData.ml_agents_parameters.decision_tree;

    // rssi_path_loss_parameters
    document.getElementById("reference_distance_parameter").value = jsonData.rssi_path_loss_parameters.reference_distance;
    document.getElementById("path_loss_parameter").value = jsonData.rssi_path_loss_parameters.path_loss_expoent;
    document.getElementById("transmission_power_parameter").value = jsonData.rssi_path_loss_parameters.transmission_power;
    document.getElementById("gaussian_distribuition_parameter").value = jsonData.rssi_path_loss_parameters.gaussian_distribuition;
    document.getElementById("skew_index_parameter").value = jsonData.rssi_path_loss_parameters.skew_index;
    document.getElementById("attenuation_factor_parameter").value = jsonData.rssi_path_loss_parameters.attenuation_factor;
}

/**
 * Return JSON object from given URL sting path
 * @param {string} url URL string path
 * @return {JSON} GeoJSON Data Object 
 */ 
async function getGeoJsonObject(url) {
    return await fetch(url)
        .then(result => result.json())
}

/**
 * Generate UUID string
 * @return {string} Generated 16-characters UUID string
 */  
function generateUUID() {
    var d = new Date().getTime(); //Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if (d > 0) { //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else { //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

/**
 * Get a random number between max and min arguments
 * @param {number} min minimum number
 * @param {number} max maximum number
 * @return {number} Math.random() between max and min arguments
 */  
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get bearing between two point locations
 * @typedef {Object} LongLat with Longitude and Latitude coordinates
 * @property {number} Long - Longitude value
 * @property {number} Lat - Latitude value
 * @param {LongLat} LongLat1 - Longitude and Latitude coordinates of point 1
 * @param {LongLat} LongLat2 - Longitude and Latitude coordinates of point 2
 * @return {number} Bearing between the both point locations
 */  
function getBearingBetweenLocations(LongLat1, LongLat2) {
    // convert Long and Lat to Radians
    var long1 = LongLat1[0] * Math.PI / 180;
    var lat1 = LongLat1[1] * Math.PI / 180;
    var long2 = LongLat2[0] * Math.PI / 180;
    var lat2 = LongLat2[1] * Math.PI / 180;

    // calculate differences
    var deltaLong = (long2 - long1);
    var deltaLat = (lat2 - lat1);

    // get angle in randians 
    var brng = Math.atan2(deltaLat, deltaLong);

    // convert to degrees, rotate -90deg and restrict angle from -180deg to 180deg
    brng = rescrictTo180Degrees(brng * 180 / Math.PI - 90);

    return brng;
}

/**
 * Remove an item occurrency from an array
 * @param {Array} arr Array from where we want remove element
 * @param {any} value Element to be removed
 * @returns {Array} Argument array without removed element
 */ 
function removeItemOnce(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

/**
 * Remove all item occurrencies from an array
 * @param {Array} arr Array from where we want remove element
 * @param {any} value Element to be removed
 * @returns {Array} Argument array without all occurrencies of removed element
 */ 
function removeItemAll(arr, value) {
    var i = 0;
    while (i < arr.length) {
        if (arr[i] === value) {
            arr.splice(i, 1);
        } else {
            ++i;
        }
    }
    return arr;
}

/**
 * Rectrict the value of an angle to be between -180° to 180° (continuous mapping problem)
 * @param {number} value Value where to apply the restriction
 * @returns {number} Angle restricted between -180° to 180°
 */ 
function rescrictTo180Degrees(value) {
    // reduce the angle  
    var angle = parseFloat(value) % 360;

    // force it to be the positive remainder, so that 0 <= angle < 360  
    angle = (angle + 360) % 360;

    // force into the minimum absolute value residue class, so that -180 < angle <= 180  
    if (angle > 180)
        angle -= 360;

    return angle;
}
/**
 * Conversion of Latitude and Longitude, from Decimal Degrees Format to DMS [Degrees° Minutes' Secconds"]
 * @param {number} coordinate Value where to apply the conversion
 * @returns {string} Coverted value to DMS [Degrees° Minutes' Secconds"]
 */  
function toDegreesMinutesAndSeconds(coordinate) {
    var absolute = Math.abs(coordinate);
    var degrees = Math.floor(absolute);
    var minutes = Math.floor((absolute - degrees) * 60);
    var seconds = ((absolute - degrees - minutes / 60) * Math.pow(60, 2)).toFixed(2);
    var deg_symbol = String.fromCharCode(176); // degree symbol (°)
    return degrees + deg_symbol + " " + minutes + "' " + seconds + "&quot";
}

/**
 * Convert Longitude from Decimal Degree Format to DMS (Degrees° Minutes' Seconds")
 * @param {number} lng Longitude value where to apply the conversion
 * @returns {string} Coverted longitude value to DMS [Degrees° Minutes' Secconds"]
 */ 
function convertDMSLng(lng) {
    var longitude = toDegreesMinutesAndSeconds(lng);
    var longitudeCardinal = lng >= 0 ? "E" : "W";
    return longitude + " " + longitudeCardinal;
}

/**
 * Convert Latitude from Decimal Degree Format to DMS (Degrees° Minutes' Seconds")
 * @param {number} lat Latitude value where to apply the conversion
 * @returns {string} Coverted longitude value to DMS [Degrees° Minutes' Secconds"]
 */ 
function convertDMSLat(lat) {
    var latitude = toDegreesMinutesAndSeconds(lat);
    var latitudeCardinal = lat >= 0 ? "N" : "S";
    return latitude + " " + latitudeCardinal;
}

/**
 * Definition of Geocoder Search Bar
 * @param {string} query Query string to search
 * @param {Array} mapFeaturesData Array of Map features
 * @returns {Array} Array of queried matching features
 */ 
function forwardGeocoder(query, mapFeaturesData) {
    var matchingFeatures = [];

    for (var i = 0, len = mapFeaturesData.features.length; i < len; i++) {
        var feature = mapFeaturesData.features[i];
        if (feature.properties.hasOwnProperty('name') &&
            feature.properties['name']
                .toLowerCase()
                .search(query.toLowerCase()) !== -1
        ) {
            feature['place_name'] = feature.properties['name'];
            feature['center'] = turf.centroid(feature).geometry.coordinates;
            feature['place_type'] = ['park'];
            matchingFeatures.push(feature);
        } else if (feature.properties.hasOwnProperty('name') &&
            feature.properties.name
                .toLowerCase()
                .search(query.toLowerCase()) !== -1
        ) {
            feature['place_name'] = feature.properties.name;
            feature['center'] = turf.centroid(feature).geometry.coordinates;
            feature['place_type'] = ['park'];
            matchingFeatures.push(feature);
        }
    }
    return matchingFeatures;
}

/**
 * Catch Walls Of Map Features Data array and filter
 * @param {Array} mapFeaturesData Array of Map features
 * @param {Array} geojson_walls Array of Map walls features
 * @param {Array} filter_walls_keywords Array of keywords to filter Map walls features 
 * @param {Array} filter_walls_level Array of levels to filter Map walls features 
 * @returns {Array} Array of geojson_walls filtered by arguments keywords and levels
 */ 
function catchWallsOfMapFeaturesData(mapFeaturesData, geojson_walls, filter_walls_keywords, filter_walls_level) {
    // deal with obstacle walls
    mapFeaturesData.features.forEach(index => {
        // apply polygon to line to define walls
        wall = turf.polygonToLine(index)
        // apply filter data (for the given "words" on the given "levels")
        filter_walls_level.forEach(level => {
            filter_walls_keywords.forEach(word => {
                // apply filter data (ex policlínica: for "walls" and "glass", only on level 0)
                if (wall.properties.name.includes(word) && wall.properties.level.includes(level)) {
                    geojson_walls.features.push(wall);
                }
            })
        })
    });
}
// ========== End  of generic functions used in session simulation ========== //