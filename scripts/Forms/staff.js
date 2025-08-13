import { world } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui"

function ConfigMain(player) {
    const blockCoords = world.getDynamicProperty("blockCoords") ?? JSON.stringify({ x: 0, y: 0, z: 0 });
    const blockItem = world.getDynamicProperty("blockItem") ?? "minecraft:jukebox";
    const configItem = world.getDynamicProperty("configItem") ?? "minecraft:stick";
    const staffTag = world.getDynamicProperty("staffTag") ?? "staff";

    const form = new ModalFormData()
        .title("Config Menu")
        .textField("Block Coordinates (JSON: {x, y, z})\nCoordinates for the music player block", blockCoords, { defaultValue: blockCoords })
        .textField("Block Item (minecraft:item)\nBlock type for the music player", blockItem, { defaultValue: blockItem })
        .textField("Config Item (minecraft:item)\nItem used to open the config menu", configItem, { defaultValue: configItem })
        .textField("Staff Tag\nTag that grants access to the config", staffTag, { defaultValue: staffTag })
        .toggle("Confirm Changes", { defaultValue: false });

    form.show(player).then(response => {

        if (response.canceled) return;

        const [newCoords, newBlockItem, newConfigItem, newStaffTag, confirm] = response.formValues;

        if (!confirm) {
            player.sendMessage("§cChanges were not saved (confirmation required).");
            return;
        }

        try {
            JSON.parse(newCoords);
            world.setDynamicProperty("blockCoords", newCoords);
            world.setDynamicProperty("blockItem", newBlockItem);
            world.setDynamicProperty("configItem", newConfigItem);
            world.setDynamicProperty("staffTag", newStaffTag);

            player.sendMessage("§aConfiguration updated successfully!");
        } catch {
            player.sendMessage("§cInvalid block coordinates format. Must be valid JSON like: {\"x\":0,\"y\":0,\"z\":0}");
        }
    })
}

export { ConfigMain };
