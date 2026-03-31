/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660641689")

  // update collection data
  unmarshal({
    "deleteRule": "follower = @request.auth.id",
    "indexes": [
      "CREATE UNIQUE INDEX idx_follows_unique ON follows (follower, following)"
    ],
    "listRule": "follower = @request.auth.id || following = @request.auth.id",
    "viewRule": "follower = @request.auth.id || following = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3117812038",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "follower",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation1908379107",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "following",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3660641689")

  // update collection data
  unmarshal({
    "deleteRule": null,
    "indexes": [],
    "listRule": null,
    "viewRule": null
  }, collection)

  // remove field
  collection.fields.removeById("relation3117812038")

  // remove field
  collection.fields.removeById("relation1908379107")

  return app.save(collection)
})
