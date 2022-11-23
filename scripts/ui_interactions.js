/**
 * UI Interections Functions definitions
 *  @module ui_interactions */

/**
 * Update Mqtt Variables and call MQTTConnect() function
 * @param {string} mqtt_hostname MQTT hostname connection
 * @param {string} mqtt_port MQTT port connection
 * @param {number} reconnect_timeout MQTT reconnect Time Out value
 * @param {string} clientUsername MQTT client username connection
 * @param {string} clientPassword MQTT client password connection
 * @param {boolean} ssl_flag MQTT connection SSL flag
 * @param {string} messageToSend MQTT message to send to the broker
 * @param {string} mqttTopicToReceivePredictions MQTT Topic To Receive Predictions
 * @param {string} mqttTopicToReceiveCalculations MQTT Topic To Receive Calculations
 * @param {FeatureCollection} geojson_asset_points Asset Points FeatureCollection
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection
 * @param {FeatureCollection} geojson_anchors Anchors FeatureCollection
 * @param {number} geojson_precison_decimal_places Vaule of precison decimal places
 * @param {Array} pulsing_dots_layers_IDs Pulsing Dots IDs Array
 * @param {Array} pulsing_dots_layers_sources Pulsing Dots sources Array
 * @param {number} selectedMapIndex index of selected Map
 * @param {string} received_uuid MQTT received session UUID
 * @returns {string} Connection string value and backend read rate value;
 */
function updateMqttParameters(
    mqtt_hostname,
    mqtt_port,
    reconnect_timeout,
    clientUsername,
    clientPassword,
    ssl_flag,
    messageToSend,
    mqttTopicToReceivePredictions,
    mqttTopicToReceiveCalculations,
    geojson_asset_points,
    geojson_antennas,
    geojson_anchors,
    geojson_precison_decimal_places,
    pulsing_dots_layers_sources,
    pulsing_dots_layers_IDs,
    selectedMapIndex,
    received_uuid
) {
    session_uuid = document.getElementById("session-uuid").innerHTML;
    client_id = document.getElementById("clientjs-id").innerHTML;
    mqtt_hostname = document.getElementById("mqtt_hostname_input").value;
    mqtt_port = parseInt(document.getElementById("mqtt_port_input").value);
    reconnect_timeout = parseInt(document.getElementById("reconnect_timeout_input").value) * 1000;
    clientUsername = document.getElementById("mqtt_username_input").value;
    clientPassword = document.getElementById("mqtt_password_input").value;
    mqttTopicToPublish = document.getElementById("topic_publish_input").value;
    mqttTopicToReceivePredictions = document.getElementById("topic_receive_predictions_input").value;
    mqttTopicToReceiveCalculations = document.getElementById("topic_receive_calculations_input").value;
    mqttTimerFullUpdate = parseInt(document.getElementById("mqtt_timer_full_update").value) * 1000;
    mqttTimerPartialUpdate = parseInt(document.getElementById("mqtt_timer_partial_update").value) * 1000;
    mqttMessagesPerTimer = parseInt(document.getElementById("mqtt_messages_per_timer").value);
    backend_read_rate = parseInt(document.getElementById("backend_read_rate_input").value) * 1000;

    // update connection_string variable
    connection_string = `ws://${mqtt_hostname}:${mqtt_port}/mqtt`;

    if (selected_ml_agent_algorithm.length < 1) {
        printableMessage = "Please select at least one ML-agent to be used in positioning predictions.";
        // show window alert message
        alert(printableMessage);

        // call to toggleMlAgentsContainer()
        toggleMlAgentsContainer();

        return;
    }
    else {
        printableMessage = "Connect MQTT:" + "\r\n" + "The client is connecting to the broker...";

        // print to console and to console_debugger
        console.log(printableMessage);
        printOnConsoleDebugger(printableMessage);

        // show window alert message
        alert(printableMessage);

        // call MQTTconnect() function
        connectToMqttBroker(
            session_uuid,
            client_id,
            mqtt_hostname,
            mqtt_port,
            reconnect_timeout,
            clientUsername,
            clientPassword,
            ssl_flag,
            backend_read_rate,
            messageToSend,
            mqttTopicToReceivePredictions,
            mqttTopicToReceiveCalculations,
            geojson_asset_points,
            geojson_antennas,
            geojson_anchors,
            geojson_precison_decimal_places,
            pulsing_dots_layers_sources,
            pulsing_dots_layers_IDs,
            selectedMapIndex,
            received_uuid
        );
    }

    // close container painel
    mqtt_variables_container.style.display = '';
    mqttVariablesContainerFlag = 0;

    return connection_string, backend_read_rate;
}

