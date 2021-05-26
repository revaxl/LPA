/* mod.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Jordipujol
 * - Revingly
 */

"use strict";

class Mod {
    constructor() {
        this.mod = "jordipujol-LPA";
        this.funcptr = HttpServer.onRespond["IMAGE"];

        Logger.info(`Loading: ${this.mod}`);
        ModLoader.onLoad[this.mod] = this.load.bind(this);
        HttpServer.onRespond["IMAGE"] = this.getImage.bind(this);
    }

    getImage(sessionID, req, resp, body) {
        Logger.log("LPA: " + req.url);
        const filepath = `${ModLoader.getModPath(this.mod)}res/`;

        if (req.url.includes("/avatar/LPA")) {
            HttpServer.sendFile(resp, `${filepath}LPA.jpg`);
            return;
        }

        this.funcptr(sessionID, req, resp, body);
    }

    load() {
        const filepath = `${ModLoader.getModPath(this.mod)}db/`;
        const keys = this.createKeysAssortTable();

        DatabaseServer.tables.traders.LPA = {
            "assort": keys,
            "base": JsonUtil.deserialize(VFS.readFile(`${filepath}base.json`)),
        };
        let locales = DatabaseServer.tables.locales.global;

        for (const locale in locales) {
            locales[locale].trading.LPA = {
                "FullName": "Lock-Picking Attorney",
                "FirstName": "Lockpick",
                "Nickname": "LPA",
                "Location": "Unknown",
                "Description": "He sells keys."
            };
        }

        DatabaseServer.tables.locales.global = locales;
    }

    createKeysAssortTable() {
        const MECHANICAL_KEY_ID = "5c99f98d86f7745c314214b3";
        const KEYCARD_ID = "5c164d2286f774194c5e69fa";
        const SELL_AMOUNT = 100;
        const ROUBLE_ID = "5449016a4bdc2d6f028b456f";
        const items = DatabaseServer.tables.templates.items;

        return Object
            .values(items)
            .filter(val => val._parent === MECHANICAL_KEY_ID || val._parent === KEYCARD_ID)
            .map(key => {
                return {
                    "_id": HashUtil.generate(),
                    "_tpl": key._id,
                    "parentId": "hideout",
                    "slotId": "hideout",
                    "upd": {
                        "UnlimitedCount": true,
                        "StackObjectsCount": 999999999
                    }
                }
            })
            .reduce((acc, key) => {
                acc.items.push(key);
                acc.barter_scheme[key._id] = [
                    [
                        {
                            "count": SELL_AMOUNT,
                            "_tpl": ROUBLE_ID
                        }
                    ]
                ];
                acc.loyal_level_items[key._id] = 1;
                return acc;
                },
                {
                    items: [], barter_scheme: {}, loyal_level_items: {}
                }
            );
    }
}

module.exports.Mod = Mod;
