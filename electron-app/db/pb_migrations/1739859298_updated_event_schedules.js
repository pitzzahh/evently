/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3655470881")

  // add field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1687431684",
    "hidden": false,
    "id": "relation1912072331",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "event_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "date3042278353",
    "max": "",
    "min": "",
    "name": "event_date",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "date931220185",
    "max": "",
    "min": "",
    "name": "am_start",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "date2132491255",
    "max": "",
    "min": "",
    "name": "am_end",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date2274392940",
    "max": "",
    "min": "",
    "name": "pm_start",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "date3079793353",
    "max": "",
    "min": "",
    "name": "pm_end",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3655470881")

  // remove field
  collection.fields.removeById("relation1912072331")

  // remove field
  collection.fields.removeById("date3042278353")

  // remove field
  collection.fields.removeById("date931220185")

  // remove field
  collection.fields.removeById("date2132491255")

  // remove field
  collection.fields.removeById("date2274392940")

  // remove field
  collection.fields.removeById("date3079793353")

  return app.save(collection)
})
