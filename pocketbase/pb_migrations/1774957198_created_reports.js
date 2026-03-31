/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.role = 'admin'",
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
          "comment",
          "user"
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
        "id": "select1001949196",
        "maxSelect": 1,
        "name": "reason",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "spam",
          "harassment",
          "misinformation",
          "counterfeit",
          "off_topic",
          "other"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1915095946",
        "max": 2000,
        "min": 0,
        "name": "details",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "pending",
          "reviewed",
          "dismissed",
          "actioned"
        ]
      }
    ],
    "id": "pbc_1615648943",
    "indexes": [],
    "listRule": "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    "name": "reports",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    "viewRule": "@request.auth.role = 'admin' || @request.auth.role = 'moderator'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943");

  return app.delete(collection);
})
