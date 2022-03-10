/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SharedMap } from "fluid-framework";
import { AzureClient } from "@fluidframework/azure-client";
import { InsecureTokenProvider } from "@fluidframework/test-client-utils";
import { v4 as uuid } from 'uuid';

export const diceValueKey = "dice-value-key";
const root = document.getElementById("content");

// Load container and render the app

const userId = uuid();

const fluidrelay_accessKey = process.env.FLUIDRELAY_ACCESSKEY;

const connectionConfig = { 
    connection: {
        tenantId: "dc24fade-1619-423f-86bc-e693b9b32462",
        tokenProvider: new InsecureTokenProvider(fluidrelay_accessKey, { id: userId }),
        orderer: "https://alfred.westeurope.fluidrelay.azure.com",
        storage: "https://historian.westeurope.fluidrelay.azure.com"
    }
}

const client = new AzureClient(connectionConfig);
const containerSchema = {
    initialObjects: { diceMap: SharedMap }
};

const createNewDice = async () => {
    const { container, services } = await client.createContainer(containerSchema);
    container.initialObjects.diceMap.set(diceValueKey, 1);
    const id = await container.attach();
    renderDiceRoller(container.initialObjects.diceMap, root);
    renderUsers(services, root);
    return id;
}

const loadExistingDice = async (id) => {
    const { container, services } = await client.getContainer(id, containerSchema);
    renderDiceRoller(container.initialObjects.diceMap, root);
    renderUsers(services, root);
}

async function start() {
    if (location.hash) {
        await loadExistingDice(location.hash.substring(1))
    } else {
        const id = await createNewDice();
        location.hash = id;
    }
}

start().catch((error) => console.error(error));

const renderDiceRoller = (diceMap, elem) => {
    const rollButton = elem.querySelector(".roll");
    const dice = elem.querySelector(".dice");

    // Set the value at our dataKey with a random number between 1 and 6.
    rollButton.onclick = () => diceMap.set(diceValueKey, Math.floor(Math.random() * 6) + 1);

    // Get the current value of the shared data to update the view whenever it changes.
    const updateDice = () => {
        const diceValue = diceMap.get(diceValueKey);
        // Unicode 0x2680-0x2685 are the sides of a dice (⚀⚁⚂⚃⚄⚅)
        dice.textContent = String.fromCodePoint(0x267f + diceValue);
        dice.style.color = `hsl(${diceValue * 60}, 70%, 30%)`;
    };
    updateDice();

    // Use the changed event to trigger the rerender whenever the value changes.
    diceMap.on("valueChanged", updateDice);
}

const renderUsers = (services, elem) => {
    const usersList = elem.querySelector('.connectedUsers');

    // When a user is connected or disconnected
    services.audience.on('membersChanged', () => {
        // Fetch connected users to the audience object and update list on the screen 
        const users = Array.from(services.audience.getMembers().values()).map(user => user.userId);
        usersList.innerHTML = users.join(' <br/> ');
    })
}