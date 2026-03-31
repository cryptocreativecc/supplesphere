/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_612317808")

  // update collection data
  unmarshal({
    "updateRule": "submitted_by = @request.auth.id || @request.auth.role = 'admin'"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1124997656",
    "hidden": false,
    "id": "relation1602912115",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "source",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1679747138",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "submitted_by",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_612317808")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin'"
  }, collection)

  // remove field
  collection.fields.removeById("relation1602912115")

  // remove field
  collection.fields.removeById("relation1679747138")

  return app.save(collection)
})