/**
 * Update Selected ML Agent from Container
 * @param {boolean} connectedFlag MQTT connection state flag
 * @param {FeatureCollection} geojson_asset_points Asset Points FeatureCollection
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection
 * @param {FeatureCollection} geojson_anchors Anchors FeatureCollection
 * @param {number} geojson_precison_decimal_places Vaule of precison decimal places 
 * @param {number} backend_read_rate Value of Backend read rate 
 * @param {number} selectedMapIndex Index of selected Map
 * @param {string} mqttTopicToPublish MQTT Topic To Publish Messages
 * @param {string} messageToSend MQTT message to send to broker
 * @returns {Array} Selected ML Agent Algorithm
 */
function updateSelectedMlAgents(
    connectedFlag,
    geojson_asset_points,
    geojson_antennas,
    geojson_anchors,
    geojson_precison_decimal_places,
    backend_read_rate,
    selectedMapIndex,
    mqttTopicToPublish,
    messageToSend
) {
    var checkboxes = document.querySelectorAll('#ml_agents_form input[type=checkbox]:checked')
    prev = selected_ml_agent_algorithm;
    selected_ml_agent_algorithm = [];

    // verify the checkboxes
    checkboxes.forEach(index => {
        selected_ml_agent_algorithm.push(`"${index.id.toLowerCase()}"`)
    });

    if (selected_ml_agent_algorithm.length < 1) {
        printableMessage = "Please select a ML-agent to be used in positioning predictions.";

        // update buttons colors
        updateUnselectedColorButtonSubmitAgents();
        updateUnselectedColorButtonStartConnection();
    }

    else {
        if (selected_ml_agent_algorithm.length > 1) {
            if (selected_ml_agent_algorithm == '"knn","svr","gbr","rf","dt","fp_dt","fp_rf","fp_rnn"') {
                selected_ml_agent_algorithm = '"all"';
            }

            printableMessage = "The selected ML-agents to be used in positioning predictions are '" + selected_ml_agent_algorithm + "'.";
        }
        else if (selected_ml_agent_algorithm.length == 1) {
            printableMessage = "The selected ML-agent to be used in positioning predictions is '" + selected_ml_agent_algorithm + "'.";
        }

        // update buttons colors
        updateSelectedColorButtonSubmitAgents();
        updateSelectedColorButtonStartConnection();
    }

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Construct Json Message
    if (connectedFlag)
        if (selected_ml_agent_algorithm.length >= 1) {
            messageToSend = constructJsonMessage(
                "algs",
                geojson_asset_points,
                geojson_antennas,
                geojson_anchors,
                geojson_precison_decimal_places,
                backend_read_rate,
                selectedMapIndex,
                messageToSend
            );
            publishMqttMessage(mqttTopicToPublish, messageToSend);
        }
        else {
            return prev;
        }

    return selected_ml_agent_algorithm;
}

/**
 * Update RSSI Path-Loss Model parameters
 * @param {boolean} connectedFlag MQTT connection state flag
 * @param {FeatureCollection} geojson_asset_points Asset Points FeatureCollection
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection
 * @param {FeatureCollection} geojson_anchors Anchors FeatureCollection
 * @param {number} geojson_precison_decimal_places Vaule of precison decimal places 
 * @param {number} backend_read_rate Value of Backend read rate 
 * @param {number} selectedMapIndex Index of selected Map
 * @param {string} mqttTopicToPublish MQTT Topic To Publish Messages
 * @param {string} messageToSend MQTT message to send to broker
 * @returns {JSON} RSSI parameters as JSON object
 */
function updateRssiPathLossModelParameters(
    connectedFlag,
    geojson_asset_points,
    geojson_antennas,
    geojson_anchors,
    geojson_precison_decimal_places,
    backend_read_rate,
    selectedMapIndex,
    mqttTopicToPublish,
    messageToSend
) {
    txPower = parseFloat(document.getElementById("transmission_power_parameter").value);
    constantFading = parseFloat(document.getElementById("gaussian_distribuition_parameter").value);
    pathLossExpoent = parseFloat(document.getElementById("path_loss_parameter").value);
    referenceDistance = parseFloat(document.getElementById("reference_distance_parameter").value);
    skewIndex = parseFloat(document.getElementById("skew_index_parameter").value);
    attenuationFactor = parseFloat(document.getElementById("attenuation_factor_parameter").value)

    // update button color
    updateRssiParametersColorButton();

    // Populate message to print
    printableMessage = "The RSSI Path-Loss Model parameters have been updated.";

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Construct Json Message
    if (connectedFlag) {
        messageToSend = constructJsonMessage(
            "rssiUpdateParams",
            geojson_asset_points,
            geojson_antennas,
            geojson_anchors,
            geojson_precison_decimal_places,
            backend_read_rate,
            selectedMapIndex,
            messageToSend
        );
        publishMqttMessage(mqttTopicToPublish, messageToSend);
    }
    return {
        "pathLossExpoent": pathLossExpoent,
        "txPower": txPower,
        "referenceDistance": referenceDistance,
        "constantFading": constantFading,
        "skewIndex": skewIndex,
        "attenuationFactor": attenuationFactor
    };
}

