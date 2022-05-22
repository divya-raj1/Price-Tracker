var ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
var element = document.getElementById("current-price");
var drop1 = document.getElementById("market-name");
var drop2 = document.getElementById("market-symbol");
var previous = null;
var marketName;
var ticksValue;
var forget_id;
var activeSymbol = [];
var activeSymbolOrg = {};
ws.onopen = function (evt) {
   ws.send(JSON.stringify({ active_symbols: 'brief' }));
};
ws.onmessage = function (msg) {
   var data = JSON.parse(msg.data);
   var arr_name = [];
   if (data.active_symbols) {
      if (document.getElementsByClassName("marketName").length < 1) {
         for (var i = 0; i < data.active_symbols.length; i++) {
            marketName = data.active_symbols[i].market_display_name;
            if (!arr_name.includes(marketName)) {
               arr_name.push(marketName);
               var opt = document.createElement('option');
               opt.value = marketName;
               opt.innerHTML = marketName;
               opt.className = "marketName";
               drop1.appendChild(opt);
            }
         }
      }
      for (var i = 0; i < arr_name.length; i++) {
         var name = arr_name[i];
         var symbol = [];
         for (var j = 0; j < data.active_symbols.length; j++) {
            if (data.active_symbols[j].market_display_name == name) {
               symbol.push(data.active_symbols[j].symbol);
            }
         }
         activeSymbolOrg[name] = symbol;
         activeSymbol.push(activeSymbolOrg);
      }
   }
   else if (data.tick) {
      let price = data.tick.quote;
      forget_id = data.tick.id;
      element.value = price;
      if (previous == price || previous == null) {
         element.style.boxShadow = "0px 7px 15px ##80808085";
      }
      else if (price > previous) {
         element.style.boxShadow = "0px 7px 15px green";
      }
      else {
         element.style.boxShadow = "0px 7px 15px red";
      }
      previous = price;
   }
   else if (data.forget) {
      element.value = 0;
      element.style.boxShadow = "0px 7px 15px #80808085";
   }
   else if (data.error) {
      if (ticksValue = drop2.value) {
         element.value = 0;
         element.style.boxShadow = "0px 7px 15px #80808085";
         alert(data.error.message);
      }
   }
}
function marketSelect() {
   remove();
   Object.keys(activeSymbolOrg).map((k) => {
      if (drop1.value == k) {
         for (var i = 0; i < activeSymbolOrg[k].length; i++) {
            var opt = activeSymbolOrg[k][i];
            var elm = document.createElement("option");
            elm.innerHTML = opt;
            elm.value = opt;
            elm.className = "symbols"
            drop2.appendChild(elm);
         }
      }
   })
   ws.send(JSON.stringify({ forget: forget_id }));
}
function remove() {
   var sym = document.getElementsByClassName("symbols");
   while (sym.length > 0) {
      sym[0].parentNode.removeChild(sym[0]);
   }
}
function symbolSelect() {
   previous = null;
   ticksValue = drop2.value;
   ws.send(JSON.stringify({ ticks: ticksValue }));
}