/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1103511960",
        "maxSelect": 1,
        "name": "target_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "post",
          "comment"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text361630566",
        "max": 50,
        "min": 1,
        "name": "target_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number494360628",
        "max": 1,
        "min": -1,
        "name": "value",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_2597176356",
    "indexes": [],
    "listRule": null,
    "name": "votes",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2597176356");

  return app.delete(collection);
})