/**
 * Toggle Drag option inside popup
 * @param {string} source_obj Source of FeatureCollection 
 * @param {FeatureCollection} geojson_obj FeatureCollection data object
 * @param {number} currentFeatureId Index of FeatureCollection data object
 * @param {boolean} draggability Value of draggability option
 */
function toggleDrag(source_obj, geojson_obj, currentFeatureId, draggability) {
    // Update the Point feature in `places` coordinates
    var currentObj = geojson_obj.features.find(obj => {
        return obj.properties.id === currentFeatureId;
    })

    // verify draggable option
    if (draggability) {
        currentObj.properties.draggable = false;
        printableMessage = `Draggable option of '${currentObj.properties.title}' was deactivated!`;

    } else {
        currentObj.properties.draggable = true;
        printableMessage = `Draggable option of '${currentObj.properties.title}' was activated!`;
    }

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Call event to close all open popups
    map.fire('closeAllPopups');

    // Call setData to the source layer `point` on it.
    map.getSource(source_obj).setData(geojson_obj);
}

/**
 * Toggle Predictions option inside popup
 * @param {string} source_obj Source of FeatureCollection 
 * @param {FeatureCollection} geojson_obj FeatureCollection data object
 * @param {number} currentFeatureId Index of FeatureCollection data object
 * @param {boolean} show_predictions Value of show predictions option
 */
function togglePredictions(source_obj, geojson_obj, currentFeatureId, show_predictions) {
    // Update the Point feature in `places` coordinates
    var currentObj = geojson_obj.features.find(obj => {
        return obj.properties.id === currentFeatureId;
    })

    // verify show_predictions option
    if (show_predictions) {
        currentObj.properties.show_predictions = false;
        printableMessage = `Predictions option of '${currentObj.properties.title}' was deactivated!`;

    } else {
        currentObj.properties.show_predictions = true;
        printableMessage = `Predictions option of '${currentObj.properties.title}' was activated!`;
    }

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Call event to close all open popups
    map.fire('closeAllPopups');

    // Call setData to the source layer `point` on it.
    map.getSource(source_obj).setData(geojson_obj);
}

/**
 * Toggle Lines-of-Sight option inside popup
 * @param {string} source_obj Source of FeatureCollection 
 * @param {FeatureCollection} geojson_obj FeatureCollection data object
 * @param {number} currentFeatureId Index of FeatureCollection data object
 * @param {boolean} show_lines Value of show lines option
 */
function toggleLinesOfSight(source_obj, geojson_obj, currentFeatureId, show_lines) {
    // Update the Point feature in `places` coordinates
    var currentObj = geojson_obj.features.find(obj => {
        return obj.properties.id === currentFeatureId;
    })

    // verify show_lines option
    if (show_lines) {
        currentObj.properties.show_lines = false;
        printableMessage = `Lines-of-Sight option of '${currentObj.properties.title}' was deactivated!`;

    } else {
        currentObj.properties.show_lines = true;
        printableMessage = `Lines-of-Sight option of '${currentObj.properties.title}' was activated!`;
    }

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Call event to close all open popups
    map.fire('closeAllPopups');

    // Call setData to the source layer `point` on it.
    map.getSource(source_obj).setData(geojson_obj);
}

/**
 * Generate an Animated Image with rgb basecolor
 * @param {string} basecolor RGB color values
 * @returns Animated Pulsing Dot
 */
