/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "deleteRule": "author = @request.auth.id || @request.auth.role = 'admin'",
    "listRule": "status = 'published' || author = @request.auth.id",
    "updateRule": "author = @request.auth.id",
    "viewRule": "status = 'published' || author = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1125843985",
    "hidden": false,
    "id": "relation1519021197",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "post",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_533777971",
    "hidden": false,
    "id": "relation3862701610",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "parent_comment",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "_pb_users_auth_",
    "hidden": false,
    "id": "relation3182418120",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "author",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = 'admin'",
    "listRule": "status = 'published'",
    "updateRule": null,
    "viewRule": "status = 'published'"
  }, collection)

  // remove field
  collection.fields.removeById("relation1519021197")

  // remove field
  collection.fields.removeById("relation3862701610")

  // remove field
  collection.fields.removeById("relation3182418120")

  return app.save(collection)
})
