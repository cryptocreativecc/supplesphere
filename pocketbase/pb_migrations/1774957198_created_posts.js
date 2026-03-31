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
        "id": "select1166749730",
        "maxSelect": 1,
        "name": "post_type",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "source_review",
          "product_review",
          "discussion",
          "deal",
          "image_post"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text724990059",
        "max": 300,
        "min": 1,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3685223346",
        "max": 50000,
        "min": 0,
        "name": "body",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number3632866850",
        "max": 5,
        "min": 1,
        "name": "rating",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "file3760176746",
        "maxSelect": 4,
        "maxSize": 10485760,
        "mimeTypes": [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif"
        ],
        "name": "images",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": null,
        "type": "file"
      },
      {
        "exceptDomains": null,
        "hidden": false,
        "id": "url4101391790",
        "name": "url",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2350375365",
        "max": 100,
        "min": 0,
        "name": "deal_price",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "date2122768388",
        "max": "",
        "min": "",
        "name": "deal_expires",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "number3216482529",
        "max": null,
        "min": 0,
        "name": "upvotes",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number1658157900",
        "max": null,
        "min": 0,
        "name": "downvotes",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "number742644883",
        "max": null,
        "min": 0,
        "name": "comment_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool651253450",
        "name": "is_verified_purchase",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "bool3043911736",
        "name": "is_pinned",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
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
          "published",
          "removed",
          "flagged"
        ]
      }
    ],
    "id": "pbc_1125843985",
    "indexes": [],
    "listRule": "status = 'published'",
    "name": "posts",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "status = 'published'"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985");

  return app.delete(collection);
})
