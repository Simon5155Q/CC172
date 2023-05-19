var tableNumber = null;
var tableNum
AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (tableNumber === null) {
      this.askTableNumber();
    }

    var dishes = await this.getDishes();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(dishes, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askTableNumber: function() {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title:"place order",
      icon:iconUrl,
      content:{element:"input"}
    }).then((data)=>{
      tableNumber = data;
      console.log(tableNumber)
    })
    
  },

  handleMarkerFound: function(dishes, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var dish = dishes.filter(dish => dish.id === markerId)[0];

    if (dish.unavailable_day.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
       // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${dish.id}`);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);
      model.setAttribute("visible", true)

      //Update UI conent VISIBILITY of AR scene(MODEL , INGREDIENTS & PRICE)

      var mainPlane = document.querySelector(`#main-plane-${dish.id}`)
      mainPlane.setAttribute("visible", true);
      var mainPlane2 = document.querySelector(`#title-plane-${dish.id}`)
      mainPlane2.setAttribute("visible", true);
      var mainPlane3 = document.querySelector(`#dish-title-${dish.id}`)
      mainPlane3.setAttribute("visible", true);
      var mainPlane4 = document.querySelector(`#ingredients-${dish.id}`)
      mainPlane4.setAttribute("visible", true);
      var mainPlane5 = document.querySelector(`#price-plane-${dish.id}`)
      mainPlane5.setAttribute("visible", true);


      // Changing button div visibility
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      // Handling Click Events
      ratingButton.addEventListener("click", function() {
        swal({
          icon: "warning",
          title: "Rate Dish",
          text: "Work In Progress"
        });
      });

      orderButtton.addEventListener("click", () => {
        
        tableNumber < 10?(tableNum = `T0${tableNumber}`):(tableNum = `T${tableNumber}`)
        this.handleOrder(tableNumber, dish);

        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For Order !",
          text: "Your order will serve soon on your table!",
          timer: 2000,
          buttons: false
        });
      });
    }
  },
  handleOrder: function(tNumber, dish) {
    console.log(tNumber)
    firebase.firestore().collection("tables").doc(tNumber).get().then((doc)=>{
      var details = doc.data();
      console.log(details);
      if(details["current_order"][dish.id]){
        details["current_order"][dish.id]["quantity"] += 1;
        var present_quantity = details["current_order"][dish.id]["quantity"];
        details["current_order"][dish.id]["sub_total"] = present_quantity * dish.price;

      }
      else{
        details["current_order"][dish.id] = {item:dish.dish_name, price: dish.price, quantity: 1, sub_total: dish.price * quantity}
      }
      details.total_bill += dish.price;
      firebase.firestore.collection("tables").doc(doc.id).update(details);
    })
  },

  getDishes: async function() {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then(snap => {
        return snap.docs.map(doc => {
          doc.data(); 
          var value = doc.data()
          console.log(value)
        });
        
      });
      
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
