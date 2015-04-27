# Movi
Una librería para enlazar objetos de JavaScript con documentos HTML

# El modelo y la vista son lo mismo
Esta librería implementa una nueva variación del arquetipo Modelo-Vista-Vista-Modelo (MVVM). Ha esta variación la he llamado Abstacción-Modelo-Vista (AMV).

El arquetipo AMV consiste en tratar el modelo y la vista de manera análoga. La analogía que hay entre el modelo (JavaScript) y la vista (HTML) es su encomienda al enlazarlos: Representar un objeto. Esta representación es la abstracción en el arquetipo.

Así que al igual que en JavaScript donde los objetos pasan por referencia, en este arquetipo la abstracción pasa por referencia en el modelo y la vista.

```js
let product = {
name: "chile",
price: 6
};

let model = product;
let view = product;

model.name = "cebolla";
view.price = 7;

model === view; // true

product;
//  {
//    name: "cebolla",
//    price: 7
//  }
```
