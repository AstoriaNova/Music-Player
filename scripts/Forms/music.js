import { world, system } from "@minecraft/server";
import { ActionFormData, MessageFormData, ModalFormData } from "@minecraft/server-ui";
import { MusicConfig } from "../config";

function MusicMain(player, song) {
    const form = new ActionFormData()
        .title("§sMusic Player")
        .body("§fSelect a music category or search for music");
    MusicConfig.forEach(cat => form.button(cat.name));
    form.button("§bSearch\n§3Find a song");
    form.button("§cStop Music\n§4Stop all currently playing music");

    form.show(player).then(res => {
        if (res.canceled) return;
        if (res.selection === MusicConfig.length) {
            openSearchMenu(player);
            return;
        }
        if (res.selection === MusicConfig.length + 1) {
            player.sendMessage("§cStopped all music.");
            stopAllRapSongs(player);
            return;
        }
        openSongListMenu(player, MusicConfig[res.selection]);
    });
}

function openSongListMenu(player, category) {
    const form = new ActionFormData()
        .title(`§s${category.title}`)
        .body("§fSelect a song:");

    category.songs.forEach(song => {
        form.button(`§b${song.name}\n§7${song.songmade}`, song.texture);
    });


    form.show(player).then(res => {
        if (res.canceled) {
            MusicMain(player);
            return;
        }
        if (res.selection === category.songs.length) {
            MusicMain(player);
            return;
        }
        showSongInfo(player, category.songs[res.selection], category);
    });
}

function showSongInfo(player, song, category) {
    new MessageFormData()
        .title(`§s${song.name}`)
        .body(`§fArtist: §b${song.artist}\n§fLength: §e${song.length}\n§fName: §a${song.name}`)
        .button1("§aPlay")
        .button2("§cBack")
        .show(player)
        .then(res => {
            if (res.selection === 0) {
                player.playSound(`${song.musicID}`, { volume: 1 });
            } else {
                openSongListMenu(player, category);
            }
        });
}

function openSearchMenu(player) {
    new ModalFormData()
        .title("§sSearch Music")
        .textField("§bType a date, artist, or song title to search!\nMatches any part of the name, artist, or year.\n\n§fEnter your search:", "Search by name, artist, or date.")
        .show(player)
        .then(res => {
            if (res.canceled || !res.formValues) {
                MusicMain(player);
                return;
            }

            const searchQuery = res.formValues[0].toLowerCase();
            if (!searchQuery.trim()) {
                player.sendMessage("§cPlease enter a search term.");
                openSearchMenu(player);
                return;
            }

            const results = [];
            MusicConfig.forEach(category => {
                category.songs.forEach(song => {
                    if (
                        song.name.toLowerCase().includes(searchQuery) ||
                        (song.artist && song.artist.toLowerCase().includes(searchQuery)) ||
                        (song.songmade && song.songmade.toLowerCase().includes(searchQuery))
                    ) {
                        results.push({
                            ...song,
                            categoryName: category.title
                        });
                    }
                });
            });

            if (results.length === 0) {
                player.sendMessage("§cNo songs found matching: §e" + searchQuery);
                MusicMain(player);
                return;
            }


            const form = new ActionFormData()
                .title(`§sSearch Results (${results.length})`)
                .body(`§fFound §a${results.length}§f songs matching: §e"${searchQuery}"`);

            results.forEach(song => {
                form.button(`§b${song.name}\n§3${song.categoryName}`, song.texture);
            });
            form.button("§cBack");

            form.show(player).then(selection => {
                if (selection.canceled || selection.selection === results.length) {
                    MusicMusic(player);
                    return;
                }
                const selectedSong = results[selection.selection];
                const category = MusicConfig.find(cat => cat.title === selectedSong.categoryName);
                showSongInfo(player, selectedSong, category);
            });
        });
}

function stopAllRapSongs(player) {
    const allSongIDs = [];
    musicCategories.forEach(cat => {
        cat.songs.forEach(song => {
            if (song.musicID) allSongIDs.push(song.musicID);
        });
    });
    allSongIDs.forEach(id => player.stopSound(id));
}

export { MusicMain }