function generateAnimatedImage(basecolor) {
    // ========== Create Animated Pulsing Dot ==========
    // This implements `StyleImageInterface`
    // to draw a pulsing dot icon on the map.
    const size = 256; // The image will be 256 pixels square.
    const bytesPerPixel = 4; // Each pixel is represented by 4 bytes: red, green, blue, and alpha.
    const animatedPulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * bytesPerPixel),

        onAdd: function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width;
            canvas.height = this.height;
            this.context = canvas.getContext('2d');
            this.map = map;
        },

        render: function () {
            const duration = 1000;
            const t = (performance.now() % duration) / duration;

            const radius = (size / 2) * 0.3;
            const outerRadius = (size / 2) * 0.7 * t + radius;
            const context = this.context;

            // Draw the outer circle.
            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                outerRadius,
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(${basecolor}, ${1 - t}})`;
            context.fill();

            // Draw the inner circle.
            context.beginPath();
            context.arc(
                this.width / 2,
                this.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.fillStyle = `rgba(${basecolor}, 0.5)`;
            context.strokeStyle = 'white';
            context.lineWidth = 2 + 4 * (1 - t);
            context.fill();
            context.stroke();

            // Update this image's data with data from the canvas.
            this.data = context.getImageData(
                0,
                0,
                this.width,
                this.height
            ).data;

            // Continuously repaint the map, resulting
            // in the smooth animation of the dot.
            this.map.triggerRepaint();

            // Return `true` to let the map know that the image was updated.
            return true;
        }
    }
    return animatedPulsingDot;
}

/**
 * Auto scroll down element (Console debug content)
 * @param {HTMLElement} htmlElement HTML Element (Console debug)
 * @param {string} string Text to print on console
 */
function autoScrollDown(htmlElement, string) {
    // Allow 1px inaccuracy by adding 1
    var isScrolledToBottom = htmlElement.scrollHeight - htmlElement.clientHeight <= htmlElement.scrollTop + 1;
    var newElement = document.createElement("div");
    newElement.innerHTML = "> " + string + "</br>";
    htmlElement.appendChild(newElement);
    // scroll to bottom if isScrolledToBottom
    if (isScrolledToBottom)
        htmlElement.scrollTop = htmlElement.scrollHeight - htmlElement.clientHeight;
}

/**
 * Print string on console debugger innerHTML element and call autoScrollDown()
 * @param {string} string Text to print on console
 */
function printOnConsoleDebugger(string) {
    var element = document.getElementById('console_debugger');
    // auto scroll down
    autoScrollDown(element, string);
}

/**
 * Attach a message to a container innerHTML
 * @param {HTMLElement} container HTML element container
 * @param {string} message Text to print on container
 */
function updateContainerInnerHtml(container, message) {
    container.innerHTML = message;
}

/**
 * Check All Checkbox Options
 * @param {Array} checkboxes Checkboxes HMTL input type Array
 */
function checkAllCheckboxOptions(checkboxes) {
    checkboxes.forEach(index => {
        index.checked = true;
    });
}

/**
 * Uncheck All Checkbox Options
 * @param {Array} checkboxes Checkboxes HMTL input type Array
 */
function uncheckAllCheckboxOptions(checkboxes) {
    checkboxes.forEach(index => {
        index.checked = false;
    });
}

/**
 * Update Rssi Parameters button color
 */
async function updateRssiParametersColorButton() {
    document.getElementById("btn_update_rssi_params").style.background = '#34eba4';
    // await 1 seconds (sleep)
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById("btn_update_rssi_params").style.background = '#00c8ff';
}

/**
 * Update button color on select ML agents
 */ 
function updateSelectedColorButtonSubmitAgents() {
    document.getElementById("submit_ml_agents").style.background = '#34eba4';
}

/**
 * Update button color on unselect ML agents
 */ 
function updateUnselectedColorButtonSubmitAgents() {
    document.getElementById("submit_ml_agents").style.background = '#00c8ff';
}

/**
 * Update Start Connection button color on selected ML agents
 */ 
function updateSelectedColorButtonStartConnection() {
    document.getElementById("btn_start_connection").style.background = '#34eba4';
}

/**
 * Update Start Connection button color on deselect ML agents
 */ 
function updateUnselectedColorButtonStartConnection() {
    document.getElementById("btn_start_connection").style.background = '#00c8ff';
}

/**
 * Update 'Start Animation' and 'Stop Animation' button colors on start
 */
function updateAnimationColorButtonsOnStart() {
    document.getElementById("btn_start_animations").style.background = '#999999';
    document.getElementById("btn_stop_animations").style.background = '#ff8080';
}

/**
 * Update 'Start Animation' and 'Stop Animation' button colors on stop
 */
function updateAnimationColorButtonsOnStop() {
    document.getElementById("btn_start_animations").style.background = '#00c8ff';
    document.getElementById("btn_stop_animations").style.background = '#999999';
}

/**
 * Update connect and disconnect button colors on connect successfully
 */
function updateConnectionButtonsColors() {
    document.getElementById("connectMqtt").style.background = '#0f0';
    document.getElementById("connectMqtt").style.color = '#000';
    document.getElementById("disconnectMqtt").style.background = '#000';
    document.getElementById("disconnectMqtt").style.color = '#f00';
}

/**
 * Update connect and disconnect button colors on disconnect successfully
 */
function updateDisconnectionButtonsColors() {
    document.getElementById("connectMqtt").style.background = '#000';
    document.getElementById("connectMqtt").style.color = '#0f0';
    document.getElementById("disconnectMqtt").style.background = '#f00';
    document.getElementById("disconnectMqtt").style.color = '#000';
}

/**
 * Set visibility of 'pulsing-dots' layers to visible
 * @param {Array} layers_pulsing_dots_IDs_to_enable Pulsing Dots Layer Ids Array to enable
 * @returns {Array} Pulsing Dots Layer Ids Array with visible elements
 */ 
function setPulsingDotsLayersToVisible(layers_pulsing_dots_IDs_to_enable) {
    var visibles = []
    layers_pulsing_dots_IDs_to_enable.forEach(index => {
        if (map.getLayer(index)) {
            map.setLayoutProperty(index, 'visibility', 'visible');
            visibles.push(index);
        }
    });
    return visibles;
}

/**
 * Set visibility of 'pulsing-dots' layers to none
 * @param {Array} layers_pulsing_dots_IDs_to_disable Pulsing Dots Layer Ids Array to disable
 * @returns {Array} Pulsing Dots Layer Ids Array with non-visible elements
 */
function setPulsingDotsLayersToNone(layers_pulsing_dots_IDs_to_disable) {
    var disables = []
    layers_pulsing_dots_IDs_to_disable.forEach(index => {
        if (map.getLayer(index)) {
            map.setLayoutProperty(index, 'visibility', 'none');
            disables.push(index);
        }
    });
    return disables;
}

/**
 * Update Asset Point Configs option inside popup
 * @param {string} source_obj Source of FeatureCollection 
 * @param {FeatureCollection} geojson_assetpoints Asset Points FeatureCollection 
 * @param {FeatureCollection} geojson_assetpoints_directions Asset Points Directions FeatureCollection 
 * @param {number} prev_large_lobe_angle_direction Previous value of large lobe angle direction of Asset Point
 * @param {number} prev_small_lobe_angle_direction Previous value of small lobe angle direction of Asset Point
 * @param {number} animation_item Asset Point Animation item index
 * @param {number} currentFeatureId Asset Point feature index
 */
function updateAssetPointConfigs(source_obj, geojson_assetpoints, geojson_assetpoints_directions, prev_large_lobe_angle_direction, prev_small_lobe_angle_direction, animation_item, currentFeatureId) {
    // Update the Point feature in `places` coordinates
    var currentObj = geojson_assetpoints.features.find(obj => {
        return obj.properties.id === currentFeatureId;
    })

    // save parameters
    var large_lobe_angle_direction = rescrictTo180Degrees(document.getElementById("ap_large_direction_parameter").value).toFixed(2);
    var small_lobe_angle_direction = rescrictTo180Degrees(document.getElementById("ap_small_direction_parameter").value).toFixed(2);
    var large_lobe_angle_opening = document.getElementById("ap_large_opening_parameter").value;
    var small_lobe_angle_opening = document.getElementById("ap_small_opening_parameter").value;

    // parse values
    if (prev_large_lobe_angle_direction != String(large_lobe_angle_direction)) {
        large_angle_direction_value = parseFloat(large_lobe_angle_direction);
        small_angle_direction_value = parseFloat(rescrictTo180Degrees(parseFloat(large_lobe_angle_direction) + 180));
    }
    else if (prev_small_lobe_angle_direction != String(small_lobe_angle_direction)) {
        large_angle_direction_value = parseFloat(rescrictTo180Degrees(parseFloat(small_lobe_angle_direction) + 180));
        small_angle_direction_value = parseFloat(small_lobe_angle_direction);
    }
    else {
        large_angle_direction_value = parseFloat(large_lobe_angle_direction);
        small_angle_direction_value = parseFloat(small_lobe_angle_direction);
    }

    large_angle_opening_value = parseFloat(large_lobe_angle_opening);
    small_angle_opening_value = parseFloat(small_lobe_angle_opening);

    // set values
    geojson_assetpoints.features[currentFeatureId].properties.angle_direction_large_lobe = large_angle_direction_value;
    geojson_assetpoints.features[currentFeatureId].properties.angle_direction_small_lobe = small_angle_direction_value;
    geojson_assetpoints.features[currentFeatureId].properties.angle_opening_large_lobe = large_angle_opening_value;
    geojson_assetpoints.features[currentFeatureId].properties.angle_opening_small_lobe = small_angle_opening_value;
    geojson_assetpoints.features[currentFeatureId].properties.animation_option_index = parseInt(animation_item.match(/(\d+)$/));

    // set printable message
    printableMessage = `AP '${currentObj.properties.title}' configs was updated!`;

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // call event to close all open popups
    map.fire('closeAllPopups');

    // call setData to the source layer `point` on it.
    map.getSource(source_obj).setData(geojson_assetpoints);

    // remove (splice) the direction at currentFeatureId from 'geojson_assetpoints_directions' FeatureCollection (x2 for asset_points_directions)
    geojson_assetpoints_directions.features.splice(currentFeatureId * 2, 2);

    // create asetpoint Direction at currentFeatureId
    createAssetPointLobesDirection(geojson_assetpoints.features[currentFeatureId], geojson_assetpoints_directions)

    // Call setData to the source layer `places` on it.
    map.getSource('assetpoints_directions').setData(geojson_assetpoints_directions);
}

/**
 * Update Antenna Configs option inside popup
 * @param {string} source_obj Source of FeatureCollection 
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection 
 * @param {FeatureCollection} geojson_antennas_directions Antennas Directions FeatureCollection 
 * @param {number} currentFeatureId Antenna feature index
 */
function updateAntennaConfigs(source_obj, geojson_antennas, geojson_antennas_directions, currentFeatureId) {
    // Update the Point feature in `places` coordinates
    var currentObj = geojson_antennas.features.find(obj => {
        return obj.properties.id === currentFeatureId;
    })

    // save parameters
    var angle_direction = document.getElementById("ant_angle_direction_parameter").value;
    var angle_opening = document.getElementById("ant_angle_opening_parameter").value;
    var tx_power = document.getElementById("ant_tx_power_parameter").value;

    // parse values
    angle_direction_value = parseFloat(angle_direction);
    angle_opening_value = parseFloat(angle_opening);
    tx_power_value = parseFloat(tx_power);

    // set values
    geojson_antennas.features[currentFeatureId].properties.angle_direction = angle_direction_value;
    geojson_antennas.features[currentFeatureId].properties.angle_opening = angle_opening_value;
    geojson_antennas.features[currentFeatureId].properties.tx_power = tx_power_value;

    printableMessage = `Antenna '${currentObj.properties.title}' configs was updated!`;

    // print to console and to console_debugger
    console.log(printableMessage);
    printOnConsoleDebugger(printableMessage);

    // Call event to close all open popups
    map.fire('closeAllPopups');

    // Call setData to the source layer `point` on it.
    map.getSource(source_obj).setData(geojson_antennas);

    // remove (splice) the direction at currentFeatureId from 'geojson_antennas_directions' FeatureCollection
    geojson_antennas_directions.features.splice(currentFeatureId, 1);

    // create antenna Direction at currentFeatureId
    createAntennaDirection(geojson_antennas.features[currentFeatureId], geojson_antennas_directions)

    // call setData to the source layer `places` on it.
    map.getSource('antennas_directions').setData(geojson_antennas_directions);

    // set flag needUpdateAntennas to true
    needUpdateAntennas = true;
}

/**
 * Create Asset Point Lobes Direction with provided a rotation angles
 * @param {number} index Asset point feature index
 * @param {FeatureCollection} geojson_assetpoints_directions Asset Point Directions FeatureCollection
 * @returns {FeatureCollection} Asset Points Directions FeatureCollection
 */
function createAssetPointLobesDirection(index, geojson_assetpoints_directions) {
    // first save antenna coordinates
    var assetpoint_coordinates = index.geometry.coordinates;
    // value of rotation of large lobe in decimal degrees, anti-clockwise
    var angle_direction_large = -index.properties.angle_direction_large_lobe;
    // value of rotation of small lobe in decimal degrees, anti-clockwise
    var angle_direction_small = -index.properties.angle_direction_small_lobe;

    // use turf.js - Sector
    // Creates a circular sector of a circle of given radius and center Point, between (clockwise) bearing1 and bearing2; 
    // 0 bearing is North of center point, positive clockwise.
    var center = turf.point([assetpoint_coordinates[0], assetpoint_coordinates[1]]);
    var radiusFactor = 1000;
    var radius1 = 1 / radiusFactor * 0.75;
    var radius2 = 1 / radiusFactor * 0.55;

    var bearingLarge1 = 0 - index.properties.angle_opening_large_lobe / 2;
    var bearingLarge2 = bearingLarge1 + index.properties.angle_opening_large_lobe;

    var bearingSmall1 = 0 - index.properties.angle_opening_small_lobe / 2;;
    var bearingSmall2 = bearingSmall1 + index.properties.angle_opening_small_lobe;

    var sectorLobeLarge = turf.sector(center, radius1, bearingLarge1, bearingLarge2);
    var sectorLobeSmall = turf.sector(center, radius2, bearingSmall1, bearingSmall2);

    // apply rotation
    var options = { pivot: [assetpoint_coordinates[0], assetpoint_coordinates[1]] };
    var rotatedSectorLobeLarge = turf.transformRotate(sectorLobeLarge, angle_direction_large, options);
    var rotatedSectorLobeSmall = turf.transformRotate(sectorLobeSmall, angle_direction_small, options);

    // push (splice) the 'sector' object in 'index.properties.id', deleting 0 elements (x2 for asset_points_directions)
    geojson_assetpoints_directions.features.splice(index.properties.id * 2, 0, rotatedSectorLobeLarge, rotatedSectorLobeSmall);

    // copy properties (x2 for asset_points_directions)
    geojson_assetpoints_directions.features[index.properties.id * 2].properties = index.properties;
    geojson_assetpoints_directions.features[index.properties.id * 2 + 1].properties = index.properties;

    return geojson_assetpoints_directions;
}

/**
 * Create Antenna Direction with provided a rotation angle
 * @param {number} index Antenna feature index
 * @param {*} geojson_antennas_directions Antennas Directions FeatureCollection
 * @returns {FeatureCollection} Antennas Directions FeatureCollection
 */
function createAntennaDirection(index, geojson_antennas_directions) {
    // first save antenna coordinates
    var antenna_coordinates = index.geometry.coordinates;

    // value of rotation in decimal degrees, anti-clockwise
    var angle_direction = -index.properties.angle_direction;

    // use turf.js - Sector
    // Creates a circular sector of a circle of given radius and center Point, between (clockwise) bearing1 and bearing2; 
    // 0 bearing is North of center point, positive clockwise.
    var center = turf.point([antenna_coordinates[0], antenna_coordinates[1]]);
    var radiusFactor = 1000;
    var radius = 1 / radiusFactor;

    var bearing1 = 0 - index.properties.angle_opening / 2;
    var bearing2 = bearing1 + index.properties.angle_opening;
    var sector = turf.sector(center, radius, bearing1, bearing2);

    // apply rotation
    var options = { pivot: [antenna_coordinates[0], antenna_coordinates[1]] };
    var rotatedSector = turf.transformRotate(sector, angle_direction, options);

    // push (splice) the 'sector' object in 'index.properties.id', deleting 0 elements
    geojson_antennas_directions.features.splice(index.properties.id, 0, rotatedSector)

    // copy antennas properties
    geojson_antennas_directions.features[index.properties.id].properties = index.properties;

    return geojson_antennas_directions;
}

/**
 * Catch the Lines Of Sight FeatureCollection
 * @param {FeatureCollection} geojson_objs Points (Asset Points or Anchors) FeatureCollection data
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection
 * @returns {Array} Lines Of Sight Array data
 */
function catchLinesOfSight(geojson_objs, geojson_antennas) {
    // set empty array data
    var lines = [];

    // Iterate by all the 'geojson_antennas.features', using array.forEach(index => { // do something here });
    geojson_antennas.features.forEach(antenna_index => {
        // Iterate by all the 'geojson_antennas.features', using array.forEach(index => { // do something here });
        geojson_objs.forEach(objs_index => {
            if (objs_index.properties.show_lines) {
                // create a line between asset_point and all of 'geojson_antennas'
                var line = turf.lineString([objs_index.geometry.coordinates, antenna_index.geometry.coordinates]);
                // populate array of lines_of_sight 
                lines.push(line);
            }
        });
    });

    return lines;
}

/**
 * Update Lines Of Sight Coordinates
 * @param {FeatureCollection} geojson_asset_points Asset Points FeatureCollection data
 * @param {FeatureCollection} geojson_anchors Anchors FeatureCollection data
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection data
 * @param {FeatureCollection} geojson_lines_of_sight Lines of Sight FeatureCollection data
 * @returns {Array} Lines Of Sight Array data
 */
function updateLinesOfSightCoordinates(geojson_asset_points, geojson_anchors, geojson_antennas, geojson_lines_of_sight) {
    // set empty array data
    var data = [];

    // concat asset_points and anchors features 
    var geojson_objs = geojson_asset_points.features.concat(geojson_anchors.features)

    // catch the lines of sight layer
    geojson_lines_of_sight.features = catchLinesOfSight(geojson_objs, geojson_antennas)

    // Iterate by all the 'geojson_lines_of_sight.features', using array.forEach(index => { // do something here });
    geojson_lines_of_sight.features.forEach(index => {
        data.push({
            'type': 'Feature',
            "properties": {
                "id": index
            },
            "geometry": {
                "type": "LineString",
                "coordinates": index.geometry.coordinates
            }
        });
        // Update the point feature coordinates in `lines_of_sight` 
        index = data[index];
    });

    return geojson_lines_of_sight;
}

/**
 * Animate Lines Of Sight function 
 * @param {FeatureCollection} geojson_asset_points Asset Points FeatureCollection data
 * @param {FeatureCollection} geojson_anchors Anchors FeatureCollection data
 * @param {FeatureCollection} geojson_antennas Antennas FeatureCollection data
 * @param {FeatureCollection} geojson_lines_of_sight Lines of Sight FeatureCollection data
 */
function animateLinesOfSight(geojson_asset_points, geojson_anchors, geojson_antennas, geojson_lines_of_sight) {
    // Update the data to a new position based on the animation timestamp. The
    // divisor in the expression `timestamp / 1000` controls the animation speed.
    map.getSource('lines-of-sight').setData(updateLinesOfSightCoordinates(geojson_asset_points, geojson_anchors, geojson_antennas, geojson_lines_of_sight));
}

/**
 * Catch the Wall Intersections in Lines Of Sight 
 * @param {FeatureCollection} lines_of_sight Lines of Sight FeatureCollection data
 * @param {FeatureCollection} walls Map Features Walls FeatureCollection data
 * @returns {Array} Lines-of-Sight Walls Intersection Points Array
 */
function catchWallIntersections(lines_of_sight, walls) {
    // set empty array data
    var wall_intersections = [];

    // Iterate by all the 'lines_of_sight.features', using array.forEach(index => { // do something here });
    lines_of_sight.features.forEach(index => {
        // verify if line-of-sight have walls intersections
        var intersection = turf.lineIntersect(index, walls);
        // populate array of wall_intersections 
        wall_intersections.push(intersection.features);
    });

    return wall_intersections;
}

/**
 * Update Wall Intersection Points Coordinates
 * @param {FeatureCollection} wall_intersections_points Lines-of-Sight Walls Intersection Points Array
 * @param {FeatureCollection} geojson_lines_of_sight Lines-of-Sight FeatureCollection
 * @param {FeatureCollection} geojson_walls Map Features Walls FeatureCollection data
 * @returns {Array} Lines-of-Sight Walls Intersection Points Array
 */
function updateWallIntersectionPointsCoordinates(wall_intersections_points, geojson_lines_of_sight, geojson_walls) {
    // set empty array data
    var data = [];

    // catch line of sight walls intersections
    wall_intersections_points.features = catchWallIntersections(geojson_lines_of_sight, geojson_walls);

    // Iterate by all the 'lines_of_sight.features', using array.forEach(index => { // do something here });
    wall_intersections_points.features.forEach(index_i => {
        index_i.forEach(index_j => {
            data.push({
                'type': 'Feature',
                "properties": {
                    "id": index_i * index_j + index_i + index_j
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": index_j.geometry.coordinates
                }
            });
        });
    });
    // Update the wall_intersections_points.features with data array
    wall_intersections_points.features = data

    return wall_intersections_points;
}

/**
 * Animate Wall Intersection Points function
 * @param {FeatureCollection} wall_intersections_points Lines-of-Sight Walls Intersection Points Array
 * @param {FeatureCollection} geojson_lines_of_sight Lines-of-Sight FeatureCollection
 * @param {FeatureCollection} geojson_walls Map Features Walls FeatureCollection data
 */
function animateWallIntersectionPoints(wall_intersections_points, geojson_lines_of_sight, geojson_walls) {
    // Update the data to a new position based on the animation timestamp. The
    // divisor in the expression `timestamp / 1000` controls the animation speed.
    map.getSource('wall-intersections-points').setData(updateWallIntersectionPointsCoordinates(wall_intersections_points, geojson_lines_of_sight, geojson_walls));
}

/**
 * Update Pulsing Dot Point Coordinates
 * @param {FeatureCollection} geojson_pulsing_dots_points Pulsing Dot Points FeatureCollection
 * @param {number} length_source FeatureCollection size
 * @param {number} index_source Pulsing Dot Points FeatureCollection index
 * @returns {FeatureCollection} Pulsing Dot Points FeatureCollection Updated
 */
function updatePulsingDotPointsCoordinates(geojson_pulsing_dots_points, length_source, index_source) {
    // set empty array data
    var data = []

    // Iterate by all the 'geojson_pulsing_dots_points.features', using array.forEach(index => { // do something here });
    geojson_pulsing_dots_points.features.forEach(index => {
        const new_id = index.properties.id - (length_source * index_source)
        data.push({
            'type': 'Feature',
            'properties': {
                'id': index.properties.id,
                'title': `Pulsing-Dot Point ${(index.properties.id + 1)}`,
                'description': `Pulsing-Dot point ${(index.properties.id + 1)} description`,
                'algorithm': index.properties.algorithm.toUpperCase(),
                'basecolor': index.properties.basecolor,
                'draggable': false,
            },
            'geometry': {
                'type': 'Point',
                'coordinates': index.geometry.coordinates
            }
        });
        // Update the point feature coordinates in `geojson_pulsing_dots_points` 
        geojson_pulsing_dots_points.features[new_id] = data[new_id];
    });

    return geojson_pulsing_dots_points;
}


/**
 * Animate Pulsing Dot Points function 
 * @param {Array} pulsing_dots_layers_sources Pulsing Dots sources Array
 */
function animatePulsingDotPoints(pulsing_dots_layers_sources) {
    for (let i = 0, len_i = pulsing_dots_layers_sources.length; i < len_i; i++) { 
        // Update the data to a new position based on the animation timestamp. The
        // divisor in the expression `timestamp / 1000` controls the animation speed.
        map.getSource(`pulsing-dot-points-${i+1}`).setData(updatePulsingDotPointsCoordinates(pulsing_dots_layers_sources[i], pulsing_dots_layers_sources[i].features.length, i));
    }
}

/**
 * Catch the Antennas Direction Intersections in Lines Of Sight ((UNCALLED - done in calculate at backend module)
 * @param {FeatureCollection} lines_of_sight Lines of Sight FeatureCollection data
 * @param {FeatureCollection} geojson_antennas_directions Antennas Directions FeatureCollection data 
 * @returns {boolean} Result value of Asset Points with Antennas Directions
 */
function catchAntennaDirectionsIntersections(lines_of_sight, geojson_antennas_directions) {
    // set empty array data
    var isDirectionated = [];

    // Iterate by all the 'lines_of_sight.features', using array.forEach(index => { // do something here });
    lines_of_sight.features.forEach(index => {
        // verify if if line-of-sight have intersections with geojson_antennas_directions
        // boolean-disjoint returns (true) if the intersection of the two geometries is an empty set.
        value = !turf.booleanDisjoint(index, geojson_antennas_directions.features[index])
        // populate array isDirectionated
        isDirectionated.push(value)
    });

    return isDirectionated;
}

// =========== End of UI Interections Functions =========== //