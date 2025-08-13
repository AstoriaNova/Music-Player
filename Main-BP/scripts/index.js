import { world, system } from "@minecraft/server";
import { MusicMain } from "./Forms/music";
import { ConfigMain } from "./Forms/staff";

world.afterEvents.worldLoad.subscribe(() => {
    const initialized = world.getDynamicProperty("Initialized");

    if (initialized === true) {
        console.warn("Already Initialized");
        return;
    }

    world.setDynamicProperty("Initialized", true);

    const coords = { x: 0, y: 0, z: 0 };
    world.setDynamicProperty("blockCoords", JSON.stringify(coords));

    world.setDynamicProperty("blockItem", "minecraft:jukebox");
    world.setDynamicProperty("configItem", "minecraft:stick");
    world.setDynamicProperty("staffTag", "Admin");

    console.warn("Music Player Ready");
});

world.beforeEvents.itemUse.subscribe(async (event) => {
    const { source: player, itemStack } = event;

    if (!player) return;

    const configItem = world.getDynamicProperty("configItem");
    const staffTag = world.getDynamicProperty("staffTag");

    if (itemStack.typeId !== configItem) return;

    if (!player.hasTag(staffTag)) {
        player.sendMessage("Does not have permission");
        return;
    }

    event.cancel = true;
    system.run(() => {
    ConfigMain(player);
})});

world.beforeEvents.playerInteractWithBlock.subscribe(async (event) => {
    const { block, player } = event;

    event.cancel = true;

    if (!player) return;

    const blockItem = world.getDynamicProperty("blockItem");
    const coords = JSON.parse(world.getDynamicProperty("blockCoords"));

    if (block.typeId !== blockItem) return;

    if (block.location.x !== coords.x || block.location.y !== coords.y || block.location.z !== coords.z) return;
    
    system.run(() => {
        MusicMain(player);
    })

});