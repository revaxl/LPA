/* mod.js
 * license: NCSA
 * copyright: Revingly @ Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Jordipujol
 * - Revingly
 */

"use strict";

class Mod {
    constructor() {
        this.mod = "Revingly-LPA-Redux";
        this.funcptr = HttpServer.onRespond["IMAGE"];

        Logger.info(`Loading: ${this.mod}`);
        ModLoader.onLoad[this.mod] = this.load.bind(this);
        HttpServer.onRespond["IMAGE"] = this.getImage.bind(this);
        this.itemsToSell = {};
    }

    getImage(sessionID, req, resp, body) {
        const filepath = `${ModLoader.getModPath(this.mod)}res/`;

        if (req.url.includes("/avatar/LPA")) {
            HttpServer.sendFile(resp, `${filepath}LPA.jpg`);
            return;
        }

        this.funcptr(sessionID, req, resp, body);
    }

    load() {
        const MECHANICAL_KEY_ID = "5c99f98d86f7745c314214b3";
        const KEYCARD_ID = "5c164d2286f774194c5e69fa";
        const SELL_AMOUNT = 100;
        const ROUBLE_ID = "5449016a4bdc2d6f028b456f";
        const filepath = `${ModLoader.getModPath(this.mod)}db/`;
        this.createKeysAssortTable(MECHANICAL_KEY_ID, KEYCARD_ID, SELL_AMOUNT, ROUBLE_ID);
        this.addCustomItems(SELL_AMOUNT, ROUBLE_ID);

        DatabaseServer.tables.traders.LPA = {
            "assort": this.itemsToSell,
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

    createKeysAssortTable(MECHANICAL_KEY_ID, KEYCARD_ID, SELL_AMOUNT, ROUBLE_ID) {
        const items = DatabaseServer.tables.templates.items;

        this.itemsToSell = Object
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

    addCustomItems(SELL_AMOUNT, ROUBLE_ID) {
        const items = [{
            "_id": HashUtil.generate(),
            "_tpl": "5d235bb686f77443f4331278",
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "UnlimitedCount": true,
                "StackObjectsCount": 999999999
            }
        },
        {
            "_id": HashUtil.generate(),
            "_tpl": "59fafd4b86f7745ca07e1232",
            "parentId": "hideout",
            "slotId": "hideout",
            "upd": {
                "UnlimitedCount": true,
                "StackObjectsCount": 999999999
            }
        }];
        for (const item of items) {
            this.itemsToSell.items.push(item);
            this.itemsToSell.barter_scheme[item._id] = [
                [
                    {
                        "count": SELL_AMOUNT,
                        "_tpl": ROUBLE_ID
                    }
                ]
            ];
            this.itemsToSell.loyal_level_items[item._id] = 1;
        }
    }
}

module.exports.Mod = Mod;
