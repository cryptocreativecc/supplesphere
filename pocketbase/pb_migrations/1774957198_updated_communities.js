/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4265546335")

  // update collection data
  unmarshal({
    "updateRule": "created_by = @request.auth.id || moderators.id ?= @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3725765462",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "created_by",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1477252819",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "moderators",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4265546335")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation3725765462")

  // remove field
  collection.fields.removeById("relation1477252819")

  return app.save(collection)
})
