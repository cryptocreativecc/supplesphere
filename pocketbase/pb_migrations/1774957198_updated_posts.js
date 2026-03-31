/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "deleteRule": "author = @request.auth.id || @request.auth.role = 'admin'",
    "listRule": "status = 'published' || author = @request.auth.id",
    "updateRule": "author = @request.auth.id",
    "viewRule": "status = 'published' || author = @request.auth.id"
  }, collection)

  // add field
  collection.fields.addAt(4, new Field({
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

  // add field
  collection.fields.addAt(5, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4265546335",
    "hidden": false,
    "id": "relation459292723",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "community",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1124997656",
    "hidden": false,
    "id": "relation1602912115",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "source",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_4092854851",
    "hidden": false,
    "id": "relation3544843437",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "product",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1236351354",
    "hidden": false,
    "id": "relation475199832",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "brand",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1125843985")

  // update collection data
  unmarshal({
    "deleteRule": "@request.auth.role = 'admin'",
    "listRule": "status = 'published'",
    "updateRule": null,
    "viewRule": "status = 'published'"
  }, collection)

  // remove field
  collection.fields.removeById("relation3182418120")

  // remove field
  collection.fields.removeById("relation459292723")

  // remove field
  collection.fields.removeById("relation1602912115")

  // remove field
  collection.fields.removeById("relation3544843437")

  // remove field
  collection.fields.removeById("relation475199832")

  return app.save(collection)
})
