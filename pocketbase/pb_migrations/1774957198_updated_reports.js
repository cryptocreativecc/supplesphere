/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // update collection data
  unmarshal({
    "listRule": "reporter = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    "viewRule": "reporter = @request.auth.id || @request.auth.role = 'admin' || @request.auth.role = 'moderator'"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1993793778",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "reporter",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1615648943")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.role = 'admin' || @request.auth.role = 'moderator'",
    "viewRule": "@request.auth.role = 'admin' || @request.auth.role = 'moderator'"
  }, collection)

  // remove field
  collection.fields.removeById("relation1993793778")

  return app.save(collection)
})
