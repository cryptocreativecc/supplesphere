/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1124997656")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin' || claimed_by = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3292755704",
    "hidden": false,
    "id": "relation989021800",
    "maxSelect": 999,
    "minSelect": 0,
    "name": "categories",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation694952315",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "claimed_by",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1124997656")

  // update collection data
  unmarshal({
    "updateRule": "@request.auth.role = 'admin'"
  }, collection)

  // remove field
  collection.fields.removeById("relation989021800")

  // remove field
  collection.fields.removeById("relation694952315")

  return app.save(collection)
})
