const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")
const app = express();

mongoose.connect("mongodb+srv://admin-bickey:test231@cluster0.lywzq.mongodb.net/todolistDB")

const itemsSchema = {
  name: String
};

const Item = mongoose.model(
  "Item", itemsSchema
);
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find(function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("successfully starting tasks")
          }
        });
        res.redirect('/');
        //this res.redirect means here that when the program gets to this line it will jump to work route and execute the code written there.

      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });

      }

    }
  });

});



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });


  if (listName === "Today") {
    item.save();
    res.redirect('/');

  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName)
      }
    })

  }


});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {

    Item.findByIdAndRemove(itemId, function(err) {
      if (!err) {
        res.redirect('/');
      }
    });

  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: itemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  //Dynamic routing
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!foundList) {
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      })
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started successfully");
});
