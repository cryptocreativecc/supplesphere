/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301922722")

  // update collection data
  unmarshal({
    "deleteRule": "recipient = @request.auth.id",
    "listRule": "recipient = @request.auth.id",
    "updateRule": "recipient = @request.auth.id",
    "viewRule": "recipient = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1745156937",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "recipient",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2301922722")

  // update collection data
  unmarshal({
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation1745156937")

  return app.save(collection)
})
